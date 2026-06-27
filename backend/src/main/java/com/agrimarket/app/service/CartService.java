package com.agrimarket.app.service;

import com.agrimarket.app.dto.CartDto;
import com.agrimarket.app.dto.CartItemDto;
import com.agrimarket.app.entity.CartItem;
import com.agrimarket.app.entity.Product;
import com.agrimarket.app.entity.User;
import com.agrimarket.app.exception.BadRequestException;
import com.agrimarket.app.exception.ResourceNotFoundException;
import com.agrimarket.app.repository.CartItemRepository;
import com.agrimarket.app.repository.ProductRepository;
import com.agrimarket.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {
    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public CartDto getCart(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        List<CartItem> items = cartItemRepository.findByUser(user);
        List<CartItemDto> itemDtos = items.stream().map(this::convertToDto).collect(Collectors.toList());
        
        BigDecimal totalAmount = itemDtos.stream()
                .map(CartItemDto::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        return new CartDto(itemDtos, totalAmount);
    }

    @Transactional
    public CartItemDto addToCart(String username, Long productId, Integer quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Not enough stock available. Available stock: " + product.getStockQuantity());
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserAndProduct(user, product);
        CartItem cartItem;
        
        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            int newQuantity = cartItem.getQuantity() + quantity;
            if (product.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Cannot add more. Not enough stock available. Available stock: " + product.getStockQuantity());
            }
            cartItem.setQuantity(newQuantity);
        } else {
            cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
        }

        return convertToDto(cartItemRepository.save(cartItem));
    }

    @Transactional
    public CartItemDto updateCartItemQuantity(String username, Long itemId, Integer quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to cart item");
        }

        if (cartItem.getProduct().getStockQuantity() < quantity) {
            throw new BadRequestException("Not enough stock available. Available stock: " + cartItem.getProduct().getStockQuantity());
        }

        cartItem.setQuantity(quantity);
        return convertToDto(cartItemRepository.save(cartItem));
    }

    @Transactional
    public void removeCartItem(String username, Long itemId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to cart item");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        cartItemRepository.deleteByUser(user);
    }

    private CartItemDto convertToDto(CartItem item) {
        BigDecimal price = item.getProduct().getPrice();
        BigDecimal subTotal = price.multiply(new BigDecimal(item.getQuantity()));
        return new CartItemDto(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getImageUrl(),
                price,
                item.getQuantity(),
                item.getProduct().getStockQuantity(),
                subTotal
        );
    }
}
