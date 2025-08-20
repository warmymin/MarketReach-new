package com.example.demo.repository;

import com.example.demo.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    
    /**
     * 전화번호로 고객 검색
     */
    List<Customer> findByPhoneContaining(String phone);
    
    /**
     * 이름으로 고객 검색
     */
    List<Customer> findByNameContainingIgnoreCase(String name);
    
    /**
     * 동 코드로 고객 검색
     */
    List<Customer> findByDongCode(String dongCode);
    
    /**
     * 위치 기반 고객 조회 (Haversine 공식 사용)
     */
    @Query(value = "SELECT c.* FROM customers c " +
                   "WHERE (6371000 * acos(cos(radians(:lat)) * cos(radians(c.lat)) * " +
                   "cos(radians(c.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(c.lat)))) <= :radiusM " +
                   "ORDER BY (6371000 * acos(cos(radians(:lat)) * cos(radians(c.lat)) * " +
                   "cos(radians(c.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(c.lat)))) ASC", 
           nativeQuery = true)
    List<Customer> findCustomersNearLocation(@Param("lat") Double lat, 
                                           @Param("lng") Double lng, 
                                           @Param("radiusM") Integer radiusM);
    
    /**
     * 간단한 거리 계산으로 고객 조회 (테스트용)
     */
    @Query(value = "SELECT c.* FROM customers c " +
                   "WHERE ABS(c.lat - :lat) <= 0.1 AND ABS(c.lng - :lng) <= 0.1", 
           nativeQuery = true)
    List<Customer> findCustomersNearLocationSimple(@Param("lat") Double lat, 
                                                 @Param("lng") Double lng);
}
