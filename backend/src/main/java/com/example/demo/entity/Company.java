package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.GenericGenerator;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "companies")
public class Company {
    
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @NotBlank(message = "회사명은 필수입니다.")
    @Column(nullable = false)
    private String name;
    
    @Column
    private String industry;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("company-customers")
    private List<Customer> customers = new ArrayList<>();
    
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("company-campaigns")
    private List<Campaign> campaigns = new ArrayList<>();
    
    // 생성자
    public Company() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Company(String name, String industry) {
        this();
        this.name = name;
        this.industry = industry;
    }
    
    // Getter와 Setter
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getIndustry() {
        return industry;
    }
    
    public void setIndustry(String industry) {
        this.industry = industry;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<Customer> getCustomers() {
        return customers;
    }
    
    public void setCustomers(List<Customer> customers) {
        this.customers = customers;
    }
    
    public List<Campaign> getCampaigns() {
        return campaigns;
    }
    
    public void setCampaigns(List<Campaign> campaigns) {
        this.campaigns = campaigns;
    }
    
    // 편의 메서드
    public void addCustomer(Customer customer) {
        customers.add(customer);
        customer.setCompany(this);
    }
    
    public void addCampaign(Campaign campaign) {
        campaigns.add(campaign);
        campaign.setCompany(this);
    }
    
    @Override
    public String toString() {
        return "Company{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", industry='" + industry + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
