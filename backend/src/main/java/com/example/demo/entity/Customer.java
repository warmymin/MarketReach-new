package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.GenericGenerator;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "customers")
public class Customer {
    
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "uuid")
    private UUID id;
    
    @NotBlank(message = "고객명은 필수입니다.")
    @Column(nullable = false)
    private String name;
    
    @NotBlank(message = "전화번호는 필수입니다.")
    @Column(nullable = false)
    private String phone;
    
    @NotNull(message = "위도는 필수입니다.")
    @Column(nullable = false)
    private Double lat;
    
    @NotNull(message = "경도는 필수입니다.")
    @Column(nullable = false)
    private Double lng;
    
    @Column(name = "dong_code")
    private String dongCode;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    @JsonBackReference("company-customers")
    private Company company;
    
    @Transient
    private UUID companyId;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    

    
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QrEvent> qrEvents = new ArrayList<>();
    
    // 생성자
    public Customer() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Customer(String name, String phone, Double lat, Double lng, String dongCode) {
        this();
        this.name = name;
        this.phone = phone;
        this.lat = lat;
        this.lng = lng;
        this.dongCode = dongCode;
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
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public Double getLat() {
        return lat;
    }
    
    public void setLat(Double lat) {
        this.lat = lat;
    }
    
    public Double getLng() {
        return lng;
    }
    
    public void setLng(Double lng) {
        this.lng = lng;
    }
    
    public String getDongCode() {
        return dongCode;
    }
    
    public void setDongCode(String dongCode) {
        this.dongCode = dongCode;
    }
    
    public Company getCompany() {
        return company;
    }
    
    public void setCompany(Company company) {
        this.company = company;
    }
    
    public UUID getCompanyId() {
        return companyId;
    }
    
    public void setCompanyId(UUID companyId) {
        this.companyId = companyId;
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
        qrEvent.setCustomer(this);
    }
    
    @Override
    public String toString() {
        return "Customer{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", phone='" + phone + '\'' +
                ", lat=" + lat +
                ", lng=" + lng +
                ", dongCode='" + dongCode + '\'' +
                ", company=" + (company != null ? company.getName() : "null") +
                ", createdAt=" + createdAt +
                '}';
    }
}
