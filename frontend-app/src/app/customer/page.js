import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Calendar, Edit, Trash2 } from 'lucide-react';
// import apiService from '@/lib/api'; // Next.js에서는 lib/api.js로 이동 예정

export default function CustomerPage() {
  const [customers, setCustomers] = useState([
    {
      id: '1', name: '김철수', phone: '010-1234-5678', location: '37.1234, 127.5678', company: 'KT 마케팅', dongCode: '11680', date: '2024-08-19'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('전체');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phone.includes(searchTerm) || customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === '전체' || customer.company === filter;
    return matchesSearch && matchesFilter;
  });

  const companies = Array.from(new Set(customers.map(c => c.company)));

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-message">
          <p>고객 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">고객 관리</h1>
          <p className="page-subtitle">고객 정보를 관리하고 분석하세요</p>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-filter">
            <div className="search-box">
              <Search size={16} />
              <input type="text" placeholder="고객명, 전화번호, 회사로 검색..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input" />
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="input">
              <option value="전체">전체 회사</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>고객명</th>
                <th>전화번호</th>
                <th>위치</th>
                <th>회사</th>
                <th>동 코드</th>
                <th>등록일</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td><div className="customer-name">{customer.name}</div></td>
                    <td><div className="customer-phone"><Phone size={14} />{customer.phone}</div></td>
                    <td><div className="customer-location"><MapPin size={14} />{customer.location}</div></td>
                    <td>{customer.company}</td>
                    <td>{customer.dongCode}</td>
                    <td><div className="customer-date"><Calendar size={14} />{customer.date}</div></td>
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
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>고객이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
