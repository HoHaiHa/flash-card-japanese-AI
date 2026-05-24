import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCube } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-cube';

// Mock database containing comprehensive vocabulary with 3-sided properties
const VOCAB_DATABASE = {
  'Lesson 1': [
    {
      id: 'v1',
      level: 'N5',
      kana: 'べんきょう',
      kanji: '勉強する',
      sinoVietnamese: 'CỐ GẮNG & CƯỜNG TRÁNG',
      details: 'Âm Hán: MIỄN CƯỜNG',
      components: [
        { char: '勉', meaning: 'Miễn (cố gắng hết sức)' },
        { char: '強', meaning: 'Cường (mạnh mẽ, cứng cáp)' }
      ],
      definition: 'Học tập, nghiên cứu',
      exampleJp: '毎日日本語を勉強しています。',
      exampleVi: 'Mỗi ngày tôi đều học tiếng Nhật.',
      type: 'vocab',
      favorite: false
    },
    {
      id: 'v2',
      level: 'N5',
      kana: 'たべる',
      kanji: '食べる',
      sinoVietnamese: 'ĂN UỐNG / THỰC PHẨM',
      details: 'Âm Hán: THỰC',
      components: [
        { char: '食', meaning: 'Thực (ăn / đồ ăn)' }
      ],
      definition: 'Ăn',
      exampleJp: 'レストランで晩ご飯を食べます。',
      exampleVi: 'Tôi ăn cơm tối ở nhà hàng.',
      type: 'vocab',
      favorite: true
    },
    {
      id: 'v3',
      level: 'N4',
      kana: 'よむ',
      kanji: '読む',
      sinoVietnamese: 'ĐỌC SÁCH / PHÁT NGÔN',
      details: 'Âm Hán: ĐỘC',
      components: [
        { char: '言', meaning: 'Bộ Ngôn (lời nói)' },
        { char: '売', meaning: 'Bộ Mại (bán buôn)' }
      ],
      definition: 'Đọc (sách, báo)',
      exampleJp: '図書館で小説を読みます。',
      exampleVi: 'Tôi đọc tiểu thuyết ở thư viện.',
      type: 'vocab',
      favorite: false
    },
    {
      id: 's1',
      level: 'N5',
      kana: 'これをたべます',
      kanji: 'これを食べます。',
      sinoVietnamese: 'CẤU TRÚC TÂN NGỮ + ĐỘNG TỪ',
      details: 'Mẫu câu: Ăn cái này',
      components: [
        { char: 'これ', meaning: 'Cái này (chỉ thị từ)' },
        { char: 'を', meaning: 'Trợ từ chỉ tân ngữ trực tiếp' }
      ],
      definition: 'Tôi ăn cái này.',
      exampleJp: 'りんごがあります。これを食べます。',
      exampleVi: 'Có quả táo. Tôi ăn cái này.',
      type: 'sentence',
      favorite: false
    },
    {
      id: 'k1',
      level: 'N5',
      kana: 'べん',
      kanji: '勉',
      sinoVietnamese: 'CỐ GẮNG / NỖ LỰC',
      details: 'Chữ Hán: MIỄN',
      components: [
        { char: '力', meaning: 'Bộ Lực (sức mạnh)' },
        { char: '免', meaning: 'Chữ Miễn (tránh né)' }
      ],
      definition: 'Miễn (cố gắng)',
      exampleJp: '勉める (つとめる): Nỗ lực, cố gắng.',
      exampleVi: 'Chữ Miễn ghép trong Miễn Cường (Học tập).',
      type: 'kanji',
      favorite: false
    }
  ],
  'Lesson 2': [
    {
      id: 'v4',
      level: 'N5',
      kana: 'いく',
      kanji: '行く',
      sinoVietnamese: 'DI CHUYỂN / HÀNH ĐỘNG',
      details: 'Âm Hán: HÀNH',
      components: [
        { char: '彳', meaning: 'Bộ Xích (bước chân trái)' },
        { char: '亍', meaning: 'Bộ Súc (bước chân phải)' }
      ],
      definition: 'Đi',
      exampleJp: '明日東京へ行きます。',
      exampleVi: 'Ngày mai tôi sẽ đi Tokyo.',
      type: 'vocab',
      favorite: false
    },
    {
      id: 'v5',
      level: 'N3',
      kana: 'かんじょう',
      kanji: '感情',
      sinoVietnamese: 'CẢM XÚC / CẢM TÌNH',
      details: 'Âm Hán: CẢM TÌNH',
      components: [
        { char: '感', meaning: 'Cảm (cảm nhận, rung động)' },
        { char: '情', meaning: 'Tình (tình cảm, sự tình)' }
      ],
      definition: 'Cảm xúc, tình cảm',
      exampleJp: '彼女は感情が豊かな人です。',
      exampleVi: 'Cô ấy là một người dồi dào cảm xúc.',
      type: 'vocab',
      favorite: false
    },
    {
      id: 's2',
      level: 'N4',
      kana: 'いっしょにいきましょう',
      kanji: '一緒に行きましょう。',
      sinoVietnamese: 'ĐỀ NGHỊ CÙNG LÀM VÀO HÀNH ĐỘNG',
      details: 'Mẫu câu: Cùng đi nhé',
      components: [
        { char: '一緒に', meaning: 'Cùng nhau (trạng từ)' },
        { char: 'ましょう', meaning: 'Đuôi rủ rê lịch sự' }
      ],
      definition: 'Chúng ta cùng đi nhé.',
      exampleJp: '天気がいいですね。一緒に行きましょう。',
      exampleVi: 'Thời tiết đẹp nhỉ. Chúng ta cùng đi nhé.',
      type: 'sentence',
      favorite: false
    },
    {
      id: 'k2',
      level: 'N4',
      kana: 'こう',
      kanji: '行',
      sinoVietnamese: 'DI CHUYỂN / HÀNH TRÌNH',
      details: 'Chữ Hán: HÀNH',
      components: [
        { char: '彳', meaning: 'Bộ Xích' },
        { char: '亍', meaning: 'Bộ Súc' }
      ],
      definition: 'Hành (đi / hàng)',
      exampleJp: '行う (o-co-nau): Thực hiện, tiến hành.',
      exampleVi: 'Hành trình, ngân hàng, hành động.',
      type: 'kanji',
      favorite: true
    }
  ]
};

