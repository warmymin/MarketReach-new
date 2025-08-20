'use client';

import { useState, useEffect } from 'react';
import { Target, MessageSquare, Calendar, Users, Save, ArrowLeft, Clock } from 'lucide-react';
import { apiService } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewCampaignPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    targetingLocationId: ''
  });

  const [targetingLocations, setTargetingLocations] = useState([]);
  const [selectedTargeting, setSelectedTargeting] = useState(null);
  const [estimatedReach, setEstimatedReach] = useState('선택 필요');
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // 타겟팅 목록 로드
  useEffect(() => {
    async function loadTargetingLocations() {
      try {
        const data = await apiService.getTargetingLocations();
        setTargetingLocations(data);
      } catch (error) {
        console.error('타겟팅 목록 로드 오류:', error);
        alert('타겟팅 목록을 불러올 수 없습니다.');
      }
    }
    loadTargetingLocations();
  }, []);

  // 타겟팅 선택 시 예상 도달 고객 수 계산
  useEffect(() => {
    if (formData.targetingLocationId) {
      calculateEstimatedReach();
    }
  }, [formData.targetingLocationId]);

  // 예상 도달 고객 수 계산
  const calculateEstimatedReach = async () => {
    try {
      setIsCalculating(true);
      setEstimatedReach('계산 중...');
      
      const targeting = targetingLocations.find(t => t.id === formData.targetingLocationId);
      if (!targeting) {
        setEstimatedReach('타겟팅 정보 없음');
        return;
      }

      setSelectedTargeting(targeting);

      const result = await apiService.getNearbyCustomers(
        targeting.centerLat,
        targeting.centerLng,
        targeting.radiusM / 1000
      );

      console.log('캠페인 예상 도달 고객 수 결과:', result);

      if (result && result.success) {
        // 응답 구조에 따라 처리
        if (result.count !== undefined) {
          // count가 최상위에 있는 경우 (현재 API 응답 구조)
          setEstimatedReach(`${result.count}명`);
        } else if (result.data && typeof result.data === 'object' && result.data.count !== undefined) {
          // data가 객체이고 count가 포함된 경우
          setEstimatedReach(`${result.data.count}명`);
        } else if (typeof result.data === 'number') {
          // data가 숫자인 경우
          setEstimatedReach(`${result.data}명`);
        } else if (Array.isArray(result.data)) {
          // data가 배열인 경우
          setEstimatedReach(`${result.data.length}명`);
        } else {
          setEstimatedReach('0명');
        }
      } else {
        setEstimatedReach('0명');
      }
    } catch (error) {
      console.error('예상 도달 고객 수 계산 오류:', error);
      setEstimatedReach('계산 실패');
    } finally {
      setIsCalculating(false);
    }
  };

  // 캠페인 생성
  const handleCreateCampaign = async () => {
    if (!formData.name.trim()) {
      alert('캠페인 이름을 입력해주세요.');
      return;
    }
    if (!formData.message.trim()) {
      alert('마케팅 메시지를 입력해주세요.');
      return;
    }
    if (!formData.targetingLocationId) {
      alert('타겟팅을 선택해주세요.');
      return;
    }


    try {
      setIsLoading(true);
      
      const campaignData = {
        name: formData.name,
        message: formData.message,
        targetingLocationId: formData.targetingLocationId
      };

      console.log('캠페인 생성 데이터:', campaignData);

      const result = await apiService.createCampaign(campaignData);

      if (result && result.success) {
        alert('캠페인이 성공적으로 생성되었습니다!');
        router.push('/campaigns');
      } else {
        alert('캠페인 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('캠페인 생성 오류:', error);
      alert('캠페인 생성에 실패했습니다: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // 임시저장
  const handleSaveDraft = () => {
    // 로컬 스토리지에 임시저장
    localStorage.setItem('campaignDraft', JSON.stringify(formData));
    alert('임시저장되었습니다.');
  };

  // 임시저장된 데이터 불러오기
  const loadDraft = () => {
    const draft = localStorage.getItem('campaignDraft');
    if (draft) {
      const draftData = JSON.parse(draft);
      setFormData(draftData);
      alert('임시저장된 데이터를 불러왔습니다.');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/campaigns" className="btn btn-secondary">
            <ArrowLeft size={16} />
            뒤로가기
          </Link>
          <div>
            <h1 className="page-title">🚀 새 캠페인 생성</h1>
            <p className="page-subtitle">위치 기반 마케팅 캠페인을 생성하세요</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 캠페인 설정 폼 */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <MessageSquare size={20} />
              캠페인 설정
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div className="form-group">
              <label className="form-label">캠페인 이름 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 여름 할인 이벤트"
                className="input"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">마케팅 메시지 *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="🔥 전 메뉴 20% 할인 이벤트! 지금 바로 방문하세요!"
                className="input"
                rows="4"
                maxLength={1000}
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.message.length}/1000자
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">타겟팅 선택 *</label>
              <select
                value={formData.targetingLocationId}
                onChange={(e) => setFormData({ ...formData, targetingLocationId: e.target.value })}
                className="input"
              >
                <option value="">타겟팅을 선택하세요</option>
                {targetingLocations.map((targeting) => (
                  <option key={targeting.id} value={targeting.id}>
                    {targeting.name} ({targeting.radiusM / 1000}km 반경)
                  </option>
                ))}
              </select>
            </div>



            <div className="flex gap-2">
              <button
                onClick={handleCreateCampaign}
                disabled={isLoading || !formData.name || !formData.message || !formData.targetingLocationId}
                className="btn btn-primary flex-1"
              >
                <Save size={16} />
                {isLoading ? '생성 중...' : '캠페인 생성'}
              </button>
              <button
                onClick={handleSaveDraft}
                className="btn btn-secondary"
              >
                임시저장
              </button>
            </div>

            <button
              onClick={loadDraft}
              className="btn btn-outline w-full"
            >
              임시저장 불러오기
            </button>
          </div>
        </div>

        {/* 타겟팅 미리보기 */}
        <div className="space-y-6">
          {/* 타겟팅 정보 */}
          {selectedTargeting && (
            <div className="card">
              <div className="card-header">
                            <h2 className="card-title">
              🎯 선택된 타겟팅
            </h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">타겟팅 이름:</span>
                    <div className="font-medium">{selectedTargeting.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">위치:</span>
                    <div className="font-mono text-sm">
                      {selectedTargeting.centerLat.toFixed(6)}, {selectedTargeting.centerLng.toFixed(6)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">반경:</span>
                    <div className="font-medium">{(selectedTargeting.radiusM / 1000).toFixed(1)}km</div>
                  </div>
                  {selectedTargeting.memo && (
                    <div>
                      <span className="text-gray-600">메모:</span>
                      <div className="text-sm">{selectedTargeting.memo}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 예상 도달 고객 수 */}
          <div className="card">
            <div className="card-header">
                          <h2 className="card-title">
              👥 예상 도달 고객 수
            </h2>
            </div>
            <div className="card-body">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {isCalculating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    estimatedReach
                  )}
                </div>
                <p className="text-gray-600">
                  {selectedTargeting ? `${selectedTargeting.name} 기준` : '타겟팅을 선택하세요'}
                </p>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
