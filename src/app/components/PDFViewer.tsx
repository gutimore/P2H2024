// components/PDFViewer.js
import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

const PDFViewer = ({ pdfUrl, highlightLocations }) => {
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    // Load the PDF document
    const loadPdf = async () => {
      const loadedPdf = await pdfjsLib.getDocument(pdfUrl).promise;
      setPdf(loadedPdf);
    };
    loadPdf();
  }, [pdfUrl]);

  const renderPage = async (pageNumber) => {
    if (isRendering) return; // Prevent concurrent rendering

    setIsRendering(true);
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });

      // Prepare canvas
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render the page
      const renderContext = {
        canvasContext: context,
        viewport,
      };
      await page.render(renderContext).promise;

      // Highlight specified text
      if (highlightLocations) {
        await highlightText(page, viewport, context, pageNumber);
      }
    } catch (error) {
      console.error("Error rendering page:", error);
    } finally {
      setIsRendering(false);
    }
  };

  const highlightText = async (page, viewport, context, pageNumber) => {
    const textContent = await page.getTextContent();

    // Iterate through highlightLocations to find matches for this page
    const locations = highlightLocations.filter(
      (loc) => loc.pageNumber === pageNumber
    );

    locations.forEach((loc) => {
      textContent.items.forEach((item, index, itms) => {
        const prevItem = index > 0 ? itms[index - 1] : "";
        const nextItem = index < itms.length ? itms[index + 1] : "";

        const prevBlock = prevItem + item;
        const nextBlock = item + nextItem;

        if (item.str.includes(loc.text)) {
          const tx = pdfjsLib.Util.transform(
            pdfjsLib.Util.transform(viewport.transform, item.transform),
            [1, 0, 0, -1, 0, 0]
          );

          const x = tx[4];
          const y = tx[5];
          const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
          const width = item.width * viewport.scale;
          const height = fontHeight;

          // Draw highlight rectangle
          context.fillStyle = "rgba(255, 255, 0, 0.5)";
          context.fillRect(x, y - height, width, height);
        }
      });
    });
  };

  useEffect(() => {
    if (pdf) {
      renderPage(10); // Render the first page by default
    }
  }, [pdf]);

  return <canvas ref={canvasRef} />;
};

export default PDFViewer;
