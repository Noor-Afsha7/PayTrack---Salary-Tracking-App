
const API_BASE = "http://localhost:8080";

const token = () => localStorage.getItem("paytrack_token");

const money = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(Number(amount || 0));

const escapeHTML = (value = "") =>
    String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

let employees = [];
let payrolls = [];

async function api(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: "omit",
        headers: {
            "Content-Type": "application/json",
            ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
            ...options.headers
        }
    });

    if (response.status === 401) {
        localStorage.removeItem("paytrack_token");
        window.location.href = "login.html";
        throw new Error("Session expired. Please sign in again.");
    }

    const data = response.status === 204
        ? null
        : await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Request failed.");
    }

    return data;
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

function openModal(id) {
    document.getElementById(id).hidden = false;
}

function closeModal(id) {
    document.getElementById(id).hidden = true;
}

/* NAVIGATION */

function navigate(page) {
    document.querySelectorAll(".page-section").forEach(section => {
        section.hidden = section.id !== `${page}Page`;
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.dataset.page === page);
    });

    const pageDetails = {
        overview: {
            title: "Payroll Overview",
            section: "OVERVIEW",
            description: "Manage your workforce and payroll operations."
        },
        employees: {
            title: "Employees",
            section: "EMPLOYEES",
            description: "Manage employee information and salary details."
        },
        payroll: {
            title: "Payroll Processing",
            section: "PAYROLL",
            description: "Generate salaries and manage payroll history."
        }
    };

    document.getElementById("pageTitle").textContent = pageDetails[page].title;
    document.getElementById("currentSection").textContent = pageDetails[page].section;
    document.getElementById("pageDescription").textContent = pageDetails[page].description;

    if (page === "employees") loadEmployees();
    if (page === "payroll") loadPayroll();
}

document.querySelectorAll("[data-page]").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        navigate(link.dataset.page);
    });
});

document.querySelectorAll("[data-navigate]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.navigate));
});

document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => closeModal(button.dataset.close));
});

/* LOGOUT */

document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("paytrack_token");
    window.location.href = "login.html";
});

/* DASHBOARD */

async function loadDashboard() {
    const data = await api("/api/dashboard");

    document.getElementById("totalEmployees").textContent = data.totalEmployees;
    document.getElementById("activeEmployees").textContent = data.activeEmployees;
    document.getElementById("totalPayrolls").textContent = data.payrollRuns;
    document.getElementById("totalNetPayroll").textContent = money(data.totalNetPayroll);

    const table = document.getElementById("recentPayrollTable");

    table.innerHTML = data.recentPayrolls.length
        ? data.recentPayrolls.map(payroll => `
            <tr>
                <td>
                    <span class="employee-name">${escapeHTML(payroll.employee.fullName)}</span>
                    <span class="employee-email">${escapeHTML(payroll.employee.department)}</span>
                </td>
                <td>${escapeHTML(payroll.payPeriod)}</td>
                <td>${money(payroll.grossSalary)}</td>
                <td>${money(payroll.netSalary)}</td>
                <td>${escapeHTML(payroll.generatedAt)}</td>
            </tr>
        `).join("")
        : `<tr><td colspan="5" class="empty-state">No payroll records available.</td></tr>`;
}

/* EMPLOYEE MANAGEMENT */

async function loadEmployees() {
    employees = await api("/api/employees");
    renderEmployees();

    document.getElementById("employeeCount").textContent =
        `${employees.length} employees`;
}

function renderEmployees() {
    const search = document.getElementById("employeeSearch").value.toLowerCase();

    const filtered = employees.filter(employee =>
        [
            employee.fullName,
            employee.email,
            employee.department,
            employee.designation
        ].some(value => String(value).toLowerCase().includes(search))
    );

    const table = document.getElementById("employeeTable");

    table.innerHTML = filtered.length
        ? filtered.map(employee => `
            <tr>
                <td>
                    <span class="employee-name">${escapeHTML(employee.fullName)}</span>
                    <span class="employee-email">${escapeHTML(employee.email)}</span>
                </td>
                <td>${escapeHTML(employee.department)}</td>
                <td>${escapeHTML(employee.designation)}</td>
                <td>${money(employee.basicSalary)}</td>
                <td>
                    <span class="status ${employee.active ? "active" : "inactive"}">
                        ${employee.active ? "Active" : "Inactive"}
                    </span>
                </td>
                <td>
                    <button class="action-button" data-edit="${employee.id}">Edit</button>
                    <button class="action-button delete" data-delete="${employee.id}">Delete</button>
                </td>
            </tr>
        `).join("")
        : `<tr><td colspan="6" class="empty-state">No employees found.</td></tr>`;
}

