import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const loanId = formData.get('loan_id');

    if (!file || !loanId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Here you would typically process the file upload
    // For now, we'll just return a success response
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      path: `/uploads/${loanId}/${file.name}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}