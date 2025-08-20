import axios from 'axios';

const API_BASE_URL = 'http://localhost:8083/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

class ApiService {
  // 회사 관련 API
  async getCompanies() {
    try {
      const response = await apiClient.get('/companies');
      return response.data.data || [];
    } catch (error) {
      console.error('회사 목록 조회 실패:', error);
      return [];
    }
  }

  async createCompany(companyData) {
    try {
      const response = await apiClient.post('/companies', companyData);
      return response.data;
    } catch (error) {
      console.error('회사 생성 실패:', error);
      throw error;
    }
  }

  // 고객 관련 API
  async getCustomers() {
    try {
      const response = await apiClient.get('/customers');
      return response.data.data || [];
    } catch (error) {
      console.error('고객 목록 조회 실패:', error);
      return [];
    }
  }

  async createCustomer(customerData) {
    try {
      const response = await apiClient.post('/customers', customerData);
      return response.data;
    } catch (error) {
      console.error('고객 생성 실패:', error);
      throw error;
    }
  }

  // 타겟팅 위치 관련 API
  async getTargetingLocations() {
    try {
      const response = await apiClient.get('/targeting-locations');
      return response.data.data || [];
    } catch (error) {
      console.error('타겟팅 위치 목록 조회 실패:', error);
      return [];
    }
  }

