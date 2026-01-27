package com.recipeplatform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtill {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiry;


    //method for generate token
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiry))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();

    }

    //for validating token
    public boolean validateToken(String token){
        return !extractClaims(token).getExpiration().before(new Date());
    }

    //key generation
    public Key getSignKey(){
        return Keys.hmacShaKeyFor(secret.getBytes());
    }


    //for extracting claims
    public Claims extractClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    //for extracting username
    public String extractUsername(String token){
        return extractClaims(token).getSubject();
    }

    //extract token from request
    public String extractToken(HttpServletRequest request){
        String header=request.getHeader("Authorization");
        if (header!=null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

}