document.getElementById("employeeSearch").addEventListener("input", renderEmployees);

document.getElementById("employeeTable").addEventListener("click", event => {
    const editId = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;

    if (editId) editEmployee(Number(editId));
    if (deleteId) deleteEmployee(Number(deleteId));
});

document.getElementById("addEmployeeButton").addEventListener("click", () => {
    document.getElementById("employeeForm").reset();
    document.getElementById("employeeId").value = "";
    document.getElementById("active").checked = true;
    document.getElementById("employeeModalTitle").textContent = "Add Employee";

    openModal("employeeModal");
});

function editEmployee(id) {
    const employee = employees.find(item => item.id === id);
    if (!employee) return;

    document.getElementById("employeeId").value = employee.id;
    document.getElementById("fullName").value = employee.fullName;
    document.getElementById("email").value = employee.email;
    document.getElementById("department").value = employee.department;
    document.getElementById("designation").value = employee.designation;
    document.getElementById("basicSalary").value = employee.basicSalary;
    document.getElementById("hra").value = employee.hra;
    document.getElementById("allowances").value = employee.allowances;
    document.getElementById("otherDeductions").value = employee.otherDeductions;
    document.getElementById("active").checked = employee.active;

    document.getElementById("employeeModalTitle").textContent = "Edit Employee";
    openModal("employeeModal");
}

async function deleteEmployee(id) {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
        await api(`/api/employees/${id}`, { method: "DELETE" });
        showToast("Employee deleted successfully.");

        await loadEmployees();
        await loadDashboard();
    } catch (error) {
        showToast(error.message);
    }
}

document.getElementById("employeeForm").addEventListener("submit", async event => {
    event.preventDefault();

    const id = document.getElementById("employeeId").value;

    const employee = {
        fullName: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        department: document.getElementById("department").value.trim(),
        designation: document.getElementById("designation").value.trim(),
        basicSalary: Number(document.getElementById("basicSalary").value),
        hra: Number(document.getElementById("hra").value),
        allowances: Number(document.getElementById("allowances").value),
        otherDeductions: Number(document.getElementById("otherDeductions").value),
        active: document.getElementById("active").checked
    };

    try {
        await api(id ? `/api/employees/${id}` : "/api/employees", {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(employee)
        });

        closeModal("employeeModal");
        showToast(id ? "Employee updated." : "Employee added.");

        await loadEmployees();
        await loadDashboard();
    } catch (error) {
        showToast(error.message);
    }
});

/* PAYROLL */

async function loadPayroll() {
    const period = document.getElementById("payrollMonth").value;

    payrolls = await api(
        "/api/payroll" + (period ? `?period=${encodeURIComponent(period)}` : "")
    );

    renderPayroll();

    document.getElementById("payrollCount").textContent =
        `${payrolls.length} records`;
}

function renderPayroll() {
    const table = document.getElementById("payrollTable");

    table.innerHTML = payrolls.length
        ? payrolls.map(payroll => `
            <tr>
                <td>
                    <span class="employee-name">${escapeHTML(payroll.employee.fullName)}</span>
                    <span class="employee-email">${escapeHTML(payroll.employee.department)}</span>
                </td>
                <td>${escapeHTML(payroll.payPeriod)}</td>
                <td>${money(payroll.grossSalary)}</td>
                <td>${money(payroll.totalDeductions)}</td>
                <td>${money(payroll.netSalary)}</td>
                <td>
                    <button class="action-button" data-payslip="${payroll.id}">
                        View Payslip
                    </button>
                </td>
            </tr>
        `).join("")
        : `<tr><td colspan="6" class="empty-state">No payroll records found.</td></tr>`;
}

