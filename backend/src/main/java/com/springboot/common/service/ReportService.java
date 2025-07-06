package com.springboot.common.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.springboot.common.dto.ReportDTO;

public interface ReportService {
    List<ReportDTO> revenueByAirline(String airlineName, LocalDateTime start, LocalDateTime end);
    Map<String, Object> getDashboardStats();
    List<ReportDTO> getBookingTrends(LocalDate startDate, LocalDate endDate);
    List<ReportDTO> getAirlinePerformance();
    Map<String, Object> getRevenueAnalysis(LocalDate startDate, LocalDate endDate);
}
