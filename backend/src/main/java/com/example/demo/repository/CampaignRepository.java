package com.example.demo.repository;

import com.example.demo.entity.Campaign;
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
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {
    
    /**
     * 회사별 캠페인 조회
     */
    @Query("SELECT c FROM Campaign c WHERE c.company.id = :companyId")
    Page<Campaign> findByCompanyId(@Param("companyId") UUID companyId, Pageable pageable);
    
    /**
     * 회사별 캠페인 수 조회
     */
    @Query("SELECT COUNT(c) FROM Campaign c WHERE c.company.id = :companyId")
    Long countByCompanyId(@Param("companyId") UUID companyId);
    
    /**
     * 이름으로 캠페인 검색
     */
    List<Campaign> findByNameContainingIgnoreCase(String name);
    
    /**
     * 예약된 캠페인 조회 (현재 시간 이후)
     */
    List<Campaign> findByScheduledAtAfterOrderByScheduledAtAsc(LocalDateTime now);
    
    /**
     * 회사별 예약된 캠페인 조회
     */
    @Query("SELECT c FROM Campaign c WHERE c.company.id = :companyId AND c.scheduledAt >= :now ORDER BY c.scheduledAt ASC")
    List<Campaign> findByCompanyIdAndScheduledAtAfterOrderByScheduledAtAsc(@Param("companyId") UUID companyId, @Param("now") LocalDateTime now);
    
    /**
     * 특정 반경 내에서 실행 가능한 캠페인 조회
     */
    @Query(value = "SELECT c.* FROM campaigns c " +
                   "WHERE c.company_id = :companyId " +
                   "AND c.scheduled_at >= :now " +
                   "AND (6371000 * acos(cos(radians(:lat)) * cos(radians(c.lat)) * " +
                   "cos(radians(c.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(c.lat)))) <= c.radius " +
                   "ORDER BY c.scheduled_at ASC", 
           nativeQuery = true)
    List<Campaign> findActiveCampaignsNearLocation(@Param("companyId") UUID companyId,
                                                  @Param("lat") Double lat,
                                                  @Param("lng") Double lng,
                                                  @Param("now") LocalDateTime now);
    
    /**
     * 캠페인 통계 조회
     */
    @Query(value = "SELECT " +
                   "COUNT(*) as total_campaigns, " +
                   "COUNT(CASE WHEN scheduled_at >= :now THEN 1 END) as active_campaigns, " +
                   "COUNT(CASE WHEN scheduled_at < :now THEN 1 END) as completed_campaigns " +
                   "FROM campaigns " +
                   "WHERE company_id = :companyId", 
           nativeQuery = true)
    Object[] getCampaignStats(@Param("companyId") UUID companyId, @Param("now") LocalDateTime now);
}
