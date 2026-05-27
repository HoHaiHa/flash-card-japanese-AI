import { useState, useEffect } from 'react';
import { getLessons } from '../services/db';

function LearningConfig({ onStart, onViewList }) {
  // Form states
  const [translationDirection, setTranslationDirection] = useState('ja-vi');
  const [contentTypes, setContentTypes] = useState(['vocab', 'sentence']); // Default: vocab & sentence selected
  const [selectedLessons, setSelectedLessons] = useState([]); // Loaded dynamically
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Validation state
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getLessons()
      .then(data => {
        if (active) {
          setLessons(data || []);
          setSelectedLessons((data || []).map(l => l.id));
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải bài học:', err);
        if (active) {
          setError('Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra lại file .env hoặc kết nối mạng.');
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  // Handle content types toggle
  const toggleContentType = (type) => {
    if (contentTypes.includes(type)) {
      setContentTypes(contentTypes.filter(item => item !== type));
    } else {
      setContentTypes([...contentTypes, type]);
    }
    setError(''); // Clear error on change
  };

  // Handle lessons toggle
  const toggleLesson = (lessonId) => {
    if (selectedLessons.includes(lessonId)) {
      setSelectedLessons(selectedLessons.filter(item => item !== lessonId));
    } else {
      setSelectedLessons([...selectedLessons, lessonId]);
    }
    setError(''); // Clear error on change
  };

  // Handle start session submit
  const handleStart = () => {
    if (contentTypes.length === 0) {
      setError('Vui lòng chọn ít nhất một nội dung học.');
      return;
    }
    if (selectedLessons.length === 0) {
      setError('Vui lòng chọn ít nhất một bài học để tiếp tục.');
      return;
    }
    
    // Call parent handler with config data
    onStart({
      translationDirection,
      contentTypes,
      selectedLessons
    });
  };

  return (
    <div className="app-container">
      {/* Section 1: Header */}
      <header className="app-header">
        <div className="header-title-wrapper">
          <div className="header-icon-circle">
            <span className="material-symbols-outlined">school</span>
          </div>
          <h1 className="header-title">Cấu hình học tập</h1>
        </div>
        <div className="header-right">
          <div className="user-avatar"></div>
        </div>
      </header>

      {/* Main Config Card */}
      <main className="config-card">
        {/* Hướng dịch */}
        <section className="config-section">
          <label className="config-label" htmlFor="translation-direction">Hướng dịch</label>
          <div className="dropdown-wrapper">
            <select 
              id="translation-direction"
              className="custom-select" 
              value={translationDirection}
              onChange={(e) => setTranslationDirection(e.target.value)}
            >
              <option value="ja-vi">Nhật → Việt</option>
              <option value="vi-ja">Việt → Nhật</option>
            </select>
            <span className="material-symbols-outlined dropdown-icon">expand_more</span>
          </div>
        </section>

        {/* Nội dung học */}
        <section className="config-section">
          <label className="config-label">Nội dung học</label>
          <div className="checkbox-list">
            {/* Từ vựng */}
            <div 
              className={`checkbox-item ${contentTypes.includes('vocab') ? 'checked' : ''}`}
              onClick={() => toggleContentType('vocab')}
            >
              <div className="checkbox-left">
                <span className="material-symbols-outlined checkbox-icon-badge">translate</span>
                <span>Từ vựng</span>
              </div>
              <div className="checkbox-indicator">
                {contentTypes.includes('vocab') && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </div>
            </div>

            {/* Mẫu câu */}
            <div 
              className={`checkbox-item ${contentTypes.includes('sentence') ? 'checked' : ''}`}
              onClick={() => toggleContentType('sentence')}
            >
              <div className="checkbox-left">
                <span className="material-symbols-outlined checkbox-icon-badge">menu</span>
                <span>Mẫu câu</span>
              </div>
              <div className="checkbox-indicator">
                {contentTypes.includes('sentence') && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </div>
            </div>

            {/* Hán tự */}
            <div 
              className={`checkbox-item ${contentTypes.includes('kanji') ? 'checked' : ''}`}
              onClick={() => toggleContentType('kanji')}
            >
              <div className="checkbox-left">
                <span className="material-symbols-outlined checkbox-icon-badge">edit</span>
                <span>Hán tự</span>
              </div>
              <div className="checkbox-indicator">
                {contentTypes.includes('kanji') && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Chọn bài học */}
        <section className="config-section">
          <label className="config-label">Chọn bài học</label>
          {loading ? (
            <div className="dashed-container" style={{ justifyContent: 'center', padding: '16px' }}>
              <span style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>Đang tải bài học...</span>
            </div>
          ) : (
            <div className="dashed-container">
              {lessons.map((lesson) => (
                <div 
                  key={lesson.id}
                  className={`lesson-item ${selectedLessons.includes(lesson.id) ? 'checked' : ''}`}
                  onClick={() => onViewList(lesson.id)}
                >
                  <span className="lesson-label">{lesson.name}</span>
                  <div 
                    className="lesson-indicator"
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài để không chuyển màn hình
                      toggleLesson(lesson.id);
                    }}
                  >
                    {selectedLessons.includes(lesson.id) && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Validation Error Message */}
        {error && (
          <div className="error-message">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Start Button */}
        <button 
          className="primary-btn"
          onClick={handleStart}
        >
          <span>Bắt đầu học ngay</span>
          <span className="material-symbols-outlined">play_arrow</span>
        </button>
      </main>
    </div>
  );
}

export default LearningConfig;
