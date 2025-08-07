package com.agriverse.usernotification.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

	@Value("${jwt.secret}")
	private String secret;

	@Value("${jwt.expiration}")
	private long expiration;

	public String generateToken(String email) {
		Date now = new Date();
		Date expiry = new Date(now.getTime() + expiration);

		return Jwts.builder().setSubject(email).setIssuedAt(now).setExpiration(expiry)
				.signWith(getSigningKey(), SignatureAlgorithm.HS256).compact();
	}

	public String exractEmail(String token) {
		return Jwts.parserBuilder().setSigningKey(getSigningKey())
				.build().parseClaimsJws(token)
				.getBody().getSubject();
	}
	private Key getSigningKey() {
		// TODO Auto-generated method stub
		return Keys.hmacShaKeyFor(secret.getBytes());
	}
}
