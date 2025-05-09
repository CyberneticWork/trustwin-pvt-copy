import { connectDB } from "@/lib/db";

// Helper function to fetch customer data
async function fetchCustomerData(customerId) {
  let connection;
  try {
    console.log('Fetching customer data for ID:', customerId);
    
    // Establish database connection
    connection = await connectDB();
    


    // Query customer details
    const [rows] = await connection.execute(
      `SELECT * FROM customer WHERE id = ?`,
      [customerId]
    );

    if (rows.length === 0) {
      console.log('No customer found for ID:', customerId);
      return {
        code: "ERROR",
        message: "No customer found with the given ID",
        status: 404
      };
    }

    const customer = rows[0];
    console.log('Customer found:', customer.fullname);

    // Helper to format date to dd.MM.yyyy
    function formatDate(dateVal) {
      if (!dateVal) return '';
      const d = new Date(dateVal);
      if (isNaN(d)) return '';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    }

    // Format customer data
    const customerData = {
      customerName: customer.fullname || '',
      customerNic: customer.nic || '',
      customerGender: customer.gender === 1 ? 'Male' : 'Female',
      customerCivilStatus: customer.prefix || '',
      customerDob: formatDate(customer.dob),
      customerAddress: customer.address || '',
      customerMobile: customer.telno || '',
      location: customer.location || '',
      district: customer.district || '',
      province: customer.province || '',
      gs: customer.gs || '',
      ds: customer.ds || '',
      email: customer.email || '',
      occupation: customer.occupation || '',
      employer: customer.employer || '',
      employerAddress: customer.employer_address || '',
      employerPhone: customer.employer_phone || '',
      emergencyContact: customer.emergency_contact || '',
      emergencyPhone: customer.emergency_phone || '',
      emergencyRelationship: customer.emergency_relationship || '',
      createdAt: formatDate(customer.created_at),
      updatedAt: formatDate(customer.updated_at)
    };

    return {
      code: "SUCCESS",
      message: "Customer data retrieved successfully",
      data: customerData,
      status: 200
    };
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return {
      code: "ERROR",
      message: error.message,
      status: 500
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Handle GET requests
export async function GET(request) {
  try {
    console.log('GET request received');
    console.log('Request URL:', request.url);
    
    // Parse URL and get customerId from query parameters
    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');
    
    console.log('Customer ID from query params:', customerId);

    if (!customerId) {
      console.log('No customerId provided');
      return new Response(
        JSON.stringify({
          code: "ERROR",
          message: "Customer ID is required as a query parameter (e.g., ?customerId=123)"
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const result = await fetchCustomerData(customerId);
    return new Response(
      JSON.stringify({
        code: result.code,
        message: result.message,
        data: result.data
      }),
      { 
        status: result.status,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in GET handler:', error);
    return new Response(
      JSON.stringify({
        code: "ERROR",
        message: "Internal server error: " + error.message
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// Handle POST requests
export async function POST(request) {
  try {
    console.log('POST request received');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { customerId } = body;

    if (!customerId) {
      console.log('No customerId in request body');
      return new Response(
        JSON.stringify({
          code: "ERROR",
          message: "Customer ID is required in request body"
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const result = await fetchCustomerData(customerId);
    return new Response(
      JSON.stringify({
        code: result.code,
        message: result.message,
        data: result.data
      }),
      { 
        status: result.status,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in POST handler:', error);
    return new Response(
      JSON.stringify({
        code: "ERROR",
        message: "Internal server error: " + error.message
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 