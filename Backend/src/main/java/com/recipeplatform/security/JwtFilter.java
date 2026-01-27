package com.recipeplatform.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtill jwtUtill;
    private final CustomUserDetailsService userDetailsService;

    public JwtFilter(JwtUtill jwtUtill, CustomUserDetailsService userDetailsService) {
        this.jwtUtill = jwtUtill;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = jwtUtill.extractToken(request);
        String username=null;

        if (token != null) {
            username = jwtUtill.extractUsername(token);
        }

        if (SecurityContextHolder.getContext().getAuthentication() == null && username != null) {
            CustomUserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtUtill.validateToken(token)) {
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
