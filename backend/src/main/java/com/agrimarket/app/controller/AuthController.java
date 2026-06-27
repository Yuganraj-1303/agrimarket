package com.agrimarket.app.controller;

import com.agrimarket.app.dto.AuthResponse;
import com.agrimarket.app.dto.LoginRequest;
import com.agrimarket.app.dto.RegisterRequest;
import com.agrimarket.app.dto.UserDto;
import com.agrimarket.app.security.JwtUtils;
import com.agrimarket.app.security.UserDetailsImpl;
import com.agrimarket.app.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import org.springframework.web.bind.annotation.CrossOrigin;


@RestController
@CrossOrigin(origins = "https://agrimarket-wgry.onrender.com")
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserService userService;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(item -> item.getAuthority())
                .orElse("ROLE_CUSTOMER");

        return ResponseEntity.ok(new AuthResponse(jwt,
                                                 userDetails.getId(), 
                                                 userDetails.getUsername(), 
                                                 userDetails.getEmail(), 
                                                 role));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        UserDto registeredUser = userService.registerUser(signUpRequest);
        return ResponseEntity.ok(registeredUser);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().body("No authenticated user session");
        }
        UserDto userDto = userService.getUserByUsername(principal.getName());
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Principal principal, @Valid @RequestBody UserDto userDto) {
        if (principal == null) {
            return ResponseEntity.badRequest().body("No authenticated user session");
        }
        UserDto updatedUser = userService.updateUserProfile(principal.getName(), userDto);
        return ResponseEntity.ok(updatedUser);
    }
}
