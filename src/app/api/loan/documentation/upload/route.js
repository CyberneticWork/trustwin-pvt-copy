import { connectDB } from "@/lib/db";

export async function POST(req) {
  let connection;
  try {
    // Parse the incoming form data
    const formData = await req.formData();
    const loanId = formData.get('loanId');
    const docType = formData.get('doctype');
    const file = formData.get('file');

    if (!loanId || !docType || !file) {
      return new Response(
        JSON.stringify({
          code: "ERROR",
          message: "loanId, doctype, and file are required"
        }),
        { status: 400 }
      );
    }

    // Establish database connection
    connection = await connectDB();

    // Upload to external file upload API
    const uploadFormData = new FormData();
    uploadFormData.append('loan_id', loanId);
    uploadFormData.append('image', file);

    const uploadResponse = await fetch(process.env.API+'/upload.php', {
      method: 'POST',
      body: uploadFormData
    });

    if (!uploadResponse.ok) {
      let errorData = {};
      let rawErrorText = '';
      try {
        errorData = await uploadResponse.json();
      } catch (jsonErr) {
        try {
          rawErrorText = await uploadResponse.text();
        } catch (textErr) {
          rawErrorText = '[Unable to read error response body]';
        }
      }
      console.error('External upload.php error:', errorData, rawErrorText);
      throw new Error(`Failed to upload file: ${errorData.message || rawErrorText || uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();
    
    if (!uploadResult.filename) {
      throw new Error("No filename received from upload service");
    }

    // Update or insert the record
    const [existingRecord] = await connection.execute(
      `SELECT id FROM requireddocumentation WHERE loanid = ? AND doctype = ?`,
      [parseInt(loanId, 10), docType]
    );

    if (existingRecord.length > 0) {
      // Update existing record
      await connection.execute(
        `UPDATE requireddocumentation SET filename = ? WHERE loanid = ? AND doctype = ?`,
        [uploadResult.filename, parseInt(loanId, 10), docType]
      );
    } else {
      // Insert new record
      await connection.execute(
        `INSERT INTO requireddocumentation (loanid, doctype, filename) VALUES (?, ?, ?)`,
        [parseInt(loanId, 10), docType, uploadResult.filename]
      );
    }

    return new Response(
      JSON.stringify({
        code: "SUCCESS",
        message: "Documentation uploaded successfully",
        filename: uploadResult.filename
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error uploading documentation:", error);
    return new Response(
      JSON.stringify({
        code: "ERROR",
        message: error.message
      }),
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}