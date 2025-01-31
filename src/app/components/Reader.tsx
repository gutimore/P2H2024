import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Scrollbars } from "react-custom-scrollbars-2";
import classNames from "classnames";
import { RootState } from "../redux/store";
import "./Reader.css";
import { SelectedChunk } from "../redux/types";

interface Loc {
  pageNumber: number;
  lines: { from: number; to: number };
}

interface Chunk {
  metadata: {
    loc: Loc;
  };
  pageContent: string;
}

function compareLocs(chunkLoc: Loc, selectedLoc: SelectedChunk): boolean {
  return (
    chunkLoc.pageNumber === selectedLoc.page &&
    chunkLoc.lines.from === selectedLoc.lines.from &&
    chunkLoc.lines.to === selectedLoc.lines.to
  );
}

const Reader = () => {
  const selectedChunk = useSelector(
    (state: RootState) => state.app.selectedChunk
  ) as SelectedChunk | null;

  const [fileContent, setFileContent] = useState<Chunk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<Scrollbars>(null);

  // Fetch file content
  useEffect(() => {
    if (!selectedChunk?.fileId) return;

    const fetchFile = async () => {
      try {
        setError(null);
        const res = await fetch(`/api/document?fileId=${selectedChunk.fileId}`);
        if (!res.ok) throw new Error("Failed to fetch file content");
        const data = await res.json();
        setFileContent(data?.content || []);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchFile();
  }, [selectedChunk?.fileId]);

  // Scroll to the chunk with matching loc
  useEffect(() => {
    if (!fileContent.length || !selectedChunk || !scrollRef.current) return;

    const matchIndex = fileContent.findIndex((chunk) =>
      compareLocs(chunk.metadata.loc, selectedChunk)
    );

    if (matchIndex >= 0) {
      const element = document.getElementById(`chunk-${matchIndex}`);
      if (element) {
        scrollRef.current.view.scrollTop = element.offsetTop;
      }
    }
  }, [fileContent, selectedChunk]);

  // Render the chunks
  const renderChunks = () =>
    fileContent.map((chunk, index) => {
      const isHighlighted = selectedChunk
        ? compareLocs(chunk.metadata.loc, selectedChunk)
        : false;
      return (
        <div
          key={index}
          id={`chunk-${index}`}
          className={classNames("chunk", { highlight: isHighlighted })}
        >
          <h5>Chunk {index}</h5>
          <pre>{chunk.pageContent}</pre>
        </div>
      );
    });

  return (
    <div className="reader">
      <div className="reader-header">
        <h4>Reader</h4>
        {selectedChunk?.fileId && (
          <p>File ID: {selectedChunk.fileId.slice(0, 10)}</p>
        )}
      </div>
      <div className="reader-body">
        {error ? (
          <div className="error">Error: {error}</div>
        ) : !fileContent.length ? (
          <div>Loading...</div>
        ) : (
          <Scrollbars ref={scrollRef} autoHide style={{ height: "100%" }}>
            <div className="reader-content">{renderChunks()}</div>
          </Scrollbars>
        )}
      </div>
    </div>
  );
};

export default Reader;
