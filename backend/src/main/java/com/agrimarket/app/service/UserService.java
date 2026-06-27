package com.agrimarket.app.service;

import com.agrimarket.app.dto.RegisterRequest;
import com.agrimarket.app.dto.UserDto;
import com.agrimarket.app.entity.Role;
import com.agrimarket.app.entity.User;
import com.agrimarket.app.exception.BadRequestException;
import com.agrimarket.app.exception.ResourceNotFoundException;
import com.agrimarket.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    public UserDto registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(encoder.encode(registerRequest.getPassword()));
        user.setName(registerRequest.getName());
        user.setPhone(registerRequest.getPhone());
        user.setAddress(registerRequest.getAddress());

        String strRole = registerRequest.getRole();
        if (strRole == null) {
            user.setRole(Role.ROLE_CUSTOMER);
        } else {
            switch (strRole.toUpperCase()) {
                case "ADMIN":
                    user.setRole(Role.ROLE_ADMIN);
                    break;
                default:
                    user.setRole(Role.ROLE_CUSTOMER);
            }
        }

        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }

    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return convertToDto(user);
    }

    @Transactional
    public UserDto updateUserProfile(String username, UserDto userDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        user.setName(userDto.getName());
        user.setPhone(userDto.getPhone());
        user.setAddress(userDto.getAddress());
        
        return convertToDto(userRepository.save(user));
    }

    public UserDto convertToDto(User user) {
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getName(),
                user.getPhone(),
                user.getAddress()
        );
    }
}
