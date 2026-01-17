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
