// components/PDFGenerator.jsx
"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import domtoimage from "dom-to-image";

/**
 * PDFGenerator - A component that generates PDF files from React content
 * Uses dom-to-image library with content centered on all pages
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

  const generatePDF = async () => {
    if (!contentRef?.current) return;
    
    try {
      setGenerating(true);
      setError(null);

      // Add class to content for PDF-specific styling
      const element = contentRef.current;
      element.classList.add("generating-pdf");
      
      // Get original dimensions of the element
      const originalWidth = element.offsetWidth;
      const originalHeight = element.offsetHeight;
      
      // Create a PDF document with A4 dimensions (in mm)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      // Get dimensions of A4 page in mm
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Set consistent margins for all pages
      const margin = 15; // mm
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);
      
      // Calculate scale factor to fit content width to PDF width
      const scaleFactor = contentWidth / originalWidth;
      
      // Apply a fixed width to the element for consistent rendering
      const originalStyles = {
        width: element.style.width,
        maxWidth: element.style.maxWidth,
      };
      
      element.style.width = `${originalWidth}px`;
      element.style.maxWidth = `${originalWidth}px`;
      
      // Create a PNG image of the element at higher quality
      const dataUrl = await domtoimage.toPng(element, {
        width: originalWidth,
        height: originalHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
        quality: 1.0,
      });
      
      // Restore original styles
      element.style.width = originalStyles.width;
      element.style.maxWidth = originalStyles.maxWidth;
      
      // Create an image object
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Calculate the scaled dimensions for the content
      // This preserves the aspect ratio
      const scaledWidth = contentWidth;
      const scaledHeight = img.height * scaleFactor;
      
      // Calculate number of pages needed
      const pageCount = Math.ceil(scaledHeight / contentHeight);
      
      // Add content to PDF, one page at a time
      for (let i = 0; i < pageCount; i++) {
        // Add new page after the first one
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate the portion of the image to use for this page
        const sourceY = (contentHeight / scaleFactor) * i;
        const sourceHeight = Math.min(contentHeight / scaleFactor, img.height - sourceY);
        const destHeight = sourceHeight * scaleFactor;
        
        // Center content horizontally on the page
        const xPosition = (pageWidth - scaledWidth) / 2;
        // Center content vertically within the available content area
        const yPosition = (pageHeight - Math.min(destHeight, contentHeight)) / 2;
        
        // Add the image slice to the PDF
        pdf.addImage(
          dataUrl,
          'PNG',
          xPosition,
          yPosition,
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
      
      // Download the PDF
      pdf.save(`${filename}.pdf`);

    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(`PDF generation failed: ${err.message}`);
    } finally {
      // Remove the PDF generation class
      if (contentRef?.current) {
        contentRef.current.classList.remove("generating-pdf");
      }
      setGenerating(false);
    }
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
        }
        
        /* Color overrides for PDF generation */
        .generating-pdf *:not(.text-green-600):not(.text-red-600):not(.text-amber-600):not(.text-blue-600):not(.text-blue-700):not(.text-gray-400):not(.text-gray-500) {
          color: #000000 !important;
        }
        
        .generating-pdf .text-green-600 {
          color: #16a34a !important;
        }
        
        .generating-pdf .text-red-600 {
          color: #dc2626 !important;
        }
        
        .generating-pdf .text-amber-600 {
          color: #d97706 !important;
        }
        
        .generating-pdf .text-blue-600, .generating-pdf .text-blue-700 {
          color: #2563eb !important;
        }
        
        .generating-pdf .text-gray-400 {
          color: #9ca3af !important;
        }
        
        .generating-pdf .text-gray-500 {
          color: #6b7280 !important;
        }
        
        /* Add page break styling for better PDF layout */
        .generating-pdf .card {
          page-break-inside: avoid;
          margin-bottom: 15px;
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
