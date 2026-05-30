import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getLessons, 
  getCardsForLesson, 
  getCardsForLessons, 
  updateCardFavorite, 
  updateCardStatus, 
  saveSessionResult,
  getStudySettings,
  saveStudySettings
} from './db';
import { supabase } from '../supabaseClient';

// Polyfill localStorage for Vitest Node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    clear() {
      store = {};
    },
    removeItem(key) {
      delete store[key];
    }
  };
})();
global.localStorage = localStorageMock;


vi.mock('../supabaseClient', () => {
  const queryMock = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
  };
  
  queryMock.select.mockImplementation(() => queryMock);
  queryMock.order.mockImplementation(() => Promise.resolve({ data: null, error: null }));
  queryMock.eq.mockImplementation(() => Promise.resolve({ data: null, error: null }));
  queryMock.in.mockImplementation(() => Promise.resolve({ data: null, error: null }));
  queryMock.update.mockImplementation(() => queryMock);
  queryMock.insert.mockImplementation(() => queryMock);

  return {
    supabase: {
      from: vi.fn(() => queryMock)
    }
  };
});

describe('db.js service tests', () => {
  let queryMock;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    queryMock = supabase.from();
  });

  describe('getLessons', () => {
    it('should fetch and return lessons', async () => {
      const mockLessons = [{ id: 1, name: 'Lesson 1', level: 'N5' }];
      queryMock.order.mockResolvedValueOnce({ data: mockLessons, error: null });

      const result = await getLessons();
      expect(supabase.from).toHaveBeenCalledWith('lessons');
      expect(queryMock.select).toHaveBeenCalledWith('id, name, level');
      expect(queryMock.order).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(result).toEqual(mockLessons);
    });

    it('should throw error when database query fails', async () => {
      const mockError = { message: 'Database failure' };
      queryMock.order.mockResolvedValueOnce({ data: null, error: mockError });

      await expect(getLessons()).rejects.toThrow('Database failure');
    });
  });

  describe('getCardsForLesson', () => {
    it('should fetch and combine vocabularies and sentences', async () => {
      const mockVocabs = [
        { id: 'v1', type: 'vocab', kana: 'a', kanji: 'A', status: 'learned' }
      ];
      const mockSentences = [
        { id: 's1', type: 'sentence', kana: 'b', kanji: 'B', status: 'forgot' }
      ];

      // First call is vocab, second is sentence
      queryMock.eq.mockResolvedValueOnce({ data: mockVocabs, error: null });
      queryMock.eq.mockResolvedValueOnce({ data: mockSentences, error: null });

      const result = await getCardsForLesson(1);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('v1');
      expect(result[0].mastered).toBe(true);
      expect(result[1].id).toBe('s1');
      expect(result[1].mastered).toBe(false);
    });
  });

  describe('getCardsForLessons', () => {
    it('should fetch from vocabularies and sentences based on types', async () => {
      const mockVocabs = [{ id: 'v1', type: 'vocab', kana: 'a', kanji: 'A' }];
      queryMock.in.mockResolvedValueOnce({ data: mockVocabs, error: null });

      // contentTypes = ['vocab'], so only vocab is queried, sentences gets mock empty promise
      const result = await getCardsForLessons([1], ['vocab']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('v1');
    });
  });

  describe('updateCardFavorite', () => {
    it('should update favorite status in vocabularies', async () => {
      queryMock.eq.mockResolvedValueOnce({ error: null });
      
      await updateCardFavorite('v1', 'vocab', true);
      expect(supabase.from).toHaveBeenCalledWith('vocabularies');
      expect(queryMock.update).toHaveBeenCalledWith({ favorite: true });
      expect(queryMock.eq).toHaveBeenCalledWith('id', 'v1');
    });
  });

  describe('updateCardStatus', () => {
    it('should update status in sentences', async () => {
      queryMock.eq.mockResolvedValueOnce({ error: null });
      
      await updateCardStatus('s1', 'sentence', 'learned');
      expect(supabase.from).toHaveBeenCalledWith('sentences');
      expect(queryMock.update).toHaveBeenCalledWith({ status: 'learned' });
      expect(queryMock.eq).toHaveBeenCalledWith('id', 's1');
    });
  });

  describe('localStorage settings', () => {
    it('should save and retrieve study settings', () => {
      const settings = { translationDirection: 'vi-ja', contentTypes: ['vocab'] };
      saveStudySettings(settings);

      const retrieved = getStudySettings();
      expect(retrieved).toEqual(settings);
    });

    it('should return null when no settings are saved', () => {
      const retrieved = getStudySettings();
      expect(retrieved).toBeNull();
    });
  });

  describe('saveSessionResult', () => {
    it('should insert session results and return data', async () => {
      const mockSession = { id: 1, total_cards: 5, learned_count: 3, forgot_count: 2 };
      queryMock.select.mockResolvedValueOnce({ data: [mockSession], error: null });

      const result = await saveSessionResult({ totalCards: 5, learnedCount: 3, forgotCount: 2 });
      expect(supabase.from).toHaveBeenCalledWith('study_sessions');
      expect(queryMock.insert).toHaveBeenCalledWith([{ total_cards: 5, learned_count: 3, forgot_count: 2 }]);
      expect(result).toEqual(mockSession);
    });
  });
});
