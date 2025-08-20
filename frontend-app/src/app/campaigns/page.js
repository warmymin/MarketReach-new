'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Calendar, Users, Target, MessageSquare, Clock, CheckCircle, AlertCircle, Play, Send, BarChart3 } from 'lucide-react';
import { apiService } from '@/lib/api';
import Link from 'next/link';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [campaignStats, setCampaignStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // 캠페인 목록 로드
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log('캠페인 데이터 로드 시작...');
        
        const campaignsData = await apiService.getCampaigns();
        console.log('캠페인 데이터:', campaignsData);
        
        setCampaigns(campaignsData);
        
        // 각 캠페인의 발송 통계 로드
        const stats = {};
        for (const campaign of campaignsData) {
          try {
            const campaignStat = await apiService.getCampaignDeliveryStats(campaign.id);
            stats[campaign.id] = campaignStat;
          } catch (err) {
            console.error(`캠페인 ${campaign.id} 통계 로드 실패:`, err);
            stats[campaign.id] = null;
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
    }
    fetchData();
  }, []);

  // 검색 및 필터링
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 캠페인 삭제
  const handleDeleteCampaign = async (id) => {
    console.log('삭제 요청된 캠페인 ID:', id);
    console.log('삭제 요청된 캠페인 ID 타입:', typeof id);
    
    const campaign = campaigns.find(c => c.id === id);
    const campaignName = campaign?.name || '이 캠페인';
    
    console.log('찾은 캠페인:', campaign);
    
    if (window.confirm(`정말로 "${campaignName}"을(를) 삭제하시겠습니까?\n\n삭제된 캠페인은 복구할 수 없습니다.`)) {
      try {
        console.log('API 호출 시작 - 삭제할 ID:', id);
        const result = await apiService.deleteCampaign(id);
        console.log('삭제 API 응답:', result);
        
        if (result) {
          alert('캠페인이 성공적으로 삭제되었습니다.');
          // 목록에서 해당 캠페인 제거
          setCampaigns(prev => prev.filter(c => c.id !== id));
          // 통계에서도 제거
          setCampaignStats(prev => {
            const newStats = { ...prev };
            delete newStats[id];
            return newStats;
          });
        }
      } catch (error) {
        console.error('캠페인 삭제 오류:', error);
        console.error('에러 상세 정보:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        alert('캠페인 삭제에 실패했습니다: ' + error.message);
      }
    }
  };

  // 캠페인 발송
  const handleSendCampaign = async (id) => {
    if (window.confirm('이 캠페인을 발송하시겠습니까?')) {
      try {
        const result = await apiService.sendCampaign(id);
        if (result.success) {
          alert(`캠페인 발송이 완료되었습니다!\n총 발송: ${result.data.totalDeliveries}건\n성공: ${result.data.sentCount}건\n실패: ${result.data.failedCount}건\n성공률: ${result.data.successRate.toFixed(1)}%`);
          
          // 목록 새로고침
          const updatedData = await apiService.getCampaigns();
          setCampaigns(updatedData);
          
          // 발송 통계 새로고침
          const updatedStats = { ...campaignStats };
          try {
            const campaignStat = await apiService.getCampaignDeliveryStats(id);
            updatedStats[id] = campaignStat;
            setCampaignStats(updatedStats);
          } catch (err) {
            console.error('발송 통계 새로고침 실패:', err);
          }
        } else {
          alert('캠페인 발송에 실패했습니다: ' + result.message);
        }
      } catch (error) {
        console.error('캠페인 발송 오류:', error);
        alert('캠페인 발송에 실패했습니다: ' + error.message);
      }
    }
  };

  // 상태별 아이콘 및 색상
  const getStatusInfo = (status) => {
    switch (status) {
      case 'DRAFT':
        return { icon: Clock, color: 'text-white', bgColor: 'bg-gray-500', label: '초안' };
      case 'IN_PROGRESS':
        return { icon: Play, color: 'text-white', bgColor: 'bg-blue-600', label: '진행중' };
      case 'COMPLETED':
        return { icon: CheckCircle, color: 'text-white', bgColor: 'bg-green-600', label: '완료' };
      case 'FAILED':
        return { icon: AlertCircle, color: 'text-white', bgColor: 'bg-red-600', label: '실패' };
      default:
        return { icon: AlertCircle, color: 'text-white', bgColor: 'bg-gray-500', label: status };
    }
  };

  // 메시지 요약 (100자 제한)
  const getMessageSummary = (message) => {
    return message.length > 100 ? message.substring(0, 100) + '...' : message;
  };

  // 발송 통계 표시
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
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* 헤더 */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 mb-3">
                마케팅 캠페인
              </h1>
              <p className="text-lg text-gray-600 font-light">위치 기반 캠페인을 생성하고 관리하세요</p>
            </div>
            <Link
              href="/campaigns/new"
              className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              <Plus size={16} className="mr-2" />
              새 캠페인
            </Link>
          </div>
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
                placeholder="캠페인 이름, 메시지로 검색..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition-colors text-sm" 
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition-colors bg-white text-sm"
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
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">로딩 중...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      ) : filteredCampaigns.length > 0 ? (
                    <div className="space-y-6">
          {filteredCampaigns.map(campaign => {
            const statusInfo = getStatusInfo(campaign.status);
            const StatusIcon = statusInfo.icon;
            const deliveryStats = getDeliveryStatsDisplay(campaign.id);
            
            return (
              <div key={campaign.id} className="group border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200 p-6 mb-4">
                {/* 상단 정보 섹션 */}
                <div className="flex items-start justify-between mb-4">
                  {/* 좌측: 타이틀과 상태 뱃지 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        campaign.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                        campaign.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {campaign.createdAt ? 
                        new Date(campaign.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }) : '날짜 없음'
                      }
                    </p>
                  </div>
                  {/* 우측: 액션 버튼 */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* 발송 버튼 - 초안 상태일 때만 표시 */}
                    {campaign.status === 'DRAFT' && (
                      <button 
                        onClick={() => handleSendCampaign(campaign.id)} 
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="발송"
                      >
                        <Send size={14} className="mr-1" />
                        발송
                      </button>
                    )}
                    
                    {/* 편집 버튼 - 초안 상태에서만 표시 */}
                    {campaign.status === 'DRAFT' && (
                      <Link 
                        href={`/campaigns/edit/${campaign.id}`} 
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="편집"
                      >
                        <Edit size={14} className="mr-1" />
                        편집
                      </Link>
                    )}
                    
                    {/* 삭제 버튼 - 모든 상태에서 표시 */}
                    <button 
                      onClick={() => handleDeleteCampaign(campaign.id)} 
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={14} className="mr-1" />
                      삭제
                    </button>
                  </div>
                </div>
                
                {/* 캠페인 설명 */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {getMessageSummary(campaign.message)}
                  </p>
                </div>
                
                {/* 하단 정보 */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Target size={14} />
                    <span>{campaign.targetingLocation ? campaign.targetingLocation.name : '강남 핫플레이스'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Send size={14} />
                    <span>{deliveryStats.totalDeliveries.toLocaleString()}건 발송</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={14} />
                    <span>성과율 {deliveryStats.successRate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            캠페인이 없습니다
          </h3>
          <p className="text-gray-500 mb-6 text-sm">
            첫 번째 마케팅 캠페인을 생성해보세요
          </p>
          <Link href="/campaigns/new" className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            <Plus size={16} className="mr-2" />
            새 캠페인 생성
          </Link>
        </div>
      )}
      </div>
    </div>
  );
}
