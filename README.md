# KT MarketReach - 위치 기반 마케팅 플랫폼

KT MarketReach는 위치 기반 마케팅을 위한 종합 플랫폼입니다. Spring Boot 백엔드와 React 프론트엔드로 구성되어 있습니다.

## 📁 프로젝트 구조

```
MarketReach/
├── backend/          # Spring Boot 백엔드
│   ├── src/          # Java 소스 코드
│   ├── build.gradle  # Gradle 설정
│   ├── application.yml # Spring Boot 설정
│   └── ...
├── frontend/         # React 프론트엔드
│   ├── src/          # TypeScript 소스 코드
│   ├── package.json  # npm 설정
│   └── ...
└── README.md         # 프로젝트 설명서
```

## 🚀 실행 방법

### 백엔드 실행 (Spring Boot)

```bash
cd backend
./gradlew bootRun
```

백엔드 서버는 `http://localhost:8080`에서 실행됩니다.

### 프론트엔드 실행 (React)

```bash
cd frontend
npm start
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

## 🛠️ 기술 스택

### 백엔드
- **Spring Boot 3.5.4**
- **Spring Data JPA**
- **PostgreSQL**
- **Gradle**

### 프론트엔드
- **React 18**
- **TypeScript**
- **React Router**
- **Lucide React** (아이콘)
- **Recharts** (차트)

## 📋 주요 기능

- **회사 관리**: 회사 등록 및 관리
- **고객 관리**: CSV 업로드, 위치 기반 고객 관리
- **캠페인 관리**: 위치 기반 마케팅 캠페인 생성 및 관리
- **타겟팅**: 반경 기반 고객 타겟팅
- **발송 현황**: 실시간 발송 모니터링
- **분석**: 마케팅 성과 분석

## 🔧 개발 환경 설정

### 필수 요구사항
- Java 17+
- Node.js 18+
- PostgreSQL 13+

### 데이터베이스 설정
1. PostgreSQL 설치 및 실행
2. `backend/create_database.sql` 실행
3. `backend/src/main/resources/application.yml`에서 데이터베이스 연결 정보 설정

## 📝 API 문서

백엔드 API는 `http://localhost:8080`에서 제공됩니다.

### 주요 엔드포인트
- `GET /api/companies` - 회사 목록
- `GET /api/campaigns` - 캠페인 목록
- `GET /api/customers` - 고객 목록
- `GET /api/targetings` - 타겟팅 목록
- `GET /api/deliveries` - 발송 현황

## 🤝 기여하기

1. 프로젝트를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
