package com.tableorder.table.controller;

import com.tableorder.common.dto.ApiResponse;
import com.tableorder.common.dto.PageResponse;
import com.tableorder.table.dto.*;
import com.tableorder.table.service.TableService;
import com.tableorder.table.service.TableSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stores/{storeId}/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;
    private final TableSessionService tableSessionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TableResponse>>> getTables(
            @PathVariable Long storeId) {
        List<TableResponse> tables = tableService.getTables(storeId);
        return ResponseEntity.ok(ApiResponse.ok(tables));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TableResponse>> createTable(
            @PathVariable Long storeId,
            @Valid @RequestBody TableCreateRequest request) {
        TableResponse table = tableService.createTable(storeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(table));
    }

    @PostMapping("/{tableId}/complete")
    public ResponseEntity<ApiResponse<TableCompleteResponse>> completeTable(
            @PathVariable Long storeId,
            @PathVariable Long tableId) {
        TableCompleteResponse response = tableSessionService.completeSession(storeId, tableId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{tableId}/history")
    public ResponseEntity<ApiResponse<PageResponse<OrderHistoryResponse>>> getTableHistory(
            @PathVariable Long storeId,
            @PathVariable Long tableId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var historyPage = tableSessionService.getTableHistory(tableId, startDate, endDate, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(historyPage)));
    }
}
