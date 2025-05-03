// components/PDFGenerator.jsx
"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import domtoimage from "dom-to-image";

/**
 * PDFGenerator - A component that generates professional PDF documents
 * Features:
 * - Clean, modern layout with proper spacing
 * - Enhanced typography and readability
 * - Professional color scheme
 * - Automatic page breaks with consistent margins
 * - Improved image quality and rendering
 * 
 * @param {Object} props - Component props
 * @param {React.RefObject} props.contentRef - Reference to the content to be converted to PDF
 * @param {string} props.filename - Name of the generated PDF file (without extension)
 * @returns {JSX.Element} Download button that generates PDF when clicked
 */
export default function PDFGenerator({ 
  contentRef,
  filename = "document"
}) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to create PDF document with proper settings
  const createPDFDocument = () => {
    return new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
  };

  // Helper function to calculate page dimensions and margins
  const calculatePageDimensions = (pdf) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const topMargin = 30; // mm
    const bottomMargin = 30; // mm
    const sideMargin = 25; // mm
    
    return {
      pageWidth,
      pageHeight,
      contentWidth: pageWidth - (2 * sideMargin),
      contentHeight: pageHeight - (topMargin + bottomMargin),
      margins: { top: topMargin, bottom: bottomMargin, side: sideMargin }
    };
  };

  // Helper function to add headers and footers
  const addHeadersAndFooters = (pdf, pageCount, dimensions) => {
    for (let i = 0; i < pageCount; i++) {
      pdf.setPage(i + 1);
      
      // Header
      pdf.setFontSize(12);
      pdf.setTextColor(50);
      pdf.text(filename, dimensions.margins.side, 15);
      
      // Footer with page number
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Page ${i + 1} of ${pageCount}`, 
        dimensions.pageWidth - dimensions.margins.side - 20,
        dimensions.pageHeight - 10
      );
    }
  };

  const generatePDF = async () => {
    if (!contentRef?.current) return;
    
    try {
      setGenerating(true);
      setError(null);

      // Add class to content for PDF-specific styling
      const element = contentRef.current;
      element.classList.add("generating-pdf");
      
      // Get original dimensions
      const originalWidth = element.offsetWidth;
      const originalHeight = element.offsetHeight;
      
      // Create PDF document
      const pdf = createPDFDocument();
      const dimensions = calculatePageDimensions(pdf);
      
      // Calculate scale factor
      const scaleFactor = dimensions.contentWidth / originalWidth;
      
      // Capture content as image
      const dataUrl = await captureContentAsImage(element, originalWidth, originalHeight);
      
      // Add content to PDF
      await addContentToPDF(pdf, dataUrl, dimensions, scaleFactor);
      
      // Add headers and footers
      addHeadersAndFooters(pdf, calculatePageCount(pdf, dimensions, scaleFactor), dimensions);
      
      // Download PDF
      pdf.save(`${filename}.pdf`);

    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(`PDF generation failed: ${err.message}`);
    } finally {
      // Clean up
      if (contentRef?.current) {
        contentRef.current.classList.remove("generating-pdf");
      }
      setGenerating(false);
    }
  };

  // Helper function to capture content as image
  const captureContentAsImage = async (element, width, height) => {
    const originalStyles = {
      width: element.style.width,
      maxWidth: element.style.maxWidth,
    };
    
    element.style.width = `${width}px`;
    element.style.maxWidth = `${width}px`;
    
    const dataUrl = await domtoimage.toPng(element, {
      width,
      height,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
      quality: 1.0,
    });
    
    element.style.width = originalStyles.width;
    element.style.maxWidth = originalStyles.maxWidth;
    
    return dataUrl;
  };

  // Helper function to add content to PDF
  const addContentToPDF = async (pdf, dataUrl, dimensions, scaleFactor) => {
    const img = new Image();
    img.src = dataUrl;
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    
    const scaledWidth = dimensions.contentWidth;
    const scaledHeight = img.height * scaleFactor;
    const pageCount = Math.ceil(scaledHeight / dimensions.contentHeight);
    
    for (let i = 0; i < pageCount; i++) {
      if (i > 0) pdf.addPage();
      
      const sourceY = (dimensions.contentHeight / scaleFactor) * i;
      const sourceHeight = Math.min(dimensions.contentHeight / scaleFactor, img.height - sourceY);
      const destHeight = sourceHeight * scaleFactor;
      
      pdf.addImage(
        dataUrl,
        'PNG',
        dimensions.margins.side,
        dimensions.margins.top,
        scaledWidth,
        destHeight,
        null,
        'FAST',
        0,
        sourceY,
        img.width,
        sourceHeight
      );
    }
  };

  // Helper function to calculate page count
  const calculatePageCount = (pdf, dimensions, scaleFactor) => {
    const img = new Image();
    img.src = pdf.output('datauristring');
    
    return Math.ceil(img.height * scaleFactor / dimensions.contentHeight);
  };

  return (
    <div>
      <Button 
        onClick={generatePDF} 
        variant="outline" 
        size="sm"
        disabled={generating}
      >
        {generating ? (
          <>
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
            Generating...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </>
        )}
      </Button>
      
      {error && (
        <div className="text-red-500 text-xs mt-2">
          {error}
        </div>
      )}
      
      <style jsx global>{`
        /* These styles will only apply when generating the PDF */
        .generating-pdf .pdf-only {
          display: block !important;
        }
        
        .generating-pdf {
          background-color: white !important;
          padding: 20px;
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
        }
        
        /* Typography and readability improvements */
        .generating-pdf h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #2D3748 !important;
        }
        
        .generating-pdf h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #4A5568 !important;
        }
        
        .generating-pdf h3 {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 10px;
          color: #718096 !important;
        }
        
        .generating-pdf p {
          font-size: 14px;
          margin-bottom: 15px;
          color: #4A5568 !important;
        }
        
        .generating-pdf ul, .generating-pdf ol {
          margin-bottom: 15px;
        }
        
        .generating-pdf li {
          margin-bottom: 8px;
        }
        
        /* Table styling */
        .generating-pdf table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .generating-pdf th, .generating-pdf td {
          border: 1px solid #E2E8F0;
          padding: 8px;
          text-align: left;
        }
        
        .generating-pdf th {
          background-color: #F7FAFC;
          font-weight: 600;
        }
        
        /* Color overrides for PDF generation */
        .generating-pdf *:not(.text-green-600):not(.text-red-600):not(.text-amber-600):not(.text-blue-600):not(.text-blue-700):not(.text-gray-400):not(.text-gray-500) {
          color: #4A5568 !important;
        }
        
        .generating-pdf .text-green-600 {
          color: #48BB78 !important;
        }
        
        .generating-pdf .text-red-600 {
          color: #F56565 !important;
        }
        
        .generating-pdf .text-amber-600 {
          color: #F6AD55 !important;
        }
        
        .generating-pdf .text-blue-600, .generating-pdf .text-blue-700 {
          color: #4299E1 !important;
        }
        
        .generating-pdf .text-gray-400 {
          color: #718096 !important;
        }
        
        .generating-pdf .text-gray-500 {
          color: #4A5568 !important;
        }
        
        /* Add page break styling for better PDF layout */
        .generating-pdf .card {
          page-break-inside: avoid;
          margin-bottom: 20px;
          padding: 15px;
          background-color: #F7FAFC;
          border-radius: 8px;
        }
        
        .generating-pdf .section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #E2E8F0;
        }
        
        @media screen {
          .pdf-only {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
