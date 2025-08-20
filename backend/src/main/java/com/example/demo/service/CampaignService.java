package com.example.demo.service;

import com.example.demo.entity.Campaign;
import com.example.demo.repository.CampaignRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
public class CampaignService {

    @Autowired
    private CampaignRepository campaignRepository;

    public Campaign createCampaign(Campaign campaign) {
        return campaignRepository.save(campaign);
    }

    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    public Optional<Campaign> getCampaignById(UUID id) {
        return campaignRepository.findById(id);
    }

    public Page<Campaign> getCampaignsByCompanyId(UUID companyId, Pageable pageable) {
        return campaignRepository.findByCompanyId(companyId, pageable);
    }

    public List<Campaign> searchCampaignsByName(String name) {
        return campaignRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Campaign> getScheduledCampaigns() {
        return campaignRepository.findByScheduledAtAfterOrderByScheduledAtAsc(LocalDateTime.now());
    }

    public List<Campaign> getScheduledCampaignsByCompany(UUID companyId) {
        return campaignRepository.findByCompanyIdAndScheduledAtAfterOrderByScheduledAtAsc(companyId, LocalDateTime.now());
    }

    public List<Campaign> findActiveCampaignsNearLocation(UUID companyId, Double lat, Double lng) {
        return campaignRepository.findActiveCampaignsNearLocation(companyId, lat, lng, LocalDateTime.now());
    }

    public Object[] getCampaignStats(UUID companyId) {
        return campaignRepository.getCampaignStats(companyId, LocalDateTime.now());
    }

    public Campaign updateCampaign(UUID id, Campaign campaignDetails) {
        Optional<Campaign> campaign = campaignRepository.findById(id);
        if (campaign.isPresent()) {
            Campaign existingCampaign = campaign.get();
            existingCampaign.setName(campaignDetails.getName());
            existingCampaign.setMessage(campaignDetails.getMessage());
            existingCampaign.setTargetingLocation(campaignDetails.getTargetingLocation());
            existingCampaign.setScheduledAt(campaignDetails.getScheduledAt());
            return campaignRepository.save(existingCampaign);
        }
        return null;
    }

    public boolean deleteCampaign(UUID id) {
        if (campaignRepository.existsById(id)) {
            campaignRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * 캠페인 타겟팅 미리보기 (반경 내 고객 수 조회)
     */
    public Map<String, Object> previewTargeting(UUID campaignId) {
        Optional<Campaign> campaign = campaignRepository.findById(campaignId);
        if (campaign.isPresent()) {
            Campaign c = campaign.get();
            // TODO: CustomerService를 주입받아서 반경 내 고객 수를 계산
            Map<String, Object> result = new HashMap<>();
            result.put("campaign", c);
            result.put("estimatedCustomers", 0); // 임시 값
            if (c.getTargetingLocation() != null) {
                result.put("radius", c.getTargetingLocation().getRadiusM());
                result.put("center", Map.of("lat", c.getTargetingLocation().getCenterLat(), "lng", c.getTargetingLocation().getCenterLng()));
            }
            return result;
        }
        return null;
    }
}
