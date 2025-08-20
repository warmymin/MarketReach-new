'use client';

import { Send, CheckCircle, XCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';

export default function DeliveryStatusPage() {
  const deliveries = [
    {
      id: '1', status: 'SUCCESS', campaignName: '여름 할인 이벤트', customerName: '김철수', deliveredAt: '2024-08-19T10:00:00Z', errorCode: '', date: '2024-08-19'
    }
  ];
  const filter = '전체';
  const filteredDeliveries = deliveries.filter(delivery => filter === '전체' || delivery.status === filter);
  const statistics = {
    total: deliveries.length,
    success: deliveries.filter(d => d.status === 'SUCCESS').length,
    fail: deliveries.filter(d => d.status === 'FAIL').length,
    pending: deliveries.filter(d => d.status === 'PENDING').length,
    successRate: deliveries.length > 0 ? ((deliveries.filter(d => d.status === 'SUCCESS').length / deliveries.length) * 100).toFixed(1) : '0'
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle size={16} className="text-green-500" />;
      case 'FAIL': return <XCircle size={16} className="text-red-500" />;
      case 'PENDING': return <Clock size={16} className="text-yellow-500" />;
      default: return <AlertCircle size={16} className="text-gray-500" />;
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'success';
      case 'FAIL': return 'danger';
      case 'PENDING': return 'warning';
      default: return 'info';
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case 'SUCCESS': return '성공';
      case 'FAIL': return '실패';
      case 'PENDING': return '대기';
      default: return '알 수 없음';
    }
  };
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">발송 현황</h1>
          <p className="page-subtitle">실시간 발송 상태를 모니터링하세요</p>
        </div>
      </div>
      <div className="grid grid-4">
        <div className="card">
          <div className="card-header">
            <div className="metric">
              <div className="metric-value">{statistics.total}</div>
              <div className="metric-label">총 발송</div>
            </div>
            <Send size={24} className="text-blue-500" />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="metric">
              <div className="metric-value">{statistics.success}</div>
              <div className="metric-label">성공</div>
            </div>
            <CheckCircle size={24} className="text-green-500" />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="metric">
              <div className="metric-value">{statistics.fail}</div>
              <div className="metric-label">실패</div>
            </div>
            <XCircle size={24} className="text-red-500" />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="metric">
              <div className="metric-value">{statistics.successRate}%</div>
              <div className="metric-label">성공률</div>
            </div>
            <TrendingUp size={24} className="text-orange-500" />
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">발송 현황</h2>
          <select className="input" defaultValue="전체">
            <option value="전체">전체 상태</option>
            <option value="SUCCESS">성공</option>
            <option value="FAIL">실패</option>
            <option value="PENDING">대기</option>
          </select>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>상태</th>
                <th>캠페인</th>
                <th>고객</th>
                <th>발송 시간</th>
                <th>오류 코드</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map(delivery => (
                  <tr key={delivery.id}>
                    <td>
                      <div className="delivery-status">
                        {getStatusIcon(delivery.status)}
                        <span className={`tag tag-${getStatusColor(delivery.status)}`}>{getStatusText(delivery.status)}</span>
                      </div>
                    </td>
                    <td>{delivery.campaignName}</td>
                    <td>{delivery.customerName}</td>
                    <td>{delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleString('ko-KR') : '-'}</td>
                    <td>{delivery.errorCode || '-'}</td>
                    <td>{delivery.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>발송 데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
