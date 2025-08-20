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
        
        System.out.println("=== 캠페인 발송 시작 ===");
        System.out.println("캠페인 ID: " + campaignId);
        System.out.println("캠페인 이름: " + campaign.getName());
        System.out.println("타겟팅 위치: " + (campaign.getTargetingLocation() != null ? campaign.getTargetingLocation().getName() : "null"));
        
        // 캠페인 상태를 "IN_PROGRESS"로 변경
        campaign.setStatus("IN_PROGRESS");
        campaignRepository.save(campaign);
        
        // 타겟팅 위치가 없으면 오류
        if (campaign.getTargetingLocation() == null) {
            throw new RuntimeException("캠페인에 타겟팅 위치가 설정되지 않았습니다.");
        }
        
        System.out.println("타겟팅 위치 정보:");
        System.out.println("- 중심점: " + campaign.getTargetingLocation().getCenterLat() + ", " + campaign.getTargetingLocation().getCenterLng());
        System.out.println("- 반경: " + campaign.getTargetingLocation().getRadiusM() + "m");
        
        // 타겟팅 위치의 반경 내 고객들 조회
        List<Customer> targetCustomers = customerRepository.findCustomersNearLocation(
                campaign.getTargetingLocation().getCenterLat(),
                campaign.getTargetingLocation().getCenterLng(),
                campaign.getTargetingLocation().getRadiusM()
        );
        
        System.out.println("타겟 고객 수: " + targetCustomers.size());
        for (Customer customer : targetCustomers) {
            System.out.println("- 고객: " + customer.getName() + " (" + customer.getLat() + ", " + customer.getLng() + ")");
        }
        
        if (targetCustomers.isEmpty()) {
            // 타겟 고객이 없으면 캠페인 상태를 "COMPLETED"로 변경하고 빈 결과 반환
            campaign.setStatus("COMPLETED");
            campaignRepository.save(campaign);
            
            Map<String, Object> result = new HashMap<>();
            result.put("totalDeliveries", 0);
            result.put("sentCount", 0);
            result.put("failedCount", 0);
            result.put("pendingCount", 0);
            result.put("successRate", 0.0);
            result.put("message", "타겟 고객이 없습니다.");
            return result;
        }
        
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
                Delivery delivery = future.get();
                if (delivery != null) {
                    deliveries.add(delivery);
                }
            } catch (Exception e) {
                System.err.println("발송 처리 중 오류: " + e.getMessage());
                // 실패한 발송 처리
                Delivery failedDelivery = new Delivery();
                failedDelivery.setStatus(DeliveryStatus.FAILED);
                failedDelivery.setErrorCode("SIMULATION_ERROR");
                failedDelivery.setCreatedAt(LocalDateTime.now());
                failedDelivery.setTargetingLocation(campaign.getTargetingLocation());
                failedDelivery.setMessage(campaign.getMessage());
                deliveries.add(deliveryRepository.save(failedDelivery));
            }
        }
        
        // 통계 계산
        long sentCount = deliveries.stream().filter(d -> d.getStatus() == DeliveryStatus.SENT).count();
        long failedCount = deliveries.stream().filter(d -> d.getStatus() == DeliveryStatus.FAILED).count();
        long pendingCount = deliveries.stream().filter(d -> d.getStatus() == DeliveryStatus.PENDING).count();
        double successRate = calculateSuccessRate(deliveries);
        
        System.out.println("발송 결과:");
        System.out.println("- 총 발송: " + deliveries.size() + "건");
        System.out.println("- 성공: " + sentCount + "건");
        System.out.println("- 실패: " + failedCount + "건");
        System.out.println("- 성공률: " + successRate + "%");
        
        // 캠페인 상태 업데이트
        if (failedCount == deliveries.size()) {
            campaign.setStatus("FAILED");
        } else {
            campaign.setStatus("COMPLETED");
        }
        campaignRepository.save(campaign);
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalDeliveries", deliveries.size());
        result.put("sentCount", sentCount);
        result.put("failedCount", failedCount);
        result.put("pendingCount", pendingCount);
        result.put("successRate", successRate);
        result.put("message", "캠페인 발송이 완료되었습니다.");
        
        return result;
    }
    
    /**
     * 개별 고객 발송 시뮬레이션
     */
    private Delivery simulateDeliveryToCustomer(Campaign campaign, Customer customer) {
        try {
            Delivery delivery = new Delivery();
            delivery.setTargetingLocation(campaign.getTargetingLocation());
            delivery.setCustomer(customer);
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
        } catch (Exception e) {
            System.err.println("고객 발송 시뮬레이션 오류: " + e.getMessage());
        return null;
        }
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
        
        // 시간대별 통계 계산
        Map<Integer, Map<String, Long>> timeSlotStats = new HashMap<>();
        for (Object[] row : rawStats) {
            Integer timeSlot = (Integer) row[0];
            String statusStr = (String) row[1];
            Long count = (Long) row[2];
            
            // enum 변환 시 예외 처리
            String statusName;
            try {
                DeliveryStatus status = DeliveryStatus.valueOf(statusStr);
                statusName = status.name();
            } catch (IllegalArgumentException e) {
                // 알 수 없는 상태는 FAILED로 처리
                statusName = "FAILED";
                System.err.println("알 수 없는 DeliveryStatus: " + statusStr);
            }
            
            timeSlotStats.computeIfAbsent(timeSlot, k -> new HashMap<>())
                    .put(statusName, count);
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
        
        if (campaign.getTargetingLocation() == null) {
            return new ArrayList<>();
        }
        
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
    
    /**
     * 캠페인별 발송 통계 조회
     */
    public Map<String, Object> getCampaignDeliveryStats(UUID campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("캠페인을 찾을 수 없습니다."));
        
        if (campaign.getTargetingLocation() == null) {
            Map<String, Object> emptyStats = new HashMap<>();
            emptyStats.put("totalDeliveries", 0);
            emptyStats.put("sentCount", 0);
            emptyStats.put("failedCount", 0);
            emptyStats.put("pendingCount", 0);
            emptyStats.put("successRate", 0.0);
            return emptyStats;
        }
        
        List<Delivery> deliveries = deliveryRepository.findByTargetingLocationIdOrderByCreatedAtDesc(
                campaign.getTargetingLocation().getId()
        );
        
        long sentCount = deliveries.stream().filter(d -> d.getStatus() == DeliveryStatus.SENT).count();
        long failedCount = deliveries.stream().filter(d -> d.getStatus() == DeliveryStatus.FAILED).count();
        long pendingCount = deliveries.stream().filter(d -> d.getStatus() == DeliveryStatus.PENDING).count();
        double successRate = calculateSuccessRate(deliveries);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDeliveries", deliveries.size());
        stats.put("sentCount", sentCount);
        stats.put("failedCount", failedCount);
        stats.put("pendingCount", pendingCount);
        stats.put("successRate", successRate);
        
        return stats;
    }
}
