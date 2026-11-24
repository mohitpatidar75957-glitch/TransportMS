package com.tms.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteMarginDTO {
    private String routeName;
    private BigDecimal expectedRevenue;
    private BigDecimal expectedCost;
    private BigDecimal expectedMargin;
    private Double marginPercentage;
}
