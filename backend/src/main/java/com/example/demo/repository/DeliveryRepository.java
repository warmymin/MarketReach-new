package com.example.demo.repository;

import com.example.demo.entity.Delivery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, UUID> {
    
    /**
     * 타겟팅별 배송 조회
     */
    List<Delivery> findByTargetingId(UUID targetingId);
    
    /**
     * 캠페인별 배송 조회
     */
    @Query(value = "SELECT d.* FROM deliveries d " +
                   "JOIN targetings t ON d.targeting_id = t.id " +
                   "WHERE t.campaign_id = :campaignId", 
           nativeQuery = true)
    List<Delivery> findByCampaignId(@Param("campaignId") UUID campaignId);
    
    /**
     * 회사별 배송 조회
     */
    @Query(value = "SELECT d.* FROM deliveries d " +
                   "JOIN targetings t ON d.targeting_id = t.id " +
                   "JOIN campaigns c ON t.campaign_id = c.id " +
                   "WHERE c.company_id = :companyId", 
           nativeQuery = true)
    List<Delivery> findByCompanyId(@Param("companyId") UUID companyId);
    
    /**
     * 상태별 배송 조회
     */
    List<Delivery> findByStatus(Delivery.DeliveryStatus status);
    
    /**
     * 특정 기간 내 배송 조회
     */
    List<Delivery> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * 배송 완료된 배송 조회
     */
    List<Delivery> findByDeliveredAtIsNotNull();
    
    /**
     * 배송 실패한 배송 조회
     */
    List<Delivery> findByStatusAndErrorCodeIsNotNull(Delivery.DeliveryStatus status);
    
    /**
     * 캠페인별 배송 통계
     */
    @Query(value = "SELECT " +
                   "COUNT(*) as total_deliveries, " +
                   "COUNT(CASE WHEN d.status = 'SUCCESS' THEN 1 END) as successful_deliveries, " +
                   "COUNT(CASE WHEN d.status = 'FAIL' THEN 1 END) as failed_deliveries, " +
                   "COUNT(CASE WHEN d.status = 'PENDING' THEN 1 END) as pending_deliveries " +
                   "FROM deliveries d " +
                   "JOIN targetings t ON d.targeting_id = t.id " +
                   "WHERE t.campaign_id = :campaignId", 
           nativeQuery = true)
    Object[] getDeliveryStatsByCampaign(@Param("campaignId") UUID campaignId);
    
    /**
     * 회사별 배송 통계
     */
    @Query(value = "SELECT " +
                   "COUNT(*) as total_deliveries, " +
                   "COUNT(CASE WHEN d.status = 'SUCCESS' THEN 1 END) as successful_deliveries, " +
                   "COUNT(CASE WHEN d.status = 'FAIL' THEN 1 END) as failed_deliveries, " +
                   "COUNT(CASE WHEN d.status = 'PENDING' THEN 1 END) as pending_deliveries " +
                   "FROM deliveries d " +
                   "JOIN targetings t ON d.targeting_id = t.id " +
                   "JOIN campaigns c ON t.campaign_id = c.id " +
                   "WHERE c.company_id = :companyId", 
           nativeQuery = true)
    Object[] getDeliveryStatsByCompany(@Param("companyId") UUID companyId);
}
