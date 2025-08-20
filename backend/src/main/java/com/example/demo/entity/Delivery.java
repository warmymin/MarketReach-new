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
        PENDING, SENT, FAILED
    }
    
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonBackReference("customer-deliveries")
    private Customer customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "targeting_location_id", nullable = true)
    @JsonBackReference("targeting-location-deliveries")
    private TargetingLocation targetingLocation;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status = DeliveryStatus.PENDING;
    
    @Column(name = "error_code")
    private String errorCode;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    

    
    // 생성자
    public Delivery() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Delivery(TargetingLocation targetingLocation) {
        this();
        this.targetingLocation = targetingLocation;
    }
    
    // Getter와 Setter
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public Customer getCustomer() {
        return customer;
    }
    
    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
    
    public TargetingLocation getTargetingLocation() {
        return targetingLocation;
    }
    
    public void setTargetingLocation(TargetingLocation targetingLocation) {
        this.targetingLocation = targetingLocation;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
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
    
    public LocalDateTime getSentAt() {
        return sentAt;
    }
    
    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    

    

    
    public void markAsSent() {
        this.status = DeliveryStatus.SENT;
        this.sentAt = LocalDateTime.now();
        this.errorCode = null;
    }
    
    public void markAsFailed(String errorCode) {
        this.status = DeliveryStatus.FAILED;
        this.errorCode = errorCode;
        this.sentAt = null;
    }
    
    @Override
    public String toString() {
        return "Delivery{" +
                "id=" + id +
                ", targetingLocation=" + (targetingLocation != null ? targetingLocation.getId() : "null") +
                ", status=" + status +
                ", errorCode='" + errorCode + '\'' +
                ", sentAt=" + sentAt +
                ", createdAt=" + createdAt +
                '}';
    }
}
