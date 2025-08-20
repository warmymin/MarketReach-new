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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">🎯 마케팅 대시보드</h1>
            <p className="page-subtitle">위치 기반 마케팅 캠페인 현황을 한눈에 확인하세요</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateDummyData}
              className="btn btn-secondary"
            >
              📊 더미 데이터 생성
            </button>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card transform hover:scale-105 transition-transform duration-300">
          <div className="card-header">
            <div className="metric">
              <div className="metric-value text-4xl font-bold text-blue-600">{statistics.companies}</div>
              <div className="metric-label text-gray-600 font-medium">🏢 등록된 회사</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 size={28} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card transform hover:scale-105 transition-transform duration-300">
          <div className="card-header">
            <div className="metric">
              <div className="metric-value text-4xl font-bold text-green-600">{statistics.customers}</div>
              <div className="metric-label text-gray-600 font-medium">👥 등록된 고객</div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users size={28} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="card transform hover:scale-105 transition-transform duration-300">
          <div className="card-header">
            <div className="metric">
              <div className="metric-value text-4xl font-bold text-purple-600">{statistics.campaigns}</div>
              <div className="metric-label text-gray-600 font-medium">🎯 진행 중인 캠페인</div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target size={28} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card transform hover:scale-105 transition-transform duration-300">
          <div className="card-header">
            <div className="metric">
              <div className="metric-value text-4xl font-bold text-red-600">{statistics.targetingLocations || 0}</div>
              <div className="metric-label text-gray-600 font-medium">📍 타겟팅 위치</div>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <MapPin size={28} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 배송 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card transform hover:scale-105 transition-transform duration-300">
          <div className="card-header">
            <h2 className="card-title">📤 배송 현황</h2>
            <div className="p-3 bg-blue-100 rounded-full">
              <Send size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="p-8 text-center">
            <div className="metric">
              <div className="metric-value text-5xl font-bold text-blue-600 mb-2">{statistics.deliveries}</div>
              <div className="metric-label text-gray-600 font-medium text-lg">총 발송 건수</div>
            </div>
          </div>
        </div>

        <div className="card transform hover:scale-105 transition-transform duration-300">
          <div className="card-header">
            <h2 className="card-title">📈 성공률</h2>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
          <div className="p-8 text-center">
            <div className="metric">
              <div className="metric-value text-5xl font-bold text-green-600 mb-2">{statistics.successRate}%</div>
              <div className="metric-label text-gray-600 font-medium text-lg">배송 성공률</div>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="card transform hover:scale-105 transition-transform duration-300">
        <div className="card-header">
          <h2 className="card-title">📋 최근 활동</h2>
        </div>
        <div className="p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">시스템이 정상 작동 중입니다!</h3>
            <p className="text-gray-500">최근 활동 내역이 여기에 표시됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
