package com.springboot.common.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.springboot.common.dto.ReportDTO;
import com.springboot.common.repository.BookingRepository;

@Service
public class ReportServiceImpl implements ReportService {
    private final BookingRepository bookingRepo;
    public ReportServiceImpl(BookingRepository bookingRepo) { this.bookingRepo = bookingRepo; }

    @Override
    public List<ReportDTO> revenueByAirline(String airline, LocalDateTime start, LocalDateTime end) {
        return bookingRepo.findByFlightAirlineNameAndBookingDateBetween(airline, start, end)
            .stream()
            .collect(Collectors.groupingBy(
                b -> b.getFlight().getAirlineName(),
                Collectors.collectingAndThen(Collectors.toList(), list -> {
                    long sold = list.size();
                    BigDecimal total = list.stream()
                        .map(b -> b.getPrice())
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
					BigDecimal avg = sold > 0
                        ? total.divide(BigDecimal.valueOf(sold), RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;
                    return new ReportDTO(airline, sold, total, avg);
                })
            ))
            .values()
            .stream().collect(Collectors.toList());
    }
}
