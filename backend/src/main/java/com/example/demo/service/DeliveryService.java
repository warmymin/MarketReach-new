package com.example.demo.service;

import com.example.demo.entity.Delivery;
import com.example.demo.entity.Delivery.DeliveryStatus;
import com.example.demo.entity.Campaign;
import com.example.demo.entity.Customer;
import com.example.demo.repository.DeliveryRepository;
import com.example.demo.repository.CampaignRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.TargetingLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class DeliveryService {
    
    @Autowired
    private DeliveryRepository deliveryRepository;
    
    @Autowired
    private CampaignRepository campaignRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private TargetingLocationRepository targetingLocationRepository;
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(5);
    
    /**
     * 캠페인 발송 시뮬레이션
     */
    @Transactional
    public Map<String, Object> simulateCampaignDelivery(UUID campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("캠페인을 찾을 수 없습니다."));
        
        // 타겟팅 위치의 반경 내 고객들 조회
        List<Customer> targetCustomers = customerRepository.findCustomersNearLocation(
                campaign.getTargetingLocation().getCenterLat(),
                campaign.getTargetingLocation().getCenterLng(),
                campaign.getTargetingLocation().getRadiusM()
        );
        
        List<Delivery> deliveries = new ArrayList<>();
        List<CompletableFuture<Delivery>> futures = new ArrayList<>();
        
        // 각 고객에 대해 발송 시뮬레이션
        for (Customer customer : targetCustomers) {
            CompletableFuture<Delivery> future = CompletableFuture.supplyAsync(() -> {
                return simulateDeliveryToCustomer(campaign, customer);
            }, executorService);
            
            futures.add(future);
        }
        
        // 모든 발송 완료 대기
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        
        // 결과 수집
        for (CompletableFuture<Delivery> future : futures) {
            try {
                deliveries.add(future.get());
            } catch (Exception e) {
                // 실패한 발송 처리
                Delivery failedDelivery = new Delivery();
                failedDelivery.setStatus(DeliveryStatus.FAILED);
                failedDelivery.setErrorCode("SIMULATION_ERROR");
                failedDelivery.setCreatedAt(LocalDateTime.now());
                deliveries.add(failedDelivery);
            }
        }
        
        // 통계 계산
        Map<String, Object> result = new HashMap<>();
        result.put("totalDeliveries", deliveries.size());
        result.put("sentCount", deliveries.stream().filter(d -> d.getStatus() == DeliveryStatus.SENT).count());
        result.put("failedCount", deliveries.stream().filter(d -> d.getStatus() == DeliveryStatus.FAILED).count());
        result.put("pendingCount", deliveries.stream().filter(d -> d.getStatus() == DeliveryStatus.PENDING).count());
        result.put("successRate", calculateSuccessRate(deliveries));
        
        return result;
    }
    
    /**
     * 개별 고객 발송 시뮬레이션
     */
    private Delivery simulateDeliveryToCustomer(Campaign campaign, Customer customer) {
        Delivery delivery = new Delivery();
        delivery.setTargetingLocation(campaign.getTargetingLocation());
        delivery.setCustomer(customer); // 고객 정보 설정
        delivery.setMessage(campaign.getMessage());
        delivery.setCreatedAt(LocalDateTime.now());
        
        // 랜덤하게 성공/실패 결정 (85% 성공률)
        double random = Math.random();
        if (random < 0.85) {
            // 성공
            delivery.setStatus(DeliveryStatus.SENT);
            delivery.setSentAt(LocalDateTime.now());
            
            // 약간의 지연 시뮬레이션 (0.1~2초)
            try {
                Thread.sleep((long) (Math.random() * 1900 + 100));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        } else {
            // 실패
            delivery.setStatus(DeliveryStatus.FAILED);
            delivery.setErrorCode(getRandomErrorCode());
        }
        
        return deliveryRepository.save(delivery);
    }
    
    /**
     * 랜덤 에러 코드 생성
     */
    private String getRandomErrorCode() {
        String[] errorCodes = {
            "NETWORK_TIMEOUT",
            "INVALID_PHONE",
            "SERVICE_UNAVAILABLE",
            "QUOTA_EXCEEDED",
            "BLOCKED_NUMBER"
        };
        return errorCodes[(int) (Math.random() * errorCodes.length)];
    }
    
    /**
     * 성공률 계산
     */
    private double calculateSuccessRate(List<Delivery> deliveries) {
        if (deliveries.isEmpty()) return 0.0;
        long sentCount = deliveries.stream().filter(d -> d.getStatus() == DeliveryStatus.SENT).count();
        return (double) sentCount / deliveries.size() * 100;
    }
    
    /**
     * 발송 통계 요약 조회
     */
    public Map<String, Object> getDeliverySummary() {
        Map<String, Object> summary = new HashMap<>();
        
        long totalDeliveries = deliveryRepository.count();
        long sentCount = deliveryRepository.countByStatus(DeliveryStatus.SENT);
        long failedCount = deliveryRepository.countByStatus(DeliveryStatus.FAILED);
        long pendingCount = deliveryRepository.countByStatus(DeliveryStatus.PENDING);
        long todayDeliveries = deliveryRepository.countTodayDeliveries();
        
        summary.put("totalDeliveries", totalDeliveries);
        summary.put("sentCount", sentCount);
        summary.put("failedCount", failedCount);
        summary.put("pendingCount", pendingCount);
        summary.put("todayDeliveries", todayDeliveries);
        summary.put("successRate", totalDeliveries > 0 ? (double) sentCount / totalDeliveries * 100 : 0.0);
        
        return summary;
    }
    
    /**
     * 실시간 발송 통계 조회 (최근 30분)
     */
    public List<Map<String, Object>> getRealtimeStats() {
        LocalDateTime startTime = LocalDateTime.now().minusMinutes(30);
        List<Object[]> rawStats = deliveryRepository.getRealtimeDeliveryStats(startTime);
        
        Map<Integer, Map<String, Long>> timeSlotStats = new HashMap<>();
        
        // 5분 단위로 데이터 그룹화
        for (Object[] row : rawStats) {
            Integer timeSlot = (Integer) row[0];
            DeliveryStatus status = (DeliveryStatus) row[1];
            Long count = (Long) row[2];
            
            timeSlotStats.computeIfAbsent(timeSlot, k -> new HashMap<>())
                    .put(status.name(), count);
        }
        
        // 결과 포맷팅
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i <= 6; i++) { // 30분을 5분 단위로 6개 구간
            Map<String, Object> timeSlot = new HashMap<>();
            timeSlot.put("timeSlot", i * 5);
            timeSlot.put("sent", timeSlotStats.getOrDefault(i, new HashMap<>()).getOrDefault("SENT", 0L));
            timeSlot.put("failed", timeSlotStats.getOrDefault(i, new HashMap<>()).getOrDefault("FAILED", 0L));
            timeSlot.put("pending", timeSlotStats.getOrDefault(i, new HashMap<>()).getOrDefault("PENDING", 0L));
            result.add(timeSlot);
        }
        
        return result;
    }
    
    /**
     * 시간대별 발송 통계 조회
     */
    public List<Map<String, Object>> getHourlyStats() {
        List<Object[]> rawStats = deliveryRepository.getHourlyDeliveryStats();
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rawStats) {
            Map<String, Object> hourStat = new HashMap<>();
            hourStat.put("hour", row[0]);
            hourStat.put("count", row[1]);
            result.add(hourStat);
        }
        
        return result;
    }
    
    /**
     * 캠페인별 발송 목록 조회
     */
    public List<Delivery> getDeliveriesByCampaign(UUID campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("캠페인을 찾을 수 없습니다."));
        
        return deliveryRepository.findByTargetingLocationIdOrderByCreatedAtDesc(
                campaign.getTargetingLocation().getId()
        );
    }
    
    /**
     * 상태별 발송 목록 조회
     */
    public List<Delivery> getDeliveriesByStatus(DeliveryStatus status) {
        return deliveryRepository.findByStatusOrderByCreatedAtDesc(status);
    }
}
