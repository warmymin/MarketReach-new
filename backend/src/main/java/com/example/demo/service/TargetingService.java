package com.example.demo.service;

import com.example.demo.entity.Targeting;
import com.example.demo.entity.Campaign;
import com.example.demo.entity.Customer;
import com.example.demo.repository.TargetingRepository;
import com.example.demo.repository.CampaignRepository;
import com.example.demo.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class TargetingService {

    @Autowired
    private TargetingRepository targetingRepository;
    
    @Autowired
    private CampaignRepository campaignRepository;
    
    @Autowired
    private CustomerRepository customerRepository;

    public Targeting createTargeting(Targeting targeting) {
        return targetingRepository.save(targeting);
    }

    public List<Targeting> getAllTargetings() {
        return targetingRepository.findAll();
    }

    public Optional<Targeting> getTargetingById(UUID id) {
        return targetingRepository.findById(id);
    }

    public List<Targeting> getTargetingsByCampaignId(UUID campaignId) {
        return targetingRepository.findByCampaignId(campaignId);
    }

    public List<Targeting> getTargetingsByCustomerId(UUID customerId) {
        return targetingRepository.findByCustomerId(customerId);
    }

    public List<Targeting> getConfirmedTargetings() {
        return targetingRepository.findByIsConfirmedTrue();
    }

    public List<Targeting> getUnconfirmedTargetings() {
        return targetingRepository.findByIsConfirmedFalse();
    }

    public List<Targeting> getConfirmedTargetingsByCampaign(UUID campaignId) {
        return targetingRepository.findByCampaignIdAndIsConfirmedTrue(campaignId);
    }

    public List<Targeting> getUnconfirmedTargetingsByCampaign(UUID campaignId) {
        return targetingRepository.findByCampaignIdAndIsConfirmedFalse(campaignId);
    }

    public Targeting updateTargeting(UUID id, Targeting targetingDetails) {
        Optional<Targeting> targeting = targetingRepository.findById(id);
        if (targeting.isPresent()) {
            Targeting existingTargeting = targeting.get();
            existingTargeting.setIsConfirmed(targetingDetails.getIsConfirmed());
            return targetingRepository.save(existingTargeting);
        }
        return null;
    }

    public boolean deleteTargeting(UUID id) {
        if (targetingRepository.existsById(id)) {
            targetingRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * 캠페인 타겟팅 미리보기 (반경 내 고객 찾기)
     */
    public List<Object[]> previewTargeting(UUID campaignId) {
        Optional<Campaign> campaign = campaignRepository.findById(campaignId);
        if (campaign.isPresent()) {
            Campaign c = campaign.get();
            return customerRepository.findCustomersWithinRadius(
                c.getLat(), c.getLng(), c.getRadius(), c.getCompany().getId()
            );
        }
        return new ArrayList<>();
    }

    /**
     * 캠페인 타겟팅 생성 (반경 내 고객들을 타겟팅으로 등록)
     */
    public List<Targeting> createTargetingsFromCampaign(UUID campaignId) {
        Optional<Campaign> campaign = campaignRepository.findById(campaignId);
        if (campaign.isPresent()) {
            Campaign c = campaign.get();
            List<Object[]> customersInRadius = customerRepository.findCustomersWithinRadius(
                c.getLat(), c.getLng(), c.getRadius(), c.getCompany().getId()
            );
            
            List<Targeting> targetings = new ArrayList<>();
            for (Object[] result : customersInRadius) {
                UUID customerId = (UUID) result[0];
                Optional<Customer> customer = customerRepository.findById(customerId);
                
                if (customer.isPresent()) {
                    Targeting targeting = new Targeting();
                    targeting.setCampaign(c);
                    targeting.setCustomer(customer.get());
                    targeting.setIsConfirmed(false);
                    targetings.add(targetingRepository.save(targeting));
                }
            }
            
            return targetings;
        }
        return new ArrayList<>();
    }

    /**
     * 타겟팅 확인
     */
    public Targeting confirmTargeting(UUID targetingId) {
        Optional<Targeting> targeting = targetingRepository.findById(targetingId);
        if (targeting.isPresent()) {
            Targeting existingTargeting = targeting.get();
            existingTargeting.setIsConfirmed(true);
            return targetingRepository.save(existingTargeting);
        }
        return null;
    }

    /**
     * 캠페인 전체 타겟팅 확인
     */
    public List<Targeting> confirmAllTargetingsByCampaign(UUID campaignId) {
        List<Targeting> unconfirmedTargetings = targetingRepository.findByCampaignIdAndIsConfirmedFalse(campaignId);
        List<Targeting> confirmedTargetings = new ArrayList<>();
        
        for (Targeting targeting : unconfirmedTargetings) {
            targeting.setIsConfirmed(true);
            confirmedTargetings.add(targetingRepository.save(targeting));
        }
        
        return confirmedTargetings;
    }

    /**
     * 타겟팅 통계
     */
    public Object[] getTargetingStatsByCampaign(UUID campaignId) {
        List<Targeting> allTargetings = targetingRepository.findByCampaignId(campaignId);
        List<Targeting> confirmedTargetings = targetingRepository.findByCampaignIdAndIsConfirmedTrue(campaignId);
        List<Targeting> unconfirmedTargetings = targetingRepository.findByCampaignIdAndIsConfirmedFalse(campaignId);
        
        return new Object[]{
            allTargetings.size(),
            confirmedTargetings.size(),
            unconfirmedTargetings.size()
        };
    }

    /**
     * 회사별 타겟팅 통계
     */
    public Object[] getTargetingStatsByCompany(UUID companyId) {
        // 회사에 속한 모든 캠페인의 타겟팅 통계를 집계
        List<Campaign> campaigns = campaignRepository.findByCompanyId(companyId, null).getContent();
        
        int totalTargetings = 0;
        int totalConfirmed = 0;
        int totalUnconfirmed = 0;
        
        for (Campaign campaign : campaigns) {
            List<Targeting> targetings = targetingRepository.findByCampaignId(campaign.getId());
            List<Targeting> confirmed = targetingRepository.findByCampaignIdAndIsConfirmedTrue(campaign.getId());
            
            totalTargetings += targetings.size();
            totalConfirmed += confirmed.size();
        }
        
        totalUnconfirmed = totalTargetings - totalConfirmed;
        
        return new Object[]{
            totalTargetings,
            totalConfirmed,
            totalUnconfirmed
        };
    }
}
