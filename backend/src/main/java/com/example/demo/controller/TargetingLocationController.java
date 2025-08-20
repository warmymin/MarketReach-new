package com.example.demo.controller;

import com.example.demo.entity.TargetingLocation;
import com.example.demo.entity.Company;
import com.example.demo.service.TargetingLocationService;
import com.example.demo.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
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
    
    // 테스트용 엔드포인트
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "TargetingLocation API가 정상 작동합니다.");
        return ResponseEntity.ok(response);
    }
    
    // 타겟팅 위치 생성
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createTargetingLocation(@RequestBody TargetingLocation targetingLocation) {
        try {
            System.out.println("=== 타겟팅 위치 생성 요청 시작 ===");
            System.out.println("받은 데이터: " + targetingLocation);
            System.out.println("Content-Type 확인 필요");
            
            // 회사 정보가 없으면 기본 회사 설정
            if (targetingLocation.getCompany() == null) {
                // 기본 회사 ID 설정 (실제 존재하는 회사 ID로 변경 필요)
                Company defaultCompany = new Company();
                defaultCompany.setId(UUID.fromString("a844e499-59f2-44de-9d44-178dba113d37"));
                targetingLocation.setCompany(defaultCompany);
            }
            
            TargetingLocation created = targetingLocationService.createTargetingLocation(targetingLocation);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "타겟팅 위치가 성공적으로 생성되었습니다.");
            response.put("data", created);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("오류 발생: " + e.getMessage());
            e.printStackTrace();
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
