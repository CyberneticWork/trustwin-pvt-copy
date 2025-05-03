import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const data = await req.json();
    console.log(data);
    const connection = await connectDB();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Generate loan ID
      const loanId = data.loanid;

      // Check if bank details exist
      const [existingBank] = await connection.execute(
        `SELECT id FROM bankdetails WHERE customerid = ? AND loandid = ?`,
        [parseInt(data.customerId), parseInt(data.loanid)]
      );
      
      const bankResult = existingBank.length > 0
        ? await connection.execute(
            `UPDATE bankdetails SET 
              acctype = ?, 
              bank = ?, 
              acno = ?, 
              branch = ?, 
              period = ?,
              Turnover1 = ?,
              Turnover2 = ?,
              Turnover3 = ?
            WHERE id = ?`,
            [
              data.accountType,
              data.bankName,
              data.accountNumber,
              data.branchName,
              data.bankAccountPeriod,
              data.bankTurnover.month1,
              data.bankTurnover.month2,
              data.bankTurnover.month3,
              existingBank[0].id
            ]
          )
        : await connection.execute(
            `INSERT INTO bankdetails (
              customerid, loandid, acctype, bank, acno, branch, period,
              Turnover1, Turnover2, Turnover3
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              parseInt(data.customerId),
              parseInt(data.loanid),
              data.accountType,
              data.bankName,
              data.accountNumber,
              data.branchName,
              data.bankAccountPeriod,
              data.bankTurnover.jan,
              data.bankTurnover.feb,
              data.bankTurnover.mar
            ]
          );

      // Check if business details exist
      const [existingBusiness] = await connection.execute(
        `SELECT id FROM businessdetails WHERE customerid = ? AND loandid = ?`,
        [parseInt(data.customerId), parseInt(data.loanid)]
      );

      const businessResult = existingBusiness.length > 0
        ? await connection.execute(
            `UPDATE businessdetails SET 
              nature = ?,
              name = ?,
              regno = ?,
              type = ?,
              addres = ?,
              img1 = ?,
              img2 = ?,
              img3 = ?
            WHERE id = ?`,
            [
              data.natureOfBusiness,
              data.businessName,
              data.businessRegistrationNo,
              data.businessType,
              `${data.address.line1 || ''}, ${data.address.line2 || ''}, ${data.address.line3 || ''}`,
              data.businessImages[0] || null,
              data.businessImages[1] || null,
              data.businessImages[2] || null,
              existingBusiness[0].id
            ]
          )
        : await connection.execute(
            `INSERT INTO businessdetails (
              customerid, loandid, nature, name, regno, type, addres,
              img1, img2, img3
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              parseInt(data.customerId),
              parseInt(data.loanid),
              data.natureOfBusiness,
              data.businessName,
              data.businessRegistrationNo,
              data.businessType,
              `${data.address.line1 || ''}, ${data.address.line2 || ''}, ${data.address.line3 || ''}`,
              data.businessImages[0] || null,
              data.businessImages[1] || null,
              data.businessImages[2] || null
            ]
          );

      // Check if financial details exist
      const [existingFinancial] = await connection.execute(
        `SELECT id FROM financialdetails WHERE customerid = ? AND loandid = ?`,
        [parseInt(data.customerId), parseInt(data.loanid)]
      );

      const financialResult = existingFinancial.length > 0
        ? await connection.execute(
            `UPDATE financialdetails SET 
              Bincume = ?,
              Sincume = ?,
              Oincome = ?,
              Iincome = ?,
              Totalincome = ?,
              Bexpence = ?,
              utilitybill = ?,
              livinexpence = ?,
              exiLopayment = ?,
              exiloanamountMon = ?,
              otherexpe = ?,
              totalexpence = ?
            WHERE id = ?`,
            [
              data.income.businessIncome,
              data.income.salaryIncome,
              data.income.otherIncome,
              data.income.interestIncome,
              data.income.businessIncome + data.income.salaryIncome +
              data.income.otherIncome + data.income.interestIncome,
              data.expenses.businessExpenses,
              data.expenses.utilityBills,
              data.expenses.livingExpenses,
              data.expenses.loanPayments,
              data.expenses.existingLoanAmount,
              data.expenses.otherExpenses,
              data.expenses.businessExpenses + data.expenses.utilityBills +
              data.expenses.livingExpenses + data.expenses.loanPayments +
              data.expenses.existingLoanAmount + data.expenses.otherExpenses,
              existingFinancial[0].id
            ]
          )
        : await connection.execute(
            `INSERT INTO financialdetails (
              customerid, loandid, Bincume, Sincume, Oincome, Iincome, Totalincome,
              Bexpence, utilitybill, livinexpence, exiLopayment, exiloanamountMon,
              otherexpe, totalexpence
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              parseInt(data.customerId),
              parseInt(data.loanid),
              data.income.businessIncome,
              data.income.salaryIncome,
              data.income.otherIncome,
              data.income.interestIncome,
              data.income.businessIncome + data.income.salaryIncome +
              data.income.otherIncome + data.income.interestIncome,
              data.expenses.businessExpenses,
              data.expenses.utilityBills,
              data.expenses.livingExpenses,
              data.expenses.loanPayments,
              data.expenses.existingLoanAmount,
              data.expenses.otherExpenses,
              data.expenses.businessExpenses + data.expenses.utilityBills +
              data.expenses.livingExpenses + data.expenses.loanPayments +
              data.expenses.existingLoanAmount + data.expenses.otherExpenses
            ]
          );

      // Update or insert guarantors
      for (const guarantor of data.guarantors) {
        if (guarantor.name) {
          // Check if guarantor exists
          const [existingGuarantor] = await connection.execute(
            `SELECT id FROM guarantor WHERE customerid = ? AND loandid = ? AND name = ?`,
            [parseInt(data.customerId), parseInt(data.loanid), guarantor.name]
          );

          if (existingGuarantor.length > 0) {
            // Update existing guarantor
            await connection.execute(
              `UPDATE guarantor SET 
                nic = ?,
                gender = ?,
                dob = ?,
                relation = ?,
                address = ?,
                province = ?,
                gs = ?,
                ds = ?,
                district = ?,
                number = ?,
                income = ?,
                type = ?,
                accountno = ?,
                bankname = ?
              WHERE id = ?`,
              [
                guarantor.nic,
                guarantor.gender === 'Male' ? 1 : 0,
                guarantor.dateOfBirth,
                guarantor.relationship,
                guarantor.address,
                guarantor.province,
                guarantor.gsDivision,
                guarantor.dsOffice,
                guarantor.district,
                guarantor.mobile,
                guarantor.income,
                guarantor.employment,
                guarantor.accountNumber,
                guarantor.bankName,
                existingGuarantor[0].id
              ]
            );
          } else {
            // Insert new guarantor
            await connection.execute(
              `INSERT INTO guarantor (
                customerid, loandid, name, nic, gender, dob, relation,
                address, province, gs, ds, district, number, income, type,
                accountno, bankname
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                parseInt(data.customerId),
                loanId,
                guarantor.name,
                guarantor.nic,
                guarantor.gender === 'Male' ? 1 : 0,
                guarantor.dateOfBirth,
                guarantor.relationship,
                guarantor.address,
                guarantor.province,
                guarantor.gsDivision,
                guarantor.dsOffice,
                guarantor.district,
                guarantor.mobile,
                guarantor.income,
                guarantor.employment,
                guarantor.accountNumber,
                guarantor.bankName
              ]
            );
          }
        }
      }

      // Commit transaction
      await connection.commit();
      await connection.end();

      return new Response(
        JSON.stringify({
          success: true,
          loanId,
          message: "Loan application submitted successfully"
        }),
        { status: 200 }
      );
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Loan application submission error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500 }
    );
  }
}