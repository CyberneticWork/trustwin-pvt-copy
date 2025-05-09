import { connectDB } from "@/lib/db";

export async function POST(req) {

  try {
    const { customerId, loanId, employmentData } = await req.json();
    // console.log(customerId);

    // Log the received data
    // console.log('Received Data:', {
    //   customerId,
    //   loanId,
    //   employmentData
    // });

    if (!customerId || !loanId || !employmentData) {
      return Response.json({
        code: "ERROR",
        message: "Missing required fields"
      }, { status: 400 });
    }

    // Validate and set default employment type
    const validTypes = ['employee', 'owner'];
    // console.log(employmentData.businessRegistrationNumber);
    console.log(employmentData);
    
    
    const employmentType = validTypes.includes(employmentData.employmentType) 
      ? employmentData.employmentType 
      : 'employee'; // Default to employee if invalid

    // Log the employment type
    console.log('Employment Type:', employmentType);
    console.log(employmentData.businessRegistrationNumber );

    // Map fields based on employment type and convert empty strings to null
    const fields = {
      employment_type: employmentType,
      number: employmentType === 'employee' 
        ? (employmentData.companyRegistrationNumber || null) 
        : (employmentData.businessRegistrationNumber || null),
      address: employmentData.businessAddress || null,
      nature_of_business: employmentType === 'employee' 
        ? (employmentData.designation || null) 
        : (employmentData.natureOfBusiness || null),
      period: employmentType === 'employee' 
        ? (employmentData.experienceYears || null) 
        : (employmentData.businessPeriod || null),
      name: employmentType === 'employee' 
        ? (employmentData.companyName || null) 
        : (employmentData.businessName || null),
      type: employmentType === 'employee' 
        ? (employmentData.businessType || null) 
        : (employmentData.employmentTypeDetail || null),
      bussnessregno: employmentType === 'employee' 
        ? (employmentData.businessRegistrationNumber || null) 
        : (employmentData.businessRegistrationNumber || null),
      jobtitle: employmentType === 'employee' 
        ? (employmentData.designation || null) 
        : (employmentData.natureOfBusiness || null)
    };

    // Log the mapped fields
    // console.log('Mapped Fields:', fields);

    const connection = await connectDB();

    // Check if employment details already exist for this customer and loan
    const [existing] = await connection.execute(
      `SELECT id FROM equipment_loan_employment 
       WHERE customerid = ? AND loandid = ?`,
      [customerId, loanId]
    );

    // console.log(fields);
    if (existing.length > 0) {
      // Log existing record details
      // console.log('Existing Record:', existing[0]);

      // Update existing record
      const [updateResult] = await connection.execute(
        `UPDATE equipment_loan_employment 
         SET employment_type = ?, number = ?, address = ?, 
             nature_of_business = ?, period = ?, name = ?, 
             type = ?, bussnessregno = ?, jobtitle = ?
         WHERE customerid = ? AND loandid = ?`,
        [
          fields.employment_type,
          fields.number || null,
          fields.address || null,
          fields.nature_of_business || null,
          fields.period || null,
          fields.name || null,
          fields.type || null,
          fields.bussnessregno || null,
          fields.jobtitle || null,
          customerId,
          loanId
        ]
      );

      // console.log('Update Result:', updateResult);
      if (updateResult.affectedRows === 0) {
        return Response.json({
          code: "ERROR",
          message: "Failed to update employment details"
        }, { status: 404 });
      }
    } else {
      // Insert new record
      const [insertResult] = await connection.execute(
        `INSERT INTO equipment_loan_employment 
         (customerid, loandid, employment_type, number, address, 
          nature_of_business, period, name, type, bussnessregno, jobtitle) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          loanId,
          fields.employment_type,
          fields.number || null,
          fields.address || null,
          fields.nature_of_business || null,
          fields.period || null,
          fields.name || null,
          fields.type || null,
          fields.bussnessregno || null,
          fields.jobtitle || null
        ]
      );

      // console.log('Insert Result:', insertResult);
    }

    return Response.json({
      code: "SUCCESS",
      message: "Employment details saved successfully"
    });

  } catch (error) {
    console.error('Error in employment API:', {
      error: error.message,
      stack: error.stack,
      customerId,
      loanId,
      employmentData,
      fields
    });
    return Response.json({
      code: "ERROR",
      message: "Failed to save employment details"
    }, { status: 500 });
  }
}
