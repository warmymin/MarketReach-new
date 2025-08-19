package com.example.demo.controller;

import com.example.demo.entity.Campaign;
import com.example.demo.entity.Company;
import com.example.demo.service.CampaignService;
import com.example.demo.service.CompanyService;
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

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = "*")
public class CampaignController {

    @Autowired
    private CampaignService campaignService;
    
    @Autowired
    private CompanyService companyService;

    // 1) 캠페인 생성
    @PostMapping
    public ResponseEntity<?> createCampaign(@RequestBody Campaign campaign) {
        try {
            // Company 설정
            if (campaign.getCompany() == null && campaign.getCompanyId() != null) {
                Optional<Company> company = companyService.getCompanyById(campaign.getCompanyId());
                if (company.isPresent()) {
                    campaign.setCompany(company.get());
                } else {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "회사를 찾을 수 없습니다.");
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

    // 6) 예약 캠페인
    @GetMapping("/scheduled")
    public ResponseEntity<?> getScheduledCampaigns() {
        return ResponseEntity.ok(Map.of("success", true, "data", campaignService.getScheduledCampaigns()));
    }

    @GetMapping("/scheduled/company/{companyId}")
    public ResponseEntity<?> getScheduledCampaignsByCompany(@PathVariable UUID companyId) {
        companyService.getCompanyById(companyId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "회사를 찾을 수 없습니다."));
        return ResponseEntity.ok(Map.of("success", true, "data",
                campaignService.getScheduledCampaignsByCompany(companyId)));
    }

    // 7) 위치 근처 활성 캠페인
    @GetMapping("/near-location")
    public ResponseEntity<?> getActiveCampaignsNearLocation(
            @RequestParam UUID companyId,
            @RequestParam Double lat,
            @RequestParam Double lng) {

        companyService.getCompanyById(companyId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "회사를 찾을 수 없습니다."));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", campaignService.findActiveCampaignsNearLocation(companyId, lat, lng),
                "location", Map.of("lat", lat, "lng", lng)
        ));
    }

    // 8) 통계
    @GetMapping("/stats/company/{companyId}")
    public ResponseEntity<?> getCampaignStats(@PathVariable UUID companyId) {
        companyService.getCompanyById(companyId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "회사를 찾을 수 없습니다."));
        Object[] stats = campaignService.getCampaignStats(companyId);
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "totalCampaigns", stats[0],
                "activeCampaigns", stats[1],
                "completedCampaigns", stats[2]
        )));
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
}
