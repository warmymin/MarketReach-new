'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MapPin, Send, BarChart3, Calendar, Settings } from 'lucide-react';
// import apiService from '@/lib/api'; // Next.js에서는 lib/api.js로 이동 예정

export default function CampaignPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('전체');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: apiService.getCampaigns()로 데이터 불러오기
    setLoading(false);
    setCampaigns([
      {
        id: '1',
        name: '여름 할인 이벤트',
        message: '시원한 여름! 전메뉴 20% 할인 이벤트! 지금 바로 방문하세요!',
        location: '강남 핫플레이스',
        status: '진행중',
        sentCount: 1420,
        successRate: 85.2,
        date: '2024-08-15'
      }
    ]);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case '진행중': return 'tag-success';
      case '완료': return 'tag-info';
      case '대기': return 'tag-warning';
      default: return 'tag-info';
    }
  };

  return (
    <div className="campaign-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">캠페인</h1>
          </div>
          <div className="header-right">
            <button className="btn btn-secondary">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="page-content">
        <div className="campaign-tabs">
          <button className={`tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>캠페인 목록</button>
          <button className={`tab ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => setActiveTab('analysis')}>성과 분석</button>
        </div>
        {activeTab === 'list' && (
          <div className="campaign-list-section">
            {loading && <div className="loading-message"><p>캠페인 데이터를 불러오는 중...</p></div>}
            <div className="campaign-controls">
              <div className="search-filter">
                <div className="search-box">
                  <Search size={16} />
                  <input type="text" placeholder="캠페인 이름으로 검색..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input" />
                </div>
                <div className="filter-dropdown">
                  <Filter size={16} />
                  <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
                    <option value="전체">전체</option>
                    <option value="진행중">진행중</option>
                    <option value="완료">완료</option>
                    <option value="대기">대기</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary"><Plus size={16} />새 캠페인 생성</button>
            </div>
            <div className="campaign-grid">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="campaign-card">
                  <div className="campaign-header">
                    <h3 className="campaign-name">{campaign.name}</h3>
                    <span className={`tag ${getStatusColor(campaign.status)}`}>{campaign.status}</span>
                  </div>
                  <p className="campaign-message">{campaign.message}</p>
                  <div className="campaign-location"><MapPin size={14} /><span>{campaign.location}</span></div>
                  <div className="campaign-stats">
                    <div className="stat"><Send size={14} /><span>{(campaign.sentCount || 0).toLocaleString()}건 발송</span></div>
                    <div className="stat"><BarChart3 size={14} /><span>성공률 {campaign.successRate || 0}%</span></div>
                  </div>
                  <div className="campaign-footer">
                    <div className="campaign-date"><Calendar size={14} /><span>{campaign.date}</span></div>
                    <div className="campaign-actions">
                      <button className="action-btn"><Edit size={14} /></button>
                      <button className="action-btn"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'analysis' && (
          <div className="analysis-section">
            <p>성과 분석 페이지는 추후 구현 예정입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
