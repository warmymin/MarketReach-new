package com.example.demo.controller;

import com.example.demo.entity.Delivery;
import com.example.demo.entity.Delivery.DeliveryStatus;
import com.example.demo.service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "*")
public class DeliveryController {
    
    @Autowired
    private DeliveryService deliveryService;
    
    /**
     * 캠페인 발송 시뮬레이션
     */
    @PostMapping("/simulate/{campaignId}")
    public ResponseEntity<Map<String, Object>> simulateCampaignDelivery(@PathVariable UUID campaignId) {
        try {
            Map<String, Object> result = deliveryService.simulateCampaignDelivery(campaignId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 발송 통계 요약 조회
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getDeliverySummary() {
        try {
            Map<String, Object> summary = deliveryService.getDeliverySummary();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", summary
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "발송 통계 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 최근 발송 내역 조회
     */
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentDeliveries() {
        try {
            List<Delivery> recentDeliveries = deliveryService.getRecentDeliveries();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", recentDeliveries
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "최근 발송 내역 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 실시간 발송 통계 조회
     */
    @GetMapping("/realtime-stats")
    public ResponseEntity<?> getRealtimeStats() {
        try {
            List<Map<String, Object>> stats = deliveryService.getRealtimeStats();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "실시간 통계 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 시간대별 발송 통계 조회
     */
    @GetMapping("/hourly-stats")
    public ResponseEntity<?> getHourlyStats() {
        try {
            List<Map<String, Object>> stats = deliveryService.getHourlyStats();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "시간대별 통계 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 캠페인별 발송 목록 조회
     */
    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<List<Delivery>> getDeliveriesByCampaign(@PathVariable UUID campaignId) {
        try {
            List<Delivery> deliveries = deliveryService.getDeliveriesByCampaign(campaignId);
            return ResponseEntity.ok(deliveries);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 상태별 발송 목록 조회
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Delivery>> getDeliveriesByStatus(@PathVariable String status) {
        try {
            DeliveryStatus deliveryStatus = DeliveryStatus.valueOf(status.toUpperCase());
            List<Delivery> deliveries = deliveryService.getDeliveriesByStatus(deliveryStatus);
            return ResponseEntity.ok(deliveries);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 모든 발송 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<Delivery>> getAllDeliveries() {
        try {
            List<Delivery> deliveries = deliveryService.getDeliveriesByStatus(DeliveryStatus.SENT);
            return ResponseEntity.ok(deliveries);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 발송 통계 요약 조회 (대시보드용)
     */
    @GetMapping("/stats/summary")
    public ResponseEntity<?> getDeliveryStatsSummary() {
        try {
            Map<String, Object> summary = deliveryService.getDeliverySummary();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", summary
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "발송 통계 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 실시간 발송 통계 조회 (대시보드용)
     */
    @GetMapping("/stats/realtime")
    public ResponseEntity<?> getDeliveryStatsRealtime() {
        try {
            List<Map<String, Object>> stats = deliveryService.getRealtimeStats();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "실시간 통계 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 시간대별 발송 통계 조회 (대시보드용)
     */
    @GetMapping("/stats/hourly")
    public ResponseEntity<?> getDeliveryStatsHourly() {
        try {
            List<Map<String, Object>> stats = deliveryService.getHourlyStats();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "시간대별 통계 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 타겟팅 위치별 발송 통계 조회
     */
    @GetMapping("/stats/by-targeting/{targetingId}")
    public ResponseEntity<?> getDeliveryStatsByTargeting(@PathVariable UUID targetingId) {
        try {
            Map<String, Object> stats = deliveryService.getDeliveryStatsByTargeting(targetingId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "타겟팅별 발송 통계 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 지역별 분포 통계 조회
     */
    @GetMapping("/region-distribution")
    public ResponseEntity<?> getRegionDistribution() {
        try {
            List<Map<String, Object>> distribution = deliveryService.getRegionDistribution();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", distribution
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "지역별 분포 통계 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    /**
     * 발송 상태 업데이트
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            DeliveryStatus deliveryStatus = DeliveryStatus.valueOf(status.toUpperCase());
            
            Delivery updated = deliveryService.updateDeliveryStatus(id, deliveryStatus);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "발송 상태 업데이트 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
}
