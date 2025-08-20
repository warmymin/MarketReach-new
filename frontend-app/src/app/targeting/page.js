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

  // 위치 기반 타겟팅 목록 로드
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log('위치 기반 타겟팅 데이터 로드 시작...');
        
        const targetingLocationsData = await apiService.getTargetingLocations();
        console.log('위치 기반 타겟팅 데이터:', targetingLocationsData);
        
        setTargetingLocations(targetingLocationsData);
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

  // 검색 필터링
  const filteredTargetingLocations = targetingLocations.filter(targeting => {
    return targeting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           targeting.memo?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 타겟팅 위치 삭제
  const handleDeleteTargeting = async (id) => {
    if (window.confirm('정말로 이 타겟팅을 삭제하시겠습니까?')) {
      try {
        const result = await apiService.deleteTargetingLocation(id);
        if (result) {
          alert('타겟팅이 성공적으로 삭제되었습니다.');
          // 목록 새로고침
          const updatedData = await apiService.getTargetingLocations();
          setTargetingLocations(updatedData);
        }
      } catch (error) {
        console.error('타겟팅 삭제 오류:', error);
        alert('타겟팅 삭제에 실패했습니다: ' + error.message);
      }
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
                  <div>
            <h1 className="page-title">🎯 위치 기반 타겟팅 관리</h1>
            <p className="page-subtitle">지역 기반 고객 타겟팅을 관리하세요</p>
          </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-filter">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="타겟팅 이름, 메모로 검색..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="input" 
              />
            </div>
          </div>
          <Link href="/targeting-location" className="btn btn-primary">
            <MapPin size={16} />새 타겟팅 생성
          </Link>
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
                          계산 중...
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
                            onClick={() => handleDeleteTargeting(targeting.id)} 
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
