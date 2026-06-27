package com.agrimarket.app.controller;

import com.agrimarket.app.dto.CartDto;
import com.agrimarket.app.dto.CartItemDto;
import com.agrimarket.app.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.security.Principal;
import org.springframework.web.bind.annotation.CrossOrigin;


@RestController
@RequestMapping("/cart")
public class CartController {
    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<CartDto> getCart(Principal principal) {
        return ResponseEntity.ok(cartService.getCart(principal.getName()));
    }

    @PostMapping("/add")
    public ResponseEntity<CartItemDto> addToCart(Principal principal, @RequestBody Map<String, Object> payload) {
        Long productId = Long.valueOf(payload.get("productId").toString());
        Integer quantity = Integer.valueOf(payload.get("quantity").toString());
        return ResponseEntity.ok(cartService.addToCart(principal.getName(), productId, quantity));
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<CartItemDto> updateCartItemQuantity(
            Principal principal,
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> payload) {
        Integer quantity = Integer.valueOf(payload.get("quantity").toString());
        return ResponseEntity.ok(cartService.updateCartItemQuantity(principal.getName(), itemId, quantity));
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<?> removeCartItem(Principal principal, @PathVariable Long itemId) {
        cartService.removeCartItem(principal.getName(), itemId);
        return ResponseEntity.ok("Item removed from cart");
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Principal principal) {
        cartService.clearCart(principal.getName());
        return ResponseEntity.ok("Cart cleared");
    }
}
