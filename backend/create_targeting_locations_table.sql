-- targeting_locations 테이블 생성
CREATE TABLE IF NOT EXISTS targeting_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    name VARCHAR(255) NOT NULL,
    center_lat DECIMAL(10, 8) NOT NULL,
    center_lng DECIMAL(11, 8) NOT NULL,
    radius_m INTEGER NOT NULL,
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_targeting_locations_company_id ON targeting_locations(company_id);
CREATE INDEX IF NOT EXISTS idx_targeting_locations_created_at ON targeting_locations(created_at);

-- 샘플 데이터 삽입 (선택사항)
INSERT INTO targeting_locations (id, company_id, name, center_lat, center_lng, radius_m, memo, created_at) VALUES
(
    gen_random_uuid(),
    (SELECT id FROM companies LIMIT 1),
    '강남역 타겟팅',
    37.4980,
    127.0276,
    2000,
    '강남역 2km 반경 타겟팅',
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM companies LIMIT 1),
    '홍대입구 타겟팅',
    37.5572,
    126.9254,
    1500,
    '홍대입구 1.5km 반경 타겟팅',
    NOW()
);