function FlashcardStudy({ config, onBack }) {
  // Global cards queue
  const [originalCards, setOriginalCards] = useState([]);
  const [activeCards, setActiveCards] = useState([]);

  // Study session indices
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [currentFace, setCurrentFace] = useState(1);
  const innerSwipers = useRef({});

  // Interactive UI effects
  const [mountTime] = useState(() => Date.now());
  const [flashType, setFlashType] = useState(null); // 'learned' | 'forgot' | null
  const [isPopping, setIsPopping] = useState(false);
  const [studyResponses, setStudyResponses] = useState({}); // { cardId: 'learned' | 'forgot' }
  const [favorites, setFavorites] = useState({}); // { cardId: bool }

  // Quick Filters state
  const [unlearnedOnly, setUnlearnedOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Initialize cards from configurations
  useEffect(() => {
    let gathered = [];
    config?.selectedLessons.forEach(lesson => {
      const lessonCards = VOCAB_DATABASE[lesson] || [];
      const filtered = lessonCards.filter(card => config.contentTypes.includes(card.type));
      gathered = [...gathered, ...filtered];
    });

    setOriginalCards(gathered);
    setActiveCards(gathered);

    // Set initial favorites mapping
    const favs = {};
    gathered.forEach(card => {
      favs[card.id] = card.favorite;
    });
    setFavorites(favs);
  }, [config]);

  // Apply filters whenever filters or responses change
  useEffect(() => {
    let result = [...originalCards];

    // Filter unlearned only
    if (unlearnedOnly) {
      result = result.filter(card => studyResponses[card.id] !== 'learned');
    }

    // Filter favorites only
    if (favoritesOnly) {
      result = result.filter(card => favorites[card.id]);
    }

    setActiveCards(result);
    setCurrentIndex(0); // Reset index to first card of filtered list
    if (swiperInstance) {
      swiperInstance.slideToLoop(0, 0);
    }
    Object.values(innerSwipers.current).forEach(s => {
      if (s && typeof s.slideToLoop === 'function') {
        s.slideToLoop(0, 0);
      }
    });
    setCurrentFace(1);
  }, [unlearnedOnly, favoritesOnly, originalCards, studyResponses, favorites]);

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
    if (Date.now() - mountTime < 400) return;
    const innerSwiper = innerSwipers.current[cardId];
    if (innerSwiper) {
      innerSwiper.slideNext();
    }
  };

  // Handle Đánh giá (Learned / Forgot)
  const handleResponse = (type) => {
    if (activeCards.length === 0 || currentIndex >= activeCards.length) return;

    const currentCard = activeCards[currentIndex];

    // Save response status
    setStudyResponses(prev => ({
      ...prev,
      [currentCard.id]: type
    }));

    // Trigger visual flash
    setFlashType(type);
    setIsPopping(true);

    setTimeout(() => {
      // Clear visual flash & advance
      setFlashType(null);
      
      if (currentIndex === activeCards.length - 1) {
        // Last card, trigger congratulations screen
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
    const shuffled = [...activeCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setActiveCards(shuffled);
    setCurrentIndex(0);
    if (swiperInstance) {
      swiperInstance.slideToLoop(0, 0);
    }
    Object.values(innerSwipers.current).forEach(s => {
      if (s && typeof s.slideToLoop === 'function') {
        s.slideToLoop(0, 0);
      }
    });
    setCurrentFace(1);
  };

  // Toggle favorite from inside study session
  const toggleFavorite = (cardId) => {
    setFavorites(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Calculate statistics
  const currentCard = activeCards[currentIndex];
  const totalCards = activeCards.length;
  const progressPercent = totalCards > 0 ? (currentIndex / totalCards) * 100 : 0;

  const totalLearned = Object.values(studyResponses).filter(v => v === 'learned').length;
  const totalForgot = Object.values(studyResponses).filter(v => v === 'forgot').length;

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
                  setCurrentFace(1);
                }}
                style={{ width: '100%', height: '100%' }}
              >
                {activeCards.map((card, idx) => (
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
                        {/* Mặt 1: Kanji / Chữ Nhật chính (Front) */}
                        <SwiperSlide>
                          <div className="swiper-card-face swiper-card-face-center">
                            <span className="card-level-badge">
                              {card.level}
                            </span>
                            
                            {/* Toggle Favorite Star inside Card */}
                            <button 
                              className="card-favorite-btn" 
                              style={{ color: favorites[card.id] ? '#ffb800' : 'var(--outline-variant)' }}
                              onClick={(e) => {
                                e.stopPropagation(); // Avoid triggering card rotation click
                                toggleFavorite(card.id);
                              }}
                            >
                              <span className="material-symbols-outlined">
                                {favorites[card.id] ? 'star' : 'star'}
                              </span>
                            </button>

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
                              <span>Chạm để xem âm Hán</span>
                            </div>
                          </div>
                        </SwiperSlide>

                        {/* Mặt 2: Âm Hán Việt & Cấu tạo bộ thủ (Middle) */}
                        <SwiperSlide>
                          <div className="swiper-card-face swiper-card-face-center">
                            <div style={{ width: '100%', textAlign: 'center' }}>
                              <div className="font-label-sm uppercase tracking-widest text-outline mb-base block" style={{ fontSize: '11px' }}>
                                Âm Hán &amp; Cấu trúc
                              </div>
                              <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '12px 16px', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--surface-variant)', marginBottom: '16px' }}>
                                <span className="font-headline-md text-on-surface" style={{ fontSize: '16px', fontWeight: '600' }}>
                                  {card.details}
                                </span>
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '240px', margin: '0 auto' }}>
                                {card.components.map((comp, idx) => (
                                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', backgroundColor: 'var(--surface-container-low)', borderRadius: '8px', width: '100%' }}>
                                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--tertiary)' }}>
                                      {comp.char}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', textAlign: 'left' }}>
                                      {comp.meaning}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="card-instruction-row" style={{ marginTop: 'auto' }}>
                              <span className="material-symbols-outlined">rotate_right</span>
                              <span>Xem nghĩa &amp; Ví dụ</span>
                            </div>
                          </div>
                        </SwiperSlide>

                        {/* Mặt 3: Nghĩa & Ví dụ minh họa (Back) */}
                        <SwiperSlide>
                          <div className="swiper-card-face swiper-card-face-center">
                            <div style={{ width: '100%', textAlign: 'center' }}>
                              <div className="font-label-sm uppercase tracking-widest text-outline mb-base block" style={{ fontSize: '11px' }}>
                                Ý nghĩa &amp; Ví dụ
                              </div>
                              
                              <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '12px 16px', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--surface-variant)', marginBottom: '16px' }}>
                                <span className="font-headline-md text-on-surface" style={{ fontSize: '16px', fontWeight: '600' }}>
                                  {card.definition}
                                </span>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '280px', margin: '0 auto' }}>
                                <p className="font-body-md text-on-surface-variant" style={{ fontStyle: 'italic', color: 'var(--primary)', fontWeight: '500' }}>
                                  {card.exampleJp}
                                </p>
                                <p className="font-body-sm text-on-surface-variant opacity-80">
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

export default FlashcardStudy;
