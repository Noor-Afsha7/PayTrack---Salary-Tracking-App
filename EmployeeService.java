
package com.paytrack.service;

import com.paytrack.model.Employee;
import com.paytrack.repository.EmployeeRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployee(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Employee not found"));
    }

    public Employee createEmployee(Employee employee) {
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Email already exists");
        }

        employee.setId(null);
        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(Long id, Employee updatedEmployee) {
        Employee existing = getEmployee(id);

        employeeRepository.findAll().stream()
                .filter(employee ->
                        employee.getEmail().equalsIgnoreCase(
                                updatedEmployee.getEmail()))
                .filter(employee -> !employee.getId().equals(id))
                .findFirst()
                .ifPresent(employee -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT, "Email already exists");
                });

        existing.setFullName(updatedEmployee.getFullName());
        existing.setEmail(updatedEmployee.getEmail());
        existing.setDepartment(updatedEmployee.getDepartment());
        existing.setDesignation(updatedEmployee.getDesignation());
        existing.setBasicSalary(updatedEmployee.getBasicSalary());
        existing.setHra(updatedEmployee.getHra());
        existing.setAllowances(updatedEmployee.getAllowances());
        existing.setOtherDeductions(updatedEmployee.getOtherDeductions());
        existing.setActive(updatedEmployee.isActive());

        return employeeRepository.save(existing);
    }

    public void deleteEmployee(Long id) {
        Employee employee = getEmployee(id);
        employeeRepository.delete(employee);
    }
}
