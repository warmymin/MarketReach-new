# MarketReach - 위치 기반 마케팅 플랫폼

MarketReach는 위치 기반 마케팅 캠페인을 관리하고 모니터링하는 현대적인 웹 플랫폼입니다.

## 🚀 기술 스택

### 백엔드
- **Spring Boot 3.x** - Java 기반 백엔드 프레임워크
- **PostgreSQL** - 메인 데이터베이스
- **JPA/Hibernate** - ORM
- **Maven** - 빌드 도구

### 프론트엔드
- **Next.js 15** - React 기반 풀스택 프레임워크 (App Router)
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Zustand** - 상태 관리
- **Framer Motion** - 애니메이션
- **Lucide React** - 아이콘 라이브러리
- **Axios** - HTTP 클라이언트

## 📁 프로젝트 구조

```
MarketReach_2/
├── backend/                 # Spring Boot 백엔드
│   ├── src/main/java/
│   │   └── com/example/demo/
│   │       ├── controller/  # REST API 컨트롤러
│   │       ├── entity/      # JPA 엔티티
│   │       ├── repository/  # 데이터 액세스 레이어
│   │       ├── service/     # 비즈니스 로직
│   │       └── config/      # 설정 클래스
│   └── src/main/resources/
│       └── application.properties
├── frontend/                # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/            # App Router 페이지
│   │   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── lib/           # 유틸리티 및 API 클라이언트
│   │   ├── store/         # Zustand 상태 관리
│   │   └── types/         # TypeScript 타입 정의
│   └── package.json
└── README.md
```

## 🛠️ 설치 및 실행

### 1. 백엔드 실행

```bash
cd backend
mvn spring-boot:run
```

백엔드 서버는 `http://localhost:8083`에서 실행됩니다.

### 2. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

프론트엔드는 `http://localhost:3003`에서 실행됩니다.

## 📋 주요 기능

### 대시보드
- 실시간 통계 카드
- 발송 현황 차트
- 최근 활동 피드

### 캠페인 관리
- 캠페인 CRUD 기능
- 상태별 필터링 (초안, 활성, 일시정지, 완료)
- 실시간 검색

### 타겟팅 관리
- 위치 기반 타겟팅 설정
- 반경 조절
- 예상 도달 고객 수 계산

### 고객 관리
- 고객 정보 CRUD
- 위치 기반 검색
- 연락처 정보 관리

### 발송 모니터링
- 실시간 발송 상태 확인
- 성공률 통계
- 상태별 필터링

### 설정
- 프로필 관리
- 알림 설정
- 보안 설정
- 테마 설정

## 🔌 API 엔드포인트

### 회사 관리
- `GET /api/companies` - 회사 목록 조회
- `POST /api/companies` - 회사 생성
- `PUT /api/companies/{id}` - 회사 수정
- `DELETE /api/companies/{id}` - 회사 삭제

### 고객 관리
- `GET /api/customers` - 고객 목록 조회
- `GET /api/customers/nearby` - 근처 고객 조회
- `POST /api/customers` - 고객 생성
- `PUT /api/customers/{id}` - 고객 수정
- `DELETE /api/customers/{id}` - 고객 삭제

### 타겟팅 관리
- `GET /api/targeting-locations` - 타겟팅 위치 목록
- `POST /api/targeting-locations` - 타겟팅 위치 생성
- `PUT /api/targeting-locations/{id}` - 타겟팅 위치 수정
- `DELETE /api/targeting-locations/{id}` - 타겟팅 위치 삭제

### 캠페인 관리
- `GET /api/campaigns` - 캠페인 목록
- `POST /api/campaigns` - 캠페인 생성
- `PUT /api/campaigns/{id}` - 캠페인 수정
- `DELETE /api/campaigns/{id}` - 캠페인 삭제

### 발송 관리
- `GET /api/deliveries` - 발송 목록
- `GET /api/deliveries/campaign/{id}` - 캠페인별 발송 목록
- `POST /api/deliveries` - 발송 생성
- `PUT /api/deliveries/{id}` - 발송 수정
- `DELETE /api/deliveries/{id}` - 발송 삭제

## 🎨 UI/UX 특징

- **반응형 디자인** - 모바일, 태블릿, 데스크톱 지원
- **모던한 UI** - 깔끔하고 직관적인 인터페이스
- **애니메이션** - 부드러운 전환 효과
- **실시간 업데이트** - 실시간 데이터 동기화
- **토스트 알림** - 사용자 피드백 시스템
- **로딩 상태** - 스켈레톤 로딩 및 스피너

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- Java 17+
- PostgreSQL 15+
- Maven 3.6+

### 환경 변수
백엔드 `.env` 파일 또는 `application.properties`에서 데이터베이스 설정을 확인하세요.

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
