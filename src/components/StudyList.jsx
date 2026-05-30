import { useState, useEffect } from 'react';
import { getCardsForLesson, updateCardFavorite, updateCardStatus } from '../services/db';

function StudyList({ lessonId, onBack }) {
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('vocab'); // 'vocab' | 'sentence' | 'kanji'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'unlearned'

  // Track lesson changes to reset loading state during render
  const [prevLessonId, setPrevLessonId] = useState(lessonId);
  if (lessonId !== prevLessonId) {
    setPrevLessonId(lessonId);
    setLoading(true);
  }

  // Fetch cards dynamically from Supabase
  useEffect(() => {
    let active = true;
    getCardsForLesson(lessonId)
      .then(cards => {
        if (active) {
          setVocabList(cards);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải thẻ bài học:', err);
        if (active) {
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [lessonId]);

  // Toggle favorite status
  const toggleFavorite = async (id) => {
    const target = vocabList.find(item => item.id === id);
    if (!target) return;
    const newFavorite = !target.favorite;
    
    // Optimistic update
    setVocabList(prev => prev.map(item => 
      item.id === id ? { ...item, favorite: newFavorite } : item
    ));

    try {
      await updateCardFavorite(id, target.type, newFavorite);
    } catch (err) {
      console.error('Lỗi khi cập nhật yêu thích:', err);
      // Rollback on error
      setVocabList(prev => prev.map(item => 
        item.id === id ? { ...item, favorite: !newFavorite } : item
      ));
    }
  };

  // Toggle mastered/learned status
  const toggleMastered = async (id) => {
    const target = vocabList.find(item => item.id === id);
    if (!target) return;
    const newMastered = !target.mastered;
    const newStatus = newMastered ? 'learned' : 'forgot';

    // Optimistic update
    setVocabList(prev => prev.map(item => 
      item.id === id ? { ...item, mastered: newMastered } : item
    ));

    try {
      await updateCardStatus(id, target.type, newStatus);
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      // Rollback on error
      setVocabList(prev => prev.map(item => 
        item.id === id ? { ...item, mastered: !newMastered } : item
      ));
    }
  };

  // Filter & Search logic
  const filteredList = vocabList.filter(item => {
    // 1. Tab filter
    if (item.type !== activeTab) return false;
    
    // 2. Chip status filter
    if (filterMode === 'unlearned' && item.mastered) return false;
    if (filterMode === 'favorite' && !item.favorite) return false;
    
    // 3. Search query filter
    const query = searchTerm.toLowerCase();
    return (
      item.kanji.toLowerCase().includes(query) ||
      item.kana.toLowerCase().includes(query) ||
      item.definition.toLowerCase().includes(query)
    );
  });

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-title-wrapper">
          <button className="back-btn" onClick={onBack}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h1 className="header-title">Danh sách học tập</h1>
        </div>
        <div className="header-right">
          <span className="font-label-sm text-xs bg-surface-container-high px-3 py-1 rounded-full text-primary font-semibold">
            {typeof lessonId === 'string' ? lessonId.replace('Lesson ', 'Bài ') : (lessonId ? `Bài ${lessonId}` : '')}
          </span>
        </div>
      </header>

      {/* Search Bar */}
      <div className="search-container" style={{ padding: '0 var(--spacing-margin-mobile)' }}>
        <div className="search-bar-wrapper">
          <span className="material-symbols-outlined search-icon">search</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Tìm kiếm từ vựng, ngữ pháp..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Tabs */}
      <div className="nav-tabs">
        <button 
          className={`tab-btn ${activeTab === 'vocab' ? 'active' : ''}`}
          onClick={() => setActiveTab('vocab')}
        >
          Từ vựng
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sentence' ? 'active' : ''}`}
          onClick={() => setActiveTab('sentence')}
        >
          Mẫu câu
        </button>
        <button 
          className={`tab-btn ${activeTab === 'kanji' ? 'active' : ''}`}
          onClick={() => setActiveTab('kanji')}
        >
          Hán tự
        </button>
      </div>

      {/* Sub Filter Chips */}
      <div className="filter-chips">
        <button 
          className={`chip-btn ${filterMode === 'all' ? 'active' : ''}`}
          onClick={() => setFilterMode('all')}
        >
          Tất cả
        </button>
        <button 
          className={`chip-btn ${filterMode === 'unlearned' ? 'active' : ''}`}
          onClick={() => setFilterMode('unlearned')}
        >
          Chưa thuộc
        </button>
        <button 
          className={`chip-btn ${filterMode === 'favorite' ? 'active' : ''}`}
          onClick={() => setFilterMode('favorite')}
        >
          Yêu thích
        </button>
      </div>

      {/* Vocab Cards List */}
      <main className="vocab-list-wrapper">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>
            <span style={{ fontSize: '15px' }}>Đang nạp dữ liệu từ Supabase...</span>
          </div>
        ) : filteredList.length > 0 ? (
          filteredList.map((item) => (
            <div className="vocab-card" key={item.id}>
              {/* Badge level */}
              <span className="vocab-level-badge">{item.level}</span>
              
              {/* Star Favorite */}
              <button 
                className={`favorite-btn ${item.favorite ? 'active' : ''}`}
                onClick={() => toggleFavorite(item.id)}
              >
                <span className="material-symbols-outlined">
                  {item.favorite ? 'star' : 'star'}
                </span>
              </button>

              {/* Word Details */}
              <div className="vocab-details">
                <span className="vocab-kana">[{item.kana}]</span>
                <h3 className="vocab-kanji">{item.kanji}</h3>
                <p className="vocab-definition">{item.definition}</p>
              </div>

              {/* Checkmark status */}
              <button 
                className={`master-btn ${item.mastered ? 'active' : ''}`}
                onClick={() => toggleMastered(item.id)}
              >
                <span className="material-symbols-outlined text-[18px]">
                  check
                </span>
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-icon">folder_open</span>
            <p className="empty-text">Không tìm thấy kết quả phù hợp.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudyList;
