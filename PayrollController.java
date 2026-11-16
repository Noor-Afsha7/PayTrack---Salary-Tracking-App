
package com.paytrack.controller;

import com.paytrack.dto.PayrollRequest;
import com.paytrack.model.Payroll;
import com.paytrack.service.PayrollService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping
    public List<Payroll> getPayrolls(
            @RequestParam(required = false) String period) {
        return payrollService.getPayrolls(period);
    }

    @GetMapping("/{id}")
    public Payroll getPayroll(@PathVariable Long id) {
        return payrollService.getPayroll(id);
    }

    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    public Payroll generatePayroll(
            @Valid @RequestBody PayrollRequest request) {
        return payrollService.generatePayroll(request);
    }
}
