// printBill.js
// Enhanced utility to open a printable payment receipt with improved design for A4 paper size

export function openPrintBill(receipt) {
  // Get current user name from localStorage
  let CRO = '';
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    CRO = user.name || 'System';
  } catch (e) {
    CRO = 'System';
  }
  
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Payment Receipt - Trustwin Private Limited</title>
    <style>
      @page {
        size: A4;
        margin: 0;
      }

      @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

      body {
        font-family: "Poppins", "Segoe UI", Arial, sans-serif;
        background: #fff;
        color: #334155;
        margin: 0;
        padding: 0;
        position: relative;
        line-height: 1;
      }

      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.08;
        width: 60%;
        height: auto;
        z-index: 0;
        user-select: none;
        pointer-events: none;
      }

      .receipt-container {
        width: 100%; /* A4 width */
        height: 95vh; /* A4 height */
        margin: 0 auto;
        padding: 10mm 20mm;
        box-sizing: border-box;
        position: relative;
        z-index: 1;
      }

      .receipt-border {
        position: absolute;
        top: 5mm;
        left: 15mm;
        right: 15mm;
        bottom: 5mm;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        pointer-events: none;
        z-index: 0;
      }

      .color-strip {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2mm;
        background: linear-gradient(90deg, #1e40af, #3b82f6);
        border-radius: 12px 12px 0 0;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
        position: relative;
      }

      .logo-container {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }

      .logo {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 20px;
        margin-right: 15px;
      }

      .company-info {
        flex: 1;
      }

      .company-name {
        font-size: 20px;
        font-weight: 700;
        color: #1e40af;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
      }

      .address-container {
        display: flex;
        gap: 40px;
        margin-top: 15px;
      }

      .address {
        font-size: 13px;
        line-height: 1.5;
        color: #64748b;
      }

      .address-title {
        font-weight: 600;
        color: #334155;
        margin-bottom: 4px;
      }

      .receipt-title-container {
        text-align: right;
        padding: 15px 20px;
        background: #f8fafc;
        border-radius: 10px;
        border-left: 4px solid #1e40af;
        min-width: 200px;
      }

      .receipt-title {
        font-size: 26px;
        color: #1e40af;
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .receipt-number {
        font-size: 16px;
        font-weight: 500;
        color: #64748b;
        margin-top: 5px;
      }

      .receipt-details {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 5px;
        margin-bottom: 5px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      }

      .receipt-details-title {
        margin-top: 0;
        margin-bottom: 20px;
        color: #1e40af;
        font-size: 18px;
        font-weight: 600;
        padding-bottom: 8px;
        border-bottom: 1px solid #e2e8f0;
      }

      .row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        padding: 3px 0;
      }

      .payment-info {
        margin: 10px 0;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 11px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      }

      .payment-title {
        margin-top: 0;
        margin-bottom: 20px;
        color: #1e40af;
        font-size: 18px;
        font-weight: 600;
        padding-bottom: 10px;
        border-bottom: 1px solid #e2e8f0;
      }

      .payment-row {
        padding: 6px 0;
        border-top: 1px dashed #e2e8f0;
      }

      .payment-row:first-of-type {
        border-top: none;
      }

      .total-row {
        font-size: 18px;
        font-weight: 700;
        margin-top: 15px;
        padding: 15px 0;
        border-top: 2px solid #e2e8f0;
        color: #1e40af;
      }

      .label {
        font-weight: 500;
        color: #64748b;
      }

      .value {
        color: #334155;
        text-align: right;
        font-weight: 500;
      }

      .amount-value {
        font-weight: 600;
        color: #1e3a8a;
      }

      .cashier-info {
        margin-top: 15px;
        padding: 10px 15px;
        background: #f8fafc;
        border-radius: 8px;
        font-size: 14px;
        display: inline-block;
      }

      .signature-section {
        margin-top: 80px;
        display: flex;
        justify-content: space-between;
      }

      .signature {
        border-top: 1.5px solid #94a3b8;
        padding-top: 10px;
        width: 220px;
        text-align: center;
        font-size: 14px;
        color: #475569;
      }

      .footer {
        position: absolute;
        bottom: 25mm;
        left: 20mm;
        right: 20mm;
        text-align: center;
        color: #64748b;
        border-top: 1px solid #e2e8f0;
        padding-top: 15px;
      }

      .thank-you {
        font-size: 16px;
        font-weight: 600;
        color: #1e40af;
        margin-bottom: 5px;
      }

      .footer-note {
        font-size: 12px;
        color: #94a3b8;
      }

      .qr-code {
        position: absolute;
        bottom: 25mm;
        right: 20mm;
        width: 80px;
        height: 80px;
        background-color: #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: #64748b;
        border: 1px solid #e2e8f0;
      }

      @media print {
        html,
        body {
          width: 100%;
          height: 100vh;
        }
        .receipt-container {
          page-break-after: always;
        }
      }
    </style>
  </head>
  <body>
    <!-- Logo watermark as background image -->
    <img
      src="/images/logo.png"
       class="watermark"
      alt="Trustwin Logo Watermark"
    />

    <div class="receipt-container">
      <div class="receipt-border">
        <div class="color-strip"></div>
      </div>

      <div class="header">
        <div class="company-info">
          <div class="logo-container">
            <div class="logo">
              <img width="50px" height="40px" src="/images/logo.png" alt="Trustwin Logo" />
            </div>
            <div class="company-name">Trustwin Private Limited</div>
          </div>
          <div class="address-container">
            <div class="address">
              <div class="address-title">Head Office</div>
              <div>Gamini Road (Station Road)</div>
              <div>Ja-Ela</div>
              <div>Tel: +94 11 123 4567</div>
            </div>
            <div class="address">
              <div class="address-title">Branch Office</div>
              <div>462/1, Kandy Road</div>
              <div>Kadawatha</div>
              <div>Tel: +94 11 789 4561</div>
            </div>
          </div>
          <div class="cashier-info"><strong>Cashier:</strong> ${CRO}</div>
        </div>
        <div class="receipt-title-container">
          <div class="receipt-title">PAYMENT RECEIPT</div>
          <div class="receipt-number">#${receipt.receiptNo}</div>
        </div>
      </div>

      <div class="receipt-details">
        <h3 class="receipt-details-title">Receipt Information</h3>
        <div class="row">
          <span class="label">Receipt Date:</span
          ><span class="value"
            >${new Date(receipt.paidAt).toLocaleString()}</span
          >
        </div>
        <div class="row">
          <span class="label">Contract No:</span
          ><span class="value">${receipt.contractNo}</span>
        </div>
        <div class="row">
          <span class="label">Borrower Name:</span
          ><span class="value">${receipt.borrowerName}</span>
        </div>
        <div class="row">
          <span class="label">Payment Method:</span
          ><span class="value">${receipt.paymentMethod}</span>
        </div>
        <div class="row">
          <span class="label">Reference No:</span
          ><span class="value">${receipt.referenceNo || '-'}</span>
        </div>
      </div>

      <div class="payment-info">
        <h3 class="payment-title">Payment Details</h3>

        <div class="row payment-row">
          <span class="label">Paid Amount:</span>
          <span class="value amount-value"
            >LKR ${Number(receipt.amount).toLocaleString(undefined,
            {minimumFractionDigits:2})}</span
          >
        </div>

        <div class="row payment-row">
          <span class="label">Previous Arrears:</span>
          <span class="value"
            >LKR ${Number(receipt.arrearsAmount).toLocaleString(undefined,
            {minimumFractionDigits:2})}</span
          >
        </div>

        <div class="row payment-row">
          <span class="label">Remaining Arrears:</span>
          <span class="value"
            >LKR ${Number(receipt.remainingArrears).toLocaleString(undefined,
            {minimumFractionDigits:2})}</span
          >
        </div>

        <div class="row payment-row">
          <span class="label">Settlement Amount:</span>
          <span class="value"
            >LKR ${Number(receipt.settlement).toLocaleString(undefined,
            {minimumFractionDigits:2})}</span
          >
        </div>

        <div class="row payment-row">
          <span class="label">Remaining Settlement:</span>
          <span class="value"
            >LKR ${Number(receipt.remainingSettlement).toLocaleString(undefined,
            {minimumFractionDigits:2})}</span
          >
        </div>

        <div class="row total-row">
          <span class="label">Total Amount:</span>
          <span class="value amount-value"
            >LKR ${Number(receipt.totalAmount).toLocaleString(undefined,
            {minimumFractionDigits:2})}</span
          >
        </div>
      </div>

      <div class="signature-section">
        <div class="signature">Authorized Signature</div>
        <div class="signature">Customer Signature</div>
      </div>

      <div class="footer">
        <p class="thank-you">Thank you for your payment!</p>
        <p class="footer-note">
          This is a computer-generated receipt and does not require physical
          signature.
        </p>
      </div>
    </div>

    <script>
      window.onload = function () {
        window.print();
        setTimeout(() => window.close(), 500);
      };
    </script>
  </body>
</html>
`;
  const win = window.open('', '_blank', 'width=800,height=1100');
  win.document.write(html);
  win.document.close();
}