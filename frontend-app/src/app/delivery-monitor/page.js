'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { apiService } from '@/lib/api';

export default function DeliveryMonitorPage() {
  const [summary, setSummary] = useState(null);
  const [realtimeStats, setRealtimeStats] = useState([]);
  const [hourlyStats, setHourlyStats] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [failedDeliveries, setFailedDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState('monitoring');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 데이터 로드
  useEffect(() => {
    loadData();
    // 30초마다 데이터 새로고침
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, realtimeData, hourlyData, pendingData, failedData] = await Promise.all([
        apiService.getDeliverySummary(),
        apiService.getRealtimeStats(),
        apiService.getHourlyStats(),
        apiService.getDeliveriesByStatus('PENDING'),
        apiService.getDeliveriesByStatus('FAILED')
      ]);
      
      setSummary(summaryData);
      setRealtimeStats(realtimeData);
      setHourlyStats(hourlyData);
      setPendingDeliveries(pendingData || []);
      setFailedDeliveries(failedData || []);
      setError(null);
    } catch (err) {
      console.error('데이터 로드 오류:', err);
      setError('데이터를 불러올 수 없습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 변화율 계산 (임시 데이터)
  const getChangeRate = (current, previous = 0) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // 요약 카드 컴포넌트
  const SummaryCard = ({ title, value, change, icon: Icon, color, bgColor }) => (
    <div className="card transform hover:scale-105 transition-transform duration-300">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-bold text-gray-900">{value?.toLocaleString() || 0}</span>
              {change && (
                <div className={`flex items-center gap-1 text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{Math.abs(change)}%</span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full ${bgColor}`}>
            <Icon size={24} className={color} />
          </div>
        </div>
      </div>
    </div>
  );

  // 탭 컴포넌트
  const TabButton = ({ id, label, icon: Icon, active, badge }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={16} />
      {label}
      {badge && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </button>
  );

  // 발송 상태별 색상
  const getStatusColor = (status) => {
    switch (status) {
      case 'SENT':
        return 'text-green-600 bg-green-100';
      case 'FAILED':
        return 'text-red-600 bg-red-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // 발송 상태별 라벨
  const getStatusLabel = (status) => {
    switch (status) {
      case 'SENT':
        return '발송 완료';
      case 'FAILED':
        return '발송 실패';
      case 'PENDING':
        return '대기 중';
      default:
        return status;
    }
  };

  if (loading && !summary) {
    return (
      <div className="page-content">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          발송 모니터링 데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">📊 발송 모니터링 대시보드</h1>
            <p className="page-subtitle">실시간 마케팅 메시지 발송 현황을 확인하세요</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="btn btn-secondary"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              새로고침
            </button>
            <button className="btn btn-primary">
              <Download size={16} />
              CSV 다운로드
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="card mb-6 border-red-200 bg-red-50">
          <div className="card-body">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="총 발송 수"
          value={summary?.totalDeliveries || 0}
          change={getChangeRate(summary?.totalDeliveries || 0, 1000)}
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <SummaryCard
          title="성공 수"
          value={summary?.sentCount || 0}
          change={getChangeRate(summary?.sentCount || 0, 850)}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <SummaryCard
          title="실패 수"
          value={summary?.failedCount || 0}
          change={getChangeRate(summary?.failedCount || 0, 150)}
          icon={XCircle}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <SummaryCard
          title="대기 중"
          value={summary?.pendingCount || 0}
          change={getChangeRate(summary?.pendingCount || 0, 200)}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
      </div>

      {/* 탭 네비게이션 */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex gap-2 overflow-x-auto">
            <TabButton
              id="monitoring"
              label="실시간 모니터링"
              icon={TrendingUp}
              active={activeTab === 'monitoring'}
            />
            <TabButton
              id="queue"
              label="발송 대기열"
              icon={Clock}
              active={activeTab === 'queue'}
              badge={pendingDeliveries.length > 0 ? pendingDeliveries.length : null}
            />
            <TabButton
              id="failed"
              label="실패 관리"
              icon={XCircle}
              active={activeTab === 'failed'}
              badge={failedDeliveries.length > 0 ? failedDeliveries.length : null}
            />
            <TabButton
              id="stats"
              label="통계"
              icon={Users}
              active={activeTab === 'stats'}
            />
          </div>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 실시간 모니터링 */}
        {activeTab === 'monitoring' && (
          <>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📈 실시간 발송 현황</h2>
                <span className="text-sm text-gray-500">최근 30분간 5분 단위</span>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {realtimeStats.length > 0 ? (
                    realtimeStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 text-center">
                            <div className="text-sm font-medium text-gray-700">
                              {stat.timeSlot}분
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">성공: {stat.sent}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">실패: {stat.failed}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">대기: {stat.pending}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>최근 30분간 발송 데이터가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">⏰ 시간대별 통계</h2>
                <span className="text-sm text-gray-500">오늘의 시간대별 발송 건수</span>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {hourlyStats.length > 0 ? (
                    hourlyStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {stat.hour}시
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.min((stat.count / 100) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {stat.count}건
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>오늘의 시간대별 데이터가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 발송 대기열 */}
        {activeTab === 'queue' && (
          <div className="card lg:col-span-2">
            <div className="card-header">
              <h2 className="card-title">⏳ 발송 대기열</h2>
              <span className="text-sm text-gray-500">현재 대기 중인 발송 목록</span>
            </div>
            <div className="card-body">
              {pendingDeliveries.length > 0 ? (
                <div className="space-y-4">
                  {pendingDeliveries.slice(0, 10).map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <Clock size={16} className="text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {delivery.customer?.name || '알 수 없는 고객'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {delivery.customer?.phone || '전화번호 없음'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {delivery.targetingLocation?.name || '타겟팅 위치 없음'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {delivery.createdAt ? new Date(delivery.createdAt).toLocaleString() : '시간 정보 없음'}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          {getStatusLabel(delivery.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {pendingDeliveries.length > 10 && (
                    <div className="text-center py-4 text-gray-500">
                      외 {pendingDeliveries.length - 10}건의 대기 중인 발송이 있습니다.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>현재 대기 중인 발송이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 실패 관리 */}
        {activeTab === 'failed' && (
          <div className="card lg:col-span-2">
            <div className="card-header">
              <h2 className="card-title">❌ 실패 관리</h2>
              <span className="text-sm text-gray-500">발송 실패한 메시지 관리</span>
            </div>
            <div className="card-body">
              {failedDeliveries.length > 0 ? (
                <div className="space-y-4">
                  {failedDeliveries.slice(0, 10).map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-100 rounded-full">
                          <AlertTriangle size={16} className="text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {delivery.customer?.name || '알 수 없는 고객'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {delivery.customer?.phone || '전화번호 없음'}
                          </div>
                          <div className="text-xs text-red-600 mt-1">
                            오류: {delivery.errorCode || '알 수 없는 오류'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {delivery.targetingLocation?.name || '타겟팅 위치 없음'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {delivery.createdAt ? new Date(delivery.createdAt).toLocaleString() : '시간 정보 없음'}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          {getStatusLabel(delivery.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {failedDeliveries.length > 10 && (
                    <div className="text-center py-4 text-gray-500">
                      외 {failedDeliveries.length - 10}건의 실패한 발송이 있습니다.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <XCircle size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>실패한 발송이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 통계 */}
        {activeTab === 'stats' && (
          <div className="card lg:col-span-2">
            <div className="card-header">
              <h2 className="card-title">📊 상세 통계</h2>
              <span className="text-sm text-gray-500">발송 성과 분석</span>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary?.successRate?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-gray-600">전체 성공률</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {summary?.todayDeliveries || 0}
                  </div>
                  <div className="text-sm text-gray-600">오늘 발송 수</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {summary?.totalDeliveries || 0}
                  </div>
                  <div className="text-sm text-gray-600">총 발송 수</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