document.getElementById("payrollMonth").addEventListener("change", loadPayroll);

document.getElementById("payrollTable").addEventListener("click", event => {
    const id = event.target.dataset.payslip;
    if (id) viewPayslip(Number(id));
});

document.getElementById("generatePayrollButton").addEventListener("click", async () => {
    try {
        employees = await api("/api/employees");

        const activeEmployees = employees.filter(employee => employee.active);
        const select = document.getElementById("payrollEmployee");

        select.innerHTML = '<option value="">Select an employee</option>';

        activeEmployees.forEach(employee => {
            const option = document.createElement("option");
            option.value = employee.id;
            option.textContent = `${employee.fullName} — ${employee.department}`;
            select.appendChild(option);
        });

        document.getElementById("payPeriod").value =
            new Date().toISOString().slice(0, 7);

        openModal("payrollModal");
    } catch (error) {
        showToast(error.message);
    }
});

document.getElementById("payrollForm").addEventListener("submit", async event => {
    event.preventDefault();

    try {
        await api("/api/payroll/generate", {
            method: "POST",
            body: JSON.stringify({
                employeeId: document.getElementById("payrollEmployee").value,
                period: document.getElementById("payPeriod").value
            })
        });

        closeModal("payrollModal");
        showToast("Payroll generated successfully.");

        await loadPayroll();
        await loadDashboard();
    } catch (error) {
        showToast(error.message);
    }
});

/* PAYSLIP */

async function viewPayslip(id) {
    try {
        const payroll = await api(`/api/payroll/${id}`);
        const employee = payroll.employee;

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            showToast("Please allow pop-ups to view your payslip.");
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>PayTrack Salary Slip</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 750px;
                        margin: 40px auto;
                        padding: 20px;
                        color: #24344d;
                    }
                    h1 { color: #174b91; }
                    .line {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid #ddd;
                    }
                    .net {
                        font-size: 22px;
                        font-weight: bold;
                        color: #174b91;
                        margin-top: 20px;
                    }
                    .print-button {
                        padding: 12px 20px;
                        background: #2463eb;
                        color: white;
                        border: 0;
                        cursor: pointer;
                    }
                    @media print {
                        .print-button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>PayTrack</h1>
                <h2>Salary Slip — ${escapeHTML(payroll.payPeriod)}</h2>

                <p><strong>Employee:</strong> ${escapeHTML(employee.fullName)}</p>
                <p><strong>Employee ID:</strong> ${employee.id}</p>
                <p><strong>Department:</strong> ${escapeHTML(employee.department)}</p>
                <p><strong>Designation:</strong> ${escapeHTML(employee.designation)}</p>

                <h3>Earnings</h3>
                <div class="line"><span>Basic Salary</span><b>${money(employee.basicSalary)}</b></div>
                <div class="line"><span>HRA</span><b>${money(employee.hra)}</b></div>
                <div class="line"><span>Allowances</span><b>${money(employee.allowances)}</b></div>
                <div class="line"><span>Gross Salary</span><b>${money(payroll.grossSalary)}</b></div>

                <h3>Deductions</h3>
                <div class="line"><span>Provident Fund</span><b>${money(payroll.providentFund)}</b></div>
                <div class="line"><span>Demo Tax</span><b>${money(payroll.tax)}</b></div>
                <div class="line"><span>Other Deductions</span><b>${money(payroll.otherDeductions)}</b></div>
                <div class="line"><span>Total Deductions</span><b>${money(payroll.totalDeductions)}</b></div>

                <div class="line net">
                    <span>NET SALARY</span>
                    <span>${money(payroll.netSalary)}</span>
                </div>

                <p>This is a project demonstration payslip, not an official statutory payroll document.</p>

                <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
            </body>
            </html>
        `);

        printWindow.document.close();

    } catch (error) {
        showToast(error.message);
    }
}

/* INITIALIZE */

document.getElementById("currentDate").textContent =
    new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date());

async function initialize() {
    if (!token()) {
        window.location.href = "login.html";
        return;
    }

    try {
        await loadDashboard();
    } catch (error) {
        showToast(error.message);
    }
}

initialize();
