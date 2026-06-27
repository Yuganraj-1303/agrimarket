package com.agrimarket.app.controller;

import com.agrimarket.app.dto.OrderRequest;
import com.agrimarket.app.dto.OrderResponse;
import com.agrimarket.app.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(Principal principal, @Valid @RequestBody OrderRequest orderRequest) {
        return ResponseEntity.ok(orderService.placeOrder(principal.getName(), orderRequest));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(Principal principal) {
        return ResponseEntity.ok(orderService.getMyOrders(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id, principal.getName()));
    }

    // Admin endpoints
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        String status = payload.get("status").toString();
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
