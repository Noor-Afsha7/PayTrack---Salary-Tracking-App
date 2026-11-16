
package com.paytrack.repository;

import com.paytrack.model.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    List<Payroll> findByPayPeriodOrderByGeneratedAtDesc(String payPeriod);

    List<Payroll> findTop5ByOrderByGeneratedAtDesc();

    Optional<Payroll> findByEmployeeIdAndPayPeriod(Long employeeId, String payPeriod);
}

boolean existsByEmployeeId(Long employeeId);
