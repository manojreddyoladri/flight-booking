package com.springboot.common.service;

import java.time.LocalDateTime;
import java.util.List;

import com.springboot.common.dto.ReportDTO;

public interface ReportService {
    List<ReportDTO> revenueByAirline(String airlineName, LocalDateTime start, LocalDateTime end);
}
