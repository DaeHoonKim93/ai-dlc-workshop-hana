package com.tableorder.auth.security;

import com.tableorder.common.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

/**
 * JWT의 storeId와 URL path의 storeId 일치 여부를 검증하는 인터셉터.
 */
@Slf4j
@Component
public class StoreIsolationInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtUserDetails userDetails)) {
            return true;
        }

        @SuppressWarnings("unchecked")
        Map<String, String> pathVariables = (Map<String, String>) request.getAttribute(
                HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);

        if (pathVariables == null || !pathVariables.containsKey("storeId")) {
            return true;
        }

        try {
            Long pathStoreId = Long.parseLong(pathVariables.get("storeId"));
            if (!userDetails.getStoreId().equals(pathStoreId)) {
                log.warn("Store isolation violation: token storeId={}, path storeId={}",
                        userDetails.getStoreId(), pathStoreId);
                throw BusinessException.forbidden("접근 권한이 없습니다");
            }
        } catch (NumberFormatException e) {
            throw BusinessException.badRequest("잘못된 매장 ID입니다");
        }

        return true;
    }
}
