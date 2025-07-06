package com.springboot.common.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.springboot.common.dto.FlightDTO;
import com.springboot.common.model.Flight;
import com.springboot.common.repository.FlightRepository;

@Service
public class FlightServiceImpl implements FlightService {
    private final FlightRepository repo;
    public FlightServiceImpl(FlightRepository repo) { this.repo = repo; }

    @Override
    public FlightDTO addFlight(FlightDTO dto) {
        Flight f = new Flight(dto.getAirlineName(), dto.getTotalSeats(), dto.getFlightDate(), dto.getPrice());
        f = repo.save(f);
        return new FlightDTO(f.getId(), f.getAirlineName(), f.getTotalSeats(), f.getAvailableSeats(), f.getFlightDate(), f.getPrice());
    }

    @Override
    public List<FlightDTO> listAll() {
        return repo.findAll().stream()
            .map(f -> new FlightDTO(f.getId(), f.getAirlineName(), f.getTotalSeats(), f.getAvailableSeats(), f.getFlightDate(), f.getPrice()))
            .collect(Collectors.toList());
    }

    @Override
    public List<FlightDTO> getFlightsByDate(LocalDate date) {
        return repo.findByFlightDate(date).stream()
            .map(f -> new FlightDTO(f.getId(), f.getAirlineName(), f.getTotalSeats(), f.getAvailableSeats(), f.getFlightDate(), f.getPrice()))
            .collect(Collectors.toList());
    }

    @Override
    public List<FlightDTO> getFutureFlights(LocalDate fromDate) {
        return repo.findByFlightDateGreaterThanEqual(fromDate).stream()
            .map(f -> new FlightDTO(f.getId(), f.getAirlineName(), f.getTotalSeats(), f.getAvailableSeats(), f.getFlightDate(), f.getPrice()))
            .collect(Collectors.toList());
    }

    @Override
    public FlightDTO updateFlight(Long id, FlightDTO dto) {
        Flight flight = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Flight not found"));
        
        flight.setAirlineName(dto.getAirlineName());
        flight.setTotalSeats(dto.getTotalSeats());
        flight.setFlightDate(dto.getFlightDate());
        flight.setPrice(dto.getPrice());
        
        flight = repo.save(flight);
        return new FlightDTO(flight.getId(), flight.getAirlineName(), flight.getTotalSeats(), flight.getAvailableSeats(), flight.getFlightDate(), flight.getPrice());
    }

    @Override
    public void deleteFlight(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Flight not found");
        }
        repo.deleteById(id);
    }

    @Override
    public int checkAvailability(Long flightId) {
        Flight f = repo.findById(flightId)
            .orElseThrow(() -> new RuntimeException("Flight not found"));
        return f.getAvailableSeats();
    }
}
