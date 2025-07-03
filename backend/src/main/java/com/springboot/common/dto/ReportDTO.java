package com.springboot.common.dto;

import java.math.BigDecimal;

public class ReportDTO {
    private String airlineName;
    private long ticketsSold;
    private BigDecimal totalRevenue;
    private BigDecimal averagePrice;

    public ReportDTO() {}

    public ReportDTO(String airlineName, long ticketsSold, BigDecimal totalRevenue, BigDecimal averagePrice) {
        this.airlineName = airlineName;
        this.ticketsSold = ticketsSold;
        this.totalRevenue = totalRevenue;
        this.averagePrice = averagePrice;
    }

    public String getAirlineName() { return airlineName; }
    public void setAirlineName(String airlineName) { this.airlineName = airlineName; }

    public long getTicketsSold() { return ticketsSold; }
    public void setTicketsSold(long ticketsSold) { this.ticketsSold = ticketsSold; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getAveragePrice() { return averagePrice; }
    public void setAveragePrice(BigDecimal averagePrice) { this.averagePrice = averagePrice; }
}
