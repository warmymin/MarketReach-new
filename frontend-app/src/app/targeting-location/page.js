'use client';

import { useState, useEffect } from 'react';
import { MapPin, Users, Target, Save, ArrowLeft } from 'lucide-react';
import { apiService } from '@/lib/api';
import Link from 'next/link';

export default function TargetingLocationPage() {
  const [formData, setFormData] = useState({
    name: '',
    location: '강남역',
    centerLat: 37.4980,
    centerLng: 127.0276,
    radiusKm: 2.0,
    memo: ''
  });

  const [estimatedReach, setEstimatedReach] = useState('계산 중...');
  const [isCalculating, setIsCalculating] = useState(false);
  const [nearbyCustomers, setNearbyCustomers] = useState([]);
  const [showCustomerList, setShowCustomerList] = useState(false);

  // 위치 선택 옵션
  const locationOptions = [
    { name: '강남역', lat: 37.4980, lng: 127.0276 },
    { name: '홍대입구', lat: 37.5572, lng: 126.9254 },
    { name: '강남구청', lat: 37.5172, lng: 127.0473 },
    { name: '시청', lat: 37.5665, lng: 126.9780 },
    { name: '잠실', lat: 37.5139, lng: 127.1006 },
    { name: '건대입구', lat: 37.5407, lng: 127.0692 },
  ];

  // 위치 변경 시 위도/경도 업데이트
  const handleLocationChange = (locationName) => {
    const location = locationOptions.find(opt => opt.name === locationName);
    if (location) {
      setFormData({
        ...formData,
        location: locationName,
        centerLat: location.lat,
        centerLng: location.lng
      });
    }
  };

  // 반경 변경 시 예상 도달 고객 수 계산
  useEffect(() => {
    if (formData.centerLat && formData.centerLng && formData.radiusKm) {
      calculateEstimatedReach();
    }
  }, [formData.centerLat, formData.centerLng, formData.radiusKm]);

  // 예상 도달 고객 수 계산
  const calculateEstimatedReach = async () => {
    try {
      setIsCalculating(true);
      setEstimatedReach('계산 중...');
      
      console.log('예상 도달 고객 수 계산 시작...', {
        lat: formData.centerLat,
        lng: formData.centerLng,
        radius: formData.radiusKm
      });

      // 새로운 위치 기반 고객 수 계산 API 사용 (백엔드 API)
      const result = await apiService.getNearbyCustomers(
        formData.centerLat,
        formData.centerLng,
        formData.radiusKm
      );

      console.log('예상 도달 고객 수 결과:', result);

      if (result && result.success && result.data) {
        setEstimatedReach(`${result.data.count}명`);
        setNearbyCustomers(result.data.customers || []);
      } else {
        // 백업: 기존 API 사용
        const backupResult = await apiService.getEstimatedReach(
          formData.centerLat,
          formData.centerLng,
          Math.round(formData.radiusKm * 1000)
        );

        if (backupResult && backupResult.data !== undefined) {
          setEstimatedReach(`${backupResult.data}명`);
        } else {
          setEstimatedReach('계산 실패');
        }
      }
    } catch (error) {
      console.error('예상 도달 고객 수 계산 오류:', error);
      setEstimatedReach('계산 실패');
    } finally {
      setIsCalculating(false);
    }
  };

  // 타겟팅 위치 생성
  const handleCreateTargeting = async () => {
    if (!formData.name.trim()) {
      alert('타겟팅 이름을 입력해주세요.');
      return;
    }

    try {
      console.log('타겟팅 위치 생성 시작:', formData);

      // 먼저 API 연결 테스트
      try {
        const testResult = await fetch('http://localhost:8083/api/targeting-locations/test');
        console.log('API 연결 테스트 결과:', testResult);
      } catch (testError) {
        console.error('API 연결 테스트 실패:', testError);
      }

      const targetingData = {
        name: formData.name,
        centerLat: parseFloat(formData.centerLat),
        centerLng: parseFloat(formData.centerLng),
        radiusM: parseInt(Math.round(formData.radiusKm * 1000)),
        memo: formData.memo || '',
        company: { id: 'a844e499-59f2-44de-9d44-178dba113d37' }
      };

      console.log('전송할 데이터:', JSON.stringify(targetingData, null, 2));

      const result = await apiService.createTargetingLocation(targetingData);

      console.log('타겟팅 위치 생성 결과:', result);

      if (result && result.success) {
        alert('타겟팅 위치가 성공적으로 생성되었습니다!');
        // 폼 초기화
        setFormData({
          name: '',
          location: '강남역',
          centerLat: 37.4980,
          centerLng: 127.0276,
          radiusKm: 2.0,
          memo: ''
        });
        setEstimatedReach('계산 중...');
        setNearbyCustomers([]);
        
        // 타겟팅 목록 페이지로 리다이렉트
        window.location.href = '/targeting';
      } else {
        alert('타겟팅 위치 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('타겟팅 위치 생성 오류:', error);
      alert('타겟팅 위치 생성에 실패했습니다: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/targeting" className="btn btn-secondary">
            <ArrowLeft size={16} />
            뒤로가기
          </Link>
          <div>
            <h1 className="page-title">위치 타겟팅 생성</h1>
            <p className="page-subtitle">지역 기반 고객 타겟팅을 생성하세요</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 타겟팅 설정 폼 */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Target size={20} />
              타겟팅 설정
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div className="form-group">
              <label className="form-label">타겟팅 이름 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 강남역 2km 반경 타겟팅"
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">위치 선택</label>
              <select
                value={formData.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="input"
              >
                {locationOptions.map((option) => (
                  <option key={option.name} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">반경: {formData.radiusKm}km</label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={formData.radiusKm}
                onChange={(e) => setFormData({ ...formData, radiusKm: parseFloat(e.target.value) })}
                className="radius-slider"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>100m</span>
                <span>5km</span>
                <span>10km</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">메모 (선택)</label>
              <textarea
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                placeholder="타겟팅에 대한 추가 설명을 입력하세요"
                className="input"
                rows="3"
              />
            </div>

            <button
              onClick={handleCreateTargeting}
              disabled={!formData.name.trim() || isCalculating}
              className="btn btn-primary w-full"
            >
              <Save size={16} />
              타겟팅 생성
            </button>
          </div>
        </div>

        {/* 프리뷰 섹션 */}
        <div className="space-y-6">
          {/* 예상 도달 고객 수 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Users size={20} />
                예상 도달 고객 수
              </h2>
            </div>
            <div className="card-body">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {estimatedReach}
                </div>
                <p className="text-gray-600">
                  {formData.location} 기준 {formData.radiusKm}km 반경 내
                </p>
                {nearbyCustomers.length > 0 && (
                  <button
                    onClick={() => setShowCustomerList(!showCustomerList)}
                    className="btn btn-secondary btn-sm mt-3"
                  >
                    {showCustomerList ? '고객 목록 숨기기' : '고객 목록 보기'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <MapPin size={20} />
                위치 정보
              </h2>
            </div>
            <div className="card-body">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">선택된 위치:</span>
                  <span className="font-medium">{formData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">위도:</span>
                  <span className="font-mono">{formData.centerLat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">경도:</span>
                  <span className="font-mono">{formData.centerLng.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">반경:</span>
                  <span className="font-medium">{formData.radiusKm}km</span>
                </div>
              </div>
            </div>
          </div>

          {/* 고객 목록 */}
          {showCustomerList && nearbyCustomers.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Users size={20} />
                  포함된 고객 목록
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {nearbyCustomers.map((customer) => (
                    <div key={customer.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium truncate mr-2">{customer.name}</span>
                      <span className="text-sm text-gray-500 whitespace-nowrap">{customer.distance}km</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
