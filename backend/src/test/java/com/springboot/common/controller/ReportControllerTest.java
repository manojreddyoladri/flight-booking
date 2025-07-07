package com.springboot.common.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.springboot.common.dto.ReportDTO;
import com.springboot.common.service.ReportService;

@ExtendWith(MockitoExtension.class)
class ReportControllerTest {

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private ReportDTO testReportDTO;
    private Map<String, Object> testDashboardStats;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        mockMvc = MockMvcBuilders.standaloneSetup(reportController).build();

        testReportDTO = new ReportDTO();
        testReportDTO.setAirlineName("Test Airlines");
        testReportDTO.setTicketsSold(10);
        testReportDTO.setTotalRevenue(new BigDecimal("2999.90"));
        testReportDTO.setAveragePrice(new BigDecimal("299.99"));

        testDashboardStats = new HashMap<>();
        testDashboardStats.put("totalFlights", 5);
        testDashboardStats.put("totalBookings", 10);
        testDashboardStats.put("totalCustomers", 8);
        testDashboardStats.put("totalRevenue", new BigDecimal("2999.90"));
    }

    @Test
    void testGetDashboardStats_Success() throws Exception {
        // Arrange
        when(reportService.getDashboardStats()).thenReturn(testDashboardStats);

        // Act & Assert
        mockMvc.perform(get("/api/reports/dashboard"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(reportService).getDashboardStats();
    }

    @Test
    void testRevenueByAirline_Success() throws Exception {
        // Arrange
        String airlineName = "Test Airlines";
        LocalDateTime startDateTime = LocalDateTime.of(2025, 8, 1, 0, 0, 0);
        LocalDateTime endDateTime = LocalDateTime.of(2025, 8, 31, 23, 59, 59);
        
        when(reportService.revenueByAirline(airlineName, startDateTime, endDateTime))
                .thenReturn(Arrays.asList(testReportDTO));

        // Act & Assert
        mockMvc.perform(get("/api/reports/revenue")
                .param("airline", airlineName)
                .param("startDate", startDateTime.toLocalDate().toString())
                .param("endDate", endDateTime.toLocalDate().toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(reportService).revenueByAirline(airlineName, startDateTime, endDateTime);
    }

    @Test
    void testGetBookingTrends_Success() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 8, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 31);
        
        when(reportService.getBookingTrends(startDate, endDate))
                .thenReturn(Arrays.asList(testReportDTO));

        // Act & Assert
        mockMvc.perform(get("/api/reports/booking-trends")
                .param("startDate", startDate.toString())
                .param("endDate", endDate.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(reportService).getBookingTrends(startDate, endDate);
    }

    @Test
    void testGetAirlinePerformance_Success() throws Exception {
        // Arrange
        when(reportService.getAirlinePerformance())
                .thenReturn(Arrays.asList(testReportDTO));

        // Act & Assert
        mockMvc.perform(get("/api/reports/airline-performance"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(reportService).getAirlinePerformance();
    }

    @Test
    void testGetRevenueAnalysis_Success() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 8, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 31);
        
        Map<String, Object> revenueAnalysis = new HashMap<>();
        revenueAnalysis.put("totalRevenue", new BigDecimal("2999.90"));
        revenueAnalysis.put("totalBookings", 10);
        revenueAnalysis.put("averageBookingValue", new BigDecimal("299.99"));
        revenueAnalysis.put("revenueByAirline", Arrays.asList(testReportDTO));

        when(reportService.getRevenueAnalysis(startDate, endDate)).thenReturn(revenueAnalysis);

        // Act & Assert
        mockMvc.perform(get("/api/reports/revenue-analysis")
                .param("startDate", startDate.toString())
                .param("endDate", endDate.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(reportService).getRevenueAnalysis(startDate, endDate);
    }

    @Test
    void testRevenueByAirline_EmptyResult() throws Exception {
        // Arrange
        String airlineName = "NonExistent Airlines";
        LocalDateTime startDateTime = LocalDateTime.of(2025, 8, 1, 0, 0, 0);
        LocalDateTime endDateTime = LocalDateTime.of(2025, 8, 31, 23, 59, 59);
        
        when(reportService.revenueByAirline(airlineName, startDateTime, endDateTime))
                .thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/reports/revenue")
                .param("airline", airlineName)
                .param("startDate", startDateTime.toLocalDate().toString())
                .param("endDate", endDateTime.toLocalDate().toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(reportService).revenueByAirline(airlineName, startDateTime, endDateTime);
    }

    @Test
    void testGetBookingTrends_EmptyResult() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 8, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 31);
        
        when(reportService.getBookingTrends(startDate, endDate))
                .thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/reports/booking-trends")
                .param("startDate", startDate.toString())
                .param("endDate", endDate.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(reportService).getBookingTrends(startDate, endDate);
    }

    @Test
    void testGetDashboardStats_EmptyData() throws Exception {
        // Arrange
        Map<String, Object> emptyStats = new HashMap<>();
        emptyStats.put("totalFlights", 0);
        emptyStats.put("totalBookings", 0);
        emptyStats.put("totalCustomers", 0);
        emptyStats.put("totalRevenue", BigDecimal.ZERO);

        when(reportService.getDashboardStats()).thenReturn(emptyStats);

        // Act & Assert
        mockMvc.perform(get("/api/reports/dashboard"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(reportService).getDashboardStats();
    }
} 