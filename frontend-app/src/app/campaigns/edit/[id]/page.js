'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { apiService } from '@/lib/api';

export default function EditCampaignPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [targetingLocations, setTargetingLocations] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    targetingLocationId: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    async function loadCampaignData() {
      try {
        setLoading(true);
        
        const campaign = await apiService.getCampaignById(id);
        if (!campaign) {
          setError('캠페인을 찾을 수 없습니다.');
          return;
        }

        const locations = await apiService.getTargetingLocations();
        setTargetingLocations(locations);

        setFormData({
          name: campaign.name || '',
          message: campaign.message || '',
          targetingLocationId: campaign.targetingLocation?.id || '',
          status: campaign.status || 'DRAFT'
        });

      } catch (err) {
        console.error('캠페인 데이터 로드 실패:', err);
        setError('캠페인 데이터를 불러올 수 없습니다: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadCampaignData();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('캠페인 이름을 입력해주세요.');
      return;
    }
    
    if (!formData.message.trim()) {
      alert('캠페인 메시지를 입력해주세요.');
      return;
    }
    
    if (!formData.targetingLocationId) {
      alert('타겟팅 위치를 선택해주세요.');
      return;
    }

    try {
      setSaving(true);
      
      console.log('수정할 데이터:', formData);
      
      const result = await apiService.updateCampaign(id, formData);
      
      console.log('수정 결과:', result);
      
      if (result.success) {
        alert('캠페인이 성공적으로 수정되었습니다.');
        router.push('/campaigns');
      } else {
        alert('캠페인 수정에 실패했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('캠페인 수정 오류:', error);
      console.error('에러 상세 정보:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('캠페인 수정에 실패했습니다: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">캠페인 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/campaigns')}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            캠페인 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => router.push('/campaigns')}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            뒤로가기
          </button>
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 mb-3">캠페인 편집</h1>
            <p className="text-lg text-gray-600 font-light">캠페인 정보를 수정하세요</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                캠페인 이름 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition-colors text-sm"
                placeholder="예: 여름 할인 이벤트"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                타겟팅 위치 *
              </label>
              <select
                name="targetingLocationId"
                value={formData.targetingLocationId}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition-colors text-sm"
                required
              >
                <option value="">타겟팅 위치를 선택하세요</option>
                {targetingLocations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({(location.radiusM / 1000).toFixed(1)}km 반경)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                캠페인 상태
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition-colors text-sm"
              >
                <option value="DRAFT">초안</option>
                <option value="IN_PROGRESS">진행중</option>
                <option value="COMPLETED">완료</option>
                <option value="FAILED">실패</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                캠페인 메시지 *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 transition-colors resize-none text-sm"
                rows={6}
                placeholder="고객에게 전달할 메시지를 입력하세요..."
                required
              />
              <div className="text-xs text-gray-500">
                메시지 길이: {formData.message.length}자
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => router.push('/campaigns')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
