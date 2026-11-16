
package com.paytrack.service;

import com.paytrack.dto.PayrollRequest;
import com.paytrack.model.Employee;
import com.paytrack.model.Payroll;
import com.paytrack.repository.EmployeeRepository;
import com.paytrack.repository.PayrollRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.List;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;

    public PayrollService(
            PayrollRepository payrollRepository,
            EmployeeRepository employeeRepository) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<Payroll> getPayrolls(String period) {
        if (period == null || period.isBlank()) {
            return payrollRepository.findAll();
        }

        return payrollRepository
                .findByPayPeriodOrderByGeneratedAtDesc(period);
    }

    public Payroll getPayroll(Long id) {
        return payrollRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Payroll record not found"));
    }

    public Payroll generatePayroll(PayrollRequest request) {

        try {
            YearMonth.parse(request.getPeriod());
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid pay period. Use YYYY-MM.");
        }

        Employee employee = employeeRepository
                .findById(request.getEmployeeId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Employee not found"));

        if (!employee.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot generate payroll for an inactive employee");
        }

        if (payrollRepository.findByEmployeeIdAndPayPeriod(
                employee.getId(), request.getPeriod()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Payroll already exists for this employee and period");
        }

        BigDecimal grossSalary = employee.getBasicSalary()
                .add(employee.getHra())
                .add(employee.getAllowances());

        BigDecimal providentFund = employee.getBasicSalary()
                .multiply(new BigDecimal("0.12"))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal tax = grossSalary
                .multiply(new BigDecimal("0.10"))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal otherDeductions = employee.getOtherDeductions();

        BigDecimal totalDeductions = providentFund
                .add(tax)
                .add(otherDeductions);

        BigDecimal netSalary = grossSalary.subtract(totalDeductions);

        if (netSalary.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Total deductions cannot exceed gross salary");
        }

        Payroll payroll = new Payroll();

        payroll.setEmployee(employee);
        payroll.setPayPeriod(request.getPeriod());
        payroll.setGrossSalary(grossSalary.setScale(2, RoundingMode.HALF_UP));
        payroll.setProvidentFund(providentFund);
        payroll.setTax(tax);
        payroll.setOtherDeductions(otherDeductions);
        payroll.setTotalDeductions(
                totalDeductions.setScale(2, RoundingMode.HALF_UP));
        payroll.setNetSalary(netSalary.setScale(2, RoundingMode.HALF_UP));

        return payrollRepository.save(payroll);
    }
}
