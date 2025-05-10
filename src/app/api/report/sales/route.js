import { connectDB } from "@/lib/db";

export const POST = async (request) => {
  try {
    const { fromDate, toDate, branch } = await request.json();

    // Accept null/empty fromDate, toDate, branch for all-data queries
    const db = await connectDB();

    // Build WHERE clauses dynamically
    let businessWhere = [];
    let businessParams = [];
    if (fromDate && toDate) {
      businessWhere.push('DATE(addat) BETWEEN ? AND ?');
      businessParams.push(fromDate, toDate);
    } else if (fromDate) {
      businessWhere.push('DATE(addat) >= ?');
      businessParams.push(fromDate);
    } else if (toDate) {
      businessWhere.push('DATE(addat) <= ?');
      businessParams.push(toDate);
    }
    // We'll filter by branch in JS below
    const businessSql = `SELECT * FROM loan_bussiness${businessWhere.length ? ' WHERE ' + businessWhere.join(' AND ') : ''}`;
    const [businessLoans] = await db.execute(businessSql, businessParams);
    console.log('Business loans fetched:', businessLoans);

    let equipmentWhere = [];
    let equipmentParams = [];
    if (fromDate && toDate) {
      equipmentWhere.push('DATE(created_at) BETWEEN ? AND ?');
      equipmentParams.push(fromDate, toDate);
    } else if (fromDate) {
      equipmentWhere.push('DATE(created_at) >= ?');
      equipmentParams.push(fromDate);
    } else if (toDate) {
      equipmentWhere.push('DATE(created_at) <= ?');
      equipmentParams.push(toDate);
    }
    const equipmentSql = `SELECT * FROM equipment_loan_applications${equipmentWhere.length ? ' WHERE ' + equipmentWhere.join(' AND ') : ''}`;
    const [equipmentLoans] = await db.execute(equipmentSql, equipmentParams);
    console.log('Equipment loans fetched:', equipmentLoans);

    // Step 2: Optionally filter by branch (using Addby -> employees)
    let employeeIds = null;
    if (branch) {
      const [employeesByBranch] = await db.execute(
        `SELECT id FROM employees WHERE branchID = ?`,
        [branch]
      );
      employeeIds = employeesByBranch.map(e => e.id);
      console.log('Employee IDs for branch', branch, ':', employeeIds);
    }

    // Step 3: Fetch all needed customers and employees
    const allCustomerIds = [
      ...businessLoans.map(l => l.customerid),
      ...equipmentLoans.map(l => l.customer_id)
    ];
    const allEmployeeIds = [
      ...businessLoans.map(l => l.Addby),
      ...equipmentLoans.map(l => l.Addby)
    ];
    // Remove duplicates
    const uniqueCustomerIds = [...new Set(allCustomerIds)];
    const uniqueEmployeeIds = [...new Set(allEmployeeIds)];
    console.log('Unique customer IDs:', uniqueCustomerIds);
    console.log('Unique employee IDs:', uniqueEmployeeIds);

    // Fetch customers
    let customers = [];
    if (uniqueCustomerIds.length > 0) {
      const [rows] = await db.query(
        `SELECT id, fullname, address FROM customer WHERE id IN (${uniqueCustomerIds.map(() => '?').join(',')})`,
        uniqueCustomerIds
      );
      customers = rows;
      console.log('Fetched customers:', customers);
    }

    // Fetch employees
    let employees = [];
    if (uniqueEmployeeIds.length > 0) {
      const [rows] = await db.query(
        `SELECT id, name, branchID FROM employees WHERE id IN (${uniqueEmployeeIds.map(() => '?').join(',')})`,
        uniqueEmployeeIds
      );
      employees = rows;
      console.log('Fetched employees:', employees);
    }

    // Helper functions to look up customer/employee
    const getCustomer = (id) => customers.find(c => c.id === id) || {};
    const getEmployee = (id) => employees.find(e => e.id === id) || {};

    // Step 4: Build results
    const businessResults = businessLoans
      .filter(l => !branch || (employeeIds && employeeIds.includes(l.Addby)))
      .map(l => {
        const customer = getCustomer(l.customerid);
        const employee = getEmployee(l.Addby);
        return {
          CROId: l.CROid,
          branch: employee.branchID,
          customerId: l.customerid,
          customerName: customer.fullname,
          customerAddress: customer.address,
          loanType: 'Business Loan',
          loanAmount: l.loanAmount,
          payedAmount: l.Totalpay,
          contractDate: l.addat,
          lastPaymentDate: l.addat
        };
      });
    console.log('Business loan results:', businessResults);

    const equipmentResults = equipmentLoans
      .filter(l => !branch || (employeeIds && employeeIds.includes(l.Addby)))
      .map(l => {
        const customer = getCustomer(l.customer_id);
        const employee = getEmployee(l.Addby);
        return {
          CROId: l.CROid,
          branch: employee.branchID,
          customerId: l.customer_id,
          customerName: customer.fullname,
          customerAddress: customer.address,
          loanType: 'Equipment Loan',
          loanAmount: l.loan_amount,
          payedAmount: l.total_payable,
          contractDate: l.created_at,
          lastPaymentDate: l.updated_at
        };
      });
    console.log('Equipment loan results:', equipmentResults);

    const combinedLoans = [...businessResults, ...equipmentResults];
    console.log('Combined loan results:', combinedLoans);

    return new Response(
      JSON.stringify({ code: "SUCCESS", data: combinedLoans }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching loan report:", error);
    return new Response(
      JSON.stringify({ code: "ERROR", message: "Failed to fetch loan report" }),
      { status: 500 }
    );
  }
};