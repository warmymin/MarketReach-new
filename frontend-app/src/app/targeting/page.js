'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  MapPin, 
  Edit, 
  Trash2, 
  Users,
  Calendar,
  Target,
  Navigation
} from 'lucide-react';
import { apiService } from '../../lib/api';
import Link from 'next/link';

export default function TargetingPage() {
  const [targetingLocations, setTargetingLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estimatedReachData, setEstimatedReachData] = useState({});
  const [calculatingReach, setCalculatingReach] = useState({});

  useEffect(() => {
    loadTargetingLocations();
  }, []);

  const loadTargetingLocations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTargetingLocations();
      setTargetingLocations(data || []);
      setError(null);
      
      // 예상 도달 고객 수 계산
      calculateAllEstimatedReach(data || []);
    } catch (err) {
      console.error('타겟팅 위치 데이터 로드 오류:', err);
      setError('데이터를 불러올 수 없습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateAllEstimatedReach = async (locations) => {
    setCalculatingReach({});
    
    // 배치 처리로 서버 부하 방지
    const batchSize = 3;
    for (let i = 0; i < locations.length; i += batchSize) {
      const batch = locations.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (location) => {
          setCalculatingReach(prev => ({ ...prev, [location.id]: true }));
          
          try {
            const reach = await calculateEstimatedReach(location);
            setEstimatedReachData(prev => ({
              ...prev,
              [location.id]: reach
            }));
          } catch (error) {
            console.error(`타겟팅 ${location.id} 도달 고객 수 계산 실패:`, error);
            setEstimatedReachData(prev => ({
              ...prev,
              [location.id]: 0
            }));
          } finally {
            setCalculatingReach(prev => ({ ...prev, [location.id]: false }));
          }
        })
      );
      
      // 배치 간 지연
      if (i + batchSize < locations.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const calculateEstimatedReach = async (targeting) => {
    try {
      const response = await apiService.getNearbyCustomers(
        targeting.centerLat,
        targeting.centerLng,
        targeting.radiusM
      );
      
      // 다양한 응답 구조 처리
      if (response && typeof response === 'object') {
        if (response.count !== undefined) {
          return response.count;
        } else if (response.data && Array.isArray(response.data)) {
          return response.data.length;
        } else if (response.total !== undefined) {
          return response.total;
        }
      }
      
      return 0;
    } catch (error) {
      console.error('예상 도달 고객 수 계산 실패:', error);
      return 0;
    }
  };

  const handleDeleteTargeting = async (targetingId, targetingName) => {
    if (!confirm(`"${targetingName}" 타겟팅을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const result = await apiService.deleteTargetingLocation(targetingId);
      
      if (result && result.success) {
        // 목록에서 삭제된 타겟팅 제거
        setTargetingLocations(prev => prev.filter(targeting => targeting.id !== targetingId));
        // 예상 도달 데이터에서도 제거
        setEstimatedReachData(prev => {
          const newData = { ...prev };
          delete newData[targetingId];
          return newData;
        });
        alert('타겟팅이 성공적으로 삭제되었습니다.');
      } else {
        alert('타겟팅 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('타겟팅 삭제 오류:', error);
      alert('타겟팅 삭제에 실패했습니다: ' + error.message);
    }
  };

  const filteredTargetingLocations = targetingLocations.filter(targeting =>
    targeting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    targeting.memo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstimatedReachDisplay = (targetingId) => {
    if (calculatingReach[targetingId]) {
      return '계산 중...';
    }
    const reach = estimatedReachData[targetingId];
    return reach !== undefined ? `${reach.toLocaleString()}명` : '계산 필요';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">🎯 위치 기반 타겟팅</h1>
              <p className="text-xl text-gray-600">지역 기반 고객 타겟팅을 관리하세요</p>
            </div>
            <Link 
              href="/targeting-location" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} className="mr-2" />
              새 타겟팅 생성
            </Link>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="타겟팅 이름, 메모로 검색..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-base" 
              />
            </div>
          </div>
        </div>

        {/* 타겟팅 목록 */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">타겟팅 데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : filteredTargetingLocations.length > 0 ? (
          <div className="space-y-6">
            {filteredTargetingLocations.map(targeting => (
              <div key={targeting.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
                {/* 상단 정보 섹션 */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl">
                        <Target size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{targeting.name}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {targeting.createdAt ? 
                              new Date(targeting.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              }) : '날짜 없음'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/targeting-location/edit/${targeting.id}`} 
                      className="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                      title="편집"
                    >
                      <Edit size={16} className="mr-2" />
                      편집
                    </Link>
                    
                    <button 
                      onClick={() => handleDeleteTargeting(targeting.id, targeting.name)} 
                      className="inline-flex items-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                      title="삭제"
                    >
                      <Trash2 size={16} className="mr-2" />
                      삭제
                    </button>
                  </div>
                </div>
                
                {/* 타겟팅 설명 */}
                {targeting.memo && (
                  <div className="mb-6">
                    <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4">
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {targeting.memo}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* 하단 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {targeting.centerLat?.toFixed(4)}, {targeting.centerLng?.toFixed(4)}
                      </div>
                      <div className="text-sm text-gray-500">중심 좌표</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Navigation size={20} className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {(targeting.radiusM / 1000).toFixed(1)}km
                      </div>
                      <div className="text-sm text-gray-500">반경</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {getEstimatedReachDisplay(targeting.id)}
                      </div>
                      <div className="text-sm text-gray-500">예상 도달 고객</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Target size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {targeting.radiusM.toLocaleString()}m
                      </div>
                      <div className="text-sm text-gray-500">반경 (미터)</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">타겟팅이 없습니다</h3>
            <p className="text-gray-500 text-lg mb-8">첫 번째 위치 기반 타겟팅을 생성해보세요</p>
            <Link 
              href="/targeting-location" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} className="mr-2" />
              새 타겟팅 생성하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
