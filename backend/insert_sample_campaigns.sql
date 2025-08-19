-- 샘플 캠페인 데이터 삽입
-- DBeaver에서 실행하세요

-- 먼저 회사 데이터 확인/추가
INSERT INTO companies (name, industry) VALUES 
('KT 마케팅', 'IT'),
('스타벅스', '음식점'),
('올리브영', '화장품')
ON CONFLICT DO NOTHING;

-- 회사 ID 가져오기
DO $$
DECLARE
    kt_company_id UUID;
    starbucks_company_id UUID;
    olive_company_id UUID;
BEGIN
    SELECT id INTO kt_company_id FROM companies WHERE name = 'KT 마케팅' LIMIT 1;
    SELECT id INTO starbucks_company_id FROM companies WHERE name = '스타벅스' LIMIT 1;
    SELECT id INTO olive_company_id FROM companies WHERE name = '올리브영' LIMIT 1;

    -- KT 마케팅 캠페인들
    INSERT INTO campaigns (name, message, lat, lng, radius, scheduled_at, company_id) VALUES 
    ('여름 할인 이벤트', '시원한 여름! 전메뉴 20% 할인 이벤트! 지금 바로 방문하세요!', 37.5665, 126.9780, 2000, '2024-08-20 10:00:00', kt_company_id),
    ('신메뉴 론칭', '새로운 시그니처 버거 출시! 첫 주문 무료배송 혜택까지!', 37.5665, 126.9780, 1500, '2024-08-21 14:00:00', kt_company_id),
    ('주말 특가 행사', '주말 한정! 모든 상품 30% 할인! 놓치면 후회할 기회!', 37.5665, 126.9780, 3000, '2024-08-22 09:00:00', kt_company_id)
    ON CONFLICT DO NOTHING;

    -- 스타벅스 캠페인들
    INSERT INTO campaigns (name, message, lat, lng, radius, scheduled_at, company_id) VALUES 
    ('아메리카노 1+1', '아메리카노 1+1 이벤트! 친구와 함께 방문하세요!', 37.5665, 126.9780, 1000, '2024-08-23 12:00:00', starbucks_company_id),
    ('새로운 시즌 메뉴', '가을 시즌 한정 메뉴 출시! 먼저 맛보세요!', 37.5665, 126.9780, 1200, '2024-08-24 15:00:00', starbucks_company_id)
    ON CONFLICT DO NOTHING;

    -- 올리브영 캠페인들
    INSERT INTO campaigns (name, message, lat, lng, radius, scheduled_at, company_id) VALUES 
    ('뷰티 상품 할인', '뷰티 상품 50% 할인! 아름다워지세요!', 37.5665, 126.9780, 800, '2024-08-25 11:00:00', olive_company_id),
    ('화장품 세트 증정', '3만원 이상 구매시 화장품 세트 증정!', 37.5665, 126.9780, 1000, '2024-08-26 13:00:00', olive_company_id)
    ON CONFLICT DO NOTHING;

END $$;

-- 결과 확인
SELECT 
    c.name as campaign_name,
    c.message,
    c.radius,
    c.scheduled_at,
    comp.name as company_name
FROM campaigns c
JOIN companies comp ON c.company_id = comp.id
ORDER BY c.created_at DESC;
