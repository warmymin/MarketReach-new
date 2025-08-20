#!/bin/bash

echo "🚀 KT MarketReach 프로젝트 시작..."

# 백엔드 실행 (백그라운드)
echo "📡 백엔드 서버 시작 중..."
cd backend
./mvnw spring-boot:run &
BACKEND_PID=$!
cd ..

# 잠시 대기
sleep 10

# 프론트엔드 실행
echo "🎨 프론트엔드 서버 시작 중..."
cd frontend-app
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ 서버들이 시작되었습니다!"
echo "📡 백엔드: http://localhost:8083"
echo "🎨 프론트엔드: http://localhost:3000"
echo ""
echo "서버를 중지하려면 Ctrl+C를 누르세요."

# 프로세스 종료 대기
wait
