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
      return response.data;
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
      const [companies, customers, campaigns, targetingLocations, deliveries] = await Promise.all([
        this.getCompanies(),
        this.getCustomers(),
        this.getCampaigns(),
        this.getTargetingLocations(),
        this.getDeliveries(),
      ]);

      return {
        companies: companies.length,
        customers: customers.length,
        campaigns: campaigns.length,
        targetingLocations: targetingLocations.length,
        deliveries: deliveries.length,
        successRate: deliveries.length > 0
          ? (deliveries.filter(d => d.status === 'SUCCESS').length / deliveries.length * 100).toFixed(1)
          : 0,
      };
    } catch (error) {
      console.error('통계 데이터 조회 실패:', error);
      return {
        companies: 0,
        customers: 0,
        campaigns: 0,
        targetingLocations: 0,
        deliveries: 0,
        successRate: 0,
      };
    }
  }
}

export const apiService = new ApiService();
