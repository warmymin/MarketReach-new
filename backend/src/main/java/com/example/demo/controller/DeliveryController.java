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
    @GetMapping("/stats/summary")
    public ResponseEntity<Map<String, Object>> getDeliverySummary() {
        try {
            Map<String, Object> summary = deliveryService.getDeliverySummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 실시간 발송 통계 조회 (최근 30분)
     */
    @GetMapping("/stats/realtime")
    public ResponseEntity<List<Map<String, Object>>> getRealtimeStats() {
        try {
            List<Map<String, Object>> stats = deliveryService.getRealtimeStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 시간대별 발송 통계 조회
     */
    @GetMapping("/stats/hourly")
    public ResponseEntity<List<Map<String, Object>>> getHourlyStats() {
        try {
            List<Map<String, Object>> stats = deliveryService.getHourlyStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
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
}
