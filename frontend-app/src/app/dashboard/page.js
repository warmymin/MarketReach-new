'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Target, 
  MapPin, 
  Send, 
  TrendingUp,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
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
  const [deliveryStats, setDeliveryStats] = useState({
    totalDeliveries: 0,
    sentCount: 0,
    failedCount: 0,
    pendingCount: 0,
    successRate: 0
  });
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // 실시간 업데이트를 위한 SSE 구독
    if (typeof window !== 'undefined') {
      const eventSource = new EventSource('http://localhost:8083/api/deliveries/stream', { 
        withCredentials: false 
      });

      eventSource.addEventListener('delivery', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('실시간 발송 이벤트 수신:', data);
          
          // 발송 이벤트가 발생하면 대시보드 데이터를 새로고침
          // 디바운싱을 위해 1초 후에 새로고침
          setTimeout(() => {
            loadDashboardData();
          }, 1000);
        } catch (error) {
          console.error('이벤트 데이터 파싱 오류:', error);
        }
      });

      eventSource.addEventListener('connected', () => {
        console.log('실시간 스트림 연결됨');
      });

      eventSource.onerror = (error) => {
        console.error('SSE 연결 오류:', error);
        // 브라우저가 자동으로 재연결을 시도합니다
      };

      // 컴포넌트 언마운트 시 연결 해제
      return () => {
        eventSource.close();
      };
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Statistics API가 아직 준비되지 않았을 수 있으므로 개별적으로 호출
      let stats = { companies: 0, customers: 0, campaigns: 0, targetingLocations: 0 };
      let deliverySummary = { total: 0, success: 0, fail: 0, successRate: 0 };
      let recentDeliveriesData = [];
      
      try {
        stats = await apiService.getStatistics();
      } catch (error) {
        console.log('Statistics API 호출 실패, 기본값 사용:', error.message);
      }
      
      try {
        deliverySummary = await apiService.getDeliverySummary();
      } catch (error) {
        console.log('Delivery Summary API 호출 실패, 기본값 사용:', error.message);
      }
      
      try {
        recentDeliveriesData = await apiService.getRecentDeliveries();
      } catch (error) {
        console.log('Recent Deliveries API 호출 실패, 기본값 사용:', error.message);
      }
      
      setStatistics(stats);
      setDeliveryStats(deliverySummary);
      setRecentDeliveries(recentDeliveriesData || []);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDummyData = async () => {
    try {
      const result = await apiService.createDummyData();
      if (result && result.success) {
        alert('더미 데이터가 성공적으로 생성되었습니다!');
        loadDashboardData();
      } else {
        alert('더미 데이터 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('더미 데이터 생성 실패:', error);
      alert('더미 데이터 생성에 실패했습니다.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SENT':
      case 'SUCCESS':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'FAILED':
        return <XCircle size={16} className="text-red-500" />;
      case 'PENDING':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SENT':
      case 'SUCCESS':
        return '발송 완료';
      case 'FAILED':
        return '발송 실패';
      case 'PENDING':
        return '발송 대기';
      default:
        return '알 수 없음';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SENT':
      case 'SUCCESS':
        return 'text-green-600 bg-green-100';
      case 'FAILED':
        return 'text-red-600 bg-red-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 mb-3">마케팅 대시보드</h1>
            <p className="text-lg text-gray-600 font-light">위치 기반 마케팅 캠페인 현황을 한눈에 확인하세요</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateDummyData}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              더미 데이터 생성
            </button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{statistics.companies}</div>
                <div className="text-sm text-gray-600">등록된 회사</div>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <Users size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{statistics.customers}</div>
                <div className="text-sm text-gray-600">등록된 고객</div>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Send size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{statistics.campaigns}</div>
                <div className="text-sm text-gray-600">생성된 캠페인</div>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Target size={20} className="text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{statistics.targetingLocations || 0}</div>
                <div className="text-sm text-gray-600">타겟팅 위치</div>
              </div>
            </div>
          </div>
        </div>

        {/* 발송 현황 상세 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">총 발송 건수</h2>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Send size={20} className="text-blue-600" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-gray-900 mb-2">{deliveryStats.totalDeliveries}</div>
              <div className="text-sm text-gray-600">전체 발송</div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">성공률</h2>
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp size={20} className="text-green-600" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-gray-900 mb-2">{deliveryStats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">발송 성공률</div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">발송 상태</h2>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Target size={20} className="text-purple-600" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">성공</span>
                <span className="font-medium text-green-600">{deliveryStats.sentCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">실패</span>
                <span className="font-medium text-red-600">{deliveryStats.failedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">대기</span>
                <span className="font-medium text-yellow-600">{deliveryStats.pendingCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 발송 내역 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">최근 발송 내역</h2>
          {recentDeliveries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">고객</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">캠페인</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">상태</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">발송 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeliveries.slice(0, 10).map((delivery) => (
                    <tr key={delivery.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                            <Users size={16} className="text-blue-600" />
                          </div>
                          <span className="font-medium text-sm">{delivery.customer?.name || '알 수 없음'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700 text-sm">{delivery.campaign?.name || '알 수 없음'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getStatusIcon(delivery.status)}
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(delivery.status)}`}>
                            {getStatusText(delivery.status)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {delivery.sentAt ? new Date(delivery.sentAt).toLocaleString('ko-KR') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">발송 내역이 없습니다</h3>
              <p className="text-gray-500 text-sm">캠페인을 발송하면 여기에 내역이 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
