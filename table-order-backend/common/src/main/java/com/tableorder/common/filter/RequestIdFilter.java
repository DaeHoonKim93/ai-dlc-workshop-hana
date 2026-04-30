package com.tableorder.common.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_KEY = "requestId";
    private static final String STORE_ID_KEY = "storeId";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        try {
            String requestId = UUID.randomUUID().toString().substring(0, 8);
            MDC.put(REQUEST_ID_KEY, requestId);

            String storeId = extractStoreId(request.getRequestURI());
            if (storeId != null) {
                MDC.put(STORE_ID_KEY, storeId);
            }

            response.setHeader("X-Request-Id", requestId);
            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }

    private String extractStoreId(String uri) {
        String prefix = "/api/stores/";
        int startIdx = uri.indexOf(prefix);
        if (startIdx == -1) return null;

        String remaining = uri.substring(startIdx + prefix.length());
        int endIdx = remaining.indexOf('/');
        return endIdx == -1 ? remaining : remaining.substring(0, endIdx);
    }
}
