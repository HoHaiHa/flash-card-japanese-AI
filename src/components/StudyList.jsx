import { useState } from 'react';

// Mock vocabulary data grouped by lesson
const MOCK_VOCAB_DATA = {
  'Lesson 1': [
    { id: 'v1', level: 'N5', kana: 'べんきょう', kanji: '勉強する', definition: 'Học tập, nghiên cứu', type: 'vocab', mastered: false, favorite: false },
    { id: 'v2', level: 'N5', kana: 'たべる', kanji: '食べる', definition: 'Ăn', type: 'vocab', mastered: true, favorite: true },
    { id: 'v3', level: 'N4', kana: 'よむ', kanji: '読む', definition: 'Đọc (sách, báo)', type: 'vocab', mastered: false, favorite: false },
    { id: 's1', level: 'N5', kana: 'これをたべます', kanji: 'これを食べます。', definition: 'Tôi ăn cái này.', type: 'sentence', mastered: false, favorite: false },
    { id: 'k1', level: 'N5', kana: 'べん', kanji: '勉', definition: 'Miễn (cố gắng)', type: 'kanji', mastered: false, favorite: false }
  ],
  'Lesson 2': [
    { id: 'v4', level: 'N5', kana: 'いく', kanji: '行く', definition: 'Đi', type: 'vocab', mastered: false, favorite: false },
    { id: 'v5', level: 'N3', kana: 'かんじょう', kanji: '感情', definition: 'Cảm xúc, tình cảm', type: 'vocab', mastered: false, favorite: false },
    { id: 's2', level: 'N4', kana: 'いっしょにいきましょう', kanji: '一緒に行きましょう。', definition: 'Chúng ta cùng đi nhé.', type: 'sentence', mastered: true, favorite: false },
    { id: 'k2', level: 'N4', kana: 'こう', kanji: '行', definition: 'Hành (đi)', type: 'kanji', mastered: true, favorite: true }
  ]
};

function StudyList({ lessonId, onBack }) {
  const [vocabList, setVocabList] = useState(MOCK_VOCAB_DATA[lessonId] || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('vocab'); // 'vocab' | 'sentence' | 'kanji'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'unlearned'

  // Toggle favorite status
  const toggleFavorite = (id) => {
    setVocabList(vocabList.map(item => 
      item.id === id ? { ...item, favorite: !item.favorite } : item
    ));
  };

  // Toggle mastered/learned status
  const toggleMastered = (id) => {
    setVocabList(vocabList.map(item => 
      item.id === id ? { ...item, mastered: !item.mastered } : item
    ));
  };

  // Filter & Search logic
  const filteredList = vocabList.filter(item => {
    // 1. Tab filter
    if (item.type !== activeTab) return false;
    
    // 2. Chip status filter
    if (filterMode === 'unlearned' && item.mastered) return false;
    
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
            {lessonId === 'Lesson 1' ? 'Bài 1' : 'Bài 2'}
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
      </div>

      {/* Vocab Cards List */}
      <main className="vocab-list-wrapper">
        {filteredList.length > 0 ? (
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
