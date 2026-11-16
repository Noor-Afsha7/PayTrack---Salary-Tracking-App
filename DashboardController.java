
package com.paytrack.controller;

import com.paytrack.model.Payroll;
import com.paytrack.repository.EmployeeRepository;
import com.paytrack.repository.PayrollRepository;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final EmployeeRepository employeeRepository;
    private final PayrollRepository payrollRepository;

    public DashboardController(
            EmployeeRepository employeeRepository,
            PayrollRepository payrollRepository) {
        this.employeeRepository = employeeRepository;
        this.payrollRepository = payrollRepository;
    }

    @GetMapping
    public Map<String, Object> getDashboard() {

        long totalEmployees = employeeRepository.count();

        long activeEmployees = employeeRepository.findAll()
                .stream()
                .filter(employee -> employee.isActive())
                .count();

        List<Payroll> allPayrolls = payrollRepository.findAll();

        BigDecimal totalNetPayroll = allPayrolls.stream()
                .map(Payroll::getNetSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Payroll> recentPayrolls =
                payrollRepository.findTop5ByOrderByGeneratedAtDesc();

        return Map.of(
                "totalEmployees", totalEmployees,
                "activeEmployees", activeEmployees,
                "payrollRuns", allPayrolls.size(),
                "totalNetPayroll", totalNetPayroll,
                "recentPayrolls", recentPayrolls
        );
    }
}
