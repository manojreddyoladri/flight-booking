package com.springboot.common.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springboot.common.dto.FlightDTO;
import com.springboot.common.service.FlightService;

@RestController
@RequestMapping("/api/flights")
public class FlightController {
    private final FlightService service;
    public FlightController(FlightService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<FlightDTO> add(@RequestBody FlightDTO dto) {
        return ResponseEntity.ok(service.addFlight(dto));
    }

    @GetMapping
    public ResponseEntity<List<FlightDTO>> all() {
        return ResponseEntity.ok(service.listAll());
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<Integer> availability(@PathVariable Long id) {
        return ResponseEntity.ok(service.checkAvailability(id));
    }
}