import axios from 'axios';

const API_BASE_URL = 'http://localhost:8083/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 서비스 클래스
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

  // 캠페인 관련 API
  async getCampaigns() {
    try {
      const response = await apiClient.get('/campaigns');
      return response.data.data || [];
    } catch (error) {
      console.error('캠페인 목록 조회 실패:', error);
      return [];
    }
  }

  async createCampaign(campaign) {
    try {
      const response = await apiClient.post('/campaigns', campaign);
      return response.data.data;
    } catch (error) {
      console.error('캠페인 생성 실패:', error);
      return null;
    }
  }

  async updateCampaign(id, campaign) {
    try {
      const response = await apiClient.put(`/campaigns/${id}`, campaign);
      return response.data.data;
    } catch (error) {
      console.error('캠페인 수정 실패:', error);
      return null;
    }
  }

  async deleteCampaign(id) {
    try {
      await apiClient.delete(`/campaigns/${id}`);
      return true;
    } catch (error) {
      console.error('캠페인 삭제 실패:', error);
      return false;
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

  async createTargetingLocation(targetingLocation) {
    try {
      console.log('API 호출 - 타겟팅 위치 생성:', targetingLocation);
      
      // fetch를 사용하여 직접 요청
      const response = await fetch('http://localhost:8083/api/targeting-locations', {
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
