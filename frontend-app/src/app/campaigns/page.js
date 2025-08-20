'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Send, 
  Edit, 
  Trash2, 
  Target, 
  BarChart3, 
  Clock,
  MessageSquare,
  Users,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../../lib/api';
import Link from 'next/link';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignStats, setCampaignStats] = useState({});

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const campaignsData = await apiService.getCampaigns();
      setCampaigns(campaignsData || []);
      
      // 각 캠페인의 발송 통계 로드
      const stats = {};
      for (const campaign of campaignsData || []) {
        try {
          const campaignStats = await apiService.getCampaignDeliveryStats(campaign.id);
          stats[campaign.id] = campaignStats || { totalDeliveries: 0, successRate: 0 };
        } catch (error) {
          console.error(`캠페인 ${campaign.id} 통계 로드 실패:`, error);
          stats[campaign.id] = { totalDeliveries: 0, successRate: 0 };
        }
      }
      setCampaignStats(stats);
      
      setError(null);
    } catch (err) {
      console.error('캠페인 데이터 로드 오류:', err);
      setError('데이터를 불러올 수 없습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (campaignId) => {
    if (!confirm('이 캠페인을 발송하시겠습니까?')) {
      return;
    }

    try {
      const result = await apiService.sendCampaign(campaignId);
      if (result && result.success) {
        alert('캠페인이 성공적으로 발송되었습니다!');
        loadCampaigns(); // 목록 새로고침
      } else {
        alert('캠페인 발송에 실패했습니다.');
      }
    } catch (error) {
      console.error('캠페인 발송 오류:', error);
      alert('캠페인 발송에 실패했습니다: ' + error.message);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!confirm(`"${campaign?.name}" 캠페인을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const result = await apiService.deleteCampaign(campaignId);
      if (result) {
        alert('캠페인이 성공적으로 삭제되었습니다.');
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      } else {
        alert('캠페인 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('캠페인 삭제 오류:', error);
      alert('캠페인 삭제에 실패했습니다: ' + error.message);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'DRAFT':
        return { label: '초안', icon: MessageSquare, color: 'bg-gray-100 text-gray-800' };
      case 'IN_PROGRESS':
        return { label: '진행중', icon: Send, color: 'bg-blue-100 text-blue-800' };
      case 'COMPLETED':
        return { label: '완료', icon: CheckCircle, color: 'bg-green-100 text-green-800' };
      case 'FAILED':
        return { label: '실패', icon: XCircle, color: 'bg-red-100 text-red-800' };
      default:
        return { label: '알 수 없음', icon: AlertCircle, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getMessageSummary = (message) => {
    if (!message) return '메시지 없음';
    return message.length > 50 ? message.substring(0, 50) + '...' : message;
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getDeliveryStatsDisplay = (campaignId) => {
    const stats = campaignStats[campaignId];
    if (!stats) {
      return {
        totalDeliveries: '로딩 중...',
        successRate: '로딩 중...'
      };
    }
    
    return {
      totalDeliveries: stats.totalDeliveries || 0,
      successRate: stats.successRate ? `${stats.successRate.toFixed(1)}%` : '0%'
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">📢 마케팅 캠페인</h1>
              <p className="text-xl text-gray-600">위치 기반 캠페인을 생성하고 관리하세요</p>
            </div>
            <Link
              href="/campaigns/new"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} className="mr-2" />
              새 캠페인 생성
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
                placeholder="캠페인 이름, 메시지로 검색..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base" 
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white text-base font-medium"
              >
                <option value="all">전체 상태</option>
                <option value="DRAFT">초안</option>
                <option value="IN_PROGRESS">진행 중</option>
                <option value="COMPLETED">완료됨</option>
                <option value="FAILED">실패</option>
              </select>
            </div>
          </div>
        </div>

        {/* 캠페인 목록 */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">캠페인 데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="space-y-6">
            {filteredCampaigns.map(campaign => {
              const statusInfo = getStatusInfo(campaign.status);
              const StatusIcon = statusInfo.icon;
              const deliveryStats = getDeliveryStatsDisplay(campaign.id);
              
              return (
                <div key={campaign.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
                  {/* 상단 정보 섹션 */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
                          <Target size={24} className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{campaign.name}</h3>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                              <StatusIcon size={16} className="mr-1" />
                              {statusInfo.label}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {campaign.createdAt ? 
                                new Date(campaign.createdAt).toLocaleDateString('ko-KR', {
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
                      {/* 발송 버튼 - 초안 상태일 때만 표시 */}
                      {campaign.status === 'DRAFT' && (
                        <button 
                          onClick={() => handleSendCampaign(campaign.id)} 
                          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:text-green-700 transition-all duration-200"
                          title="발송"
                        >
                          <Send size={16} className="mr-2" />
                          발송
                        </button>
                      )}
                      
                      {/* 편집 버튼 - 초안 상태에서만 표시 */}
                      {campaign.status === 'DRAFT' && (
                        <Link 
                          href={`/campaigns/edit/${campaign.id}`} 
                          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                          title="편집"
                        >
                          <Edit size={16} className="mr-2" />
                          편집
                        </Link>
                      )}
                      
                      {/* 삭제 버튼 - 모든 상태에서 표시 */}
                      <button 
                        onClick={() => handleDeleteCampaign(campaign.id)} 
                        className="inline-flex items-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                        title="삭제"
                      >
                        <Trash2 size={16} className="mr-2" />
                        삭제
                      </button>
                    </div>
                  </div>
                  
                  {/* 캠페인 설명 */}
                  <div className="mb-6">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {getMessageSummary(campaign.message)}
                      </p>
                    </div>
                  </div>
                  
                  {/* 하단 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {campaign.targetingLocation ? campaign.targetingLocation.name : '타겟팅 없음'}
                        </div>
                        <div className="text-sm text-gray-500">타겟팅 위치</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users size={20} className="text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {deliveryStats.totalDeliveries}건
                        </div>
                        <div className="text-sm text-gray-500">총 발송</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {deliveryStats.successRate}
                        </div>
                        <div className="text-sm text-gray-500">성공률</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📢</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">캠페인이 없습니다</h3>
            <p className="text-gray-500 text-lg mb-8">첫 번째 마케팅 캠페인을 생성해보세요</p>
            <Link 
              href="/campaigns/new" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} className="mr-2" />
              새 캠페인 생성하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
