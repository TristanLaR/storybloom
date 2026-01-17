"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Lulu print specifications for 8.75" x 8.75" square book
const PRINT_SPECS = {
  // Page size in points (72 points = 1 inch)
  pageWidth: 8.75 * 72, // 630 points
  pageHeight: 8.75 * 72, // 630 points

  // Bleed area (0.125" on all sides)
  bleedSize: 0.125 * 72, // 9 points

  // Safety margin (0.5" from edge after trim)
  safetyMargin: 0.5 * 72, // 36 points

  // Text area (within safety margins)
  get textAreaX() {
    return this.safetyMargin;
  },
  get textAreaY() {
    return this.safetyMargin;
  },
  get textAreaWidth() {
    return this.pageWidth - this.safetyMargin * 2;
  },
  get textAreaHeight() {
    return this.pageHeight - this.safetyMargin * 2;
  },
};

// Font sizes in points
const FONT_SIZES = {
  title: 36,
  author: 18,
  storyText: 14,
  pageNumber: 10,
};

// Text position mappings
const TEXT_POSITIONS: Record<string, number> = {
  top: 0.85, // 85% from bottom
  middle: 0.5, // 50% from bottom
  bottom: 0.15, // 15% from bottom
};

// Generate the interior PDF
export const generateInteriorPdf = action({
  args: {
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    // Get the book data
    const book = await ctx.runQuery(internal.books.internalQueries.getBookInternal, {
      bookId: args.bookId,
    });

    if (!book) {
      throw new Error("Book not found");
    }

    // Get all pages
    const pages = await ctx.runQuery(internal.pages.queries.getBookPagesInternal, {
      bookId: args.bookId,
    });

    if (!pages || pages.length === 0) {
      throw new Error("No pages found for this book");
    }

    // Create the PDF document
    const pdfDoc = await PDFDocument.create();

    // Embed standard fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Process each page
    for (const bookPage of pages) {
      // Create a new PDF page with bleed
      const page = pdfDoc.addPage([
        PRINT_SPECS.pageWidth,
        PRINT_SPECS.pageHeight,
      ]);

      // Draw background (white)
      page.drawRectangle({
        x: 0,
        y: 0,
        width: PRINT_SPECS.pageWidth,
        height: PRINT_SPECS.pageHeight,
        color: rgb(1, 1, 1),
      });

      // Embed the page image if it exists
      if (bookPage.imageId) {
        try {
          const imageUrl = await ctx.storage.getUrl(bookPage.imageId);
          if (imageUrl) {
            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            const imageBytes = new Uint8Array(imageBuffer);

            // Determine image type and embed
            let embeddedImage;
            if (isPng(imageBytes)) {
              embeddedImage = await pdfDoc.embedPng(imageBytes);
            } else if (isJpeg(imageBytes)) {
              embeddedImage = await pdfDoc.embedJpg(imageBytes);
            }

            if (embeddedImage) {
              // Draw image to fill the page (with bleed)
              const { width: imgWidth, height: imgHeight } = embeddedImage;
              const scale = Math.max(
                PRINT_SPECS.pageWidth / imgWidth,
                PRINT_SPECS.pageHeight / imgHeight
              );

              const scaledWidth = imgWidth * scale;
              const scaledHeight = imgHeight * scale;

              // Center the image
              const x = (PRINT_SPECS.pageWidth - scaledWidth) / 2;
              const y = (PRINT_SPECS.pageHeight - scaledHeight) / 2;

              page.drawImage(embeddedImage, {
                x,
                y,
                width: scaledWidth,
                height: scaledHeight,
              });
            }
          }
        } catch (error) {
          console.error(`Failed to embed image for page ${bookPage.pageNumber}:`, error);
          // Continue without image
        }
      }

      // Draw text content
      if (bookPage.textContent) {
        const textY =
          PRINT_SPECS.pageHeight * TEXT_POSITIONS[bookPage.textPosition];

        // Draw semi-transparent text background
        const textLines = wrapText(
          bookPage.textContent,
          PRINT_SPECS.textAreaWidth - 40,
          helvetica,
          FONT_SIZES.storyText
        );

        const lineHeight = FONT_SIZES.storyText * 1.4;
        const textBlockHeight = textLines.length * lineHeight + 24;
        const textBlockWidth = PRINT_SPECS.textAreaWidth - 40;

        // Calculate text block position
        const textBlockX = (PRINT_SPECS.pageWidth - textBlockWidth) / 2;
        let textBlockY = textY - textBlockHeight / 2;

        // Ensure text stays within safety margins
        textBlockY = Math.max(
          PRINT_SPECS.safetyMargin + 20,
          Math.min(
            PRINT_SPECS.pageHeight - PRINT_SPECS.safetyMargin - textBlockHeight - 20,
            textBlockY
          )
        );

        // Draw text background
        page.drawRectangle({
          x: textBlockX - 16,
          y: textBlockY - 12,
          width: textBlockWidth + 32,
          height: textBlockHeight + 24,
          color: rgb(1, 1, 1),
          opacity: 0.85,
          borderColor: rgb(0.9, 0.9, 0.9),
          borderWidth: 1,
        });

        // Draw text
        const font = bookPage.pageType === "title" ? helveticaBold : helvetica;
        const fontSize =
          bookPage.pageType === "title" ? FONT_SIZES.title : FONT_SIZES.storyText;

        let currentY = textBlockY + textBlockHeight - lineHeight;

        for (const line of textLines) {
          const textWidth = font.widthOfTextAtSize(line, fontSize);
          const textX = (PRINT_SPECS.pageWidth - textWidth) / 2; // Center text

          page.drawText(line, {
            x: textX,
            y: currentY,
            size: fontSize,
            font,
            color: rgb(0.1, 0.1, 0.1),
          });

          currentY -= lineHeight;
        }
      }

      // Add page number (except for title and back cover)
      if (bookPage.pageType === "story") {
        const pageNumText = String(bookPage.pageNumber);
        const pageNumWidth = helvetica.widthOfTextAtSize(
          pageNumText,
          FONT_SIZES.pageNumber
        );

        page.drawText(pageNumText, {
          x: (PRINT_SPECS.pageWidth - pageNumWidth) / 2,
          y: PRINT_SPECS.safetyMargin / 2,
          size: FONT_SIZES.pageNumber,
          font: helvetica,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    }

    // Generate the PDF bytes
    const pdfBytes = await pdfDoc.save();

    // Store the PDF in Convex storage
    // Convert Uint8Array to ArrayBuffer for Blob compatibility
    const arrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    const storageId = await ctx.storage.store(blob);

    // Update the book with the PDF ID
    await ctx.runMutation(internal.books.internalMutations.updateInteriorPdf, {
      bookId: args.bookId,
      interiorPdfId: storageId,
    });

    return {
      success: true,
      storageId,
      pageCount: pages.length,
    };
  },
});

// Helper function to wrap text
function wrapText(
  text: string,
  maxWidth: number,
  font: any,
  fontSize: number
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    const words = paragraph.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

// Helper function to check if bytes are PNG
function isPng(bytes: Uint8Array): boolean {
  return (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

// Helper function to check if bytes are JPEG
function isJpeg(bytes: Uint8Array): boolean {
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

// Lulu cover specifications
const COVER_SPECS = {
  // Page dimensions (same as interior)
  pageWidth: 8.75 * 72, // 630 points
  pageHeight: 8.75 * 72, // 630 points

  // Bleed
  bleed: 0.125 * 72, // 9 points

  // Spine width per page (approximate - Lulu provides exact calculator)
  // For standard paper, approximately 0.0025" per page
  spineWidthPerPage: 0.0025 * 72, // ~0.18 points per page

  // Minimum spine width for spine text (80 pages minimum per Lulu guidelines)
  minPagesForSpineText: 80,

  // Safety margins for text
  safetyMargin: 0.5 * 72, // 36 points
};

// Calculate spine width based on page count
function calculateSpineWidth(pageCount: number): number {
  // Lulu formula: approximately 0.0025" per page for standard paper
  // Minimum 24 pages = ~0.06" (about 4.3 points)
  return Math.max(pageCount * COVER_SPECS.spineWidthPerPage, 0.06 * 72);
}

// Generate the cover PDF (spread: back cover + spine + front cover)
export const generateCoverPdf = action({
  args: {
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    // Get the book data
    const book = await ctx.runQuery(internal.books.internalQueries.getBookInternal, {
      bookId: args.bookId,
    });

    if (!book) {
      throw new Error("Book not found");
    }

    // Get page count
    const pages = await ctx.runQuery(internal.pages.queries.getBookPagesInternal, {
      bookId: args.bookId,
    });

    const pageCount = pages?.length || 24;

    // Calculate dimensions
    const spineWidth = calculateSpineWidth(pageCount);
    const coverWidth =
      COVER_SPECS.pageWidth * 2 + spineWidth + COVER_SPECS.bleed * 2;
    const coverHeight = COVER_SPECS.pageHeight + COVER_SPECS.bleed * 2;

    // Create the PDF document
    const pdfDoc = await PDFDocument.create();

    // Embed fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Create single cover page
    const page = pdfDoc.addPage([coverWidth, coverHeight]);

    // Draw white background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: coverWidth,
      height: coverHeight,
      color: rgb(1, 1, 1),
    });

    // Calculate section positions (from left: back cover, spine, front cover)
    const backCoverX = COVER_SPECS.bleed;
    const spineX = COVER_SPECS.bleed + COVER_SPECS.pageWidth;
    const frontCoverX = COVER_SPECS.bleed + COVER_SPECS.pageWidth + spineWidth;

    // Draw front cover image if available
    if (book.coverImageId) {
      try {
        const imageUrl = await ctx.storage.getUrl(book.coverImageId);
        if (imageUrl) {
          const imageResponse = await fetch(imageUrl);
          const imageBuffer = await imageResponse.arrayBuffer();
          const imageBytes = new Uint8Array(imageBuffer);

          let embeddedImage;
          if (isPng(imageBytes)) {
            embeddedImage = await pdfDoc.embedPng(imageBytes);
          } else if (isJpeg(imageBytes)) {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          }

          if (embeddedImage) {
            // Draw on front cover area (with some bleed extension)
            const { width: imgWidth, height: imgHeight } = embeddedImage;
            const scale = Math.max(
              (COVER_SPECS.pageWidth + COVER_SPECS.bleed) / imgWidth,
              (COVER_SPECS.pageHeight + COVER_SPECS.bleed * 2) / imgHeight
            );

            const scaledWidth = imgWidth * scale;
            const scaledHeight = imgHeight * scale;

            page.drawImage(embeddedImage, {
              x: frontCoverX + (COVER_SPECS.pageWidth - scaledWidth) / 2,
              y: (coverHeight - scaledHeight) / 2,
              width: scaledWidth,
              height: scaledHeight,
            });
          }
        }
      } catch (error) {
        console.error("Failed to embed cover image:", error);
      }
    }

    // Draw front cover text overlay
    const title = book.title || "Untitled";
    const author = book.authorName || "";

    // Title on front cover
    const titleFontSize = 36;
    const titleLines = wrapText(title, COVER_SPECS.pageWidth - 80, helveticaBold, titleFontSize);
    const titleLineHeight = titleFontSize * 1.3;
    const titleBlockHeight = titleLines.length * titleLineHeight;
    const titleY = coverHeight / 2 + titleBlockHeight / 2;

    // Draw title background
    page.drawRectangle({
      x: frontCoverX + 30,
      y: titleY - titleBlockHeight - 20,
      width: COVER_SPECS.pageWidth - 60,
      height: titleBlockHeight + 40 + (author ? 40 : 0),
      color: rgb(0, 0, 0),
      opacity: 0.5,
    });

    // Draw title text
    let currentY = titleY;
    for (const line of titleLines) {
      const textWidth = helveticaBold.widthOfTextAtSize(line, titleFontSize);
      const textX = frontCoverX + (COVER_SPECS.pageWidth - textWidth) / 2;

      page.drawText(line, {
        x: textX,
        y: currentY,
        size: titleFontSize,
        font: helveticaBold,
        color: rgb(1, 1, 1),
      });

      currentY -= titleLineHeight;
    }

    // Draw author name
    if (author) {
      const authorFontSize = 18;
      const authorText = `by ${author}`;
      const authorWidth = helvetica.widthOfTextAtSize(authorText, authorFontSize);
      const authorX = frontCoverX + (COVER_SPECS.pageWidth - authorWidth) / 2;

      page.drawText(authorText, {
        x: authorX,
        y: currentY - 10,
        size: authorFontSize,
        font: helvetica,
        color: rgb(1, 1, 1),
      });
    }

    // Draw spine (only add text if book has enough pages)
    page.drawRectangle({
      x: spineX,
      y: COVER_SPECS.bleed,
      width: spineWidth,
      height: COVER_SPECS.pageHeight,
      color: rgb(0.95, 0.95, 0.95), // Light gray spine
    });

    // Note: Spine text is only added for books with 80+ pages per Lulu guidelines
    // For books with fewer pages, the spine is too narrow for readable text

    // Draw back cover
    page.drawRectangle({
      x: backCoverX,
      y: COVER_SPECS.bleed,
      width: COVER_SPECS.pageWidth,
      height: COVER_SPECS.pageHeight,
      color: rgb(0.98, 0.98, 0.98), // Slightly off-white back cover
    });

    // Add barcode area placeholder on back cover (bottom right)
    const barcodeWidth = 2 * 72; // 2 inches
    const barcodeHeight = 1.2 * 72; // 1.2 inches
    const barcodeX = backCoverX + COVER_SPECS.pageWidth - barcodeWidth - COVER_SPECS.safetyMargin;
    const barcodeY = COVER_SPECS.bleed + COVER_SPECS.safetyMargin;

    page.drawRectangle({
      x: barcodeX,
      y: barcodeY,
      width: barcodeWidth,
      height: barcodeHeight,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    page.drawText("ISBN Barcode Area", {
      x: barcodeX + 20,
      y: barcodeY + barcodeHeight / 2,
      size: 10,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Generate the PDF bytes
    const pdfBytes = await pdfDoc.save();

    // Store the PDF in Convex storage
    const arrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    const storageId = await ctx.storage.store(blob);

    // Update the book with the cover PDF ID
    await ctx.runMutation(internal.books.internalMutations.updateCoverPdf, {
      bookId: args.bookId,
      coverPdfId: storageId,
    });

    return {
      success: true,
      storageId,
      dimensions: {
        width: coverWidth / 72, // Convert back to inches
        height: coverHeight / 72,
        spineWidth: spineWidth / 72,
      },
    };
  },
});

// Get cover PDF URL
export const getCoverPdfUrl = action({
  args: {
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    const book = await ctx.runQuery(internal.books.internalQueries.getBookInternal, {
      bookId: args.bookId,
    });

    if (!book || !book.coverPdfId) {
      return null;
    }

    const url = await ctx.storage.getUrl(book.coverPdfId);
    return url;
  },
});

// Generate a preview/download URL for the PDF
export const getInteriorPdfUrl = action({
  args: {
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    const book = await ctx.runQuery(internal.books.internalQueries.getBookInternal, {
      bookId: args.bookId,
    });

    if (!book || !book.interiorPdfId) {
      return null;
    }

    const url = await ctx.storage.getUrl(book.interiorPdfId);
    return url;
  },
});