  async getTargetingLocationById(id) {
    try {
      const response = await apiClient.get(`/targeting-locations/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('타겟팅 위치 조회 실패:', error);
      return null;
    }
  }

  async createTargetingLocation(targetingLocation) {
    try {
      const response = await fetch(`${API_BASE_URL}/targeting-locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(targetingLocation)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API 응답:', data);
      return data;
    } catch (error) {
      console.error('타겟팅 위치 생성 실패:', error);
      throw error;
    }
  }

  async updateTargetingLocation(id, targetingLocation) {
    try {
      const response = await fetch(`${API_BASE_URL}/targeting-locations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(targetingLocation)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API 응답:', data);
      return data;
    } catch (error) {
      console.error('타겟팅 위치 수정 실패:', error);
      throw error;
    }
  }

  async deleteTargetingLocation(id) {
    try {
      const response = await apiClient.delete(`/targeting-locations/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('타겟팅 위치 삭제 실패:', error);
      throw error;
    }
  }

  async getEstimatedReach(lat, lng, radiusM) {
    try {
      const response = await apiClient.get('/targeting-locations/estimate-reach', {
        params: { lat, lng, radiusM }
      });
      return response.data.data;
    } catch (error) {
      console.error('예상 도달 고객 수 계산 실패:', error);
      return null;
    }
  }

  // 새로운 위치 기반 고객 수 계산 API (백엔드 API 사용)
  async getNearbyCustomers(lat, lng, radius) {
    try {
      const response = await apiClient.get('/customers/nearby', {
        params: { lat, lng, radius }
      });
      return response.data;
    } catch (error) {
      console.error('근처 고객 수 계산 실패:', error);
      return null;
    }
  }

  // PostgreSQL 직접 연동 API
  async getNearbyCustomersFromDB(lat, lng, radius) {
    try {
      const response = await fetch(`/api/customers/nearby-db?lat=${lat}&lng=${lng}&radius=${radius}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('DB에서 근처 고객 수 계산 실패:', error);
      return null;
    }
  }

  // 캠페인 관련 API
  async createCampaign(campaignData) {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('캠페인 생성 실패:', error);
      throw error;
    }
  }

  async getCampaigns() {
    try {
      const response = await apiClient.get('/campaigns');
      return response.data.data;
    } catch (error) {
      console.error('캠페인 목록 조회 실패:', error);
      throw error;
    }
  }

  async sendCampaign(campaignId) {
    try {
      const response = await apiClient.post(`/campaigns/${campaignId}/send`);
      return response.data;
    } catch (error) {
      console.error('캠페인 발송 실패:', error);
      throw error;
    }
  }

  async getCampaignDeliveryStats(campaignId) {
    try {
      const response = await apiClient.get(`/campaigns/${campaignId}/delivery-stats`);
      return response.data.data;
    } catch (error) {
      console.error('캠페인 발송 통계 조회 실패:', error);
      return null;
    }
  }

  async deleteCampaign(id) {
    try {
      const response = await apiClient.delete(`/campaigns/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('캠페인 삭제 실패:', error);
      throw error;
    }
  }

  // 배송 관련 API
  async getDeliveries() {
    try {
      const response = await apiClient.get('/deliveries');
      return response.data.data || [];
    } catch (error) {
      console.error('배송 목록 조회 실패:', error);
      return [];
    }
  }

  // 발송 통계 API
  async getDeliverySummary() {
    try {
      const response = await apiClient.get('/deliveries/stats/summary');
      return response.data;
    } catch (error) {
      console.error('발송 통계 조회 실패:', error);
      return null;
    }
  }

  // 실시간 발송 통계 API
  async getRealtimeStats() {
    try {
      const response = await apiClient.get('/deliveries/stats/realtime');
      return response.data;
    } catch (error) {
      console.error('실시간 통계 조회 실패:', error);
      return [];
    }
  }

  // 시간대별 발송 통계 API
  async getHourlyStats() {
    try {
      const response = await apiClient.get('/deliveries/stats/hourly');
      // response.data가 배열인지 확인하고, 아니면 빈 배열 반환
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('시간대별 통계 조회 실패:', error);
      return [];
    }
  }

  // 캠페인별 발송 목록 API
  async getDeliveriesByCampaign(campaignId) {
    try {
      const response = await apiClient.get(`/deliveries/campaign/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('캠페인별 발송 목록 조회 실패:', error);
      return [];
    }
  }

  // 상태별 발송 목록 API
  async getDeliveriesByStatus(status) {
    try {
      const response = await apiClient.get(`/deliveries/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('상태별 발송 목록 조회 실패:', error);
      return [];
    }
  }

  // 더미 데이터 생성 API
  async createDummyData() {
    try {
      const response = await apiClient.post('/test/create-dummy-data');
      return response.data;
    } catch (error) {
      console.error('더미 데이터 생성 실패:', error);
      return null;
    }
  }

  // 통계 데이터 API
  async getStatistics() {
    try {
      const response = await apiClient.get('/statistics');
      return response.data.data || {};
    } catch (error) {
      console.error('통계 조회 실패, 개별 API로 대체:', error);
      
      // 개별 API로 통계 데이터 수집
      try {
        const [companiesRes, customersRes, campaignsRes, targetingRes] = await Promise.all([
          apiClient.get('/companies'),
          apiClient.get('/customers'),
          apiClient.get('/campaigns'),
          apiClient.get('/targeting-locations')
        ]);
        
        return {
          companies: companiesRes.data.data?.length || 0,
          customers: customersRes.data.data?.length || 0,
          campaigns: campaignsRes.data.data?.length || 0,
          targetingLocations: targetingRes.data.data?.length || 0
        };
      } catch (fallbackError) {
        console.error('개별 API 호출도 실패:', fallbackError);
        return {
          companies: 0,
          customers: 0,
          campaigns: 0,
          targetingLocations: 0
        };
      }
    }
  }

  // 발송 통계 관련 API
  async getDeliverySummary() {
    try {
      const response = await apiClient.get('/deliveries/summary');
      return response.data.data || {
        totalDeliveries: 0,
        sentCount: 0,
        failedCount: 0,
        pendingCount: 0,
        successRate: 0
      };
    } catch (error) {
      console.error('발송 통계 조회 실패:', error);
      return {
        totalDeliveries: 0,
        sentCount: 0,
        failedCount: 0,
        pendingCount: 0,
        successRate: 0
      };
    }
  }

  async getRecentDeliveries() {
    try {
      const response = await apiClient.get('/deliveries/recent');
      return response.data.data || [];
    } catch (error) {
      console.error('최근 발송 내역 조회 실패:', error);
      return [];
    }
  }

  // 위치타겟팅과 발송 현황 연결 API
  async getTargetingLocationStats(targetingId) {
    try {
      const response = await apiClient.get(`/deliveries/stats/by-targeting/${targetingId}`);
      return response.data.data || {
        totalDeliveries: 0,
        sentCount: 0,
        failedCount: 0,
        pendingCount: 0,
        successRate: 0
      };
    } catch (error) {
      console.error('타겟팅 위치별 발송 통계 조회 실패:', error);
      return {
        totalDeliveries: 0,
        sentCount: 0,
        failedCount: 0,
        pendingCount: 0,
        successRate: 0
      };
    }
  }

  async updateDeliveryStatus(deliveryId, status) {
    try {
      const response = await apiClient.put(`/deliveries/${deliveryId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('발송 상태 업데이트 실패:', error);
      throw error;
    }
  }

  // 타겟팅 위치별 고객 목록 조회
  async getCustomersByTargeting(targetingId) {
    try {
      const response = await apiClient.get(`/targeting-locations/${targetingId}/customers`);
      return response.data.data || [];
    } catch (error) {
      console.error('타겟팅 위치별 고객 목록 조회 실패:', error);
      return [];
    }
  }

  // 타겟팅 위치별 캠페인 목록 조회
  async getCampaignsByTargeting(targetingId) {
    try {
      const response = await apiClient.get(`/targeting-locations/${targetingId}/campaigns`);
      return response.data.data || [];
    } catch (error) {
      console.error('타겟팅 위치별 캠페인 목록 조회 실패:', error);
      return [];
    }
  }

  // 실시간 발송 모니터링 데이터 조회
  async getRealtimeDeliveryMonitoring() {
    try {
      const [summary, realtimeStats, hourlyStats] = await Promise.all([
        this.getDeliverySummary(),
        this.getRealtimeStats(),
        this.getHourlyStats()
      ]);
      
      return {
        summary,
        realtimeStats,
        hourlyStats
      };
    } catch (error) {
      console.error('실시간 발송 모니터링 데이터 조회 실패:', error);
      return {
        summary: {
          totalDeliveries: 0,
          sentCount: 0,
          failedCount: 0,
          pendingCount: 0,
          successRate: 0
        },
        realtimeStats: [],
        hourlyStats: []
      };
    }
  }

  // 대시보드 요약 데이터 조회
  async getDashboardSummary() {
    try {
      const response = await apiClient.get('/deliveries/summary');
      const data = response.data.data || {};
      
      // 실제 데이터와 Mock 데이터를 조합하여 표시
      return {
        totalCampaigns: data.totalCampaigns || 12,
        totalDeliveries: data.totalDeliveries || 2847,
        sentCount: data.sentCount || 2651,
        reachedCustomers: data.reachedCustomers || data.sentCount || 2651,
        successRate: data.successRate || 93.1,
        deltaCampaignsPct: data.deltaCampaignsPct || 8.3,
        deltaDeliveriesPct: data.deltaDeliveriesPct || 12.5,
        deltaReachedPct: data.deltaReachedPct || 15.2,
        deltaSuccessRatePct: data.deltaSuccessRatePct || 2.1,
        regionDistribution: data.regionDistribution || [
          { name: '강남구', value: 29 },
          { name: '서초구', value: 23 },
          { name: '마포구', value: 18 },
          { name: '종로구', value: 15 },
          { name: '중구', value: 15 }
        ],
        recentCampaigns: data.recentCampaigns || [
          { id: '1', name: '강남구 할인 이벤트', distanceKm: 2, date: '2024-08-20', count: 1420, status: '진행중' },
          { id: '2', name: '서초구 신규 오픈', distanceKm: 1.5, date: '2024-08-19', count: 856, status: '완료' },
          { id: '3', name: '마포구 시즌 프로모션', distanceKm: 3, date: '2024-08-18', count: 1234, status: '완료' },
          { id: '4', name: '종로구 특별 할인', distanceKm: 2.5, date: '2024-08-17', count: 987, status: '대기' }
        ]
      };
    } catch (error) {
      console.error('대시보드 요약 데이터 조회 실패:', error);
      // Mock 데이터 반환 (백엔드 연결 실패 시)
      return {
        totalCampaigns: 12,
        totalDeliveries: 2847,
        sentCount: 2651,
        reachedCustomers: 2651,
        successRate: 93.1,
        deltaCampaignsPct: 8.3,
        deltaDeliveriesPct: 12.5,
        deltaReachedPct: 15.2,
        deltaSuccessRatePct: 2.1,
        regionDistribution: [
          { name: '강남구', value: 29 },
          { name: '서초구', value: 23 },
          { name: '마포구', value: 18 },
          { name: '종로구', value: 15 },
          { name: '중구', value: 15 }
        ],
        recentCampaigns: [
          { id: '1', name: '강남구 할인 이벤트', distanceKm: 2, date: '2024-08-20', count: 1420, status: '진행중' },
          { id: '2', name: '서초구 신규 오픈', distanceKm: 1.5, date: '2024-08-19', count: 856, status: '완료' },
          { id: '3', name: '마포구 시즌 프로모션', distanceKm: 3, date: '2024-08-18', count: 1234, status: '완료' },
          { id: '4', name: '종로구 특별 할인', distanceKm: 2.5, date: '2024-08-17', count: 987, status: '대기' }
        ]
      };
    }
  }

  // 지역별 분포 데이터 조회
  async getRegionDistribution() {
    try {
      const response = await apiClient.get('/deliveries/region-distribution');
      const data = response.data?.data || response.data;
      // data가 배열인지 확인하고, 아니면 Mock 데이터 반환
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return [
        { name: '강남구', value: 29 },
        { name: '서초구', value: 23 },
        { name: '마포구', value: 18 },
        { name: '종로구', value: 15 },
        { name: '중구', value: 15 }
      ];
    } catch (error) {
      console.error('지역별 분포 데이터 조회 실패:', error);
      // Mock 데이터 반환 (백엔드 연결 실패 시)
      return [
        { name: '강남구', value: 29 },
        { name: '서초구', value: 23 },
        { name: '마포구', value: 18 },
        { name: '종로구', value: 15 },
        { name: '중구', value: 15 }
      ];
    }
  }

  // 실시간 발송 현황 조회 (한국 시간 기준)
  async getRealtimeDeliveryStatus() {
    try {
      const response = await apiClient.get('/deliveries/realtime-status');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('실시간 발송 현황 조회 실패:', error);
      return [];
    }
  }

  // 오늘 시간대별 통계 조회 (한국 시간 기준)
  async getTodayHourlyStats() {
    try {
      const response = await apiClient.get('/deliveries/today-hourly-stats');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('오늘 시간대별 통계 조회 실패:', error);
      return [];
    }
  }

  // 최근 캠페인 목록 조회
  async getRecentCampaigns() {
    try {
      const response = await apiClient.get('/campaigns/recent');
      const data = response.data?.data || response.data;
      // data가 배열인지 확인하고, 아니면 Mock 데이터 반환
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return [
        { id: '1', name: '강남구 할인 이벤트', distanceKm: 2, date: '2024-08-20', count: 1420, status: '진행중' },
        { id: '2', name: '서초구 신규 오픈', distanceKm: 1.5, date: '2024-08-19', count: 856, status: '완료' },
        { id: '3', name: '마포구 시즌 프로모션', distanceKm: 3, date: '2024-08-18', count: 1234, status: '완료' },
        { id: '4', name: '종로구 특별 할인', distanceKm: 2.5, date: '2024-08-17', count: 987, status: '대기' }
      ];
    } catch (error) {
      console.error('최근 캠페인 목록 조회 실패:', error);
      // Mock 데이터 반환 (백엔드 연결 실패 시)
      return [
        { id: '1', name: '강남구 할인 이벤트', distanceKm: 2, date: '2024-08-20', count: 1420, status: '진행중' },
        { id: '2', name: '서초구 신규 오픈', distanceKm: 1.5, date: '2024-08-19', count: 856, status: '완료' },
        { id: '3', name: '마포구 시즌 프로모션', distanceKm: 3, date: '2024-08-18', count: 1234, status: '완료' },
        { id: '4', name: '종로구 특별 할인', distanceKm: 2.5, date: '2024-08-17', count: 987, status: '대기' }
      ];
    }
  }
}

export const apiService = new ApiService();
