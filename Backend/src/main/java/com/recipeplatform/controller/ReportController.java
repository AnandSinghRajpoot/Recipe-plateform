package com.recipeplatform.controller;

import com.recipeplatform.domain.Report;
import com.recipeplatform.domain.enums.ReportType;
import com.recipeplatform.dto.ApiResponse;
import com.recipeplatform.repository.ReportRepository;
import com.recipeplatform.util.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;
    private final CurrentUser currentUser;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submitReport(
            @RequestParam ReportType type,
            @RequestParam Long targetId,
            @RequestParam String reason) {
        Report report = Report.builder()
                .reporter(currentUser.getCurrentUser())
                .type(type)
                .targetId(targetId)
                .reason(reason)
                .build();
        reportRepository.save(report);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("Report submitted successfully", null, 201));
    }
}
