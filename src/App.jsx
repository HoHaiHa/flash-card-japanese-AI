import { useState } from 'react';
import LearningConfig from './components/LearningConfig';
import StudyList from './components/StudyList';
import FlashcardStudy from './components/FlashcardStudy';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('config'); // 'config' | 'list' | 'flashcard'
  const [learningConfig, setLearningConfig] = useState(null);
  const [selectedLessonForList, setSelectedLessonForList] = useState(null);

  // Triggered when configuration is valid and start is clicked
  const handleStartLearning = (config) => {
    setLearningConfig(config);
    setCurrentScreen('flashcard');
  };

  // Switch screen handler
  const handleViewList = (lessonId) => {
    setSelectedLessonForList(lessonId);
    setCurrentScreen('list');
  };

  return (
    <>
      {currentScreen === 'config' && (
        <LearningConfig 
          onStart={handleStartLearning} 
          onViewList={handleViewList}
        />
      )}
      
      {currentScreen === 'list' && (
        <StudyList 
          lessonId={selectedLessonForList} 
          onBack={() => setCurrentScreen('config')}
        />
      )}

      {currentScreen === 'flashcard' && (
        <FlashcardStudy 
          config={learningConfig} 
          onBack={() => setCurrentScreen('config')}
        />
      )}
    </>
  );
}

export default App;
