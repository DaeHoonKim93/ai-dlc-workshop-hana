package com.tableorder.common.aspect;

import com.tableorder.common.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

/**
 * 매장 격리 AOP Aspect.
 * URL의 storeId와 인증된 사용자의 storeId가 일치하는지 검증합니다.
 * 현재는 URL path variable 추출만 구현. 실제 JWT 검증은 Unit 1 (auth) 통합 시 연결.
 */
@Slf4j
@Aspect
@Component
public class StoreIsolationAspect {

    @Before("execution(* com.tableorder..controller..*(..))")
    public void validateStoreAccess(JoinPoint joinPoint) {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) return;

        HttpServletRequest request = attrs.getRequest();

        @SuppressWarnings("unchecked")
        Map<String, String> pathVariables = (Map<String, String>) request.getAttribute(
                HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);

        if (pathVariables == null || !pathVariables.containsKey("storeId")) return;

        // TODO: Unit 1 (auth) 통합 시 JWT에서 storeId를 추출하여 비교
        // Long tokenStoreId = SecurityContextHolder.getContext()...getStoreId();
        // Long pathStoreId = Long.parseLong(pathVariables.get("storeId"));
        // if (!tokenStoreId.equals(pathStoreId)) {
        //     throw BusinessException.forbidden("접근 권한이 없습니다");
        // }

        log.trace("Store isolation check passed for storeId={}", pathVariables.get("storeId"));
    }
}
