import { supabase } from '../supabaseClient';

/**
 * Maps database record (snake_case) to application card format (camelCase)
 */
function mapRecordToCard(record) {
  return {
    id: record.id,
    level: record.level || '',
    kana: record.kana || '',
    kanji: record.kanji || '',
    sinoVietnamese: record.sino_vietnamese || '',
    details: record.details || '',
    components: record.components || [],
    definition: record.definition || '',
    exampleJp: record.example_jp || '',
    exampleVi: record.example_vi || '',
    type: record.type,
    favorite: !!record.favorite,
    mastered: record.status === 'learned'
  };
}

/**
 * Fetch all lessons from the database
 */
export async function getLessons() {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, name, level')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Lỗi khi tải danh sách bài học:', error);
    throw error;
  }
  return data;
}

/**
 * Fetch all vocabulary, kanji, and sentences for a single lesson
 */
export async function getCardsForLesson(lessonId) {
  // Query vocabularies (types: 'vocab', 'kanji')
  const vocabPromise = supabase
    .from('vocabularies')
    .select('*')
    .eq('lesson_id', lessonId);

  // Query sentences (type: 'sentence')
  const sentencePromise = supabase
    .from('sentences')
    .select('*')
    .eq('lesson_id', lessonId);

  const [vocabRes, sentenceRes] = await Promise.all([vocabPromise, sentencePromise]);

  if (vocabRes.error) {
    console.error('Lỗi khi tải từ vựng:', vocabRes.error);
    throw vocabRes.error;
  }
  if (sentenceRes.error) {
    console.error('Lỗi khi tải mẫu câu:', sentenceRes.error);
    throw sentenceRes.error;
  }

  const vocabCards = (vocabRes.data || []).map(mapRecordToCard);
  const sentenceCards = (sentenceRes.data || []).map(mapRecordToCard);

  return [...vocabCards, ...sentenceCards];
}

/**
 * Fetch cards from multiple lessons filtered by types (vocab, kanji, sentence)
 */
export async function getCardsForLessons(lessonIds, contentTypes) {
  if (!lessonIds || lessonIds.length === 0 || !contentTypes || contentTypes.length === 0) {
    return [];
  }

  const promises = [];

  // Query vocabularies if 'vocab' or 'kanji' is requested
  const hasVocabOrKanji = contentTypes.includes('vocab') || contentTypes.includes('kanji');
  if (hasVocabOrKanji) {
    promises.push(
      supabase
        .from('vocabularies')
        .select('*')
        .in('lesson_id', lessonIds)
    );
  } else {
    promises.push(Promise.resolve({ data: [] }));
  }

  // Query sentences if 'sentence' is requested
  const hasSentence = contentTypes.includes('sentence');
  if (hasSentence) {
    promises.push(
      supabase
        .from('sentences')
        .select('*')
        .in('lesson_id', lessonIds)
    );
  } else {
    promises.push(Promise.resolve({ data: [] }));
  }

  const [vocabRes, sentenceRes] = await Promise.all(promises);

  if (vocabRes.error) {
    console.error('Lỗi khi tải từ vựng:', vocabRes.error);
    throw vocabRes.error;
  }
  if (sentenceRes.error) {
    console.error('Lỗi khi tải mẫu câu:', sentenceRes.error);
    throw sentenceRes.error;
  }

  // Map and filter by exact contentTypes (e.g. filter out 'kanji' if only 'vocab' was requested)
  const vocabCards = (vocabRes.data || [])
    .map(mapRecordToCard)
    .filter(card => contentTypes.includes(card.type));

  const sentenceCards = (sentenceRes.data || [])
    .map(mapRecordToCard)
    .filter(card => contentTypes.includes(card.type));

  return [...vocabCards, ...sentenceCards];
}

/**
 * Update card's favorite status on Supabase
 */
export async function updateCardFavorite(cardId, type, favorite) {
  const table = type === 'sentence' ? 'sentences' : 'vocabularies';
  const { error } = await supabase
    .from(table)
    .update({ favorite })
    .eq('id', cardId);

  if (error) {
    console.error(`Lỗi khi cập nhật yêu thích cho thẻ ${cardId}:`, error);
    throw error;
  }
}

/**
 * Update card's mastered status on Supabase
 * @param {string} status - 'learned' | 'forgot'
 */
export async function updateCardStatus(cardId, type, status) {
  const table = type === 'sentence' ? 'sentences' : 'vocabularies';
  const { error } = await supabase
    .from(table)
    .update({ status })
    .eq('id', cardId);

  if (error) {
    console.error(`Lỗi khi cập nhật trạng thái thuộc cho thẻ ${cardId}:`, error);
    throw error;
  }
}
