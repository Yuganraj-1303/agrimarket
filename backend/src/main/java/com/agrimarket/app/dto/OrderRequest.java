package com.agrimarket.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderRequest {
    @NotBlank
    private String shippingAddress;

    @NotBlank
    private String phone;

    @NotBlank
    private String paymentMethod;
}
