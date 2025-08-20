import { NextResponse } from 'next/server';

// Haversine 공식을 사용한 거리 계산 함수
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // km 단위
  return distance;
}

// PostgreSQL에서 고객 데이터를 가져오는 함수 (실제 구현에서는 데이터베이스 연결 필요)
async function getCustomersFromDatabase() {
  // 실제 구현에서는 PostgreSQL 연결을 통해 데이터를 가져와야 합니다
  // 현재는 샘플 데이터를 반환합니다
  return [
    { id: 1, name: '김철수', lat: 37.4980, lng: 127.0276 },
    { id: 2, name: '이영희', lat: 37.5572, lng: 126.9254 },
    { id: 3, name: '박민수', lat: 37.5172, lng: 127.0473 },
    { id: 4, name: '최지영', lat: 37.5665, lng: 126.9780 },
    { id: 5, name: '정현우', lat: 37.4968, lng: 127.0278 },
    { id: 6, name: '한소영', lat: 37.5575, lng: 126.9258 },
    { id: 7, name: '윤태호', lat: 37.5175, lng: 127.0478 },
    { id: 8, name: '임수진', lat: 37.5668, lng: 126.9785 },
    { id: 9, name: '강동현', lat: 37.4985, lng: 127.0280 },
    { id: 10, name: '조미영', lat: 37.5578, lng: 126.9260 },
  ];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const radius = parseFloat(searchParams.get('radius')) || 5; // 기본값 5km

    // 파라미터 검증
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: '잘못된 위도/경도 파라미터입니다.' },
        { status: 400 }
      );
    }

    if (radius <= 0 || isNaN(radius)) {
      return NextResponse.json(
        { error: '잘못된 반경 파라미터입니다.' },
        { status: 400 }
      );
    }

    // 고객 데이터 가져오기
    const customers = await getCustomersFromDatabase();
    
    // 지정된 반경 내 고객 수 계산
    const nearbyCustomers = customers.filter(customer => {
      const distance = calculateDistance(lat, lng, customer.lat, customer.lng);
      return distance <= radius;
    });

    const count = nearbyCustomers.length;

    return NextResponse.json({
      success: true,
      data: {
        count,
        radius,
        center: { lat, lng },
        customers: nearbyCustomers.map(c => ({
          id: c.id,
          name: c.name,
          distance: calculateDistance(lat, lng, c.lat, c.lng).toFixed(2)
        }))
      }
    });

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
