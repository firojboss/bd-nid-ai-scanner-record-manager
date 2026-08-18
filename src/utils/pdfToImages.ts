import * as pdfjsLib from "pdfjs-dist";

// Configure worker using CDN matching the installed pdfjs-dist version
if (typeof window !== "undefined") {
  // Use unpkg or cdnjs with pdfjsLib.version
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn("Could not set pdf worker url from cdnjs, trying fallback", e);
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
}

export interface ConvertedPdfPage {
  pageNumber: number;
  dataUrl: string; // PNG base64
  width: number;
  height: number;
}

/**
 * Convert a PDF file or base64 data to an array of high-resolution images
 */
export async function convertPdfToImages(
  fileOrData: File | string | ArrayBuffer,
  scale: number = 2.0 // High resolution for OCR and zooming
): Promise<ConvertedPdfPage[]> {
  try {
    let pdfData: Uint8Array | ArrayBuffer;

    if (fileOrData instanceof File) {
      const buffer = await fileOrData.arrayBuffer();
      pdfData = buffer;
    } else if (typeof fileOrData === "string") {
      if (fileOrData.startsWith("data:")) {
        // Base64 data URL
        const base64 = fileOrData.split(",")[1];
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        pdfData = bytes;
      } else {
        const binaryString = atob(fileOrData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        pdfData = bytes;
      }
    } else {
      pdfData = fileOrData;
    }

    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdfDoc = await loadingTask.promise;
    const pagesCount = Math.min(pdfDoc.numPages, 4); // Usually 1-2 pages for NID
    const convertedPages: ConvertedPdfPage[] = [];

    for (let pageNum = 1; pageNum <= pagesCount; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (!context) continue;

      // Fill white background (crucial for PDF transparency)
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      await page.render(renderContext).promise;

      const dataUrl = canvas.toDataURL("image/png", 0.95);
      convertedPages.push({
        pageNumber: pageNum,
        dataUrl,
        width: viewport.width,
        height: viewport.height,
      });
    }

    return convertedPages;
  } catch (error) {
    console.error("PDF to Image conversion error:", error);
    throw error;
  }
}
