package com.springboot.common.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.common.dto.ReportDTO;
import com.springboot.common.service.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService service;
    public ReportController(ReportService service) { this.service = service; }

    @GetMapping("/revenue")
    public ResponseEntity<List<ReportDTO>> revenue(
            @RequestParam String airline,
            @RequestParam String start,
            @RequestParam String end) {
        LocalDateTime s = LocalDateTime.parse(start);
        LocalDateTime e = LocalDateTime.parse(end);
        return ResponseEntity.ok(service.revenueByAirline(airline, s, e));
    }
}
