import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { UploadedFile, CoverPageData } from '../types';

// Helper to wrap text
const wrapText = (text: string, width: number, font: any, fontSize: number) => {
  const words = text.split(' ');
  let line = '';
  let result = [];
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > width && n > 0) {
      result.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  result.push(line);
  return result;
};

export const mergePdfs = async (
  files: UploadedFile[], 
  fileName: string,
  coverPageData?: CoverPageData
): Promise<void> => {
  try {
    const mergedPdf = await PDFDocument.create();

    // 1. Add Cover Page if data exists
    if (coverPageData) {
      const coverPage = mergedPdf.addPage([595.28, 841.89]); // A4 size
      const { width, height } = coverPage.getSize();
      const helveticaFont = await mergedPdf.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

      // Title
      coverPage.drawText(coverPageData.title, {
        x: 50,
        y: height - 150,
        size: 28,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.1), // Nearly black
        maxWidth: width - 100,
      });

      // Subtitle
      coverPage.drawText(coverPageData.subtitle, {
        x: 50,
        y: height - 200,
        size: 18,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4), // Grey
        maxWidth: width - 100,
      });

      // Decorative Line - Sleek black/grey
      coverPage.drawLine({
        start: { x: 50, y: height - 230 },
        end: { x: width - 50, y: height - 230 },
        thickness: 1,
        color: rgb(0.2, 0.2, 0.2),
      });

      // Abstract (Wrapped)
      const wrappedAbstract = wrapText(coverPageData.abstract, width - 100, helveticaFont, 12);
      let yPosition = height - 280;
      
      wrappedAbstract.forEach(line => {
        coverPage.drawText(line, {
          x: 50,
          y: yPosition,
          size: 12,
          font: helveticaFont,
          color: rgb(0.25, 0.25, 0.25),
        });
        yPosition -= 18;
      });
      
      // Footer
      coverPage.drawText("Muhammed's PDF Manager", {
         x: 50,
         y: 50,
         size: 10,
         font: helveticaFont,
         color: rgb(0.6, 0.6, 0.6)
      });
    }

    // 2. Merge uploaded files
    for (const pdfFile of files) {
      const fileBuffer = await pdfFile.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    
    // 3. Trigger Download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error("Merge Error:", error);
    throw new Error("Failed to merge PDFs.");
  }
};