package com.example.demo.controller;

import com.example.demo.entity.Campaign;
import com.example.demo.entity.Company;
import com.example.demo.entity.Targeting;
import com.example.demo.entity.Customer;
import com.example.demo.entity.Delivery;
import com.example.demo.service.CampaignService;
import com.example.demo.service.CompanyService;
import com.example.demo.service.TargetingService;
import com.example.demo.service.CustomerService;
import com.example.demo.service.DeliveryService;
import com.example.demo.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;
import com.example.demo.repository.CompanyRepository;
import com.example.demo.repository.CampaignRepository;
import java.util.Arrays;
import com.example.demo.repository.TargetingRepository;
import com.example.demo.repository.DeliveryRepository;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private CampaignService campaignService;
    
    @Autowired
    private CompanyService companyService;
    
    @Autowired
    private TargetingService targetingService;
    
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private DeliveryService deliveryService;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private CompanyRepository companyRepository;
    
    @Autowired
    private CampaignRepository campaignRepository;
    
    @Autowired
    private TargetingRepository targetingRepository;
    
    @Autowired
    private DeliveryRepository deliveryRepository;

    @PostMapping("/echo")
    public Map<String, Object> echo(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "JSON 데이터가 성공적으로 수신되었습니다.");
        response.put("received", data);
        return response;
    }

    @PostMapping("/simple")
    public Map<String, Object> simple(@RequestBody String data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "문자열 데이터가 성공적으로 수신되었습니다.");
        response.put("received", data);
        return response;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "테스트 컨트롤러가 정상 작동합니다.");
        return response;
    }

    /**
     * 간단한 캠페인 생성 테스트
     */
    @PostMapping("/create-campaign")
    public Map<String, Object> createSimpleCampaign(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "캠페인 생성 요청이 성공적으로 수신되었습니다.");
        response.put("received", data);
        return response;
    }

    /**
     * 실제 캠페인 생성 테스트
     */
    @PostMapping("/create-real-campaign")
    public Map<String, Object> createRealCampaign(@RequestBody Map<String, Object> data) {
        try {
            // Campaign 엔티티 생성
            Campaign campaign = new Campaign();
            campaign.setName((String) data.get("name"));
            campaign.setMessage((String) data.get("message"));
            campaign.setLat(((Number) data.get("lat")).doubleValue());
            campaign.setLng(((Number) data.get("lng")).doubleValue());
            campaign.setRadius(((Number) data.get("radius")).intValue());
            
            // scheduled_at 파싱
            if (data.get("scheduled_at") != null) {
                String scheduledAtStr = (String) data.get("scheduled_at");
                LocalDateTime scheduledAt = LocalDateTime.parse(scheduledAtStr.replace("Z", ""));
                campaign.setScheduledAt(scheduledAt);
            }
            
            // company_id 설정 및 Company 객체 연결
            if (data.get("company_id") != null) {
                UUID companyId = UUID.fromString((String) data.get("company_id"));
                Optional<Company> company = companyService.getCompanyById(companyId);
                if (company.isPresent()) {
                    campaign.setCompany(company.get());
                } else {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "회사를 찾을 수 없습니다.");
                    return response;
                }
            }
            
            // 데이터베이스에 저장
            Campaign savedCampaign = campaignService.createCampaign(campaign);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "캠페인이 성공적으로 생성되었습니다.");
            response.put("campaign", savedCampaign);
            return response;
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "캠페인 생성 중 오류가 발생했습니다: " + e.getMessage());
            return response;
        }
    }

    /**
     * 간단한 타겟팅 생성 테스트
     */
    @PostMapping("/create-targeting")
    public Map<String, Object> createSimpleTargeting(@RequestBody Map<String, Object> data) {
        try {
            String campaignIdStr = (String) data.get("campaign_id");
            String customerIdStr = (String) data.get("customer_id");
            
            if (campaignIdStr == null || customerIdStr == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "campaign_id와 customer_id가 필요합니다.");
                return response;
            }
            
            UUID campaignId = UUID.fromString(campaignIdStr);
            UUID customerId = UUID.fromString(customerIdStr);
            
            // Campaign과 Customer 조회
            Optional<Campaign> campaign = campaignService.getCampaignById(campaignId);
            Optional<Customer> customer = customerService.getCustomerById(customerId);
            
            if (!campaign.isPresent() || !customer.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "캠페인 또는 고객을 찾을 수 없습니다.");
                return response;
            }
            
            // Targeting 생성
            Targeting targeting = new Targeting();
            targeting.setCampaign(campaign.get());
            targeting.setCustomer(customer.get());
            targeting.setIsConfirmed(false);
            
            Targeting savedTargeting = targetingService.createTargeting(targeting);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "타겟팅이 성공적으로 생성되었습니다.");
            response.put("targeting", savedTargeting);
            return response;
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "타겟팅 생성 중 오류가 발생했습니다: " + e.getMessage());
            return response;
        }
    }

    /**
     * 간단한 회사 생성 테스트
     */
    @PostMapping("/create-company")
    public Map<String, Object> createSimpleCompany(@RequestBody Map<String, Object> data) {
        try {
            String name = (String) data.get("name");
            String industry = (String) data.get("industry");
            
            if (name == null || industry == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "name과 industry가 필요합니다.");
                return response;
            }
            
            Company company = new Company();
            company.setName(name);
            company.setIndustry(industry);
            
            Company savedCompany = companyService.createCompany(company);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "회사가 성공적으로 생성되었습니다.");
            response.put("company", savedCompany);
            return response;
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "회사 생성 중 오류가 발생했습니다: " + e.getMessage());
            return response;
        }
    }

    /**
     * 강남역 근처 고객 추가 테스트
     */
    @PostMapping("/add-gangnam-customer")
    public Map<String, Object> addGangnamCustomer(@RequestBody Map<String, Object> data) {
        try {
            String companyIdStr = (String) data.get("company_id");
            
            if (companyIdStr == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "company_id가 필요합니다.");
                return response;
            }
            
            UUID companyId = UUID.fromString(companyIdStr);
            
            // Company 조회
            Optional<Company> company = companyService.getCompanyById(companyId);
            if (!company.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "회사를 찾을 수 없습니다.");
                return response;
            }
            
            // 강남역 근처 고객 생성
            Customer customer = new Customer();
            customer.setName("강남역 고객");
            customer.setPhone("010-1234-5678");
            customer.setLat(37.498); // 강남역 위도
            customer.setLng(127.027); // 강남역 경도
            customer.setDongCode("1168051000"); // 강남구 강남대로
            customer.setCompany(company.get());
            
            Customer savedCustomer = customerService.createCustomer(customer);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "강남역 근처 고객이 성공적으로 생성되었습니다.");
            response.put("customer", savedCustomer);
            return response;
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "고객 생성 중 오류가 발생했습니다: " + e.getMessage());
            return response;
        }
    }

    /**
     * 간단한 타겟팅 생성 (캠페인 반경 내 고객 자동 찾기)
     */
    @PostMapping("/create-targeting-simple")
    public Map<String, Object> createTargetingSimple(@RequestBody Map<String, Object> data) {
        try {
            String campaignIdStr = (String) data.get("campaign_id");
            
            if (campaignIdStr == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "campaign_id가 필요합니다.");
                return response;
            }
            
            UUID campaignId = UUID.fromString(campaignIdStr);
            
            // Campaign 조회
            Optional<Campaign> campaign = campaignService.getCampaignById(campaignId);
            if (!campaign.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "캠페인을 찾을 수 없습니다.");
                return response;
            }
            
            Campaign c = campaign.get();
            
            // 회사 ID 가져오기 (Company 객체에서 가져오기)
            if (c.getCompany() == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "캠페인의 회사 정보가 없습니다.");
                return response;
            }
            UUID companyId = c.getCompany().getId();
            
            // 반경 내 고객 찾기
            List<Object[]> customersInRadius = customerRepository.findCustomersWithinRadius(
                c.getLat(), c.getLng(), c.getRadius(), companyId
            );
            
            List<Targeting> targetings = new ArrayList<>();
            for (Object[] result : customersInRadius) {
                UUID customerId = (UUID) result[0];
                Optional<Customer> customer = customerService.getCustomerById(customerId);
                
                if (customer.isPresent()) {
                    Targeting targeting = new Targeting();
                    targeting.setCampaign(c);
                    targeting.setCustomer(customer.get());
                    targeting.setIsConfirmed(false);
                    targetings.add(targetingService.createTargeting(targeting));
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "타겟팅이 성공적으로 생성되었습니다.");
            response.put("targetings", targetings);
            response.put("totalTargetings", targetings.size());
            return response;
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "타겟팅 생성 중 오류가 발생했습니다: " + e.getMessage());
            return response;
        }
    }

    /**
     * 배송 시뮬레이션 테스트
     */
    @PostMapping("/simulate-delivery")
    public Map<String, Object> simulateDelivery(@RequestBody Map<String, Object> data) {
        try {
            String targetingIdStr = (String) data.get("targeting_id");
            
            if (targetingIdStr == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "targeting_id가 필요합니다.");
                return response;
            }
            
            UUID targetingId = UUID.fromString(targetingIdStr);
            
            // Spring의 의존성 주입된 DeliveryService 사용
            Delivery delivery = deliveryService.simulateMessageDelivery(targetingId);
            
            if (delivery != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "배송 시뮬레이션이 완료되었습니다.");
                response.put("delivery", delivery);
                return response;
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "타겟팅을 찾을 수 없습니다.");
                return response;
            }
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "배송 시뮬레이션 중 오류가 발생했습니다: " + e.getMessage());
            return response;
        }
    }

    /**
     * 모든 고객의 회사 ID 업데이트
     */
    @PostMapping("/update-customers-company")
    public Map<String, Object> updateCustomersCompany(@RequestBody Map<String, Object> data) {
        try {
            String companyIdStr = (String) data.get("companyId");
            
            if (companyIdStr == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "companyId가 필요합니다.");
                return response;
            }
            
            UUID companyId = UUID.fromString(companyIdStr);
            
            // Company 조회
            Optional<Company> company = companyService.getCompanyById(companyId);
            if (!company.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "회사를 찾을 수 없습니다.");
                return response;
            }
            
            // 모든 고객 조회
            List<Customer> customers = customerService.getAllCustomers();
            int updatedCount = 0;
            
            for (Customer customer : customers) {
                customer.setCompany(company.get());
                customerService.updateCustomer(customer);
                updatedCount++;
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", updatedCount + "명의 고객 회사 정보가 업데이트되었습니다.");
            response.put("updatedCount", updatedCount);
            return response;
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "고객 회사 정보 업데이트 중 오류가 발생했습니다: " + e.getMessage());
            return response;
        }
    }

    /**
     * 샘플 데이터 생성 API
     */
    @PostMapping("/create-sample-data")
    public Map<String, Object> createSampleData() {
        try {
            // 이미 데이터가 있으면 스킵
            if (companyRepository.count() > 0) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "이미 샘플 데이터가 존재합니다.");
                response.put("companies", companyRepository.count());
                response.put("campaigns", campaignRepository.count());
                return response;
            }

            // 회사 데이터 생성
            Company ktCompany = new Company();
            ktCompany.setName("KT 마케팅");
            ktCompany.setIndustry("IT");
            ktCompany = companyRepository.save(ktCompany);

            Company starbucksCompany = new Company();
            starbucksCompany.setName("스타벅스");
            starbucksCompany.setIndustry("음식점");
            starbucksCompany = companyRepository.save(starbucksCompany);

            Company oliveCompany = new Company();
            oliveCompany.setName("올리브영");
            oliveCompany.setIndustry("화장품");
            oliveCompany = companyRepository.save(oliveCompany);

            // 캠페인 데이터 생성
            createSampleCampaign(ktCompany, "여름 할인 이벤트", "시원한 여름! 전메뉴 20% 할인 이벤트! 지금 바로 방문하세요!", 37.5665, 126.9780, 2000, LocalDateTime.now().plusDays(5));
            createSampleCampaign(ktCompany, "신메뉴 론칭", "새로운 시그니처 버거 출시! 첫 주문 무료배송 혜택까지!", 37.5665, 126.9780, 1500, LocalDateTime.now().plusDays(10));
            createSampleCampaign(ktCompany, "주말 특가 행사", "주말 한정! 모든 상품 30% 할인! 놓치면 후회할 기회!", 37.5665, 126.9780, 3000, LocalDateTime.now().plusDays(15));

            createSampleCampaign(starbucksCompany, "아메리카노 1+1", "아메리카노 1+1 이벤트! 친구와 함께 방문하세요!", 37.5665, 126.9780, 1000, LocalDateTime.now().plusDays(3));
            createSampleCampaign(starbucksCompany, "새로운 시즌 메뉴", "가을 시즌 한정 메뉴 출시! 먼저 맛보세요!", 37.5665, 126.9780, 1200, LocalDateTime.now().plusDays(8));

            createSampleCampaign(oliveCompany, "뷰티 상품 할인", "뷰티 상품 50% 할인! 아름다워지세요!", 37.5665, 126.9780, 800, LocalDateTime.now().plusDays(2));
            createSampleCampaign(oliveCompany, "화장품 세트 증정", "3만원 이상 구매시 화장품 세트 증정!", 37.5665, 126.9780, 1000, LocalDateTime.now().plusDays(7));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "샘플 데이터 생성 완료!");
            response.put("companies", companyRepository.count());
            response.put("campaigns", campaignRepository.count());

            return response;
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "샘플 데이터 생성 실패: " + e.getMessage());
            return response;
        }
    }

    /**
     * 종합 더미 데이터 생성 API
     */
    @PostMapping("/create-dummy-data")
    public Map<String, Object> createDummyData() {
        try {
            Map<String, Object> response = new HashMap<>();
            
            // 1. 회사 데이터 생성
            Company ktCompany = createCompanyIfNotExists("KT 마케팅", "IT");
            Company starbucksCompany = createCompanyIfNotExists("스타벅스", "음식점");
            Company oliveCompany = createCompanyIfNotExists("올리브영", "화장품");
            
            // 2. 고객 데이터 생성
            List<Customer> customers = createDummyCustomers(Arrays.asList(ktCompany, starbucksCompany, oliveCompany));
            
            // 3. 캠페인 데이터 생성
            List<Campaign> campaigns = createDummyCampaigns(Arrays.asList(ktCompany, starbucksCompany, oliveCompany));
            
            // 4. 타겟팅 데이터 생성
            List<Targeting> targetings = createDummyTargetings(campaigns, customers);
            
            // 5. 배송 데이터 생성
            List<Delivery> deliveries = createDummyDeliveries(targetings);
            
            response.put("success", true);
            response.put("message", "더미 데이터 생성 완료!");
            response.put("companies", companyRepository.count());
            response.put("customers", customerRepository.count());
            response.put("campaigns", campaignRepository.count());
            response.put("targetings", targetingRepository.count());
            response.put("deliveries", deliveryRepository.count());
            
            return response;
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "더미 데이터 생성 실패: " + e.getMessage());
            return response;
        }
    }

    private void createSampleCampaign(Company company, String name, String message, double lat, double lng, int radius, LocalDateTime scheduledAt) {
        Campaign campaign = new Campaign();
        campaign.setName(name);
        campaign.setMessage(message);
        campaign.setLat(lat);
        campaign.setLng(lng);
        campaign.setRadius(radius);
        campaign.setScheduledAt(scheduledAt);
        campaign.setCompany(company);
        campaignRepository.save(campaign);
    }

    private Company createCompanyIfNotExists(String name, String industry) {
        List<Company> existingCompanies = companyService.getAllCompanies();
        for (Company company : existingCompanies) {
            if (company.getName().equals(name)) {
                return company;
            }
        }
        
        Company company = new Company();
        company.setName(name);
        company.setIndustry(industry);
        return companyService.createCompany(company);
    }

    private List<Customer> createDummyCustomers(List<Company> companies) {
        List<Customer> customers = new ArrayList<>();
        String[] koreanNames = {
            "김철수", "이영희", "박민수", "정수진", "최동욱", "한미영", "송태호", "윤지영", "강현우", "임서연",
            "조성민", "백지원", "오승호", "신혜진", "유재석", "전지현", "남궁민", "서예진", "권지용", "배수지",
            "홍길동", "김영수", "이미라", "박준호", "정다은", "최민호", "한소희", "송중기", "윤아", "강동원"
        };
        
        String[] dongCodes = {
            "1168051000", "1168052000", "1168053000", "1168054000", "1168055000",
            "1144066000", "1144067000", "1144068000", "1144069000", "1144070000"
        };
        
        for (int i = 0; i < 30; i++) {
            Customer customer = new Customer();
            customer.setName(koreanNames[i % koreanNames.length]);
            customer.setPhone("010-" + String.format("%04d", (int)(Math.random() * 10000)) + "-" + String.format("%04d", (int)(Math.random() * 10000)));
            
            // 서울 지역 랜덤 좌표
            double lat = 37.48 + (Math.random() * 0.15); // 37.48 ~ 37.63
            double lng = 126.90 + (Math.random() * 0.20); // 126.90 ~ 127.10
            customer.setLat(lat);
            customer.setLng(lng);
            customer.setDongCode(dongCodes[i % dongCodes.length]);
            customer.setCompany(companies.get(i % companies.size()));
            
            customers.add(customerService.createCustomer(customer));
        }
        
        return customers;
    }

    private List<Campaign> createDummyCampaigns(List<Company> companies) {
        List<Campaign> campaigns = new ArrayList<>();
        
        // KT 마케팅 캠페인
        campaigns.add(createCampaign(companies.get(0), "여름 할인 이벤트", "시원한 여름! 전메뉴 20% 할인 이벤트! 지금 바로 방문하세요!", 37.5665, 126.9780, 2000, 5));
        campaigns.add(createCampaign(companies.get(0), "신메뉴 론칭", "새로운 시그니처 버거 출시! 첫 주문 무료배송 혜택까지!", 37.5665, 126.9780, 1500, 10));
        campaigns.add(createCampaign(companies.get(0), "주말 특가 행사", "주말 한정! 모든 상품 30% 할인! 놓치면 후회할 기회!", 37.5665, 126.9780, 3000, 15));
        
        // 스타벅스 캠페인
        campaigns.add(createCampaign(companies.get(1), "아메리카노 1+1", "아메리카노 1+1 이벤트! 친구와 함께 방문하세요!", 37.5665, 126.9780, 1000, 3));
        campaigns.add(createCampaign(companies.get(1), "새로운 시즌 메뉴", "가을 시즌 한정 메뉴 출시! 먼저 맛보세요!", 37.5665, 126.9780, 1200, 8));
        
        // 올리브영 캠페인
        campaigns.add(createCampaign(companies.get(2), "뷰티 상품 할인", "뷰티 상품 50% 할인! 아름다워지세요!", 37.5665, 126.9780, 800, 2));
        campaigns.add(createCampaign(companies.get(2), "화장품 세트 증정", "3만원 이상 구매시 화장품 세트 증정!", 37.5665, 126.9780, 1000, 7));
        
        return campaigns;
    }

    private Campaign createCampaign(Company company, String name, String message, double lat, double lng, int radius, int daysFromNow) {
        Campaign campaign = new Campaign();
        campaign.setName(name);
        campaign.setMessage(message);
        campaign.setLat(lat);
        campaign.setLng(lng);
        campaign.setRadius(radius);
        campaign.setScheduledAt(LocalDateTime.now().plusDays(daysFromNow));
        campaign.setCompany(company);
        return campaignService.createCampaign(campaign);
    }

    private List<Targeting> createDummyTargetings(List<Campaign> campaigns, List<Customer> customers) {
        List<Targeting> targetings = new ArrayList<>();
        
        for (Campaign campaign : campaigns) {
            // 각 캠페인마다 3-8명의 고객을 타겟팅
            int targetCount = 3 + (int)(Math.random() * 6);
            for (int i = 0; i < targetCount && i < customers.size(); i++) {
                Customer customer = customers.get((int)(Math.random() * customers.size()));
                
                Targeting targeting = new Targeting();
                targeting.setCampaign(campaign);
                targeting.setCustomer(customer);
                targeting.setIsConfirmed(Math.random() > 0.3); // 70% 확률로 확인됨
                
                targetings.add(targetingService.createTargeting(targeting));
            }
        }
        
        return targetings;
    }

    private List<Delivery> createDummyDeliveries(List<Targeting> targetings) {
        List<Delivery> deliveries = new ArrayList<>();
        String[] statuses = {"success", "fail", "pending"};
        
        for (Targeting targeting : targetings) {
            Delivery delivery = new Delivery();
            delivery.setTargeting(targeting);
            
            // 상태 분포: 70% 성공, 20% 실패, 10% 대기
            double rand = Math.random();
            if (rand < 0.7) {
                delivery.setStatus(Delivery.DeliveryStatus.SUCCESS);
                delivery.setDeliveredAt(LocalDateTime.now().minusMinutes((long)(Math.random() * 60)));
            } else if (rand < 0.9) {
                delivery.setStatus(Delivery.DeliveryStatus.FAIL);
                delivery.setErrorCode("NETWORK_ERROR");
            } else {
                delivery.setStatus(Delivery.DeliveryStatus.PENDING);
            }
            
            deliveries.add(deliveryService.createDelivery(delivery));
        }
        
        return deliveries;
    }
}
