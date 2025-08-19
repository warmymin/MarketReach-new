package com.example.demo.service;

import com.example.demo.entity.Delivery;
import com.example.demo.entity.Targeting;
import com.example.demo.repository.DeliveryRepository;
import com.example.demo.repository.TargetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;
    
    @Autowired
    private TargetingRepository targetingRepository;

    public Delivery createDelivery(Delivery delivery) {
        return deliveryRepository.save(delivery);
    }

    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    public Optional<Delivery> getDeliveryById(UUID id) {
        return deliveryRepository.findById(id);
    }

    public List<Delivery> getDeliveriesByTargetingId(UUID targetingId) {
        return deliveryRepository.findByTargetingId(targetingId);
    }

    public List<Delivery> getDeliveriesByCampaignId(UUID campaignId) {
        return deliveryRepository.findByCampaignId(campaignId);
    }

    public List<Delivery> getDeliveriesByCompanyId(UUID companyId) {
        return deliveryRepository.findByCompanyId(companyId);
    }

    public List<Delivery> getDeliveriesByStatus(Delivery.DeliveryStatus status) {
        return deliveryRepository.findByStatus(status);
    }

    public List<Delivery> getDeliveriesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return deliveryRepository.findByCreatedAtBetween(startDate, endDate);
    }

    public List<Delivery> getCompletedDeliveries() {
        return deliveryRepository.findByDeliveredAtIsNotNull();
    }

    public List<Delivery> getFailedDeliveries() {
        return deliveryRepository.findByStatusAndErrorCodeIsNotNull(Delivery.DeliveryStatus.FAIL);
    }

    public Object[] getDeliveryStatsByCampaign(UUID campaignId) {
        return deliveryRepository.getDeliveryStatsByCampaign(campaignId);
    }

    public Object[] getDeliveryStatsByCompany(UUID companyId) {
        return deliveryRepository.getDeliveryStatsByCompany(companyId);
    }

    public Delivery updateDelivery(UUID id, Delivery deliveryDetails) {
        Optional<Delivery> delivery = deliveryRepository.findById(id);
        if (delivery.isPresent()) {
            Delivery existingDelivery = delivery.get();
            existingDelivery.setStatus(deliveryDetails.getStatus());
            existingDelivery.setErrorCode(deliveryDetails.getErrorCode());
            existingDelivery.setDeliveredAt(deliveryDetails.getDeliveredAt());
            return deliveryRepository.save(existingDelivery);
        }
        return null;
    }

    public boolean deleteDelivery(UUID id) {
        if (deliveryRepository.existsById(id)) {
            deliveryRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * 메시지 전송 시뮬레이션
     */
    public Delivery simulateMessageDelivery(UUID targetingId) {
        Optional<Targeting> targeting = targetingRepository.findById(targetingId);
        if (targeting.isPresent()) {
            Delivery delivery = new Delivery();
            delivery.setTargeting(targeting.get());
            
            // 랜덤하게 성공/실패 시뮬레이션 (80% 성공률)
            Random random = new Random();
            if (random.nextDouble() < 0.8) {
                delivery.setStatus(Delivery.DeliveryStatus.SUCCESS);
                delivery.setDeliveredAt(LocalDateTime.now());
            } else {
                delivery.setStatus(Delivery.DeliveryStatus.FAIL);
                delivery.setErrorCode(getRandomErrorCode());
            }
            
            return deliveryRepository.save(delivery);
        }
        return null;
    }

    /**
     * 배치 메시지 전송 시뮬레이션
     */
    public List<Delivery> simulateBatchMessageDelivery(List<UUID> targetingIds) {
        List<Delivery> deliveries = new ArrayList<>();
        
        for (UUID targetingId : targetingIds) {
            Delivery delivery = simulateMessageDelivery(targetingId);
            if (delivery != null) {
                deliveries.add(delivery);
            }
        }
        
        return deliveries;
    }

    /**
     * 캠페인 전체 메시지 전송 시뮬레이션
     */
    public List<Delivery> simulateCampaignDelivery(UUID campaignId) {
        // 캠페인에 연결된 모든 타겟팅을 찾아서 배송 시뮬레이션
        List<Targeting> targetings = targetingRepository.findByCampaignId(campaignId);
        List<UUID> targetingIds = targetings.stream()
                .map(Targeting::getId)
                .collect(Collectors.toList());
        
        return simulateBatchMessageDelivery(targetingIds);
    }

    /**
     * 랜덤 에러 코드 생성
     */
    private String getRandomErrorCode() {
        String[] errorCodes = {
            "NETWORK_ERROR",
            "INVALID_PHONE",
            "MESSAGE_TOO_LONG",
            "RATE_LIMIT_EXCEEDED",
            "SERVICE_UNAVAILABLE",
            "AUTHENTICATION_FAILED"
        };
        
        Random random = new Random();
        return errorCodes[random.nextInt(errorCodes.length)];
    }
}
