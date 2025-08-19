import { MapPin, Target, X } from 'lucide-react';

export default function TargetingLocationPage() {
  const locationOptions = [
    { id: 'gangnam', name: '강남역', lat: 37.4980, lng: 127.0276 },
    { id: 'hongdae', name: '홍대입구역', lat: 37.5571, lng: 126.9254 }
  ];
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">타겟팅 위치 생성</h1>
          <p className="page-subtitle">위치 기반 타겟팅을 생성하세요</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">위치 선택</h3>
        <div className="location-options">
          {locationOptions.map(loc => (
            <div key={loc.id} className="location-option">
              <MapPin size={20} />
              <span>{loc.name}</span>
              <span className="location-coords">({loc.lat}, {loc.lng})</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button className="btn btn-primary"><Target size={16} />타겟팅 생성</button>
        </div>
      </div>
    </div>
  );
}
