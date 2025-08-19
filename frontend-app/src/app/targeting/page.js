import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { apiService } from '@/lib/api';

export default function TargetingPage() {
  const [targetings, setTargetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('전체');

  useEffect(() => {
    async function fetchTargetings() {
      try {
        setLoading(true);
        const data = await apiService.getTargetings();
        // 데이터 변환: campaign/customer 정보가 있으면 이름 추출
        const converted = data.map(t => ({
          id: t.id,
          campaignName: t.campaign?.name || '',
          customerName: t.customer?.name || '',
          isConfirmed: t.isConfirmed,
          createdAt: t.createdAt ? t.createdAt.split('T')[0] : ''
        }));
        setTargetings(converted);
        setError(null);
      } catch (err) {
        setError('타겟팅 데이터를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchTargetings();
  }, []);

  const filteredTargetings = targetings.filter(targeting => {
    const matchesSearch = targeting.campaignName.includes(searchTerm) || targeting.customerName.includes(searchTerm);
    const matchesFilter = filter === '전체' || (targeting.isConfirmed ? '확정' : '미확정') === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">타겟팅 관리</h1>
          <p className="page-subtitle">캠페인별 타겟팅을 관리하세요</p>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-filter">
            <div className="search-box">
              <Search size={16} />
              <input type="text" placeholder="캠페인명, 고객명으로 검색..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input" />
            </div>
            <select className="input" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="전체">전체</option>
              <option value="확정">확정</option>
              <option value="미확정">미확정</option>
            </select>
          </div>
          <button className="btn btn-primary"><Plus size={16} />타겟팅 생성</button>
        </div>
        <div className="table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>
          ) : error ? (
            <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>캠페인명</th>
                  <th>고객명</th>
                  <th>확정 여부</th>
                  <th>등록일</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargetings.length > 0 ? (
                  filteredTargetings.map(targeting => (
                    <tr key={targeting.id}>
                      <td>{targeting.campaignName}</td>
                      <td>{targeting.customerName}</td>
                      <td>
                        {targeting.isConfirmed ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                        <span className={`tag tag-${targeting.isConfirmed ? 'success' : 'danger'}`}>{targeting.isConfirmed ? '확정' : '미확정'}</span>
                      </td>
                      <td><div className="targeting-date"><Calendar size={14} />{targeting.createdAt}</div></td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                          <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>타겟팅 데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
