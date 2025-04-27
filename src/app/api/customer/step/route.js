import { connectDB } from "@/lib/db";

export async function POST(req) {
  let connection;
  try {
    const data = await req.json();
    const { customer, spouse, step } = data;
    if (!customer || !customer.nic) {
      return Response.json({ error: "NIC is required", code: "INVALID_INPUT" }, { status: 400 });
    }

    connection = await connectDB();
    // Check if customer exists
    const [rows] = await connection.execute("SELECT * FROM customer WHERE nic = ?", [customer.nic]);
    let customerId;
    // Helper: default value
    const val = (v, d = "N/A") => (v !== undefined && v !== null && v !== "") ? v : d;
    // Prepare field sets for each step
    let updateFields = {};
    if (step === "personal") {
      updateFields = {
        fullname: val(customer.fullname, ""),
        gender: val(customer.gender, 1),
        dob: val(customer.dob, "0000-00-00"),
        location: val(customer.location),
        address: val(customer.address),
        gs: val(customer.gs),
        ds: val(customer.ds),
        district: val(customer.district),
        province: val(customer.province),
        utiltype: val(customer.utiltype),
        bankactype: "N/A",
        bank: "N/A",
        branch: "N/A",
        acno: "N/A",
        status: "draft",
        createby: val(customer.createby, "system"),
        editby: val(customer.editby, "system")
      };
    } else if (step === "bank") {
      updateFields = {
        bankactype: val(customer.bankactype),
        bank: val(customer.bank),
        branch: val(customer.branch),
        acno: val(customer.acno),
        status: "draft",
        editby: val(customer.editby, "system")
      };
    } else if (step === "relation") {
      // Only spouse table, but keep customer status draft
      updateFields = {
        status: "draft",
        editby: val(customer.editby, "system")
      };
    } else if (step === "status" && customer && customer.nic && customer.status) {
      await connection.execute(
        "UPDATE customer SET status = ? WHERE nic = ?",
        [customer.status, customer.nic]
      );
      await connection.end();
      return Response.json({ message: "Status updated successfully", code: "SUCCESS" }, { status: 200 });
    } else {
      // Final/full submit, but status always draft
      updateFields = {
        fullname: val(customer.fullname, ""),
        gender: val(customer.gender, 1),
        dob: val(customer.dob, "0000-00-00"),
        location: val(customer.location),
        address: val(customer.address),
        gs: val(customer.gs),
        ds: val(customer.ds),
        district: val(customer.district),
        province: val(customer.province),
        utiltype: val(customer.utiltype),
        bankactype: val(customer.bankactype),
        bank: val(customer.bank),
        branch: val(customer.branch),
        acno: val(customer.acno),
        status: "draft",
        createby: val(customer.createby, "system"),
        editby: val(customer.editby, "system")
      };
    }

    if (rows.length > 0) {
      // Update existing customer
      customerId = rows[0].id;
      const setStr = Object.keys(updateFields).map(f => `${f}=?`).join(", ");
      const setVals = Object.values(updateFields);
      setVals.push(customer.nic); // For WHERE
      await connection.execute(
        `UPDATE customer SET ${setStr}, editat=NOW() WHERE nic=?`,
        setVals
      );
    } else {
      // Insert new customer (fill all fields)
      const allFields = {
        fullname: val(customer.fullname, ""),
        nic: customer.nic,
        gender: val(customer.gender, 1),
        dob: val(customer.dob, "0000-00-00"),
        location: val(customer.location),
        address: val(customer.address),
        gs: val(customer.gs),
        ds: val(customer.ds),
        district: val(customer.district),
        province: val(customer.province),
        utiltype: val(customer.utiltype),
        bankactype: val(customer.bankactype, "N/A"),
        bank: val(customer.bank, "N/A"),
        branch: val(customer.branch, "N/A"),
        acno: val(customer.acno, "N/A"),
        status: "draft",
        createby: val(customer.createby, "system"),
        editby: val(customer.editby, "system")
      };
      const fieldNames = Object.keys(allFields);
      const fieldVals = Object.values(allFields);
      const [result] = await connection.execute(
        `INSERT INTO customer (${fieldNames.join(",")}) VALUES (${fieldNames.map(_ => "?").join(",")})`,
        fieldVals
      );
      customerId = result.insertId;
    }

    // Handle spouse (upsert by NIC and customer ID) on relation step
    if (spouse && spouse.name && step === "relation") {
      // Get customer id for relation
      const [custRows] = await connection.execute("SELECT id FROM customer WHERE nic = ?", [customer.nic]);
      const customerId = custRows.length > 0 ? custRows[0].id : null;
      if (!customerId) throw new Error("Customer not found for spouse relation");
      // Check if spouse already exists for this spouse nic and customer id
      const [spouseRows] = await connection.execute("SELECT id FROM spouse WHERE nic = ? AND customers = ?", [spouse.nic, customerId]);
      if (spouseRows.length > 0) {
        await connection.execute(
          `UPDATE spouse SET name=?, address=?, telno=?, relation=?, editby=?, editat=NOW() WHERE id=?`,
          [spouse.name, spouse.address, spouse.telno || '', spouse.relation, val(spouse.editby, 'system'), spouseRows[0].id]
        );
      } else {
        await connection.execute(
          `INSERT INTO spouse (nic, name, address, telno, relation, customers, createby, editby) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [spouse.nic, spouse.name, spouse.address, spouse.telno || '', spouse.relation, customerId, val(spouse.createby, 'system'), val(spouse.editby, 'system')]
        );
      }
    }

    await connection.end();
    return Response.json({ message: "Saved successfully", code: "SUCCESS" }, { status: 200 });
  } catch (error) {
    if (connection) try { await connection.end(); } catch (e) {}
    console.error("Customer Step API Error:", error);
    return Response.json({ error: error.message, code: error.code || "SERVER_ERROR" }, { status: 500 });
  }
}
