package com.springboot.common.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/by-date")
    public ResponseEntity<List<FlightDTO>> getByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getFlightsByDate(date));
    }

    @GetMapping("/future")
    public ResponseEntity<List<FlightDTO>> getFutureFlights(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate) {
        return ResponseEntity.ok(service.getFutureFlights(fromDate));
    }

    @GetMapping("/future-today")
    public ResponseEntity<List<FlightDTO>> getFutureFlightsToday() {
        return ResponseEntity.ok(service.getFutureFlights(java.time.LocalDate.now()));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<Integer> availability(@PathVariable Long id) {
        return ResponseEntity.ok(service.checkAvailability(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlightDTO> update(@PathVariable Long id, @RequestBody FlightDTO dto) {
        return ResponseEntity.ok(service.updateFlight(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteFlight(id);
        return ResponseEntity.noContent().build();
    }
}