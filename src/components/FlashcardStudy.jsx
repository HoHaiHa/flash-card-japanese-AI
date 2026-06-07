import { useState, useEffect, useRef, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCube } from 'swiper/modules';
import { getCardsForLessons, updateCardFavorite, updateCardStatus, saveSessionResult } from '../services/db';

import 'swiper/css';
import 'swiper/css/effect-cube';

function FlashcardStudy({ config, onBack }) {
  // Global cards queue
  const [originalCards, setOriginalCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track config changes to reset loading state during render
  const [prevConfig, setPrevConfig] = useState(config);
  if (config !== prevConfig) {
    setPrevConfig(config);
    setLoading(true);
  }

  // Study session indices
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const innerSwipers = useRef({});

  // Interactive UI effects
  const mountTimeRef = useRef(0);
  useEffect(() => {
    mountTimeRef.current = Date.now();
  }, []);
  const [flashType, setFlashType] = useState(null); // 'learned' | 'forgot' | null
  const [isPopping, setIsPopping] = useState(false);
  const [studyResponses, setStudyResponses] = useState({}); // { cardId: 'learned' | 'forgot' }
  const [favorites, setFavorites] = useState({}); // { cardId: bool }

  // Quick Filters state
  const [unlearnedOnly, setUnlearnedOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const cardRanks = useRef({});

  // Initialize cards from configurations
  useEffect(() => {
    if (!config) return;
    let active = true;
    getCardsForLessons(config.selectedLessons, config.contentTypes)
      .then(cards => {
        if (active) {
          setOriginalCards(cards);

          // Set initial favorites mapping & loaded responses
          const favs = {};
          const initialResponses = {};
          const ranks = {};
          cards.forEach(card => {
            favs[card.id] = card.favorite;
            ranks[card.id] = Math.random();
            if (card.mastered) {
              initialResponses[card.id] = 'learned';
            }
          });
          setFavorites(favs);
          cardRanks.current = ranks;
          setStudyResponses(initialResponses);
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          console.error(err);
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, [config]);

  // Apply filters/sorting and calculate active cards during render
  const activeCards = useMemo(() => {
    let result = [...originalCards];

    // Filter unlearned only
    if (unlearnedOnly) {
      result = result.filter(card => studyResponses[card.id] !== 'learned');
    }

    // Filter favorites only
    if (favoritesOnly) {
      result = result.filter(card => favorites[card.id]);
    }

    // Stable Rank Shuffle if enabled
    if (isShuffled) {
      result.sort((a, b) => (cardRanks.current[a.id] || 0) - (cardRanks.current[b.id] || 0));
    }

    return result;
  }, [unlearnedOnly, favoritesOnly, originalCards, studyResponses, favorites, isShuffled]);

  // Reset currentIndex only when the actual card IDs change (not just studyResponses reference)
  const activeCardIds = activeCards.map(c => c.id).join(',');
  const [prevActiveCardIds, setPrevActiveCardIds] = useState(activeCardIds);
  if (activeCardIds !== prevActiveCardIds) {
    setPrevActiveCardIds(activeCardIds);
    setCurrentIndex(0);
  }

  // Reset swipers position only when card IDs actually change
  useEffect(() => {
    if (swiperInstance) {
      swiperInstance.slideToLoop(0, 0);
    }
    Object.values(innerSwipers.current).forEach(s => {
      if (s && typeof s.slideToLoop === 'function') {
        s.slideToLoop(0, 0);
      }
    });
  }, [activeCardIds, swiperInstance]);

  // Apply background flash style
  useEffect(() => {
    if (flashType) {
      const color = flashType === 'learned' ? 'rgba(0, 201, 133, 0.1)' : 'rgba(186, 26, 26, 0.1)';
      document.body.style.transition = 'background-color 0.2s ease';
      document.body.style.backgroundColor = color;
    } else {
      document.body.style.backgroundColor = '';
    }

    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [flashType]);

  // Handle lật thẻ xoay 3D
  const handleCardClick = (cardId) => {
    if (isRecentMount(mountTimeRef.current)) return;
    const innerSwiper = innerSwipers.current[cardId];
    if (innerSwiper) {
      innerSwiper.slideNext();
    }
  };

  // Handle Đánh giá (Learned / Forgot)
  const handleResponse = async (type) => {
    if (activeCards.length === 0 || currentIndex >= activeCards.length) return;

    const currentCard = activeCards[currentIndex];

    // Save response status locally (Optimistic update)
    setStudyResponses(prev => ({
      ...prev,
      [currentCard.id]: type
    }));

    // Trigger visual flash
    setFlashType(type);
    setIsPopping(true);

    // Save to database (fire-and-forget — không block navigation)
    updateCardStatus(currentCard.id, currentCard.type, type).catch(err => {
      console.error('Lỗi khi cập nhật trạng thái:', err);
    });

    setTimeout(() => {
      // Clear visual flash & advance
      setFlashType(null);
      
      if (currentIndex === activeCards.length - 1) {
        // Last card, save session results to database
        const updatedResponses = { ...studyResponses, [currentCard.id]: type };
        const learnedCount = Object.values(updatedResponses).filter(v => v === 'learned').length;
        const forgotCount = Object.values(updatedResponses).filter(v => v === 'forgot').length;
        const totalCardsCount = activeCards.length;

        saveSessionResult({
          totalCards: totalCardsCount,
          learnedCount,
          forgotCount
        }).catch(err => {
          console.error('Lỗi khi lưu kết quả phiên học:', err);
        });

        // Trigger congratulations screen
        setCurrentIndex(prev => prev + 1);
      } else {
        if (swiperInstance) {
          swiperInstance.slideNext();
        }
      }

      // Delay removing the scaling animation to make it smooth
      setTimeout(() => {
        setIsPopping(false);
      }, 100);
    }, 300);
  };

  // Handle xáo trộn thứ tự (Shuffle toggle)
  const handleShuffleToggle = () => {
    setIsShuffled(prev => {
      const next = !prev;
      if (next) {
        // Re-generate random ranks when turning shuffle on to get a fresh shuffle
        const ranks = {};
        originalCards.forEach(card => {
          ranks[card.id] = Math.random();
        });
        cardRanks.current = ranks;
      }
      return next;
    });
  };

  // Toggle favorite from inside study session
  const toggleFavorite = async (cardId) => {
    const card = originalCards.find(c => c.id === cardId);
    if (!card) return;
    const newFavorite = !favorites[cardId];

    // Optimistic update
    setFavorites(prev => ({
      ...prev,
      [cardId]: newFavorite
    }));

    try {
      await updateCardFavorite(cardId, card.type, newFavorite);
    } catch (err) {
      console.error('Lỗi khi cập nhật yêu thích:', err);
      // Rollback on error
      setFavorites(prev => ({
        ...prev,
        [cardId]: !newFavorite
      }));
    }
  };

  const renderCardFaces = (card) => {
    const isViJa = config?.translationDirection === 'vi-ja';
    
    // common header elements
    const renderHeader = (isFront) => {
      if (!isFront) return null;

      const getTypeLabel = (type) => {
        switch (type) {
          case 'vocab': return 'Từ vựng';
          case 'sentence': return 'Mẫu câu';
          case 'kanji': return 'Hán tự';
          default: return '';
        }
      };

      const getTypeBadgeStyle = (type) => {
        switch (type) {
          case 'vocab':
            return { color: 'var(--primary)', backgroundColor: 'rgba(0, 90, 224, 0.08)', border: '1px solid rgba(0, 90, 224, 0.16)' };
          case 'sentence':
            return { color: 'var(--secondary)', backgroundColor: 'rgba(0, 110, 80, 0.08)', border: '1px solid rgba(0, 110, 80, 0.16)' };
          case 'kanji':
            return { color: 'var(--tertiary)', backgroundColor: 'rgba(120, 70, 0, 0.08)', border: '1px solid rgba(120, 70, 0, 0.16)' };
          default:
            return {};
        }
      };

      return (
        <>
          <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span className="card-level-badge" style={{ position: 'static', whiteSpace: 'nowrap', flexShrink: 0 }}>{card.level}</span>
            <span className="card-level-badge" style={{ position: 'static', whiteSpace: 'nowrap', flexShrink: 0, ...getTypeBadgeStyle(card.type) }}>
              {getTypeLabel(card.type)}
            </span>
          </div>
          <button 
            className="card-favorite-btn" 
            style={{ color: favorites[card.id] ? '#ffb800' : 'var(--outline-variant)' }}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(card.id);
            }}
          >
            <span className="material-symbols-outlined">
              {favorites[card.id] ? 'star' : 'star'}
            </span>
          </button>
        </>
      );
    };

    if (card.type === 'vocab') {
      if (isViJa) {
        // Việt -> Nhật
        return (
          <>
            {/* Mặt 1: Nghĩa tiếng Việt */}
            <SwiperSlide>
              <div className="swiper-card-face swiper-card-face-center">
                {renderHeader(true)}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 16px', marginTop: '24px' }}>
                  <span className="font-headline-md text-on-surface" style={{ fontSize: '28px', fontWeight: '600', color: 'var(--primary)' }}>
                    {card.definition}
                  </span>
                </div>
                <div className="card-instruction-row">
                  <span className="material-symbols-outlined">touch_app</span>
                  <span>Chạm để xem từ vựng tiếng Nhật</span>
                </div>
              </div>
            </SwiperSlide>

            {/* Mặt 2: Từ vựng tiếng Nhật (Kanji/Kana) */}
            <SwiperSlide>
              <div className="swiper-card-face swiper-card-face-center">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <span className="font-display-jp text-on-surface mb-stack-sm" style={{ fontSize: card.kanji.length > 5 ? '32px' : '48px' }}>
                    {card.kanji}
                  </span>
                  <span className="font-body-lg text-on-surface-variant opacity-60" style={{ fontSize: '22px' }}>
                    {card.kana}
                  </span>
                  {card.details && (
                    <span className="font-label-sm text-outline mt-base" style={{ fontSize: '12px' }}>
                      ({card.details})
                    </span>
                  )}
                </div>
                <div className="card-instruction-row">
                  <span className="material-symbols-outlined">rotate_right</span>
                  <span>Về mặt trước</span>
                </div>
              </div>
            </SwiperSlide>
          </>
        );
      } else {
        // Nhật -> Việt (Mặc định)
        return (
          <>
            {/* Mặt 1: Từ vựng tiếng Nhật (Kanji/Kana) */}
            <SwiperSlide>
              <div className="swiper-card-face swiper-card-face-center">
                {renderHeader(true)}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '24px' }}>
                  <span className="font-display-jp text-on-surface mb-stack-sm" style={{ fontSize: card.kanji.length > 5 ? '32px' : '48px' }}>
                    {card.kanji}
                  </span>
                  <span className="font-body-lg text-on-surface-variant opacity-60" style={{ fontSize: '22px' }}>
                    {card.kana}
                  </span>
                </div>
                <div className="card-instruction-row">
                  <span className="material-symbols-outlined">touch_app</span>
                  <span>Chạm để xem nghĩa tiếng Việt</span>
                </div>
              </div>
            </SwiperSlide>

            {/* Mặt 2: Nghĩa tiếng Việt */}
            <SwiperSlide>
              <div className="swiper-card-face swiper-card-face-center">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 16px' }}>
                  <div className="font-label-sm uppercase tracking-widest text-outline mb-base block" style={{ fontSize: '11px' }}>
                    Ý nghĩa tiếng Việt
                  </div>
                  <span className="font-headline-md text-on-surface" style={{ fontSize: '24px', fontWeight: '600', color: 'var(--primary)' }}>
                    {card.definition}
                  </span>
                  {card.details && (
                    <span className="font-body-sm text-on-surface-variant opacity-60 mt-stack-sm">
                      {card.details}
                    </span>
                  )}
                </div>
                <div className="card-instruction-row">
                  <span className="material-symbols-outlined">rotate_right</span>
                  <span>Về mặt trước</span>
                </div>
              </div>
            </SwiperSlide>
          </>
        );
      }
    } else if (card.type === 'sentence') {
      // Cấu trúc mẫu câu (Sentence Card)
      return (
        <>
          {/* Mặt 1: Cấu trúc ngữ pháp */}
          <SwiperSlide>
            <div className="swiper-card-face swiper-card-face-center">
              {renderHeader(true)}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 16px', marginTop: '24px' }}>
                <div className="font-label-sm uppercase tracking-widest text-outline mb-base block" style={{ fontSize: '11px' }}>
                  Cấu trúc Ngữ pháp
                </div>
                <span className="font-headline-md text-on-surface" style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary)', lineHeight: '1.4' }}>
                  {card.details}
                </span>
              </div>
              <div className="card-instruction-row">
                <span className="material-symbols-outlined">touch_app</span>
                <span>Chạm để xem ví dụ &amp; ý nghĩa</span>
              </div>
            </div>
          </SwiperSlide>

          {/* Mặt 2: Ví dụ, Ý nghĩa & Phân tích trợ từ */}
          <SwiperSlide>
            <div className="swiper-card-face" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 16px var(--spacing-stack-md) 16px' }}>
              <div style={{ width: '100%', textAlign: 'center', marginBottom: '14px' }}>
                <div className="font-label-sm uppercase tracking-widest text-outline block" style={{ fontSize: '11px', color: 'var(--primary)' }}>
                  Ví dụ &amp; Phân tích chi tiết
                </div>
              </div>
              
              {/* Scrollable Container to fit both parts neatly */}
              <div className="custom-scrollbar" style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Japanese Example Sentence & Vietnamese Meaning */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
                  <span className="font-display-jp text-on-surface" style={{ fontSize: card.kanji.length > 10 ? '22px' : '28px', lineHeight: '1.4', marginBottom: '6px', fontWeight: '700' }}>
                    {card.kanji}
                  </span>
                  <span className="font-body-lg text-on-surface-variant opacity-60" style={{ fontSize: '15px', marginBottom: '12px', fontWeight: '500' }}>
                    {card.kana}
                  </span>
                  <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--surface-variant)', width: '100%' }}>
                    <span className="font-body-md text-on-surface" style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '14px' }}>
                      {card.definition}
                    </span>
                  </div>
                </div>

                {/* 2. Particle Breakdown List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  <div style={{ borderTop: '1px dashed var(--outline-variant)', paddingTop: '12px', paddingBottom: '4px', textAlign: 'center' }}>
                    <span className="font-label-sm uppercase tracking-widest text-outline block" style={{ fontSize: '10px', color: 'var(--on-surface-variant)' }}>
                      Phân tích trợ từ &amp; thành phần
                    </span>
                  </div>
                  {card.components && card.components.map((comp, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', backgroundColor: 'var(--surface-container-low)', borderRadius: '8px', border: '1px solid var(--surface-variant)' }}>
                      <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {comp.char}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', textAlign: 'left', lineHeight: '1.3' }}>
                        {comp.meaning}
                      </span>
                    </div>
                  ))}
                  {(!card.components || card.components.length === 0) && (
                    <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', textAlign: 'center', fontStyle: 'italic' }}>Không có phân tích thành phần.</span>
                  )}
                </div>
              </div>

              {/* Bottom navigation hint */}
              <div className="card-instruction-row" style={{ marginTop: '12px', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">restart_alt</span>
                <span>Về mặt trước</span>
              </div>
            </div>
          </SwiperSlide>
        </>
      );
    } else if (card.type === 'kanji') {
      // Chữ Hán (Kanji Card)
      return (
        <>
          {/* Mặt 1: Chữ Kanji chính */}
          <SwiperSlide>
            <div className="swiper-card-face swiper-card-face-center">
              {renderHeader(true)}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '24px' }}>
                <span className="font-display-jp text-on-surface" style={{ fontSize: '88px', color: 'var(--tertiary)', marginBottom: '20px', display: 'block' }}>
                  {card.kanji}
                </span>
                {card.onyomi || card.kunyomi ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                    {card.onyomi && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', backgroundColor: 'var(--surface-container-low)', padding: '4px 12px', borderRadius: '12px', border: '1px solid var(--surface-variant)' }}>
                        <span style={{ fontWeight: '700', color: 'var(--tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '11px' }}>On:</span>
                        <span className="font-body-md text-on-surface" style={{ fontWeight: '500' }}>{card.onyomi}</span>
                      </div>
                    )}
                    {card.kunyomi && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', backgroundColor: 'var(--surface-container-low)', padding: '4px 12px', borderRadius: '12px', border: '1px solid var(--surface-variant)' }}>
                        <span style={{ fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '11px' }}>Kun:</span>
                        <span className="font-body-md text-on-surface" style={{ fontWeight: '500' }}>{card.kunyomi}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="font-body-lg text-on-surface-variant" style={{ opacity: 0.7, fontWeight: '500', fontSize: '18px' }}>
                    On/Kun: {card.kana}
                  </span>
                )}
              </div>
              <div className="card-instruction-row">
                <span className="material-symbols-outlined">touch_app</span>
                <span>Chạm để xem nghĩa Hán Việt</span>
              </div>
            </div>
          </SwiperSlide>

          {/* Mặt 2: Nghĩa Hán Việt & Định nghĩa */}
          <SwiperSlide>
            <div className="swiper-card-face swiper-card-face-center">
              <div style={{ width: '100%', textAlign: 'center', padding: '0 16px' }}>
                <div className="font-label-sm uppercase tracking-widest text-outline mb-base block" style={{ fontSize: '11px' }}>
                  Hán Việt &amp; Ý nghĩa
                </div>
                <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '10px 16px', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--surface-variant)', marginBottom: '12px' }}>
                  <span className="font-headline-md text-on-surface" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--tertiary)' }}>
                    {card.details}
                  </span>
                </div>
                <p className="font-headline-sm text-on-surface" style={{ fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                  Nghĩa: {card.definition}
                </p>
                {card.sinoVietnamese && (
                  <p style={{ fontSize: '12px', color: 'var(--outline-variant)', marginTop: '8px' }}>
                    ({card.sinoVietnamese})
                  </p>
                )}
              </div>
              <div className="card-instruction-row">
                <span className="material-symbols-outlined">rotate_right</span>
                <span>Chạm để xem phân tích bộ thủ</span>
              </div>
            </div>
          </SwiperSlide>

          {/* Mặt 3: Cấu tạo bộ thủ & Phân tích */}
          <SwiperSlide>
            <div className="swiper-card-face" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}>
                <div className="font-label-sm uppercase tracking-widest text-outline block" style={{ fontSize: '11px', marginBottom: '8px' }}>
                  Cấu tạo &amp; Phân tích bộ thủ
                </div>
              </div>
              
              {/* Scrollable analysis content */}
              <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1. Radicals List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {card.components && card.components.map((comp, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', backgroundColor: 'var(--surface-container-low)', borderRadius: '8px', border: '1px solid var(--surface-variant)' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--tertiary)' }}>
                        {comp.char}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: '500' }}>
                        {comp.meaning}
                      </span>
                    </div>
                  ))}
                  {(!card.components || card.components.length === 0) && (
                    <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', textAlign: 'center' }}>Không có thông tin bộ thủ.</span>
                  )}
                </div>

                {/* 2. Radical Analysis Story */}
                {card.radicalAnalysis && (
                  <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '10px 12px', borderRadius: '8px', borderLeft: '4px solid var(--primary)', fontSize: '12px', color: 'var(--on-surface-variant)', lineHeight: '1.4', textAlign: 'left' }}>
                    <strong style={{ display: 'block', color: 'var(--primary)', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Giải nghĩa bộ thủ</strong>
                    {card.radicalAnalysis}
                  </div>
                )}

                {/* 3. Word Logic Story */}
                {card.characterLogic && (
                  <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '10px 12px', borderRadius: '8px', borderLeft: '4px solid var(--secondary)', fontSize: '12px', color: 'var(--on-surface-variant)', lineHeight: '1.4', textAlign: 'left' }}>
                    <strong style={{ display: 'block', color: 'var(--secondary)', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Liên tưởng ghi nhớ</strong>
                    {card.characterLogic}
                  </div>
                )}
              </div>

              <div className="card-instruction-row" style={{ marginTop: '12px', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">restart_alt</span>
                <span>Về mặt trước</span>
              </div>
            </div>
          </SwiperSlide>
        </>
      );
    }

    return null;
  };

  // Calculate statistics
  const totalCards = activeCards.length;
  const progressPercent = totalCards > 0 ? Math.min(((currentIndex + 1) / totalCards) * 100, 100) : 0;

  const totalLearned = Object.values(studyResponses).filter(v => v === 'learned').length;
  const totalForgot = Object.values(studyResponses).filter(v => v === 'forgot').length;

  // Render Loading State
  if (loading) {
    return (
      <div className="app-container">
        <header className="app-header">
          <button className="back-btn" onClick={onBack}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h1 className="header-title">Đang nạp...</h1>
        </header>
        <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--on-surface-variant)', fontSize: '15px' }}>Đang nạp thẻ học từ Supabase...</span>
        </main>
      </div>
    );
  }

  // Render Congratulation State when completed
  if (totalCards > 0 && currentIndex >= totalCards) {
    return (
      <div className="app-container">
        <header className="app-header">
          <button className="back-btn" onClick={onBack}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h1 className="header-title">Hoàn thành phiên</h1>
        </header>

        <main className="config-card congrats-card">
          <div className="congrats-icon-ring">
            <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>emoji_events</span>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--on-surface)' }}>
            Chúc mừng bạn!
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', lineHeight: '1.5' }}>
            Bạn đã hoàn thành việc ôn tập tất cả các thẻ học trong phiên này.
          </p>

          <div className="congrats-stat-row">
            <div className="congrats-stat-item">
              <span className="congrats-stat-val learned">{totalLearned}</span>
              <span className="congrats-stat-lbl">Đã thuộc</span>
            </div>
            <div className="congrats-stat-item">
              <span className="congrats-stat-val unlearned">{totalForgot}</span>
              <span className="congrats-stat-lbl">Chưa thuộc</span>
            </div>
          </div>

          <button
            className="primary-btn"
            style={{ width: '100%' }}
            onClick={onBack}
          >
            <span>Làm phiên học mới</span>
            <span className="material-symbols-outlined">restart_alt</span>
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <button className="back-btn" onClick={onBack}>
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="header-progress-text">
          <span className="progress-label">Session Progress</span>
          <span className="progress-value">
            {totalCards > 0 ? `${Math.min(currentIndex + 1, totalCards)} / ${totalCards}` : '0 / 0'}
          </span>
        </div>
        <div className="user-avatar"></div>
      </header>

      {/* Progress Bar */}
      <div style={{ padding: '0 var(--spacing-margin-mobile) var(--spacing-base)' }}>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-container)', borderRadius: 'var(--rounded-full)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: 'var(--primary-container)',
              borderRadius: 'var(--rounded-full)',
              transition: 'width 0.4s ease-out'
            }}
          ></div>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 'var(--spacing-margin-mobile)', justifyContent: 'center' }}>

        {/* Quick Action Pill Buttons */}
        <div className="quick-action-bar">
          <button
            className={`quick-pill-btn ${unlearnedOnly ? 'active' : ''}`}
            onClick={() => { setUnlearnedOnly(!unlearnedOnly); setLearnedOnly(false); }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--error)' }}>close</span>
            <span>Chưa thuộc</span>
          </button>

          <button
            className={`quick-pill-btn ${learnedOnly ? 'active' : ''}`}
            onClick={() => { setLearnedOnly(!learnedOnly); setUnlearnedOnly(false); }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--correct, #00c985)' }}>check_circle</span>
            <span>Đã thuộc</span>
          </button>

          <button
            className={`quick-pill-btn ${isShuffled ? 'active' : ''}`}
            onClick={handleShuffleToggle}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>shuffle</span>
            <span>Ngẫu nhiên</span>
          </button>

          <button
            className={`quick-pill-btn ${favoritesOnly ? 'active' : ''}`}
            onClick={() => setFavoritesOnly(!favoritesOnly)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ffb800' }}>star</span>
            <span>Yêu thích</span>
          </button>
        </div>

        {totalCards > 0 ? (
          <>
            {/* Flashcard container with Perspective frame */}
            <div 
              style={{ width: '100%', maxWidth: '380px', aspectRatio: '3/4', margin: '0 auto', transition: 'all 0.25s ease' }}
              className={`perspective-1000 ${isPopping ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
            >
              <Swiper
                onSwiper={setSwiperInstance}
                onSlideChange={(swiper) => {
                  setCurrentIndex(swiper.activeIndex);
                  // Reset all cards' rotation back to Face 1 when swiping between words
                  Object.values(innerSwipers.current).forEach(s => {
                    if (s && typeof s.slideToLoop === 'function') {
                      s.slideToLoop(0, 0);
                    }
                  });
                }}
                spaceBetween={20}
                style={{ width: '100%', height: '100%' }}
              >
                {activeCards.map((card) => (
                  <SwiperSlide key={card.id}>
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '24px',
                        border: studyResponses[card.id] === 'learned'
                          ? '2px solid rgba(34, 197, 94, 0.55)'
                          : studyResponses[card.id] === 'forgot'
                          ? '2px solid rgba(239, 68, 68, 0.4)'
                          : '2px solid transparent',
                        transition: 'border 0.3s ease',
                        overflow: 'hidden',
                      }}
                      onClick={() => handleCardClick(card.id)}
                    >
                      <Swiper
                        effect={'cube'}
                        loop={true}
                        allowTouchMove={false}
                        cubeEffect={{
                          shadow: false,
                          slideShadows: false,
                        }}
                        modules={[EffectCube]}
                        onSwiper={(swiper) => {
                          innerSwipers.current[card.id] = swiper;
                        }}
                        style={{ width: '100%', height: '100%' }}
                      >
                        {renderCardFaces(card)}
                      </Swiper>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Bottom Actions: Đánh giá thuộc / chưa thuộc */}
            <div style={{ width: '100%', maxWidth: '380px', margin: 'var(--spacing-stack-md) auto 0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button
                className="study-btn-forgot"
                onClick={() => handleResponse('forgot')}
              >
                <span className="material-symbols-outlined mb-1">close</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Chưa thuộc</span>
              </button>

              <button
                className="study-btn-learned"
                onClick={() => handleResponse('learned')}
              >
                <span className="material-symbols-outlined mb-1">check_circle</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Đã thuộc</span>
              </button>
            </div>

          </>
        ) : (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">sentiment_dissatisfied</span>
            <p className="empty-text">Không có thẻ nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper to check elapsed time since mount without triggering React purity checks
function isRecentMount(mountTime, limitMs = 400) {
  return Date.now() - mountTime < limitMs;
}

export default FlashcardStudy;
