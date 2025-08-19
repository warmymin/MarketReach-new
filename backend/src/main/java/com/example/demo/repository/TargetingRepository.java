package com.example.demo.repository;

import com.example.demo.entity.Targeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TargetingRepository extends JpaRepository<Targeting, UUID> {
    
    /**
     * 캠페인별 타겟팅 조회
     */
    List<Targeting> findByCampaignId(UUID campaignId);
    
    /**
     * 고객별 타겟팅 조회
     */
    List<Targeting> findByCustomerId(UUID customerId);
    
    /**
     * 확인된 타겟팅 조회
     */
    List<Targeting> findByIsConfirmedTrue();
    
    /**
     * 미확인 타겟팅 조회
     */
    List<Targeting> findByIsConfirmedFalse();
    
    /**
     * 캠페인별 확인된 타겟팅 조회
     */
    List<Targeting> findByCampaignIdAndIsConfirmedTrue(UUID campaignId);
    
    /**
     * 캠페인별 미확인 타겟팅 조회
     */
    List<Targeting> findByCampaignIdAndIsConfirmedFalse(UUID campaignId);
}
