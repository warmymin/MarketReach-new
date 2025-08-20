package com.example.demo.repository;

import com.example.demo.entity.Delivery;
import com.example.demo.entity.Delivery.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, UUID> {
    
    // 캠페인별 발송 목록 조회
    List<Delivery> findByTargetingLocationIdOrderByCreatedAtDesc(UUID targetingLocationId);
    
    // 상태별 발송 목록 조회
    List<Delivery> findByStatusOrderByCreatedAtDesc(DeliveryStatus status);
    
    // 특정 시간 범위 내 발송 목록 조회
    @Query("SELECT d FROM Delivery d WHERE d.createdAt BETWEEN :startTime AND :endTime ORDER BY d.createdAt DESC")
    List<Delivery> findByCreatedAtBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
    
    // 상태별 발송 건수 조회
    long countByStatus(DeliveryStatus status);
    
    // 캠페인별 상태별 발송 건수 조회
    long countByTargetingLocationIdAndStatus(UUID targetingLocationId, DeliveryStatus status);
    
    // 오늘 발송된 건수 조회
    @Query("SELECT COUNT(d) FROM Delivery d WHERE DATE(d.createdAt) = CURRENT_DATE")
    long countTodayDeliveries();
    
    // 시간대별 발송 건수 조회 (오늘)
    @Query("SELECT HOUR(d.createdAt) as hour, COUNT(d) as count FROM Delivery d " +
           "WHERE DATE(d.createdAt) = CURRENT_DATE " +
           "GROUP BY HOUR(d.createdAt) ORDER BY hour")
    List<Object[]> getHourlyDeliveryStats();
    
    // 최근 30분간 5분 단위 발송 통계
    @Query("SELECT " +
           "FLOOR(MINUTE(d.createdAt) / 5) * 5 as timeSlot, " +
           "d.status, " +
           "COUNT(d) as count " +
           "FROM Delivery d " +
           "WHERE d.createdAt >= :startTime " +
           "GROUP BY FLOOR(MINUTE(d.createdAt) / 5) * 5, d.status " +
           "ORDER BY timeSlot, d.status")
    List<Object[]> getRealtimeDeliveryStats(@Param("startTime") LocalDateTime startTime);
}
