package com.agrimarket.app.service;

import com.agrimarket.app.dto.OrderRequest;
import com.agrimarket.app.dto.OrderResponse;
import com.agrimarket.app.entity.*;
import com.agrimarket.app.exception.BadRequestException;
import com.agrimarket.app.exception.ResourceNotFoundException;
import com.agrimarket.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public OrderResponse placeOrder(String username, OrderRequest orderRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cannot place order with an empty cart");
        }

        // Validate stock and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(orderRequest.getShippingAddress());
        order.setPhone(orderRequest.getPhone());
        order.setPaymentMethod(orderRequest.getPaymentMethod());

        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Product " + product.getName() + " is out of stock or does not have enough quantity. Available stock: " + product.getStockQuantity());
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(product.getPrice());

            order.getOrderItems().add(orderItem);

            BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setTotalAmount(totalAmount);

        // Save order and clear cart
        Order savedOrder = orderRepository.save(order);
        cartItemRepository.deleteByUser(user);

        return convertToDto(savedOrder);
    }

    public List<OrderResponse> getMyOrders(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findByUserOrderByOrderDateDesc(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        // Check if user is owner or admin
        if (!order.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ROLE_ADMIN")) {
            throw new BadRequestException("Unauthorized access to order details");
        }

        return convertToDto(order);
    }

    // Admin methods
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        try {
            order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + status);
        }

        return convertToDto(orderRepository.save(order));
    }

    private OrderResponse convertToDto(Order order) {
        List<OrderResponse.OrderItemDto> items = order.getOrderItems().stream().map(item -> 
            new OrderResponse.OrderItemDto(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getImageUrl(),
                item.getPrice(),
                item.getQuantity()
            )
        ).collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getUsername(),
                order.getOrderDate(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getShippingAddress(),
                order.getPhone(),
                order.getPaymentMethod(),
                items
        );
    }
}
