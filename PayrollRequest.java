
package com.paytrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class PayrollRequest {

    @NotNull
    private Long employeeId;

    @NotBlank
    @Pattern(regexp = "\\d{4}-\\d{2}", message = "Period must be YYYY-MM")
    private String period;

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
}
