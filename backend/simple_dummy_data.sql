-- 간단한 더미 데이터 생성 (단계별로 실행)

-- 1단계: 회사 데이터
INSERT INTO companies (name, industry) VALUES 
('KT 마케팅', 'IT'),
('스타벅스', '음식점'),
('올리브영', '화장품')
ON CONFLICT DO NOTHING;

-- 2단계: 고객 데이터 (5명만)
INSERT INTO customers (name, phone, lat, lng, dong_code, company_id) VALUES 
('김철수', '010-1234-5678', 37.5665, 126.9780, '1168051000', (SELECT id FROM companies WHERE name = 'KT 마케팅' LIMIT 1)),
('이영희', '010-2345-6789', 37.5665, 126.9780, '1168052000', (SELECT id FROM companies WHERE name = '스타벅스' LIMIT 1)),
('박민수', '010-3456-7890', 37.5665, 126.9780, '1168053000', (SELECT id FROM companies WHERE name = '올리브영' LIMIT 1)),
('정수진', '010-4567-8901', 37.5665, 126.9780, '1168054000', (SELECT id FROM companies WHERE name = 'KT 마케팅' LIMIT 1)),
('최동욱', '010-5678-9012', 37.5665, 126.9780, '1168055000', (SELECT id FROM companies WHERE name = '스타벅스' LIMIT 1))
ON CONFLICT DO NOTHING;

-- 3단계: 캠페인 데이터 (3개만)
INSERT INTO campaigns (name, message, lat, lng, radius, scheduled_at, company_id) VALUES 
('여름 할인 이벤트', '시원한 여름! 전메뉴 20% 할인 이벤트!', 37.5665, 126.9780, 2000, NOW() + INTERVAL '5 days', (SELECT id FROM companies WHERE name = 'KT 마케팅' LIMIT 1)),
('아메리카노 1+1', '아메리카노 1+1 이벤트! 친구와 함께 방문하세요!', 37.5665, 126.9780, 1000, NOW() + INTERVAL '3 days', (SELECT id FROM companies WHERE name = '스타벅스' LIMIT 1)),
('뷰티 상품 할인', '뷰티 상품 50% 할인! 아름다워지세요!', 37.5665, 126.9780, 800, NOW() + INTERVAL '2 days', (SELECT id FROM companies WHERE name = '올리브영' LIMIT 1))
ON CONFLICT DO NOTHING;

-- 4단계: 타겟팅 데이터 (간단하게)
INSERT INTO targetings (campaign_id, customer_id, is_confirmed)
SELECT 
    c.id as campaign_id,
    cu.id as customer_id,
    true as is_confirmed
FROM campaigns c
CROSS JOIN customers cu
LIMIT 5
ON CONFLICT DO NOTHING;

-- 5단계: 배송 데이터 (간단하게)
INSERT INTO deliveries (targeting_id, status, error_code, delivered_at)
SELECT 
    t.id as targeting_id,
    'SUCCESS' as status,
    NULL as error_code,
    NOW() - INTERVAL '1 hour' as delivered_at
FROM targetings t
LIMIT 3
ON CONFLICT DO NOTHING;

-- 결과 확인
SELECT '회사' as type, COUNT(*) as count FROM companies
UNION ALL
SELECT '고객', COUNT(*) FROM customers
UNION ALL
SELECT '캠페인', COUNT(*) FROM campaigns
UNION ALL
SELECT '타겟팅', COUNT(*) FROM targetings
UNION ALL
SELECT '배송', COUNT(*) FROM deliveries
ORDER BY type;
