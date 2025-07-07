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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springboot.common.dto.ReportDTO;
import com.springboot.common.service.ReportService;

@WebMvcTest(ReportController.class)
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportService reportService;

    @Autowired
    private ObjectMapper objectMapper;

    private ReportDTO testReportDTO;
    private Map<String, Object> testDashboardStats;

    @BeforeEach
    void setUp() {
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
        testDashboardStats.put("availableSeats", 450);
        testDashboardStats.put("totalSeats", 500);
        testDashboardStats.put("occupancyRate", 10.0);
    }

    @Test
    void testRevenueByAirline_Success() throws Exception {
        // Arrange
        String airlineName = "Test Airlines";
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now().plusDays(7);
        
        when(reportService.revenueByAirline(airlineName, start, end))
            .thenReturn(Arrays.asList(testReportDTO));

        // Act & Assert
        mockMvc.perform(get("/api/reports/revenue")
                .param("airlineName", airlineName)
                .param("start", "2025-08-01T00:00:00")
                .param("end", "2025-08-15T23:59:59"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].airlineName").value("Test Airlines"))
                .andExpect(jsonPath("$[0].ticketsSold").value(10))
                .andExpect(jsonPath("$[0].totalRevenue").value(2999.90))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(reportService).revenueByAirline(airlineName, start, end);
    }

    @Test
    void testRevenueByAirline_EmptyResult() throws Exception {
        // Arrange
        String airlineName = "NonExistent Airlines";
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now().plusDays(7);
        
        when(reportService.revenueByAirline(airlineName, start, end))
            .thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/reports/revenue")
                .param("airlineName", airlineName)
                .param("start", "2025-08-01T00:00:00")
                .param("end", "2025-08-15T23:59:59"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(reportService).revenueByAirline(airlineName, start, end);
    }

    @Test
    void testRevenueByAirline_InvalidDateTime() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/reports/revenue")
                .param("airlineName", "Test Airlines")
                .param("start", "invalid-datetime")
                .param("end", "2025-08-15T23:59:59"))
                .andExpect(status().isBadRequest());

        verify(reportService, never()).revenueByAirline(anyString(), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    void testGetDashboardStats_Success() throws Exception {
        // Arrange
        when(reportService.getDashboardStats()).thenReturn(testDashboardStats);

        // Act & Assert
        mockMvc.perform(get("/api/reports/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalFlights").value(5))
                .andExpect(jsonPath("$.totalBookings").value(10))
                .andExpect(jsonPath("$.totalCustomers").value(8))
                .andExpect(jsonPath("$.totalRevenue").value(2999.90))
                .andExpect(jsonPath("$.availableSeats").value(450))
                .andExpect(jsonPath("$.totalSeats").value(500))
                .andExpect(jsonPath("$.occupancyRate").value(10.0));

        verify(reportService).getDashboardStats();
    }

    @Test
    void testGetDashboardStats_EmptyData() throws Exception {
        // Arrange
        Map<String, Object> emptyStats = new HashMap<>();
        emptyStats.put("totalFlights", 0);
        emptyStats.put("totalBookings", 0);
        emptyStats.put("totalCustomers", 0);
        emptyStats.put("totalRevenue", BigDecimal.ZERO);
        emptyStats.put("availableSeats", 0);
        emptyStats.put("totalSeats", 0);
        emptyStats.put("occupancyRate", 0.0);

        when(reportService.getDashboardStats()).thenReturn(emptyStats);

        // Act & Assert
        mockMvc.perform(get("/api/reports/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalFlights").value(0))
                .andExpect(jsonPath("$.totalBookings").value(0))
                .andExpect(jsonPath("$.totalRevenue").value(0));

        verify(reportService).getDashboardStats();
    }

    @Test
    void testGetBookingTrends_Success() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 8, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 15);
        
        when(reportService.getBookingTrends(startDate, endDate))
            .thenReturn(Arrays.asList(testReportDTO));

        // Act & Assert
        mockMvc.perform(get("/api/reports/booking-trends")
                .param("startDate", "2025-08-01")
                .param("endDate", "2025-08-15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].airlineName").value("Test Airlines"))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(reportService).getBookingTrends(startDate, endDate);
    }

    @Test
    void testGetBookingTrends_InvalidDate() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/reports/booking-trends")
                .param("startDate", "invalid-date")
                .param("endDate", "2025-08-15"))
                .andExpect(status().isBadRequest());

        verify(reportService, never()).getBookingTrends(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    void testGetAirlinePerformance_Success() throws Exception {
        // Arrange
        when(reportService.getAirlinePerformance())
            .thenReturn(Arrays.asList(testReportDTO));

        // Act & Assert
        mockMvc.perform(get("/api/reports/airline-performance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].airlineName").value("Test Airlines"))
                .andExpect(jsonPath("$[0].ticketsSold").value(10))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(reportService).getAirlinePerformance();
    }

    @Test
    void testGetAirlinePerformance_EmptyResult() throws Exception {
        // Arrange
        when(reportService.getAirlinePerformance())
            .thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/reports/airline-performance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(reportService).getAirlinePerformance();
    }

    @Test
    void testGetRevenueAnalysis_Success() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 8, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 15);
        
        Map<String, Object> revenueAnalysis = new HashMap<>();
        revenueAnalysis.put("totalRevenue", new BigDecimal("2999.90"));
        revenueAnalysis.put("totalBookings", 10);
        revenueAnalysis.put("averageBookingValue", new BigDecimal("299.99"));
        revenueAnalysis.put("revenueByAirline", Arrays.asList(testReportDTO));

        when(reportService.getRevenueAnalysis(startDate, endDate))
            .thenReturn(revenueAnalysis);

        // Act & Assert
        mockMvc.perform(get("/api/reports/revenue-analysis")
                .param("startDate", "2025-08-01")
                .param("endDate", "2025-08-15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue").value(2999.90))
                .andExpect(jsonPath("$.totalBookings").value(10))
                .andExpect(jsonPath("$.averageBookingValue").value(299.99))
                .andExpect(jsonPath("$.revenueByAirline").isArray());

        verify(reportService).getRevenueAnalysis(startDate, endDate);
    }

    @Test
    void testGetRevenueAnalysis_InvalidDate() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/reports/revenue-analysis")
                .param("startDate", "invalid-date")
                .param("endDate", "2025-08-15"))
                .andExpect(status().isBadRequest());

        verify(reportService, never()).getRevenueAnalysis(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    void testRevenueByAirline_MissingParameters() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/reports/revenue"))
                .andExpect(status().isBadRequest());

        verify(reportService, never()).revenueByAirline(anyString(), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    void testGetBookingTrends_MissingParameters() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/reports/booking-trends"))
                .andExpect(status().isBadRequest());

        verify(reportService, never()).getBookingTrends(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    void testGetRevenueAnalysis_MissingParameters() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/reports/revenue-analysis"))
                .andExpect(status().isBadRequest());

        verify(reportService, never()).getRevenueAnalysis(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    void testRevenueByAirline_ServiceException() throws Exception {
        // Arrange
        String airlineName = "Test Airlines";
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now().plusDays(7);
        
        when(reportService.revenueByAirline(airlineName, start, end))
            .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        mockMvc.perform(get("/api/reports/revenue")
                .param("airlineName", airlineName)
                .param("start", "2025-08-01T00:00:00")
                .param("end", "2025-08-15T23:59:59"))
                .andExpect(status().isInternalServerError());

        verify(reportService).revenueByAirline(airlineName, start, end);
    }

    @Test
    void testGetDashboardStats_ServiceException() throws Exception {
        // Arrange
        when(reportService.getDashboardStats())
            .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        mockMvc.perform(get("/api/reports/dashboard"))
                .andExpect(status().isInternalServerError());

        verify(reportService).getDashboardStats();
    }

    @Test
    void testGetBookingTrends_ServiceException() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 8, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 15);
        
        when(reportService.getBookingTrends(startDate, endDate))
            .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        mockMvc.perform(get("/api/reports/booking-trends")
                .param("startDate", "2025-08-01")
                .param("endDate", "2025-08-15"))
                .andExpect(status().isInternalServerError());

        verify(reportService).getBookingTrends(startDate, endDate);
    }

    @Test
    void testGetAirlinePerformance_ServiceException() throws Exception {
        // Arrange
        when(reportService.getAirlinePerformance())
            .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        mockMvc.perform(get("/api/reports/airline-performance"))
                .andExpect(status().isInternalServerError());

        verify(reportService).getAirlinePerformance();
    }

    @Test
    void testGetRevenueAnalysis_ServiceException() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 8, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 15);
        
        when(reportService.getRevenueAnalysis(startDate, endDate))
            .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        mockMvc.perform(get("/api/reports/revenue-analysis")
                .param("startDate", "2025-08-01")
                .param("endDate", "2025-08-15"))
                .andExpect(status().isInternalServerError());

        verify(reportService).getRevenueAnalysis(startDate, endDate);
    }
} 