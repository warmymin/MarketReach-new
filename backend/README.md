# 위치 기반 마케팅 플랫폼 API

Node.js Express와 Supabase PostgreSQL을 사용한 위치 기반 마케팅 플랫폼의 백엔드 API 서버입니다.

## 🚀 주요 기능

- **회사 관리**: 회사 정보 CRUD
- **고객 관리**: 고객 데이터 업로드 (CSV/JSON), 위치 기반 고객 조회
- **캠페인 관리**: 위치 기반 캠페인 생성 및 타겟팅
- **메시지 전송**: 시뮬레이션 기반 메시지 전송
- **배송 추적**: 전송 결과 및 통계 조회
- **QR/쿠폰 이벤트**: 고객 행동 추적 및 분석

## 📋 데이터베이스 스키마

### 테이블 구조

1. **companies** - 회사 정보
2. **customers** - 고객 정보 (위치 포함)
3. **campaigns** - 마케팅 캠페인
4. **targetings** - 캠페인 타겟팅 정보
5. **deliveries** - 메시지 전송 결과
6. **qr_events** - QR/쿠폰 이벤트 추적

## 🛠️ 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 정보를 입력하세요:

```env
# Supabase Database Configuration
DB_HOST=wciyepofmhkqgsiimxhg.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=true

# Supabase URL and API Key
SUPABASE_URL=https://wciyepofmhkqgsiimxhg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjaXllcG9mbWhrcWdzaWlteGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDc1MTIsImV4cCI6MjA3MTA4MzUxMn0.WohwT7CafhnMPd1ITjcomJDNm-Mzv8AooPfhvSqbUAc

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. 데이터베이스 초기화
```bash
node init-db.js
```

### 4. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 📚 API 문서

### 회사 관리 API

#### 회사 생성
```http
POST /api/companies
Content-Type: application/json

{
  "name": "스타벅스 강남점",
  "industry": "카페"
}
```

#### 회사 목록 조회
```http
GET /api/companies
```

#### 회사 상세 조회
```http
GET /api/companies/:id
```

### 고객 관리 API

#### 고객 생성
```http
POST /api/customers
Content-Type: application/json

{
  "name": "김철수",
  "phone": "010-1234-5678",
  "lat": 37.5665,
  "lng": 126.9780,
  "dong_code": "1168010100",
  "company_id": "uuid"
}
```

#### CSV 파일 업로드
```http
POST /api/customers/upload-csv
Content-Type: multipart/form-data

file: [CSV 파일]
company_id: "uuid"
```

#### JSON 데이터 업로드
```http
POST /api/customers/upload-json
Content-Type: application/json

{
  "company_id": "uuid",
  "customers": [
    {
      "name": "김철수",
      "phone": "010-1234-5678",
      "lat": 37.5665,
      "lng": 126.9780,
      "dong_code": "1168010100"
    }
  ]
}
```

### 캠페인 관리 API

#### 캠페인 생성
```http
POST /api/campaigns
Content-Type: application/json

{
  "name": "강남점 오픈 기념 할인",
  "message": "강남점 오픈을 기념하여 20% 할인 이벤트를 진행합니다!",
  "lat": 37.5665,
  "lng": 126.9780,
  "radius": 1000,
  "scheduled_at": "2024-01-15T10:00:00Z",
  "company_id": "uuid"
}
```

#### 타겟팅 미리보기
```http
GET /api/campaigns/:id/preview-targeting?page=1&limit=100
```

#### 타겟팅 확인
```http
POST /api/campaigns/:id/confirm-targeting
Content-Type: application/json

{
  "customer_ids": ["uuid1", "uuid2", "uuid3"]
}
```

### 메시지 전송 API

#### 메시지 전송 시뮬레이션
```http
POST /api/deliveries/simulate/:campaignId
```

#### 배송 결과 조회
```http
GET /api/deliveries/campaign/:campaignId?page=1&limit=50&status=success
```

#### 배송 통계 조회
```http
GET /api/deliveries/stats/campaign/:campaignId
```

### QR 이벤트 API

#### QR 이벤트 생성
```http
POST /api/qr-events
Content-Type: application/json

{
  "delivery_id": "uuid",
  "event_type": "qr_scan",
  "customer_id": "uuid",
  "campaign_id": "uuid",
  "event_data": {
    "scan_time": "2024-01-15T10:00:00Z",
    "location": "store_entrance",
    "device": "mobile"
  }
}
```

#### QR 이벤트 통계 조회
```http
GET /api/qr-events/stats/campaign/:campaignId
```

## 🔧 개발 스크립트

```bash
# 개발 서버 실행 (nodemon)
npm run dev

# 프로덕션 서버 실행
npm start

# 데이터베이스 초기화
node init-db.js
```

## 📊 응답 형식

모든 API 응답은 다음과 같은 형식을 따릅니다:

### 성공 응답
```json
{
  "success": true,
  "message": "작업이 성공적으로 완료되었습니다.",
  "data": {
    // 응답 데이터
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "message": "에러 메시지",
  "error": "상세 에러 정보 (개발 모드에서만)"
}
```

## 🗺️ 위치 기반 기능

### Haversine 공식
두 지점 간의 거리를 계산하기 위해 Haversine 공식을 사용합니다.

### 반경 내 고객 검색
캠페인의 위치와 반경을 기준으로 타겟 고객을 자동으로 찾습니다.

## 🔒 보안

- Helmet.js를 사용한 보안 헤더 설정
- CORS 설정
- 입력 데이터 검증
- SQL 인젝션 방지 (Parameterized Queries)

## 📝 로깅

Morgan을 사용한 HTTP 요청 로깅이 활성화되어 있습니다.

## 🚀 배포

1. 환경 변수 설정
2. 데이터베이스 초기화
3. `npm start`로 서버 실행

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.
