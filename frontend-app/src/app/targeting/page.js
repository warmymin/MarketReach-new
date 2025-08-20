'use client';

import { useEffect, useState } from 'react';
import { Search, Edit, Trash2, Calendar, MapPin } from 'lucide-react';
import { apiService } from '@/lib/api';
import Link from 'next/link';

export default function TargetingPage() {
  const [targetingLocations, setTargetingLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estimatedReachData, setEstimatedReachData] = useState({});
  const [calculatingReach, setCalculatingReach] = useState({});

  // 위치 기반 타겟팅 목록 로드
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log('위치 기반 타겟팅 데이터 로드 시작...');
        
        const targetingLocationsData = await apiService.getTargetingLocations();
        console.log('위치 기반 타겟팅 데이터:', targetingLocationsData);
        
        setTargetingLocations(targetingLocationsData);
        
        // 각 타겟팅 위치별로 예상 도달 고객 수 계산
        if (targetingLocationsData && targetingLocationsData.length > 0) {
          calculateAllEstimatedReach(targetingLocationsData);
        }
        
        setError(null);
      } catch (err) {
        console.error('위치 기반 타겟팅 데이터 로드 오류:', err);
        setError('데이터를 불러올 수 없습니다: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 모든 타겟팅 위치의 예상 도달 고객 수 계산 (병렬 처리)
  const calculateAllEstimatedReach = async (targetings) => {
    // 동시에 최대 3개씩 처리하여 서버 부하 방지
    const batchSize = 3;
    for (let i = 0; i < targetings.length; i += batchSize) {
      const batch = targetings.slice(i, i + batchSize);
      await Promise.all(batch.map(targeting => calculateEstimatedReach(targeting)));
      
      // 배치 간 약간의 지연
      if (i + batchSize < targetings.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  };

  // 개별 타겟팅 위치의 예상 도달 고객 수 계산
  const calculateEstimatedReach = async (targeting) => {
    try {
      setCalculatingReach(prev => ({ ...prev, [targeting.id]: true }));
      
      const result = await apiService.getNearbyCustomers(
        targeting.centerLat,
        targeting.centerLng,
        targeting.radiusM / 1000
      );

      console.log(`타겟팅 ${targeting.name} 예상 도달 고객 수 결과:`, result);

      if (result && result.success) {
        let count = 0;
        if (result.count !== undefined) {
          count = result.count;
        } else if (result.data && typeof result.data === 'object' && result.data.count !== undefined) {
          count = result.data.count;
        } else if (typeof result.data === 'number') {
          count = result.data;
        } else if (Array.isArray(result.data)) {
          count = result.data.length;
        }
        
        setEstimatedReachData(prev => ({ ...prev, [targeting.id]: count }));
      } else {
        setEstimatedReachData(prev => ({ ...prev, [targeting.id]: 0 }));
      }
    } catch (error) {
      console.error(`타겟팅 ${targeting.name} 예상 도달 고객 수 계산 오류:`, error);
      setEstimatedReachData(prev => ({ ...prev, [targeting.id]: 0 }));
    } finally {
      setCalculatingReach(prev => ({ ...prev, [targeting.id]: false }));
    }
  };

  // 검색 필터링
  const filteredTargetingLocations = targetingLocations.filter(targeting => {
    return targeting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           targeting.memo?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 타겟팅 삭제
  const handleDeleteTargeting = async (targetingId, targetingName) => {
    if (!confirm(`"${targetingName}" 타겟팅을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const result = await apiService.deleteTargetingLocation(targetingId);
      
      if (result && result.success) {
        // 목록에서 삭제된 타겟팅 제거
        setTargetingLocations(prev => prev.filter(targeting => targeting.id !== targetingId));
        alert('타겟팅이 성공적으로 삭제되었습니다.');
      } else {
        alert('타겟팅 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('타겟팅 삭제 오류:', error);
      alert('타겟팅 삭제에 실패했습니다: ' + error.message);
    }
  };



  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 mb-3">위치 기반 타겟팅</h1>
            <p className="text-lg text-gray-600 font-light">지역 기반 고객 타겟팅을 관리하세요</p>
          </div>
          <Link 
            href="/targeting-location" 
            className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <MapPin size={16} className="mr-2" />
            새 타겟팅 생성
          </Link>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="타겟팅 이름, 메모로 검색..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition-colors text-sm" 
              />
            </div>
          </div>
        </div>
        <div className="table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>
          ) : error ? (
            <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>타겟팅 이름</th>
                  <th>위치</th>
                  <th>반경</th>
                  <th>예상 도달 고객 수</th>
                  <th>등록일</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargetingLocations.length > 0 ? (
                  filteredTargetingLocations.map(targeting => (
                    <tr key={targeting.id}>
                      <td>
                        <div className="font-medium">{targeting.name}</div>
                        {targeting.memo && (
                          <div className="text-sm text-gray-500 mt-1">{targeting.memo}</div>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center">
                          <MapPin size={14} className="text-gray-400 mr-1" />
                          <span className="text-sm">
                            {targeting.centerLat?.toFixed(4)}, {targeting.centerLng?.toFixed(4)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="tag tag-primary">{(targeting.radiusM / 1000).toFixed(1)}km</span>
                      </td>
                      <td>
                        <span className="font-medium text-blue-600">
                          {calculatingReach[targeting.id] ? (
                            '계산 중...'
                          ) : estimatedReachData[targeting.id] !== undefined ? (
                            `${estimatedReachData[targeting.id]}명`
                          ) : (
                            '0명'
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="targeting-date">
                          <Calendar size={14} />
                          {targeting.createdAt ? 
                            (typeof targeting.createdAt === 'string' ? 
                              targeting.createdAt.split(' ')[0] : 
                              new Date(targeting.createdAt).toISOString().split('T')[0]
                            ) : ''
                          }
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link href={`/targeting-location/edit/${targeting.id}`} className="btn btn-secondary btn-sm">
                            <Edit size={14} />
                          </Link>
                          <button 
                            onClick={() => handleDeleteTargeting(targeting.id, targeting.name)} 
                            className="btn btn-danger btn-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      위치 기반 타겟팅이 없습니다.
                      <br />
                      <Link href="/targeting-location" className="btn btn-primary btn-sm mt-2">
                        첫 번째 타겟팅 생성하기
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
