-- 1. Alter vocabularies table to add onyomi and kunyomi columns
ALTER TABLE vocabularies 
ADD COLUMN IF NOT EXISTS onyomi TEXT,
ADD COLUMN IF NOT EXISTS kunyomi TEXT;

-- 2. Update seed data for Kanji 勉 (k1) with detailed Onyomi, Kunyomi, and Mnemonics
UPDATE vocabularies 
SET 
    onyomi = 'ベン',
    kunyomi = 'つと.める',
    radical_analysis = 'Bộ Lực (力 - sức mạnh: biểu thị sức lực cơ bắp, sự nỗ lực thể chất và tinh thần) đứng cạnh chữ Miễn (免 - tránh né: đại diện cho việc thoát khỏi hoặc tránh né điều xấu).',
    character_logic = 'Để tránh né (免) khỏi sự nghèo đói, lười biếng hoặc thất bại trong cuộc sống, con người bắt buộc phải dốc hết sức lực (力) của mình ra để cố gắng, nỗ lực (勉) học tập và làm việc.'
WHERE id = 'k1';

-- 3. Update seed data for Kanji 行 (k2) with detailed Onyomi, Kunyomi, and Mnemonics
UPDATE vocabularies 
SET 
    onyomi = 'コウ, ギョウ, アン',
    kunyomi = 'い.く, ゆ.く, おこな.う',
    radical_analysis = 'Bộ Xích (彳 - bước chân trái: tượng trưng cho nửa bên trái của ngã tư đường) đứng cùng bộ Súc (亍 - bước chân phải: hoàn thiện nửa còn lại của hành động di chuyển).',
    character_logic = 'Sự kết hợp nhịp nhàng giữa bước chân trái (彳) và bước chân phải (亍) tạo thành một ngã tư đường hoàn chỉnh biểu thị hành động di chuyển, đi lại hoặc tiến hành (行) một công việc.'
WHERE id = 'k2';

-- 4. Update sentence details to grammatical patterns
UPDATE sentences
SET details = 'Danh từ / Chỉ thị từ + を + Động từ'
WHERE id = 's1';

UPDATE sentences
SET details = 'Trạng từ + Động từ thể ましょう (Rủ rê)'
WHERE id = 's2';
