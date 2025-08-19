package com.example.demo.controller;

import com.example.demo.entity.TargetingLocation;
import com.example.demo.service.TargetingLocationService;
import com.example.demo.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/targeting-locations")
@CrossOrigin(origins = "*")
public class TargetingLocationController {
    
    @Autowired
    private TargetingLocationService targetingLocationService;
    
    @Autowired
    private CompanyService companyService;
    
    // 타겟팅 위치 생성
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTargetingLocation(@RequestBody TargetingLocation targetingLocation) {
        try {
            // 회사 존재 여부 확인
            if (!targetingLocationService.companyExists(targetingLocation.getCompany().getId())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "존재하지 않는 회사입니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            TargetingLocation created = targetingLocationService.createTargetingLocation(targetingLocation);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "타겟팅 위치가 성공적으로 생성되었습니다.");
            response.put("data", created);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "타겟팅 위치 생성 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // 모든 타겟팅 위치 조회
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTargetingLocations() {
        try {
            List<TargetingLocation> targetingLocations = targetingLocationService.getAllTargetingLocations();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", targetingLocations);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "타겟팅 위치 조회 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // ID로 타겟팅 위치 조회
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTargetingLocationById(@PathVariable UUID id) {
        try {
            return targetingLocationService.getTargetingLocationById(id)
                    .map(targetingLocation -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("data", targetingLocation);
                        return ResponseEntity.ok(response);
                    })
                    .orElseGet(() -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("success", false);
                        response.put("message", "타겟팅 위치를 찾을 수 없습니다.");
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "타겟팅 위치 조회 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // 회사별 타겟팅 위치 조회
    @GetMapping("/company/{companyId}")
    public ResponseEntity<Map<String, Object>> getTargetingLocationsByCompany(@PathVariable UUID companyId) {
        try {
            List<TargetingLocation> targetingLocations = targetingLocationService.getTargetingLocationsByCompany(companyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", targetingLocations);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "타겟팅 위치 조회 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // 이름으로 검색
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchTargetingLocations(@RequestParam String name) {
        try {
            List<TargetingLocation> targetingLocations = targetingLocationService.searchTargetingLocationsByName(name);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", targetingLocations);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "타겟팅 위치 검색 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // 타겟팅 위치 수정
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTargetingLocation(@PathVariable UUID id, @RequestBody TargetingLocation targetingLocation) {
        try {
            TargetingLocation updated = targetingLocationService.updateTargetingLocation(id, targetingLocation);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "타겟팅 위치가 성공적으로 수정되었습니다.");
            response.put("data", updated);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "타겟팅 위치 수정 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // 타겟팅 위치 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTargetingLocation(@PathVariable UUID id) {
        try {
            boolean deleted = targetingLocationService.deleteTargetingLocation(id);
            
            Map<String, Object> response = new HashMap<>();
            if (deleted) {
                response.put("success", true);
                response.put("message", "타겟팅 위치가 성공적으로 삭제되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "타겟팅 위치를 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "타겟팅 위치 삭제 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // 예상 도달 고객 수 계산
    @GetMapping("/estimate-reach")
    public ResponseEntity<Map<String, Object>> getEstimatedReach(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam Integer radiusM) {
        try {
            Long estimatedReach = targetingLocationService.getEstimatedReach(lat, lng, radiusM);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", estimatedReach);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "예상 도달 고객 수 계산 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
