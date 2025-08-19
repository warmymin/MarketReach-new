-- deliveries 테이블 완전 재생성

-- 1. 기존 deliveries 테이블과 관련 데이터 완전 삭제
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS qr_events CASCADE;

-- 2. deliveries 테이블 새로 생성 (VARCHAR 타입으로)
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    targeting_id UUID REFERENCES targetings(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('SUCCESS', 'FAIL', 'PENDING')),
    error_code VARCHAR(100),
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. qr_events 테이블 재생성
CREATE TABLE qr_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('qr_scan', 'coupon_use', 'visit_store')),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    event_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 인덱스 생성
CREATE INDEX idx_deliveries_targeting_id ON deliveries(targeting_id);
CREATE INDEX idx_qr_events_delivery_id ON qr_events(delivery_id);

-- 5. 테이블 구조 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'deliveries' 
ORDER BY ordinal_position;
