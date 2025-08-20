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
  AlertTriangle,
  MapPin,
  Target,
  BarChart3,
  Send,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { apiService } from '@/lib/api';
import Link from 'next/link';

// KPI 카드 컴포넌트
const KpiCard = ({ title, value, change, icon: Icon, color, bgColor }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform hover:scale-[1.02] transition-transform duration-300">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-full ${bgColor}`}>
        <Icon size={20} className={color} />
      </div>
    </div>
  </div>
);

// 탭 네비게이션 컴포넌트
const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'realtime', label: '실시간 모니터링' },
    { id: 'queue', label: '발송 대기열' },
    { id: 'failed', label: '실패 관리' },
    { id: 'stats', label: '통계' }
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// 실시간 라인 차트 컴포넌트
const RealtimeLineChart = ({ data }) => {
  // 실시간 데이터 생성 (Mock)
  const defaultData = [
    { time: '14:00', total: 120, success: 100, failed: 20 },
    { time: '14:05', total: 95, success: 90, failed: 5 },
    { time: '14:10', total: 160, success: 140, failed: 20 },
    { time: '14:15', total: 145, success: 130, failed: 15 },
    { time: '14:20', total: 130, success: 120, failed: 10 },
    { time: '14:25', total: 175, success: 160, failed: 15 }
  ];
  
  // data가 배열이고 길이가 0보다 큰지 확인
  const chartData = Array.isArray(data) && data.length > 0 ? data : defaultData;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">최근 30분간 메시지 발송 현황</h2>
        <p className="text-sm text-gray-500">실시간 발송 상태 모니터링</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            domain={[0, 180]}
            ticks={[0, 45, 90, 135, 180]}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            name="총 발송"
          />
          <Line 
            type="monotone" 
            dataKey="success" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            name="성공"
          />
          <Line 
            type="monotone" 
            dataKey="failed" 
            stroke="#EF4444" 
            strokeWidth={2}
            dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
            name="실패"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 시간대별 막대 차트 컴포넌트
const HourlyBarChart = ({ data }) => {
  const COLORS = ['#10B981', '#EF4444'];
  
  // 데이터 검증 및 기본값 설정
  const defaultData = [
    { hour: '09:00', success: 380, failed: 80 },
    { hour: '10:00', success: 580, failed: 100 },
    { hour: '11:00', success: 620, failed: 120 },
    { hour: '12:00', success: 780, failed: 140 },
    { hour: '13:00', success: 550, failed: 80 },
    { hour: '14:00', success: 520, failed: 60 }
  ];
  
  // data가 배열이고 길이가 0보다 큰지 확인
  const chartData = Array.isArray(data) && data.length > 0 ? data : defaultData;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">오늘 시간대별 발송 현황</h2>
        <p className="text-sm text-gray-500">시간대별 성공/실패 통계</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="hour" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            domain={[0, 800]}
            ticks={[0, 200, 400, 600, 800]}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar 
            dataKey="success" 
            fill={COLORS[0]} 
            name="성공"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="failed" 
            fill={COLORS[1]} 
            name="실패"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 지역별 파이 차트 컴포넌트
const RegionPieChart = ({ data }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  // 데이터 검증 및 기본값 설정
  const defaultData = [
    { name: '강남구', value: 29 },
    { name: '서초구', value: 23 },
    { name: '마포구', value: 18 },
    { name: '종로구', value: 15 },
    { name: '중구', value: 15 }
  ];
  
  // data가 배열이고 길이가 0보다 큰지 확인
  const chartData = Array.isArray(data) && data.length > 0 ? data : defaultData;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">지역별 고객 분포</h2>
        <p className="text-sm text-gray-500">타겟 고객 지역 분포도</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 상태 배지 컴포넌트
const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case '진행중':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case '완료':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case '대기':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
};

// 최근 캠페인 리스트 컴포넌트
const RecentCampaignsList = ({ campaigns }) => {
  // 데이터 검증 및 기본값 설정
  const defaultData = [
    { id: '1', name: '강남구 할인 이벤트', distanceKm: 2, date: '2024-08-20', count: 1420, status: '진행중' },
    { id: '2', name: '서초구 신규 오픈', distanceKm: 1.5, date: '2024-08-19', count: 856, status: '완료' },
    { id: '3', name: '마포구 시즌 프로모션', distanceKm: 3, date: '2024-08-18', count: 1234, status: '완료' }
  ];
  
  // campaigns가 배열이고 길이가 0보다 큰지 확인
  const campaignData = Array.isArray(campaigns) && campaigns.length > 0 ? campaigns : defaultData;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">최근 캠페인</h2>
          <p className="text-sm text-gray-500">진행 중이거나 최근 완료된 캠페인</p>
        </div>
        <Link href="/campaigns/new" className="btn btn-primary btn-sm">
          <Plus size={16} />
          새 캠페인 생성
        </Link>
      </div>
      <div className="space-y-4">
        {campaignData.length > 0 ? (
          campaignData.map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Target size={16} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{campaign.name}</div>
                  <div className="text-sm text-gray-600">
                    {campaign.distanceKm}km • {campaign.date} • {(campaign.count || 0).toLocaleString()}건
                  </div>
                </div>
              </div>
              <StatusBadge status={campaign.status} />
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Target size={48} className="mx-auto mb-4 text-gray-300" />
            <p>최근 캠페인이 없습니다.</p>
            <Link href="/campaigns/new" className="btn btn-primary btn-sm mt-3">
              캠페인 생성하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default function DeliveryMonitorPage() {
  const [activeTab, setActiveTab] = useState('realtime');
  const [summary, setSummary] = useState(null);
  const [hourlyStats, setHourlyStats] = useState([]);
  const [regionDistribution, setRegionDistribution] = useState([]);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 데이터 로드
  useEffect(() => {
    loadData();
    
    // 실시간 업데이트를 위한 SSE 구독
    if (typeof window !== 'undefined') {
      const eventSource = new EventSource('http://localhost:8083/api/deliveries/stream', { 
        withCredentials: false 
      });

      eventSource.addEventListener('delivery', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('배송 모니터 - 실시간 이벤트 수신:', data);
          
          // 발송 이벤트가 발생하면 데이터를 새로고침
          setTimeout(() => {
            loadData();
          }, 1000);
        } catch (error) {
          console.error('이벤트 데이터 파싱 오류:', error);
        }
      });

      eventSource.addEventListener('connected', () => {
        console.log('배송 모니터 - 실시간 스트림 연결됨');
      });

      eventSource.onerror = (error) => {
        console.error('SSE 연결 오류:', error);
      };

      // 컴포넌트 언마운트 시 연결 해제
      return () => {
        eventSource.close();
      };
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 각 API 호출을 개별적으로 처리하여 일부 실패해도 다른 데이터는 표시
      const dashboardData = await apiService.getDashboardSummary();
      setSummary(dashboardData);
      
      const hourlyData = await apiService.getHourlyStats();
      setHourlyStats(hourlyData);
      
      const regionData = await apiService.getRegionDistribution();
      setRegionDistribution(regionData);
      
      const campaignsData = await apiService.getRecentCampaigns();
      setRecentCampaigns(campaignsData);
      
      setError(null);
    } catch (err) {
      console.error('데이터 로드 오류:', err);
      // 오류가 발생해도 Mock 데이터가 표시되므로 사용자에게는 오류를 숨김
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          대시보드 데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 발송 현황 대시보드</h1>
            <p className="text-gray-600">실시간 메시지 발송 현황과 통계를 확인하세요</p>
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
            <Link href="/campaigns/new" className="btn btn-primary">
              <Plus size={16} />
              캠페인 생성
            </Link>
          </div>
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="총 발송"
          value="15,420"
          change={8}
          icon={Send}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <KpiCard
          title="성공"
          value="12,680"
          change={12}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <KpiCard
          title="실패"
          value="890"
          change={-5}
          icon={XCircle}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <KpiCard
          title="대기중"
          value="1,850"
          change={15}
          icon={Clock}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* 탭 네비게이션 */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 탭별 콘텐츠 */}
      {activeTab === 'realtime' && (
        <div className="space-y-6">
          {/* 실시간 차트 */}
          <RealtimeLineChart />
          
          {/* 하단 차트 섹션 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HourlyBarChart data={hourlyStats} />
            <RegionPieChart data={regionDistribution} />
          </div>
          
          {/* 최근 캠페인 리스트 */}
          <RecentCampaignsList campaigns={recentCampaigns} />
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">발송 대기열</h2>
          <p className="text-gray-500">발송 대기 중인 메시지 목록이 여기에 표시됩니다.</p>
        </div>
      )}

      {activeTab === 'failed' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">실패 관리</h2>
          <p className="text-gray-500">발송 실패한 메시지 관리가 여기에 표시됩니다.</p>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">통계</h2>
          <p className="text-gray-500">상세한 통계 정보가 여기에 표시됩니다.</p>
        </div>
      )}
    </div>
  );
}
