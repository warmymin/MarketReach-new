-- 고객 테이블에 위도/경도 컬럼 추가 (Customer 엔티티와 맞춤)
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS lng DECIMAL(11, 8);

-- 기존 고객 데이터에 위도/경도 정보 업데이트
UPDATE customers SET 
  lat = 37.4980, 
  lng = 127.0276 
WHERE id = '6936203c-f5e3-46b5-90ae-7f3e842f22a1';

UPDATE customers SET 
  lat = 37.5572, 
  lng = 126.9254 
WHERE id = '7f3e842f-22a1-46b5-90ae-6936203c-f5e3';

UPDATE customers SET 
  lat = 37.5172, 
  lng = 127.0473 
WHERE id = '90ae-7f3e-842f-22a1-46b5-6936203c';

UPDATE customers SET 
  lat = 37.5665, 
  lng = 126.9780 
WHERE id = '46b5-90ae-7f3e-842f-22a1-6936203c';

UPDATE customers SET 
  lat = 37.5139, 
  lng = 127.1006 
WHERE id = '22a1-46b5-90ae-7f3e-842f-6936203c';

-- 추가 고객 데이터 삽입 (위도/경도 포함)
INSERT INTO customers (id, name, email, phone, address, lat, lng, created_at) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '김철수', 'kim@example.com', '010-1234-5678', '서울시 강남구', 37.4968, 127.0278, NOW()),
('b2c3d4e5-f6g7-8901-bcde-f23456789012', '이영희', 'lee@example.com', '010-2345-6789', '서울시 마포구', 37.5575, 126.9258, NOW()),
('c3d4e5f6-g7h8-9012-cdef-345678901234', '박민수', 'park@example.com', '010-3456-7890', '서울시 강남구', 37.5175, 127.0478, NOW()),
('d4e5f6g7-h8i9-0123-defg-456789012345', '최지영', 'choi@example.com', '010-4567-8901', '서울시 중구', 37.5668, 126.9785, NOW()),
('e5f6g7h8-i9j0-1234-efgh-567890123456', '정현우', 'jung@example.com', '010-5678-9012', '서울시 강남구', 37.4985, 127.0280, NOW()),
('f6g7h8i9-j0k1-2345-fghi-678901234567', '한소영', 'han@example.com', '010-6789-0123', '서울시 마포구', 37.5578, 126.9260, NOW()),
('g7h8i9j0-k1l2-3456-ghij-789012345678', '윤태호', 'yoon@example.com', '010-7890-1234', '서울시 강남구', 37.5178, 127.0480, NOW()),
('h8i9j0k1-l2m3-4567-hijk-890123456789', '임수진', 'lim@example.com', '010-8901-2345', '서울시 중구', 37.5670, 126.9790, NOW()),
('i9j0k1l2-m3n4-5678-ijkl-901234567890', '강동현', 'kang@example.com', '010-9012-3456', '서울시 강남구', 37.4990, 127.0285, NOW()),
('j0k1l2m3-n4o5-6789-jklm-012345678901', '조미영', 'jo@example.com', '010-0123-4567', '서울시 마포구', 37.5580, 126.9265, NOW());

-- 위도/경도가 NULL인 고객들을 위한 기본값 설정
UPDATE customers 
SET lat = 37.4980, lng = 127.0276 
WHERE lat IS NULL OR lng IS NULL;
