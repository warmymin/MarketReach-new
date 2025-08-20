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
     * 회사별 고객 조회
     */
    Page<Customer> findByCompanyId(UUID companyId, Pageable pageable);
    
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
     * 반경 내 고객 검색 (PostgreSQL용 Haversine 공식)
     */
    @Query(value = "SELECT c.id, c.name, c.phone, c.lat, c.lng, c.dong_code, c.company_id, c.created_at, " +
                   "(6371000 * acos(cos(radians(:lat)) * cos(radians(c.lat)) * " +
                   "cos(radians(c.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(c.lat)))) AS distance " +
                   "FROM customers c " +
                   "WHERE c.company_id = :companyId " +
                   "AND (6371000 * acos(cos(radians(:lat)) * cos(radians(c.lat)) * " +
                   "cos(radians(c.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(c.lat)))) <= :radius " +
                   "ORDER BY distance ASC", 
           nativeQuery = true)
    List<Object[]> findCustomersWithinRadius(@Param("lat") Double lat, 
                                           @Param("lng") Double lng, 
                                           @Param("radius") Integer radius, 
                                           @Param("companyId") UUID companyId);
    
    /**
     * 반경 내 고객 수 조회 (PostgreSQL용)
     */
    @Query(value = "SELECT COUNT(*) FROM customers c " +
                   "WHERE c.company_id = :companyId " +
                   "AND (6371000 * acos(cos(radians(:lat)) * cos(radians(c.lat)) * " +
                   "cos(radians(c.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(c.lat)))) <= :radius", 
           nativeQuery = true)
    Long countCustomersWithinRadius(@Param("lat") Double lat, 
                                  @Param("lng") Double lng, 
                                  @Param("radius") Integer radius, 
                                  @Param("companyId") UUID companyId);
    
    /**
     * 특정 좌표에서 가장 가까운 고객들 조회 (PostgreSQL용)
     */
    @Query(value = "SELECT c.id, c.name, c.phone, c.lat, c.lng, c.dong_code, c.company_id, c.created_at, " +
                   "(6371000 * acos(cos(radians(:lat)) * cos(radians(c.lat)) * " +
                   "cos(radians(c.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(c.lat)))) AS distance " +
                   "FROM customers c " +
                   "WHERE c.company_id = :companyId " +
                   "ORDER BY distance ASC " +
                   "LIMIT :limit", 
           nativeQuery = true)
    List<Object[]> findNearestCustomers(@Param("lat") Double lat, 
                                      @Param("lng") Double lng, 
                                      @Param("companyId") UUID companyId, 
                                      @Param("limit") Integer limit);

    /**
     * 위치 기반 고객 조회 (Haversine 공식 사용, 회사 제한 없음)
     */
    @Query(value = "SELECT c.* FROM customers c " +
                   "WHERE (6371 * acos(cos(radians(:lat)) * cos(radians(c.lat)) * " +
                   "cos(radians(c.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(c.lat)))) <= :radius " +
                   "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(c.lat)) * " +
                   "cos(radians(c.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(c.lat)))) ASC", 
           nativeQuery = true)
    List<Customer> findNearbyCustomers(@Param("lat") Double lat, 
                                     @Param("lng") Double lng, 
                                     @Param("radius") Double radius);
}
