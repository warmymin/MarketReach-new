'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Target, 
  MapPin, 
  Send, 
  TrendingUp,
  Plus
} from 'lucide-react';
import { apiService } from '@/lib/api';

export default function Dashboard() {
  const [statistics, setStatistics] = useState({
    companies: 0,
    customers: 0,
    campaigns: 0,
    targetings: 0,
    deliveries: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const stats = await apiService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('통계 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDummyData = async () => {
    try {
      const result = await apiService.createDummyData();
      if (result && result.success) {
        alert('더미 데이터가 성공적으로 생성되었습니다!');
        loadStatistics();
      } else {
        alert('더미 데이터 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('더미 데이터 생성 실패:', error);
      alert('더미 데이터 생성에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-message">
          <p>대시보드 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">대시보드</h1>
          <p className="page-subtitle">마케팅 캠페인 현황을 한눈에 확인하세요</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleCreateDummyData}
        >
          <Plus size={16} />
          더미 데이터 생성
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-4">
        <div className="card">
          <div className="card-header">
            <div className="metric">
              <div className="metric-value">{statistics.companies}</div>
              <div className="metric-label">등록된 회사</div>
            </div>
            <Building2 size={24} className="text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="metric">
              <div className="metric-value">{statistics.customers}</div>
              <div className="metric-label">등록된 고객</div>
            </div>
            <Users size={24} className="text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="metric">
              <div className="metric-value">{statistics.campaigns}</div>
              <div className="metric-label">진행 중인 캠페인</div>
            </div>
            <Target size={24} className="text-purple-500" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="metric">
              <div className="metric-value">{statistics.targetings}</div>
              <div className="metric-label">타겟팅 수</div>
            </div>
            <MapPin size={24} className="text-orange-500" />
          </div>
        </div>
      </div>

      {/* 배송 현황 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">배송 현황</h2>
            <Send size={20} className="text-blue-500" />
          </div>
          <div className="p-6">
            <div className="metric">
              <div className="metric-value">{statistics.deliveries}</div>
              <div className="metric-label">총 발송 건수</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">성공률</h2>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <div className="p-6">
            <div className="metric">
              <div className="metric-value">{statistics.successRate}%</div>
              <div className="metric-label">배송 성공률</div>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">최근 활동</h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">
            <p>최근 활동 내역이 여기에 표시됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
