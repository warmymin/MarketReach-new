package com.example.demo.service;

import com.example.demo.entity.Delivery;
import com.example.demo.entity.TargetingLocation;
import com.example.demo.repository.DeliveryRepository;
import com.example.demo.repository.TargetingLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.ArrayList;

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;
    
    @Autowired
    private TargetingLocationRepository targetingLocationRepository;

    public Delivery createDelivery(Delivery delivery) {
        return deliveryRepository.save(delivery);
    }

    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    public Optional<Delivery> getDeliveryById(UUID id) {
        return deliveryRepository.findById(id);
    }

    public List<Delivery> getDeliveriesByTargetingLocationId(UUID targetingLocationId) {
        return deliveryRepository.findByTargetingLocationId(targetingLocationId);
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
     * 위치 기반 메시지 전송 시뮬레이션
     */
    public Delivery simulateLocationBasedDelivery(UUID targetingLocationId) {
        Optional<TargetingLocation> targetingLocation = targetingLocationRepository.findById(targetingLocationId);
        if (targetingLocation.isPresent()) {
            Delivery delivery = new Delivery();
            delivery.setTargetingLocation(targetingLocation.get());
            
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
