-- Alter vocabularies table to add radical analysis fields
ALTER TABLE vocabularies 
ADD COLUMN IF NOT EXISTS radical_analysis TEXT,
ADD COLUMN IF NOT EXISTS character_logic TEXT;

-- Update seed data for Kanji 勉 (k1)
UPDATE vocabularies 
SET 
    radical_analysis = 'Ghép từ bộ Lực (力 - sức mạnh) đứng cạnh chữ Miễn (免 - tránh né).',
    character_logic = 'Để tránh né (免) thất bại và hướng tới thành công, con người cần phải dùng hết sức lực (力) để cố gắng, nỗ lực (勉).'
WHERE id = 'k1';

-- Update seed data for Kanji 行 (k2)
UPDATE vocabularies 
SET 
    radical_analysis = 'Ghép từ bộ Xích (彳 - bước chân trái) và bộ Súc (亍 - bước chân phải).',
    character_logic = 'Sự kết hợp của bước chân trái (彳) và bước chân phải (亍) tạo thành hành động đi lại, di chuyển (行).'
WHERE id = 'k2';
