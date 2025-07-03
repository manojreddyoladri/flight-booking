package com.springboot.common.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class BookingRequestDTO {
    private Long flightId;
    private Long customerId;
    private BigDecimal price;

}
