package com.springboot.common.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.springboot.common.dto.ReportDTO;
import com.springboot.common.model.Booking;
import com.springboot.common.model.Customer;
import com.springboot.common.model.Flight;
import com.springboot.common.repository.BookingRepository;
import com.springboot.common.repository.CustomerRepository;
import com.springboot.common.repository.FlightRepository;

@Service
public class ReportServiceImpl implements ReportService {
    private final BookingRepository bookingRepo;
    private final CustomerRepository customerRepo;
    private final FlightRepository flightRepo;
    
    public ReportServiceImpl(BookingRepository bookingRepo, CustomerRepository customerRepo, FlightRepository flightRepo) { 
        this.bookingRepo = bookingRepo; 
        this.customerRepo = customerRepo;
        this.flightRepo = flightRepo;
    }

    @Override
    public List<ReportDTO> revenueByAirline(String airline, LocalDateTime start, LocalDateTime end) {
        List<Booking> bookings = bookingRepo.findByFlightAirlineNameAndBookingDateBetween(airline, start, end);
        
        if (bookings.isEmpty()) {
            // Return empty result if no bookings found
            return List.of();
        }
        
        return bookings.stream()
            .collect(Collectors.groupingBy(
                b -> b.getFlight().getAirlineName(),
                Collectors.collectingAndThen(Collectors.toList(), list -> {
                    // Count unique flights
                    long uniqueFlights = list.stream()
                        .map(b -> b.getFlight().getId())
                        .distinct()
                        .count();
                    
                    // Count total seats booked
                    long totalSeatsBooked = list.size();
                    
                    BigDecimal totalRevenue = list.stream()
                        .map(b -> b.getPrice())
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    BigDecimal avgPrice = totalSeatsBooked > 0
                        ? totalRevenue.divide(BigDecimal.valueOf(totalSeatsBooked), RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;
                    
                    // Use uniqueFlights for the first parameter (representing number of flights)
                    return new ReportDTO(airline, uniqueFlights, totalRevenue, avgPrice);
                })
            ))
            .values()
            .stream().collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get only future flights for active flights count
        List<Flight> futureFlights = flightRepo.findByFlightDateGreaterThanEqual(LocalDate.now());
        List<Flight> allFlights = flightRepo.findAll();
        List<Booking> bookings = bookingRepo.findAll();
        List<Customer> customers = customerRepo.findAll();
        
        stats.put("totalFlights", futureFlights.size()); // Only future flights as active
        stats.put("totalBookings", bookings.size());
        stats.put("totalCustomers", customers.size());
        stats.put("totalRevenue", bookings.stream()
            .map(Booking::getPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
        stats.put("availableSeats", futureFlights.stream()
            .mapToInt(Flight::getAvailableSeats)
            .sum());
        stats.put("totalSeats", futureFlights.stream()
            .mapToInt(Flight::getTotalSeats)
            .sum());
        stats.put("occupancyRate", calculateOccupancyRate(futureFlights));
        
        return stats;
    }

    @Override
    public List<ReportDTO> getBookingTrends(LocalDate startDate, LocalDate endDate) {
        return bookingRepo.findAll().stream()
            .filter(booking -> {
                LocalDate bookingDate = booking.getBookingDate().toLocalDate();
                return !bookingDate.isBefore(startDate) && !bookingDate.isAfter(endDate);
            })
            .collect(Collectors.groupingBy(
                b -> b.getBookingDate().toLocalDate(),
                Collectors.collectingAndThen(Collectors.toList(), list -> {
                    long count = list.size();
                    BigDecimal revenue = list.stream()
                        .map(Booking::getPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new ReportDTO("Daily", count, revenue, BigDecimal.ZERO);
                })
            ))
            .values()
            .stream()
            .sorted((a, b) -> a.getAirlineName().compareTo(b.getAirlineName()))
            .collect(Collectors.toList());
    }

    @Override
    public List<ReportDTO> getAirlinePerformance() {
        return flightRepo.findByFlightDateGreaterThanEqual(LocalDate.now()).stream()
            .collect(Collectors.groupingBy(
                Flight::getAirlineName,
                Collectors.collectingAndThen(Collectors.toList(), flights -> {
                    int totalSeats = flights.stream().mapToInt(Flight::getTotalSeats).sum();
                    int bookedSeats = flights.stream().mapToInt(Flight::getBookedSeats).sum();
                    
                    BigDecimal avgPrice;
                    if (flights.isEmpty()) {
                        avgPrice = BigDecimal.ZERO;
                    } else {
                        avgPrice = flights.stream()
                            .map(Flight::getPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .divide(BigDecimal.valueOf(flights.size()), RoundingMode.HALF_UP);
                    }
                    
                    return new ReportDTO(
                        flights.get(0).getAirlineName(),
                        bookedSeats,
                        avgPrice.multiply(BigDecimal.valueOf(bookedSeats)),
                        avgPrice
                    );
                })
            ))
            .values()
            .stream()
            .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getRevenueAnalysis(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> analysis = new HashMap<>();
        
        List<Booking> bookings = bookingRepo.findAll().stream()
            .filter(booking -> {
                LocalDate bookingDate = booking.getBookingDate().toLocalDate();
                return !bookingDate.isBefore(startDate) && !bookingDate.isAfter(endDate);
            })
            .collect(Collectors.toList());
        
        BigDecimal totalRevenue = bookings.stream()
            .map(Booking::getPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal avgBookingValue = bookings.isEmpty() ? BigDecimal.ZERO :
            totalRevenue.divide(BigDecimal.valueOf(bookings.size()), RoundingMode.HALF_UP);
        
        analysis.put("totalRevenue", totalRevenue);
        analysis.put("totalBookings", bookings.size());
        analysis.put("averageBookingValue", avgBookingValue);
        analysis.put("revenueByAirline", bookings.stream()
            .collect(Collectors.groupingBy(
                b -> b.getFlight().getAirlineName(),
                Collectors.mapping(Booking::getPrice, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
            )));
        
        return analysis;
    }

    private double calculateOccupancyRate(List<Flight> flights) {
        if (flights.isEmpty()) return 0.0;
        
        int totalSeats = flights.stream().mapToInt(Flight::getTotalSeats).sum();
        int bookedSeats = flights.stream().mapToInt(Flight::getBookedSeats).sum();
        
        return totalSeats > 0 ? (double) bookedSeats / totalSeats * 100 : 0.0;
    }
}
