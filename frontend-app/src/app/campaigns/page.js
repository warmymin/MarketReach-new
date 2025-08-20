'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Calendar, Users, Target, MessageSquare, Clock, CheckCircle, AlertCircle, Play, Send } from 'lucide-react';
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
    if (window.confirm('정말로 이 캠페인을 삭제하시겠습니까?')) {
      try {
        const result = await apiService.deleteCampaign(id);
        if (result) {
          alert('캠페인이 성공적으로 삭제되었습니다.');
          // 목록 새로고침
          const updatedData = await apiService.getCampaigns();
          setCampaigns(updatedData);
        }
      } catch (error) {
        console.error('캠페인 삭제 오류:', error);
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
        return { icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-100', label: '초안' };
      case 'IN_PROGRESS':
        return { icon: Play, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: '진행 중' };
      case 'COMPLETED':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: '완료됨' };
      case 'FAILED':
        return { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: '실패' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bgColor: 'bg-gray-100', label: status };
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
    <div className="page-content">
      <div className="page-header">
                  <div>
            <h1 className="page-title">📢 마케팅 캠페인 관리</h1>
            <p className="page-subtitle">위치 기반 캠페인을 생성하고 관리하세요</p>
          </div>
        <Link href="/campaigns/new" className="btn btn-primary">
          <Plus size={16} />
          새 캠페인 생성
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="search-box flex-1">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="캠페인 이름, 메시지로 검색..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="input" 
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="input"
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
      </div>

      {/* 캠페인 목록 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          로딩 중...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => {
            const statusInfo = getStatusInfo(campaign.status);
            const StatusIcon = statusInfo.icon;
            const deliveryStats = getDeliveryStatsDisplay(campaign.id);
            
            return (
              <div key={campaign.id} className="card hover:shadow-lg transition-shadow">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <h3 className="card-title text-lg font-semibold truncate">
                      {campaign.name}
                    </h3>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleSendCampaign(campaign.id)} 
                        className="btn btn-success btn-sm"
                        title="발송"
                        disabled={campaign.status === 'IN_PROGRESS'}
                      >
                        <Send size={14} />
                      </button>
                      <Link 
                        href={`/campaigns/edit/${campaign.id}`} 
                        className="btn btn-secondary btn-sm"
                        title="편집"
                      >
                        <Edit size={14} />
                      </Link>
                      <button 
                        onClick={() => handleDeleteCampaign(campaign.id)} 
                        className="btn btn-danger btn-sm"
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="card-body space-y-4">
                  {/* 메시지 요약 */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">메시지</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {getMessageSummary(campaign.message)}
                    </p>
                  </div>

                  {/* 타겟팅 정보 */}
                  {campaign.targetingLocation && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">타겟팅</span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{campaign.targetingLocation.name}</div>
                        <div className="text-gray-500">
                          {(campaign.targetingLocation.radiusM / 1000).toFixed(1)}km 반경
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 상태 */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <StatusIcon size={16} className={statusInfo.color} />
                      <span className="text-sm font-medium text-gray-600">상태</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* 발송 통계 */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">발송 통계</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">발송 수:</span>
                        <span className="font-medium">{deliveryStats.totalDeliveries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">성공률:</span>
                        <span className="font-medium">{deliveryStats.successRate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            캠페인이 없습니다
          </h3>
          <p className="text-gray-500 mb-6">
            첫 번째 마케팅 캠페인을 생성해보세요
          </p>
          <Link href="/campaigns/new" className="btn btn-primary">
            <Plus size={16} />
            새 캠페인 생성하기
          </Link>
        </div>
      )}
    </div>
  );
}
