-- DBeaver에서 실행할 더미 데이터 생성 스크립트

-- 1. 회사 데이터 생성
INSERT INTO companies (name, industry) VALUES 
('KT 마케팅', 'IT'),
('스타벅스', '음식점'),
('올리브영', '화장품')
ON CONFLICT DO NOTHING;

-- 2. 고객 데이터 생성 (30명)
INSERT INTO customers (name, phone, lat, lng, dong_code, company_id) 
SELECT 
    CASE (i % 30)
        WHEN 0 THEN '김철수' WHEN 1 THEN '이영희' WHEN 2 THEN '박민수' WHEN 3 THEN '정수진' WHEN 4 THEN '최동욱'
        WHEN 5 THEN '한미영' WHEN 6 THEN '송태호' WHEN 7 THEN '윤지영' WHEN 8 THEN '강현우' WHEN 9 THEN '임서연'
        WHEN 10 THEN '조성민' WHEN 11 THEN '백지원' WHEN 12 THEN '오승호' WHEN 13 THEN '신혜진' WHEN 14 THEN '유재석'
        WHEN 15 THEN '전지현' WHEN 16 THEN '남궁민' WHEN 17 THEN '서예진' WHEN 18 THEN '권지용' WHEN 19 THEN '배수지'
        WHEN 20 THEN '홍길동' WHEN 21 THEN '김영수' WHEN 22 THEN '이미라' WHEN 23 THEN '박준호' WHEN 24 THEN '정다은'
        WHEN 25 THEN '최민호' WHEN 26 THEN '한소희' WHEN 27 THEN '송중기' WHEN 28 THEN '윤아' WHEN 29 THEN '강동원'
    END,
    '010-' || LPAD((i % 10000)::text, 4, '0') || '-' || LPAD((i % 10000)::text, 4, '0'),
    37.48 + (random() * 0.15), -- 서울 위도 범위
    126.90 + (random() * 0.20), -- 서울 경도 범위
    CASE (i % 10)
        WHEN 0 THEN '1168051000' WHEN 1 THEN '1168052000' WHEN 2 THEN '1168053000' WHEN 3 THEN '1168054000' WHEN 4 THEN '1168055000'
        WHEN 5 THEN '1144066000' WHEN 6 THEN '1144067000' WHEN 7 THEN '1144068000' WHEN 8 THEN '1144069000' WHEN 9 THEN '1144070000'
    END,
    (SELECT id FROM companies ORDER BY random() LIMIT 1)
FROM generate_series(1, 30) i
ON CONFLICT DO NOTHING;

-- 3. 캠페인 데이터 생성
INSERT INTO campaigns (name, message, lat, lng, radius, scheduled_at, company_id) VALUES 
-- KT 마케팅 캠페인
('여름 할인 이벤트', '시원한 여름! 전메뉴 20% 할인 이벤트! 지금 바로 방문하세요!', 37.5665, 126.9780, 2000, NOW() + INTERVAL '5 days', (SELECT id FROM companies WHERE name = 'KT 마케팅' LIMIT 1)),
('신메뉴 론칭', '새로운 시그니처 버거 출시! 첫 주문 무료배송 혜택까지!', 37.5665, 126.9780, 1500, NOW() + INTERVAL '10 days', (SELECT id FROM companies WHERE name = 'KT 마케팅' LIMIT 1)),
('주말 특가 행사', '주말 한정! 모든 상품 30% 할인! 놓치면 후회할 기회!', 37.5665, 126.9780, 3000, NOW() + INTERVAL '15 days', (SELECT id FROM companies WHERE name = 'KT 마케팅' LIMIT 1)),

-- 스타벅스 캠페인
('아메리카노 1+1', '아메리카노 1+1 이벤트! 친구와 함께 방문하세요!', 37.5665, 126.9780, 1000, NOW() + INTERVAL '3 days', (SELECT id FROM companies WHERE name = '스타벅스' LIMIT 1)),
('새로운 시즌 메뉴', '가을 시즌 한정 메뉴 출시! 먼저 맛보세요!', 37.5665, 126.9780, 1200, NOW() + INTERVAL '8 days', (SELECT id FROM companies WHERE name = '스타벅스' LIMIT 1)),

-- 올리브영 캠페인
('뷰티 상품 할인', '뷰티 상품 50% 할인! 아름다워지세요!', 37.5665, 126.9780, 800, NOW() + INTERVAL '2 days', (SELECT id FROM companies WHERE name = '올리브영' LIMIT 1)),
('화장품 세트 증정', '3만원 이상 구매시 화장품 세트 증정!', 37.5665, 126.9780, 1000, NOW() + INTERVAL '7 days', (SELECT id FROM companies WHERE name = '올리브영' LIMIT 1))
ON CONFLICT DO NOTHING;

-- 4. 타겟팅 데이터 생성
INSERT INTO targetings (campaign_id, customer_id, is_confirmed)
SELECT 
    c.id as campaign_id,
    cu.id as customer_id,
    random() > 0.3 as is_confirmed
FROM campaigns c
CROSS JOIN customers cu
WHERE random() < 0.3 -- 30% 확률로 타겟팅
ON CONFLICT DO NOTHING;

-- 5. 배송 데이터 생성
INSERT INTO deliveries (targeting_id, status, error_code, delivered_at)
SELECT 
    t.id as targeting_id,
    CASE 
        WHEN random() < 0.7 THEN 'SUCCESS'::text
        WHEN random() < 0.9 THEN 'FAIL'::text
        ELSE 'PENDING'::text
    END as status,
    CASE 
        WHEN random() < 0.7 THEN NULL
        ELSE 'NETWORK_ERROR'
    END as error_code,
    CASE 
        WHEN random() < 0.7 THEN NOW() - INTERVAL '1 hour' * random() * 24
        ELSE NULL
    END as delivered_at
FROM targetings t
ON CONFLICT DO NOTHING;

-- 결과 확인
SELECT 
    '회사' as type, COUNT(*) as count FROM companies
UNION ALL
SELECT '고객', COUNT(*) FROM customers
UNION ALL
SELECT '캠페인', COUNT(*) FROM campaigns
UNION ALL
SELECT '타겟팅', COUNT(*) FROM targetings
UNION ALL
SELECT '배송', COUNT(*) FROM deliveries
ORDER BY type;
