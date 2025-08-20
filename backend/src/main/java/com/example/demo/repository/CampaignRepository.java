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
    

}
