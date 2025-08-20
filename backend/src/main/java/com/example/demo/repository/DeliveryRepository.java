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
     * 위치 기반 타겟팅별 배송 조회
     */
    List<Delivery> findByTargetingLocationId(UUID targetingLocationId);
    
    /**
     * 회사별 배송 조회
     */
    @Query(value = "SELECT d.* FROM deliveries d " +
                   "JOIN targeting_locations tl ON d.targeting_location_id = tl.id " +
                   "WHERE tl.company_id = :companyId", 
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
}
