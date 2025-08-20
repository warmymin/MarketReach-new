import React, { useEffect, useState } from 'react';
import { apiService } from '../../lib/api';

const TargetingLocation = () => {
  const [locations, setLocations] = useState([]);
  const [reach, setReach] = useState(null);
  const [loading, setLoading] = useState(true);

  // 예시 좌표 및 반경 (실제 값은 UI에서 입력받을 수 있음)
  const lat = 37.5665;
  const lng = 126.9780;
  const radiusM = 1000;

  useEffect(() => {
    const fetchData = async () => {ㄴ
      setLoading(true);
      const locs = await apiService.getTargetingLocations();
      setLocations(locs);
      const estReach = await apiService.getEstimatedReach(lat, lng, radiusM);
      setReach(estReach);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">타겟팅 위치 목록</h2>
      {loading ? (
        <div>로딩 중...</div>
      ) : (
        <ul className="mb-6">
          {locations.map(loc => (
            <li key={loc.id} className="border-b py-2">
              <strong>{loc.name}</strong> ({loc.centerLat}, {loc.centerLng}) - 반경: {loc.radiusM}m
            </li>
          ))}
        </ul>
      )}
      <h3 className="text-lg font-semibold">예상 도달 고객 수</h3>
      <div className="text-blue-600 text-2xl">{reach !== null ? `${reach}명` : '계산 중...'}</div>
    </div>
  );
};

export default TargetingLocation;
