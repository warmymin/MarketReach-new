// 프론트엔드용 더미 데이터 (JavaScript)
export function generateMockData() {
  const companies = [
    { id: '1', name: 'KT 마케팅', industry: 'IT', createdAt: '2024-08-19T10:00:00Z' },
    { id: '2', name: '스타벅스', industry: '음식점', createdAt: '2024-08-19T10:00:00Z' },
    { id: '3', name: '올리브영', industry: '화장품', createdAt: '2024-08-19T10:00:00Z' }
  ];
  const customers = [
    { id: '1', name: '김철수', phone: '010-1234-5678', lat: 37.5665, lng: 126.9780, dongCode: '1168051000', companyId: '1', createdAt: '2024-08-19T10:00:00Z', company: companies[0] },
    { id: '2', name: '이영희', phone: '010-2345-6789', lat: 37.5665, lng: 126.9780, dongCode: '1168052000', companyId: '2', createdAt: '2024-08-19T10:00:00Z', company: companies[1] },
    { id: '3', name: '박민수', phone: '010-3456-7890', lat: 37.5665, lng: 126.9780, dongCode: '1168053000', companyId: '3', createdAt: '2024-08-19T10:00:00Z', company: companies[2] },
    { id: '4', name: '정수진', phone: '010-4567-8901', lat: 37.5665, lng: 126.9780, dongCode: '1168054000', companyId: '1', createdAt: '2024-08-19T10:00:00Z', company: companies[0] },
    { id: '5', name: '최동욱', phone: '010-5678-9012', lat: 37.5665, lng: 126.9780, dongCode: '1168055000', companyId: '2', createdAt: '2024-08-19T10:00:00Z', company: companies[1] }
  ];
  const campaigns = [
    { id: '1', name: '여름 할인 이벤트', message: '시원한 여름! 전메뉴 20% 할인 이벤트!', lat: 37.5665, lng: 126.9780, radius: 2000, scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), companyId: '1', createdAt: '2024-08-19T10:00:00Z', company: companies[0] },
    { id: '2', name: '아메리카노 1+1', message: '아메리카노 1+1 이벤트! 친구와 함께 방문하세요!', lat: 37.5665, lng: 126.9780, radius: 1000, scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), companyId: '2', createdAt: '2024-08-19T10:00:00Z', company: companies[1] },
    { id: '3', name: '뷰티 상품 할인', message: '뷰티 상품 50% 할인! 아름다워지세요!', lat: 37.5665, lng: 126.9780, radius: 800, scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), companyId: '3', createdAt: '2024-08-19T10:00:00Z', company: companies[2] }
  ];
  const targetings = [
    { id: '1', campaignId: '1', customerId: '1', isConfirmed: true, createdAt: '2024-08-19T10:00:00Z', campaign: campaigns[0], customer: customers[0] },
    { id: '2', campaignId: '2', customerId: '2', isConfirmed: true, createdAt: '2024-08-19T10:00:00Z', campaign: campaigns[1], customer: customers[1] },
    { id: '3', campaignId: '3', customerId: '3', isConfirmed: true, createdAt: '2024-08-19T10:00:00Z', campaign: campaigns[2], customer: customers[2] },
    { id: '4', campaignId: '1', customerId: '4', isConfirmed: false, createdAt: '2024-08-19T10:00:00Z', campaign: campaigns[0], customer: customers[3] },
    { id: '5', campaignId: '2', customerId: '5', isConfirmed: true, createdAt: '2024-08-19T10:00:00Z', campaign: campaigns[1], customer: customers[4] }
  ];
  const deliveries = [
    { id: '1', targetingId: '1', status: 'SUCCESS', deliveredAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), createdAt: '2024-08-19T10:00:00Z', targeting: targetings[0] },
    { id: '2', targetingId: '2', status: 'SUCCESS', deliveredAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), createdAt: '2024-08-19T10:00:00Z', targeting: targetings[1] },
    { id: '3', targetingId: '3', status: 'FAIL', errorCode: 'NETWORK_ERROR', createdAt: '2024-08-19T10:00:00Z', targeting: targetings[2] }
  ];
  return { companies, customers, campaigns, targetings, deliveries };
}
