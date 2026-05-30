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
          cards.forEach(card => {
            favs[card.id] = card.favorite;
            if (card.mastered) {
              initialResponses[card.id] = 'learned';
            }
          });
          setFavorites(favs);
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

    return result;
  }, [unlearnedOnly, favoritesOnly, originalCards, studyResponses, favorites]);

  // Reset currentIndex when activeCards list changes
  const [prevActiveCards, setPrevActiveCards] = useState(activeCards);
  if (activeCards !== prevActiveCards) {
    setPrevActiveCards(activeCards);
    setCurrentIndex(0);
  }

  // Reset swipers position when activeCards list changes
  useEffect(() => {
    if (swiperInstance) {
      swiperInstance.slideToLoop(0, 0);
    }
    Object.values(innerSwipers.current).forEach(s => {
      if (s && typeof s.slideToLoop === 'function') {
        s.slideToLoop(0, 0);
      }
    });
  }, [activeCards, swiperInstance]);

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

    // Save to database
    try {
      await updateCardStatus(currentCard.id, currentCard.type, type);
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
    }

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

  // Handle xáo trộn thứ tự (Shuffle)
  const handleShuffle = () => {
    setOriginalCards(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setCurrentIndex(0);
    if (swiperInstance) {
      swiperInstance.slideToLoop(0, 0);
    }
    Object.values(innerSwipers.current).forEach(s => {
      if (s && typeof s.slideToLoop === 'function') {
        s.slideToLoop(0, 0);
      }
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
      return (
        <>
          <span className="card-level-badge">{card.level}</span>
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 16px' }}>
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
                  <span className="font-body-lg text-on-surface-variant opacity-60">
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
                  <span>Xem cách sử dụng (Ví dụ)</span>
                </div>
              </div>
            </SwiperSlide>

            {/* Mặt 3: Cách sử dụng (Ví dụ) */}
            <SwiperSlide>
              <div className="swiper-card-face swiper-card-face-center">
                <div style={{ width: '100%', textAlign: 'center', padding: '0 16px' }}>
                  <div className="font-label-sm uppercase tracking-widest text-outline mb-base block" style={{ fontSize: '11px' }}>
                    Cách sử dụng &amp; Ví dụ
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                    <p className="font-body-md text-on-surface-variant" style={{ fontStyle: 'italic', color: 'var(--primary)', fontWeight: '500', fontSize: '16px' }}>
                      {card.exampleJp}
                    </p>
                    <p className="font-body-sm text-on-surface-variant opacity-80" style={{ fontSize: '14px' }}>
                      {card.exampleVi}
                    </p>
                  </div>
                </div>
                <div className="card-instruction-row" style={{ marginTop: 'auto', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined">restart_alt</span>
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <span className="font-display-jp text-on-surface mb-stack-sm" style={{ fontSize: card.kanji.length > 5 ? '32px' : '48px' }}>
                    {card.kanji}
                  </span>
                  <span className="font-body-lg text-on-surface-variant opacity-60">
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
                  <span>Chạm để xem mẫu câu ví dụ</span>
                </div>
              </div>
            </SwiperSlide>

            {/* Mặt 3: Mẫu câu ví dụ */}
            <SwiperSlide>
              <div className="swiper-card-face swiper-card-face-center">
                <div style={{ width: '100%', textAlign: 'center', padding: '0 16px' }}>
                  <div className="font-label-sm uppercase tracking-widest text-outline mb-base block" style={{ fontSize: '11px' }}>
                    Mẫu câu ví dụ
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                    <p className="font-body-md text-on-surface-variant" style={{ fontStyle: 'italic', color: 'var(--primary)', fontWeight: '500', fontSize: '16px' }}>
                      {card.exampleJp}
                    </p>
                    <p className="font-body-sm text-on-surface-variant opacity-80" style={{ fontSize: '14px' }}>
                      {card.exampleVi}
                    </p>
                  </div>
                </div>
                <div className="card-instruction-row" style={{ marginTop: 'auto', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined">restart_alt</span>
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
          {/* Mặt 1: Câu ví dụ tiếng Nhật chính */}
          <SwiperSlide>
            <div className="swiper-card-face swiper-card-face-center">
              {renderHeader(true)}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 16px' }}>
                <span className="font-display-jp text-on-surface mb-stack-sm" style={{ fontSize: card.kanji.length > 10 ? '24px' : '32px', lineHeight: '1.4' }}>
                  {card.kanji}
                </span>
                <span className="font-body-lg text-on-surface-variant opacity-60">
                  {card.kana}
                </span>
              </div>
              <div className="card-instruction-row">
                <span className="material-symbols-outlined">touch_app</span>
                <span>Chạm để xem ý nghĩa &amp; cấu trúc</span>
              </div>
            </div>
          </SwiperSlide>

          {/* Mặt 2: Ý nghĩa tiếng Việt & cấu trúc */}
          <SwiperSlide>
            <div className="swiper-card-face swiper-card-face-center">
              <div style={{ width: '100%', textAlign: 'center', padding: '0 16px' }}>
                <div className="font-label-sm uppercase tracking-widest text-outline mb-base block" style={{ fontSize: '11px' }}>
                  Ý nghĩa &amp; Cấu trúc
                </div>
                <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '10px 14px', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--surface-variant)', marginBottom: '12px' }}>
                  <span className="font-headline-md text-on-surface" style={{ fontSize: '15px', fontWeight: '600', color: 'var(--primary)' }}>
                    {card.definition}
                  </span>
                </div>
                {card.details && (
                  <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', margin: '0 auto', maxWidth: '280px', lineHeight: '1.4' }}>
                    <strong>Mẫu câu:</strong> {card.details}
                  </p>
                )}
                {card.sinoVietnamese && (
                  <p style={{ fontSize: '11px', color: 'var(--outline)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {card.sinoVietnamese}
                  </p>
                )}
              </div>
              <div className="card-instruction-row">
                <span className="material-symbols-outlined">rotate_right</span>
                <span>Chạm để xem ví dụ chi tiết</span>
              </div>
            </div>
          </SwiperSlide>

          {/* Mặt 3: Ví dụ bổ sung / cách sử dụng */}
          <SwiperSlide>
            <div className="swiper-card-face swiper-card-face-center">
              <div style={{ width: '100%', textAlign: 'center', padding: '0 16px' }}>
                <div className="font-label-sm uppercase tracking-widest text-outline mb-base block" style={{ fontSize: '11px' }}>
                  Cách sử dụng &amp; Ví dụ
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                  <p className="font-body-md text-on-surface-variant" style={{ fontStyle: 'italic', color: 'var(--primary)', fontWeight: '500', fontSize: '15px' }}>
                    {card.exampleJp}
                  </p>
                  <p className="font-body-sm text-on-surface-variant opacity-80" style={{ fontSize: '13px' }}>
                    {card.exampleVi}
                  </p>
                </div>
              </div>
              <div className="card-instruction-row" style={{ marginTop: 'auto', justifyContent: 'center' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span className="font-display-jp text-on-surface mb-stack-sm" style={{ fontSize: '72px', color: 'var(--tertiary)' }}>
                  {card.kanji}
                </span>
                <span className="font-body-lg text-on-surface-variant opacity-60">
                  On/Kun: {card.kana}
                </span>
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

          {/* Mặt 3: Cấu tạo bộ thủ */}
          <SwiperSlide>
            <div className="swiper-card-face swiper-card-face-center">
              <div style={{ width: '100%', textAlign: 'center', padding: '0 16px' }}>
                <div className="font-label-sm uppercase tracking-widest text-outline mb-base block" style={{ fontSize: '11px' }}>
                  Cấu tạo bộ thủ
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '260px', margin: '0 auto' }}>
                  {card.components && card.components.map((comp, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 10px', backgroundColor: 'var(--surface-container-low)', borderRadius: '8px', width: '100%', border: '1px solid var(--surface-variant)' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--tertiary)' }}>
                        {comp.char}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', textAlign: 'left' }}>
                        {comp.meaning}
                      </span>
                    </div>
                  ))}
                  {(!card.components || card.components.length === 0) && (
                    <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Không có thông tin bộ thủ.</span>
                  )}
                </div>
              </div>
              <div className="card-instruction-row" style={{ marginTop: 'auto', justifyContent: 'center' }}>
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
  const progressPercent = totalCards > 0 ? (currentIndex / totalCards) * 100 : 0;

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
            {totalCards > 0 ? `${currentIndex} / ${totalCards}` : '0 / 0'}
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
            onClick={() => setUnlearnedOnly(!unlearnedOnly)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--error)' }}>close</span>
            <span>Chưa thuộc</span>
          </button>

          <button className="quick-pill-btn" onClick={handleShuffle}>
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
                style={{ width: '100%', height: '100%' }}
              >
                {activeCards.map((card) => (
                  <SwiperSlide key={card.id}>
                    <div 
                      style={{ width: '100%', height: '100%' }}
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
