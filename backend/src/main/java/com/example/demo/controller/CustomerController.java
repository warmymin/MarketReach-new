package com.example.demo.controller;

import com.example.demo.entity.Customer;
import com.example.demo.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    /**
     * 고객 생성
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createCustomer(@Valid @RequestBody Customer customer) {
        Customer createdCustomer = customerService.createCustomer(customer);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "고객이 성공적으로 생성되었습니다.");
        response.put("data", createdCustomer);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 모든 고객 조회
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", customers);
        
        return ResponseEntity.ok(response);
    }

    /**
     * ID로 고객 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCustomerById(@PathVariable UUID id) {
        Optional<Customer> customer = customerService.getCustomerById(id);
        
        Map<String, Object> response = new HashMap<>();
        if (customer.isPresent()) {
            response.put("success", true);
            response.put("data", customer.get());
        } else {
            response.put("success", false);
            response.put("message", "고객을 찾을 수 없습니다.");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * 회사별 고객 조회 (페이지네이션)
     */
    @GetMapping("/company/{companyId}")
    public ResponseEntity<Map<String, Object>> getCustomersByCompany(
            @PathVariable UUID companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Customer> customers = customerService.getCustomersByCompanyId(companyId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", customers.getContent());
        response.put("totalElements", customers.getTotalElements());
        response.put("totalPages", customers.getTotalPages());
        response.put("currentPage", customers.getNumber());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 전화번호로 고객 검색
     */
    @GetMapping("/search/phone")
    public ResponseEntity<Map<String, Object>> searchCustomersByPhone(@RequestParam String phone) {
        List<Customer> customers = customerService.searchCustomersByPhone(phone);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", customers);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 이름으로 고객 검색
     */
    @GetMapping("/search/name")
    public ResponseEntity<Map<String, Object>> searchCustomersByName(@RequestParam String name) {
        List<Customer> customers = customerService.searchCustomersByName(name);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", customers);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 동 코드로 고객 검색
     */
    @GetMapping("/search/dong")
    public ResponseEntity<Map<String, Object>> searchCustomersByDongCode(@RequestParam String dongCode) {
        List<Customer> customers = customerService.searchCustomersByDongCode(dongCode);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", customers);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 반경 내 고객 검색
     */
    @GetMapping("/radius")
    public ResponseEntity<Map<String, Object>> findCustomersWithinRadius(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam Integer radius,
            @RequestParam UUID companyId) {
        
        List<Object[]> customers = customerService.findCustomersWithinRadius(lat, lng, radius, companyId);
        Long count = customerService.countCustomersWithinRadius(lat, lng, radius, companyId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", customers);
        response.put("count", count);
        response.put("radius", radius);
        response.put("center", Map.of("lat", lat, "lng", lng));
        
        return ResponseEntity.ok(response);
    }

    /**
     * CSV 파일로 고객 데이터 업로드
     */
    @PostMapping("/upload/csv")
    public ResponseEntity<Map<String, Object>> uploadCustomersFromCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam UUID companyId) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (file.isEmpty()) {
            response.put("success", false);
            response.put("message", "파일이 비어있습니다.");
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            List<Customer> uploadedCustomers = customerService.uploadCustomersFromCsv(file, companyId);
            
            response.put("success", true);
            response.put("message", "CSV 파일이 성공적으로 업로드되었습니다.");
            response.put("data", uploadedCustomers);
            response.put("totalUploaded", uploadedCustomers.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "CSV 업로드 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
