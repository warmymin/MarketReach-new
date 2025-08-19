package com.example.demo.controller;

import com.example.demo.entity.Targeting;
import com.example.demo.service.TargetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/targetings")
@CrossOrigin(origins = "*")
public class TargetingController {

    @Autowired
    private TargetingService targetingService;

    /**
     * 타겟팅 생성
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTargeting(@Valid @RequestBody Targeting targeting) {
        Targeting createdTargeting = targetingService.createTargeting(targeting);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "타겟팅이 성공적으로 생성되었습니다.");
        response.put("data", createdTargeting);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 모든 타겟팅 조회
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTargetings() {
        List<Targeting> targetings = targetingService.getAllTargetings();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", targetings);
        
        return ResponseEntity.ok(response);
    }

    /**
     * ID로 타겟팅 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTargetingById(@PathVariable UUID id) {
        Optional<Targeting> targeting = targetingService.getTargetingById(id);
        
        Map<String, Object> response = new HashMap<>();
        if (targeting.isPresent()) {
            response.put("success", true);
            response.put("data", targeting.get());
        } else {
            response.put("success", false);
            response.put("message", "타겟팅을 찾을 수 없습니다.");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * 캠페인별 타겟팅 조회
     */
    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<Map<String, Object>> getTargetingsByCampaign(@PathVariable UUID campaignId) {
        List<Targeting> targetings = targetingService.getTargetingsByCampaignId(campaignId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", targetings);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 고객별 타겟팅 조회
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<Map<String, Object>> getTargetingsByCustomer(@PathVariable UUID customerId) {
        List<Targeting> targetings = targetingService.getTargetingsByCustomerId(customerId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", targetings);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 확인된 타겟팅 조회
     */
    @GetMapping("/confirmed")
    public ResponseEntity<Map<String, Object>> getConfirmedTargetings() {
        List<Targeting> targetings = targetingService.getConfirmedTargetings();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", targetings);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 미확인 타겟팅 조회
     */
    @GetMapping("/unconfirmed")
    public ResponseEntity<Map<String, Object>> getUnconfirmedTargetings() {
        List<Targeting> targetings = targetingService.getUnconfirmedTargetings();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", targetings);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 캠페인별 확인된 타겟팅 조회
     */
    @GetMapping("/campaign/{campaignId}/confirmed")
    public ResponseEntity<Map<String, Object>> getConfirmedTargetingsByCampaign(@PathVariable UUID campaignId) {
        List<Targeting> targetings = targetingService.getConfirmedTargetingsByCampaign(campaignId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", targetings);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 캠페인별 미확인 타겟팅 조회
     */
    @GetMapping("/campaign/{campaignId}/unconfirmed")
    public ResponseEntity<Map<String, Object>> getUnconfirmedTargetingsByCampaign(@PathVariable UUID campaignId) {
        List<Targeting> targetings = targetingService.getUnconfirmedTargetingsByCampaign(campaignId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", targetings);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 캠페인 타겟팅 미리보기 (반경 내 고객 찾기)
     */
    @GetMapping("/preview/{campaignId}")
    public ResponseEntity<Map<String, Object>> previewTargeting(@PathVariable UUID campaignId) {
        List<Object[]> customersInRadius = targetingService.previewTargeting(campaignId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", customersInRadius);
        response.put("totalCustomers", customersInRadius.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 캠페인 타겟팅 생성 (반경 내 고객들을 타겟팅으로 등록)
     */
    @PostMapping("/create-from-campaign/{campaignId}")
    public ResponseEntity<Map<String, Object>> createTargetingsFromCampaign(@PathVariable UUID campaignId) {
        List<Targeting> targetings = targetingService.createTargetingsFromCampaign(campaignId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "캠페인 타겟팅이 성공적으로 생성되었습니다.");
        response.put("data", targetings);
        response.put("totalTargetings", targetings.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 타겟팅 확인
     */
    @PutMapping("/{id}/confirm")
    public ResponseEntity<Map<String, Object>> confirmTargeting(@PathVariable UUID id) {
        Targeting targeting = targetingService.confirmTargeting(id);
        
        Map<String, Object> response = new HashMap<>();
        if (targeting != null) {
            response.put("success", true);
            response.put("message", "타겟팅이 성공적으로 확인되었습니다.");
            response.put("data", targeting);
        } else {
            response.put("success", false);
            response.put("message", "타겟팅을 찾을 수 없습니다.");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * 캠페인 전체 타겟팅 확인
     */
    @PutMapping("/campaign/{campaignId}/confirm-all")
    public ResponseEntity<Map<String, Object>> confirmAllTargetingsByCampaign(@PathVariable UUID campaignId) {
        List<Targeting> targetings = targetingService.confirmAllTargetingsByCampaign(campaignId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "캠페인 전체 타겟팅이 성공적으로 확인되었습니다.");
        response.put("data", targetings);
        response.put("totalConfirmed", targetings.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 캠페인별 타겟팅 통계
     */
    @GetMapping("/stats/campaign/{campaignId}")
    public ResponseEntity<Map<String, Object>> getTargetingStatsByCampaign(@PathVariable UUID campaignId) {
        Object[] stats = targetingService.getTargetingStatsByCampaign(campaignId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", Map.of(
            "totalTargetings", stats[0],
            "confirmedTargetings", stats[1],
            "unconfirmedTargetings", stats[2]
        ));
        
        return ResponseEntity.ok(response);
    }

    /**
     * 회사별 타겟팅 통계
     */
    @GetMapping("/stats/company/{companyId}")
    public ResponseEntity<Map<String, Object>> getTargetingStatsByCompany(@PathVariable UUID companyId) {
        Object[] stats = targetingService.getTargetingStatsByCompany(companyId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", Map.of(
            "totalTargetings", stats[0],
            "confirmedTargetings", stats[1],
            "unconfirmedTargetings", stats[2]
        ));
        
        return ResponseEntity.ok(response);
    }

    /**
     * 타겟팅 정보 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTargeting(
            @PathVariable UUID id,
            @Valid @RequestBody Targeting targetingDetails) {
        
        Targeting updatedTargeting = targetingService.updateTargeting(id, targetingDetails);
        
        Map<String, Object> response = new HashMap<>();
        if (updatedTargeting != null) {
            response.put("success", true);
            response.put("message", "타겟팅 정보가 성공적으로 수정되었습니다.");
            response.put("data", updatedTargeting);
        } else {
            response.put("success", false);
            response.put("message", "타겟팅을 찾을 수 없습니다.");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * 타겟팅 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTargeting(@PathVariable UUID id) {
        boolean deleted = targetingService.deleteTargeting(id);
        
        Map<String, Object> response = new HashMap<>();
        if (deleted) {
            response.put("success", true);
            response.put("message", "타겟팅이 성공적으로 삭제되었습니다.");
        } else {
            response.put("success", false);
            response.put("message", "타겟팅을 찾을 수 없습니다.");
        }
        
        return ResponseEntity.ok(response);
    }
}
