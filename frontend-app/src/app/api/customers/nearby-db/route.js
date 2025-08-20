import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// PostgreSQL 연결 설정
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pg_sample',
  password: 'postgres',
  port: 5433,
});

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

    // PostgreSQL에서 고객 데이터 가져오기
    const client = await pool.connect();
    
    try {
      // 고객 테이블에서 위도, 경도 데이터 조회
      const result = await client.query(`
        SELECT id, name, lat, lng 
        FROM customers 
        WHERE lat IS NOT NULL AND lng IS NOT NULL
      `);

      const customers = result.rows;
      
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

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다: ' + error.message },
      { status: 500 }
    );
  }
}
