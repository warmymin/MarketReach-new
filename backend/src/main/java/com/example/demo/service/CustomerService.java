package com.example.demo.service;

import com.example.demo.entity.Customer;
import com.example.demo.entity.Company;
import com.example.demo.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private CompanyService companyService;

    public Customer createCustomer(Customer customer) {
        // Company 객체가 설정되지 않은 경우 처리
        if (customer.getCompany() == null && customer.getCompanyId() != null) {
            Optional<Company> company = companyService.getCompanyById(customer.getCompanyId());
            if (company.isPresent()) {
                customer.setCompany(company.get());
            }
        }
        return customerRepository.save(customer);
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(UUID id) {
        return customerRepository.findById(id);
    }

    public Customer updateCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Page<Customer> getCustomersByCompanyId(UUID companyId, Pageable pageable) {
        return customerRepository.findByCompanyId(companyId, pageable);
    }

    public List<Customer> searchCustomersByPhone(String phone) {
        return customerRepository.findByPhoneContaining(phone);
    }

    public List<Customer> searchCustomersByName(String name) {
        return customerRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Customer> searchCustomersByDongCode(String dongCode) {
        return customerRepository.findByDongCode(dongCode);
    }

    public List<Object[]> findCustomersWithinRadius(Double lat, Double lng, Integer radius, UUID companyId) {
        return customerRepository.findCustomersWithinRadius(lat, lng, radius, companyId);
    }

    public Long countCustomersWithinRadius(Double lat, Double lng, Integer radius, UUID companyId) {
        return customerRepository.countCustomersWithinRadius(lat, lng, radius, companyId);
    }

    // 새로운 위치 기반 고객 조회 메서드
    public List<Customer> getNearbyCustomers(Double lat, Double lng, Double radius) {
        return customerRepository.findNearbyCustomers(lat, lng, radius);
    }

    // UUID 문자열로 고객 조회
    public Customer getCustomerById(String id) {
        try {
            UUID uuid = UUID.fromString(id);
            Optional<Customer> customer = customerRepository.findById(uuid);
            return customer.orElseThrow(() -> new IllegalArgumentException("고객을 찾을 수 없습니다: " + id));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("잘못된 고객 ID 형식입니다: " + id);
        }
    }

    // UUID 문자열로 고객 업데이트
    public Customer updateCustomer(String id, Customer customer) {
        Customer existingCustomer = getCustomerById(id);
        existingCustomer.setName(customer.getName());
        existingCustomer.setPhone(customer.getPhone());
        existingCustomer.setLat(customer.getLat());
        existingCustomer.setLng(customer.getLng());
        existingCustomer.setDongCode(customer.getDongCode());
        return customerRepository.save(existingCustomer);
    }

    // UUID 문자열로 고객 삭제
    public void deleteCustomer(String id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
    }

    /**
     * CSV 파일로 고객 데이터 업로드
     */
    public List<Customer> uploadCustomersFromCsv(MultipartFile file, UUID companyId) throws Exception {
        List<Customer> uploadedCustomers = new ArrayList<>();
        
        // 회사 정보 가져오기
        Optional<Company> company = companyService.getCompanyById(companyId);
        if (!company.isPresent()) {
            throw new IllegalArgumentException("회사를 찾을 수 없습니다: " + companyId);
        }
        
        // CSV 파싱
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isFirstLine = true;
            
            while ((line = reader.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue; // 헤더 건너뛰기
                }
                
                String[] values = line.split(",");
                if (values.length >= 3) {
                    Customer customer = new Customer();
                    customer.setName(values[0].trim());
                    customer.setPhone(values[1].trim());
                    customer.setDongCode(values[2].trim());
                    
                    // 동 코드 기반 Centroid 좌표 자동 설정
                    setCoordinatesFromDongCode(customer);
                    
                    customer.setCompany(company.get());
                    uploadedCustomers.add(customerRepository.save(customer));
                }
            }
        }
        
        return uploadedCustomers;
    }
    
    /**
     * 동 코드 기반 Centroid 좌표 자동 설정
     */
    private void setCoordinatesFromDongCode(Customer customer) {
        // 실제 구현에서는 동 코드별 좌표 데이터베이스나 API를 사용
        // 여기서는 간단한 예시로 구현
        String dongCode = customer.getDongCode();
        
        // 서울시 강남구 테헤란로 기준 (예시)
        if (dongCode != null && !dongCode.isEmpty()) {
            // 동 코드의 마지막 2자리를 사용하여 간단한 좌표 생성
            try {
                int code = Integer.parseInt(dongCode.substring(Math.max(0, dongCode.length() - 2)));
                double lat = 37.5665 + (code * 0.001); // 서울 중심점 기준
                double lng = 126.9780 + (code * 0.001);
                customer.setLat(lat);
                customer.setLng(lng);
            } catch (NumberFormatException e) {
                // 기본 좌표 설정
                customer.setLat(37.5665);
                customer.setLng(126.9780);
            }
        } else {
            // 기본 좌표 설정
            customer.setLat(37.5665);
            customer.setLng(126.9780);
        }
    }
}
