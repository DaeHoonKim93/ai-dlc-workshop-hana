package com.tableorder.order.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class SseService {

    private static final long SSE_TIMEOUT = 30 * 60 * 1000L; // 30분

    private final ConcurrentHashMap<Long, List<SseEmitter>> storeSubscribers = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long storeId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        storeSubscribers.computeIfAbsent(storeId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(storeId, emitter));
        emitter.onTimeout(() -> removeEmitter(storeId, emitter));
        emitter.onError(e -> removeEmitter(storeId, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data(Map.of("timestamp", LocalDateTime.now().toString())));
        } catch (IOException e) {
            log.warn("Failed to send initial SSE event", e);
            removeEmitter(storeId, emitter);
        }

        log.info("SSE subscriber added: storeId={}, total={}", storeId,
                storeSubscribers.getOrDefault(storeId, Collections.emptyList()).size());

        return emitter;
    }

    public void notify(Long storeId, String eventType, Object data) {
        List<SseEmitter> emitters = storeSubscribers.getOrDefault(storeId, Collections.emptyList());
        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventType)
                        .data(data));
            } catch (Exception e) {
                log.debug("SSE send failed, removing emitter: storeId={}", storeId);
                deadEmitters.add(emitter);
            }
        }

        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
        }
    }

    @Scheduled(fixedRate = 30000)
    public void sendHeartbeat() {
        Map<String, String> heartbeat = Map.of("timestamp", LocalDateTime.now().toString());
        storeSubscribers.forEach((storeId, emitters) -> {
            if (!emitters.isEmpty()) {
                notify(storeId, "HEARTBEAT", heartbeat);
            }
        });
    }

    private void removeEmitter(Long storeId, SseEmitter emitter) {
        List<SseEmitter> emitters = storeSubscribers.get(storeId);
        if (emitters != null) {
            emitters.remove(emitter);
            log.debug("SSE subscriber removed: storeId={}, remaining={}", storeId, emitters.size());
        }
    }
}
