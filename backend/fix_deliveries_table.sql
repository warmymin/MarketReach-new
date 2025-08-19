-- deliveries 테이블의 status 컬럼 수정

-- 1. 기존 deliveries 테이블 삭제
DROP TABLE IF EXISTS deliveries CASCADE;

-- 2. deliveries 테이블 재생성 (status를 VARCHAR로 변경)
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    targeting_id UUID REFERENCES targetings(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('SUCCESS', 'FAIL', 'PENDING')),
    error_code VARCHAR(100),
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 인덱스 생성
CREATE INDEX idx_deliveries_targeting_id ON deliveries(targeting_id);
