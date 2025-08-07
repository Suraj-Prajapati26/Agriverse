package com.agriverse.marketplaceorder.service;

import com.agriverse.marketplaceorder.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class UserClientService {

    private final RestTemplate restTemplate;

    @Value("${user.service.url:http://localhost:8081}")
    private String userServiceUrl;

    public UserResponse getUserFromToken(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);  // token should already have "Bearer "
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<UserResponse> response = restTemplate.exchange(
                userServiceUrl + "/api/users/me",
                HttpMethod.GET,
                requestEntity,
                UserResponse.class
        );

        return response.getBody();
    }

}
