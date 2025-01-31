"use client";

// pages/pdf.js
import React, { useState } from "react";
import PDFViewer from "../components/PDFViewer";

const PdfPage = () => {
  const [pdfUrl] = useState("/Make_It_Stick.pdf"); // Path to your PDF file
  const [highlightLocations] = useState([
    {
      pageNumber: 10,
      lines: { from: 5, to: 12 },
      text: "EARLY IN HIS CAREER",
    },
  ]);

  return (
    <div>
      <h1>PDF Viewer with Highlights</h1>
      <PDFViewer pdfUrl={pdfUrl} highlightLocations={highlightLocations} />
    </div>
  );
};

export default PdfPage;
