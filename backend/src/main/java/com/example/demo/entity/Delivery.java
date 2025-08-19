package com.example.demo.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "deliveries")
public class Delivery {
    
    public enum DeliveryStatus {
        SUCCESS, FAIL, PENDING
    }
    
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "targeting_id", nullable = false)
    @JsonBackReference("targeting-deliveries")
    private Targeting targeting;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status = DeliveryStatus.PENDING;
    
    @Column(name = "error_code")
    private String errorCode;
    
    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "delivery", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("delivery-qrevents")
    private List<QrEvent> qrEvents = new ArrayList<>();
    
    // 생성자
    public Delivery() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Delivery(Targeting targeting) {
        this();
        this.targeting = targeting;
    }
    
    // Getter와 Setter
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public Targeting getTargeting() {
        return targeting;
    }
    
    public void setTargeting(Targeting targeting) {
        this.targeting = targeting;
    }
    
    public DeliveryStatus getStatus() {
        return status;
    }
    
    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
    
    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }
    
    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<QrEvent> getQrEvents() {
        return qrEvents;
    }
    
    public void setQrEvents(List<QrEvent> qrEvents) {
        this.qrEvents = qrEvents;
    }
    
    // 편의 메서드
    public void addQrEvent(QrEvent qrEvent) {
        qrEvents.add(qrEvent);
        qrEvent.setDelivery(this);
    }
    
    public void markAsSuccess() {
        this.status = DeliveryStatus.SUCCESS;
        this.deliveredAt = LocalDateTime.now();
        this.errorCode = null;
    }
    
    public void markAsFailed(String errorCode) {
        this.status = DeliveryStatus.FAIL;
        this.errorCode = errorCode;
        this.deliveredAt = null;
    }
    
    @Override
    public String toString() {
        return "Delivery{" +
                "id=" + id +
                ", targeting=" + (targeting != null ? targeting.getId() : "null") +
                ", status=" + status +
                ", errorCode='" + errorCode + '\'' +
                ", deliveredAt=" + deliveredAt +
                ", createdAt=" + createdAt +
                '}';
    }
}
