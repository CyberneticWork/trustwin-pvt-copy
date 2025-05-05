import { connectDB } from "@/lib/db";

export async function POST(req) {
  let connection;
  try {
    // Parse the incoming form data
    const formData = await req.formData();
    const loanId = formData.get('loanId');

    if (!loanId) {
      return new Response(
        JSON.stringify({
          code: "ERROR",
          message: "loanId is required"
        }),
        { status: 400 }
      );
    }

    // Collect all image files dynamically
    const imageFiles = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image') && value instanceof File) {
        const index = parseInt(key.replace('image', ''), 10);
        imageFiles.push({ file: value, index });
      }
    }

    if (imageFiles.length === 0) {
      return new Response(
        JSON.stringify({
          code: "ERROR",
          message: "At least one image is required"
        }),
        { status: 400 }
      );
    }

    // Establish database connection
    connection = await connectDB();

    // Check if the business record exists
    const [existingRecord] = await connection.execute(
      `SELECT id FROM businessdetails WHERE loandid = ?`,
      [parseInt(loanId, 10)]
    );

    if (existingRecord.length === 0) {
      // Insert a new record with basic details
      await connection.execute(
        `INSERT INTO businessdetails (
          customerid, loandid, nature, name, regno, type, addres
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [1, parseInt(loanId, 10), '', '', '', '', ''] // Default values
      );
    }

    // Process each image file
    for (const { file, index } of imageFiles) {
      try {
        // Upload the image to the external API
        const uploadFormData = new FormData();
        uploadFormData.append('loan_id', loanId);
        uploadFormData.append('image', file);

        const uploadResponse = await fetch(process.env.API+'/upload.php', {
          method: 'POST',
          body: uploadFormData
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload image ${index}: ${uploadResponse.statusText}`);
        }

        const uploadResult = await uploadResponse.json();
        console.log(uploadResult.filename);
        if (uploadResult.message !== "File uploaded successfully") {
          throw new Error(uploadResult.message || `Failed to upload image ${index}`);
        }

        // Update the businessdetails table with the image URL/path
        console.log(loanId);
        const [updateResult] = await connection.execute(
          `UPDATE businessdetails SET img${index} = ? WHERE loandid = ?`,
          [uploadResult.filename, parseInt(loanId, 10)] // Assuming the API returns a `fileUrl`
        );

        if (updateResult.affectedRows === 0) {
          throw new Error(`Failed to update business record for image ${index}`);
        }
      } catch (uploadError) {
        console.error(`Error processing image ${index}:`, uploadError);
        // Continue processing other images even if one fails
        continue;
      }
    }

    return new Response(
      {
        code: "SUCCESS",
        message: "Business images uploaded successfully"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading business images:", error);
    return new Response(
      {
        code: "ERROR",
        message: error.message
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}