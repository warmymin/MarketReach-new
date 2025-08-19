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
@Table(name = "targetings")
public class Targeting {
    
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    @JsonBackReference("campaign-targetings")
    private Campaign campaign;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonBackReference("customer-targetings")
    private Customer customer;
    
    @Column(name = "is_confirmed", nullable = false)
    private Boolean isConfirmed = false;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "targeting", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("targeting-deliveries")
    private List<Delivery> deliveries = new ArrayList<>();
    
    // 생성자
    public Targeting() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Targeting(Campaign campaign, Customer customer) {
        this();
        this.campaign = campaign;
        this.customer = customer;
    }
    
    // Getter와 Setter
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public Campaign getCampaign() {
        return campaign;
    }
    
    public void setCampaign(Campaign campaign) {
        this.campaign = campaign;
    }
    
    public Customer getCustomer() {
        return customer;
    }
    
    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
    
    public Boolean getIsConfirmed() {
        return isConfirmed;
    }
    
    public void setIsConfirmed(Boolean isConfirmed) {
        this.isConfirmed = isConfirmed;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<Delivery> getDeliveries() {
        return deliveries;
    }
    
    public void setDeliveries(List<Delivery> deliveries) {
        this.deliveries = deliveries;
    }
    
    // 편의 메서드
    public void addDelivery(Delivery delivery) {
        deliveries.add(delivery);
        delivery.setTargeting(this);
    }
    
    @Override
    public String toString() {
        return "Targeting{" +
                "id=" + id +
                ", campaign=" + (campaign != null ? campaign.getName() : "null") +
                ", customer=" + (customer != null ? customer.getName() : "null") +
                ", isConfirmed=" + isConfirmed +
                ", createdAt=" + createdAt +
                '}';
    }
}
