package com.example.demo.controller;

import com.example.demo.entity.Delivery;
import com.example.demo.service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "*")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    /**
     * 배송 생성
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createDelivery(@Valid @RequestBody Delivery delivery) {
        Delivery createdDelivery = deliveryService.createDelivery(delivery);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "배송이 성공적으로 생성되었습니다.");
        response.put("data", createdDelivery);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 모든 배송 조회
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllDeliveries() {
        List<Delivery> deliveries = deliveryService.getAllDeliveries();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", deliveries);
        
        return ResponseEntity.ok(response);
    }

    /**
     * ID로 배송 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDeliveryById(@PathVariable UUID id) {
        Optional<Delivery> delivery = deliveryService.getDeliveryById(id);
        
        Map<String, Object> response = new HashMap<>();
        if (delivery.isPresent()) {
            response.put("success", true);
            response.put("data", delivery.get());
        } else {
            response.put("success", false);
            response.put("message", "배송을 찾을 수 없습니다.");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * 타겟팅별 배송 조회
     */
    @GetMapping("/targeting/{targetingId}")
    public ResponseEntity<Map<String, Object>> getDeliveriesByTargeting(@PathVariable UUID targetingId) {
        List<Delivery> deliveries = deliveryService.getDeliveriesByTargetingId(targetingId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", deliveries);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 캠페인별 배송 조회
     */
    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<Map<String, Object>> getDeliveriesByCampaign(@PathVariable UUID campaignId) {
        List<Delivery> deliveries = deliveryService.getDeliveriesByCampaignId(campaignId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", deliveries);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 회사별 배송 조회
     */
    @GetMapping("/company/{companyId}")
    public ResponseEntity<Map<String, Object>> getDeliveriesByCompany(@PathVariable UUID companyId) {
        List<Delivery> deliveries = deliveryService.getDeliveriesByCompanyId(companyId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", deliveries);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 상태별 배송 조회
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getDeliveriesByStatus(@PathVariable String status) {
        Delivery.DeliveryStatus deliveryStatus;
        try {
            deliveryStatus = Delivery.DeliveryStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "유효하지 않은 상태입니다. (SUCCESS, FAIL, PENDING)");
            return ResponseEntity.badRequest().body(response);
        }
        
        List<Delivery> deliveries = deliveryService.getDeliveriesByStatus(deliveryStatus);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", deliveries);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 기간별 배송 조회
     */
    @GetMapping("/date-range")
    public ResponseEntity<Map<String, Object>> getDeliveriesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<Delivery> deliveries = deliveryService.getDeliveriesByDateRange(startDate, endDate);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", deliveries);
        response.put("dateRange", Map.of("startDate", startDate, "endDate", endDate));
        
        return ResponseEntity.ok(response);
    }

    /**
     * 완료된 배송 조회
     */
    @GetMapping("/completed")
    public ResponseEntity<Map<String, Object>> getCompletedDeliveries() {
        List<Delivery> deliveries = deliveryService.getCompletedDeliveries();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", deliveries);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 실패한 배송 조회
     */
    @GetMapping("/failed")
    public ResponseEntity<Map<String, Object>> getFailedDeliveries() {
        List<Delivery> deliveries = deliveryService.getFailedDeliveries();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", deliveries);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 캠페인별 배송 통계
     */
    @GetMapping("/stats/campaign/{campaignId}")
    public ResponseEntity<Map<String, Object>> getDeliveryStatsByCampaign(@PathVariable UUID campaignId) {
        Object[] stats = deliveryService.getDeliveryStatsByCampaign(campaignId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", Map.of(
            "totalDeliveries", stats[0],
            "successfulDeliveries", stats[1],
            "failedDeliveries", stats[2],
            "pendingDeliveries", stats[3]
        ));
        
        return ResponseEntity.ok(response);
    }

    /**
     * 회사별 배송 통계
     */
    @GetMapping("/stats/company/{companyId}")
    public ResponseEntity<Map<String, Object>> getDeliveryStatsByCompany(@PathVariable UUID companyId) {
        Object[] stats = deliveryService.getDeliveryStatsByCompany(companyId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", Map.of(
            "totalDeliveries", stats[0],
            "successfulDeliveries", stats[1],
            "failedDeliveries", stats[2],
            "pendingDeliveries", stats[3]
        ));
        
        return ResponseEntity.ok(response);
    }

    /**
     * 메시지 전송 시뮬레이션
     */
    @PostMapping("/simulate/{targetingId}")
    public ResponseEntity<Map<String, Object>> simulateMessageDelivery(@PathVariable UUID targetingId) {
        Delivery delivery = deliveryService.simulateMessageDelivery(targetingId);
        
        Map<String, Object> response = new HashMap<>();
        if (delivery != null) {
            response.put("success", true);
            response.put("message", "메시지 전송 시뮬레이션이 완료되었습니다.");
            response.put("data", delivery);
        } else {
            response.put("success", false);
            response.put("message", "타겟팅을 찾을 수 없습니다.");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * 캠페인 전체 메시지 전송 시뮬레이션
     */
    @PostMapping("/simulate/campaign/{campaignId}")
    public ResponseEntity<Map<String, Object>> simulateCampaignDelivery(@PathVariable UUID campaignId) {
        List<Delivery> deliveries = deliveryService.simulateCampaignDelivery(campaignId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "캠페인 메시지 전송 시뮬레이션이 완료되었습니다.");
        response.put("data", deliveries);
        response.put("totalDeliveries", deliveries.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 배송 정보 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateDelivery(
            @PathVariable UUID id,
            @Valid @RequestBody Delivery deliveryDetails) {
        
        Delivery updatedDelivery = deliveryService.updateDelivery(id, deliveryDetails);
        
        Map<String, Object> response = new HashMap<>();
        if (updatedDelivery != null) {
            response.put("success", true);
            response.put("message", "배송 정보가 성공적으로 수정되었습니다.");
            response.put("data", updatedDelivery);
        } else {
            response.put("success", false);
            response.put("message", "배송을 찾을 수 없습니다.");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * 배송 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteDelivery(@PathVariable UUID id) {
        boolean deleted = deliveryService.deleteDelivery(id);
        
        Map<String, Object> response = new HashMap<>();
        if (deleted) {
            response.put("success", true);
            response.put("message", "배송이 성공적으로 삭제되었습니다.");
        } else {
            response.put("success", false);
            response.put("message", "배송을 찾을 수 없습니다.");
        }
        
        return ResponseEntity.ok(response);
    }
}
