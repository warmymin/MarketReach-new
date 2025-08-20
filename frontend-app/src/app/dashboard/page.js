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
  AlertCircle,
  BarChart3,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { apiService } from '../../lib/api';
import Link from 'next/link';

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
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 실제 존재하는 API 함수들만 사용
      let companies = [];
      let customers = [];
      let campaigns = [];
      let targetingLocations = [];
      let deliveries = [];
      
      try {
        companies = await apiService.getCompanies();
      } catch (error) {
        console.log('Companies API 호출 실패:', error.message);
      }
      
      try {
        customers = await apiService.getCustomers();
      } catch (error) {
        console.log('Customers API 호출 실패:', error.message);
      }
      
      try {
        campaigns = await apiService.getCampaigns();
      } catch (error) {
        console.log('Campaigns API 호출 실패:', error.message);
      }
      
      try {
        targetingLocations = await apiService.getTargetingLocations();
      } catch (error) {
        console.log('Targeting Locations API 호출 실패:', error.message);
      }
      
      try {
        deliveries = await apiService.getDeliveries();
      } catch (error) {
        console.log('Deliveries API 호출 실패:', error.message);
      }
      
      // 통계 계산
      const stats = {
        companies: companies.length,
        customers: customers.length,
        campaigns: campaigns.length,
        targetings: targetingLocations.length,
        deliveries: deliveries.length,
        successRate: 0
      };
      
      // 발송 통계 계산
      const sentDeliveries = deliveries.filter(d => d.status === 'SENT' || d.status === 'SUCCESS');
      const failedDeliveries = deliveries.filter(d => d.status === 'FAILED');
      const pendingDeliveries = deliveries.filter(d => d.status === 'PENDING');
      
      const deliverySummary = {
        totalDeliveries: deliveries.length,
        sentCount: sentDeliveries.length,
        failedCount: failedDeliveries.length,
        pendingCount: pendingDeliveries.length,
        successRate: deliveries.length > 0 ? (sentDeliveries.length / deliveries.length) * 100 : 0
      };
      
      // 최근 발송 내역 (최근 10개)
      const recentDeliveriesData = deliveries
        .sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt))
        .slice(0, 10);
      
      setStatistics(stats);
      setDeliveryStats(deliverySummary);
      setRecentDeliveries(recentDeliveriesData);
      
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">대시보드 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">마케팅 대시보드</h1>
              <p className="text-xl text-gray-600">위치 기반 마케팅 캠페인 현황을 한눈에 확인하세요</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateDummyData}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                더미 데이터 생성
              </button>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{statistics.companies}</div>
                <div className="text-gray-600 font-medium">등록된 회사</div>
              </div>
              <div className="p-4 bg-blue-100 rounded-full">
                <Building2 size={32} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">{statistics.customers}</div>
                <div className="text-gray-600 font-medium">등록된 고객</div>
              </div>
              <div className="p-4 bg-green-100 rounded-full">
                <Users size={32} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">{statistics.campaigns}</div>
                <div className="text-gray-600 font-medium">진행 중인 캠페인</div>
              </div>
              <div className="p-4 bg-purple-100 rounded-full">
                <Target size={32} className="text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600 mb-2">{statistics.targetings}</div>
                <div className="text-gray-600 font-medium">타겟팅 위치</div>
              </div>
              <div className="p-4 bg-red-100 rounded-full">
                <MapPin size={32} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 발송 현황 상세 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">총 발송 건수</h2>
              <div className="p-3 bg-blue-100 rounded-full">
                <Send size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">{deliveryStats.totalDeliveries}</div>
              <div className="text-gray-600 font-medium text-lg">전체 발송</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">성공률</h2>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">{deliveryStats.successRate.toFixed(1)}%</div>
              <div className="text-gray-600 font-medium text-lg">발송 성공률</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">발송 상태</h2>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 size={24} className="text-purple-600" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">성공</span>
                <span className="font-bold text-green-600">{deliveryStats.sentCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">실패</span>
                <span className="font-bold text-red-600">{deliveryStats.failedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">대기</span>
                <span className="font-bold text-yellow-600">{deliveryStats.pendingCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 발송 내역 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">최근 발송 내역</h2>
            <Link 
              href="/delivery-monitor" 
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              전체 보기
            </Link>
          </div>
          
          {recentDeliveries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-bold text-gray-700">고객</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">캠페인</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">상태</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">발송 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeliveries.slice(0, 10).map((delivery) => (
                    <tr key={delivery.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Users size={20} className="text-blue-600" />
                          </div>
                          <span className="font-semibold">{delivery.customer?.name || '알 수 없음'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700 font-medium">{delivery.campaign?.name || '알 수 없음'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {getStatusIcon(delivery.status)}
                          <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(delivery.status)}`}>
                            {getStatusText(delivery.status)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {delivery.sentAt ? new Date(delivery.sentAt).toLocaleString('ko-KR') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">📭</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">발송 내역이 없습니다</h3>
              <p className="text-gray-500 text-lg mb-6">캠페인을 발송하면 여기에 내역이 표시됩니다.</p>
              <Link 
                href="/campaigns/new" 
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                첫 번째 캠페인 생성하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
