package com.example.demo.controller;

import com.example.demo.entity.Campaign;
import com.example.demo.entity.Company;
import com.example.demo.entity.TargetingLocation;
import com.example.demo.service.CampaignService;
import com.example.demo.service.CompanyService;
import com.example.demo.service.TargetingLocationService;
import com.example.demo.service.DeliveryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.time.LocalDateTime;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = "*")
public class CampaignController {

    @Autowired
    private CampaignService campaignService;
    
    @Autowired
    private CompanyService companyService;
    
    @Autowired
    private TargetingLocationService targetingLocationService;
    
    @Autowired
    private DeliveryService deliveryService;

    // 1) 캠페인 생성
    @PostMapping
    public ResponseEntity<?> createCampaign(@RequestBody Map<String, Object> requestData) {
        try {
            System.out.println("=== 캠페인 생성 요청 시작 ===");
            System.out.println("받은 데이터: " + requestData);
            
            // Map에서 Campaign 객체 생성
            Campaign campaign = new Campaign();
            campaign.setName((String) requestData.get("name"));
            campaign.setMessage((String) requestData.get("message"));
            campaign.setStatus("DRAFT"); // 기본 상태
            
            // Company 설정 (첫 번째 회사 사용)
            Company defaultCompany = new Company();
            defaultCompany.setId(UUID.fromString("55006cf8-2322-4901-b76c-e7f2fd83ed94"));
            campaign.setCompany(defaultCompany);
            
            // TargetingLocation 설정
            if (requestData.get("targetingLocationId") != null) {
                UUID targetingId = UUID.fromString((String) requestData.get("targetingLocationId"));
                Optional<TargetingLocation> targetingLocation = targetingLocationService.getTargetingLocationById(targetingId);
                if (targetingLocation.isPresent()) {
                    campaign.setTargetingLocation(targetingLocation.get());
                } else {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "타겟팅 위치를 찾을 수 없습니다.");
                    return ResponseEntity.badRequest().body(response);
                }
            }
            
            Campaign created = campaignService.createCampaign(campaign);
            return ResponseEntity.status(CREATED).body(Map.of(
                    "success", true,
                    "message", "캠페인이 성공적으로 생성되었습니다.",
                    "data", created
            ));
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(BAD_REQUEST,
                    "데이터 무결성 오류: " + e.getMostSpecificCause().getMessage());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "캠페인 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 2) 전체 조회
    @GetMapping
    public ResponseEntity<?> getAllCampaigns() {
        return ResponseEntity.ok(Map.of("success", true, "data", campaignService.getAllCampaigns()));
    }

    // 3) 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<?> getCampaignById(@PathVariable UUID id) {
        Campaign c = campaignService.getCampaignById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "캠페인을 찾을 수 없습니다."));
        return ResponseEntity.ok(Map.of("success", true, "data", c));
    }

    // 4) 회사별 페이지 조회
    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getCampaignsByCompany(
            @PathVariable UUID companyId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {

        companyService.getCompanyById(companyId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "회사를 찾을 수 없습니다."));

        Page<Campaign> p = campaignService.getCampaignsByCompanyId(companyId, PageRequest.of(page, size));
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", p.getContent(),
                "totalElements", p.getTotalElements(),
                "totalPages", p.getTotalPages(),
                "currentPage", p.getNumber()
        ));
    }

    // 5) 이름 검색
    @GetMapping("/search/name")
    public ResponseEntity<?> searchCampaignsByName(@RequestParam String name) {
        return ResponseEntity.ok(Map.of("success", true, "data", campaignService.searchCampaignsByName(name)));
    }



    // 9) 타겟 미리보기
    @GetMapping("/{id}/preview-targeting")
    public ResponseEntity<?> previewTargeting(@PathVariable UUID id) {
        Map<String, Object> preview = campaignService.previewTargeting(id);
        if (preview == null) throw new ResponseStatusException(NOT_FOUND, "캠페인을 찾을 수 없습니다.");
        return ResponseEntity.ok(Map.of("success", true, "data", preview));
    }

    // 10) 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCampaign(@PathVariable UUID id,
                                            @RequestBody Campaign campaign) {
        try {
            Campaign updated = campaignService.updateCampaign(id, campaign);
            if (updated == null) throw new ResponseStatusException(NOT_FOUND, "캠페인을 찾을 수 없습니다.");
            return ResponseEntity.ok(Map.of("success", true, "message", "캠페인 정보가 성공적으로 수정되었습니다.", "data", updated));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(BAD_REQUEST, e.getMessage());
        }
    }

    // 11) 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCampaign(@PathVariable UUID id) {
        boolean deleted = campaignService.deleteCampaign(id);
        if (!deleted) throw new ResponseStatusException(NOT_FOUND, "캠페인을 찾을 수 없습니다.");
        return ResponseEntity.ok(Map.of("success", true, "message", "캠페인이 성공적으로 삭제되었습니다."));
    }
    
    // 12) 캠페인 발송 시뮬레이션
    @PostMapping("/{id}/send")
    public ResponseEntity<?> sendCampaign(@PathVariable UUID id) {
        try {
            Map<String, Object> result = deliveryService.simulateCampaignDelivery(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "캠페인 발송이 완료되었습니다.",
                "data", result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "캠페인 발송 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
    
    // 13) 캠페인별 발송 통계 조회
    @GetMapping("/{id}/delivery-stats")
    public ResponseEntity<?> getCampaignDeliveryStats(@PathVariable UUID id) {
        try {
            Map<String, Object> stats = deliveryService.getCampaignDeliveryStats(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "발송 통계 조회 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
}
