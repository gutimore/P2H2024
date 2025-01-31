import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { setSources } from "../redux/appSlice";

import "./SidePanel.css";

// Assuming UploadDialog is already implemented and imported
import UploadDialog from "./UploadDialog";

const SidePanel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const sources = useSelector((state: RootState) => state.app.sources);

  // Select or deselect all sources
  const handleSelectAll = (selectAll: boolean) => {
    const updatedSources = sources.map((source) => ({
      ...source,
      selected: selectAll,
    }));
    dispatch(setSources(updatedSources));
  };

  // Handle selecting a single source by ID
  const handleSelectSource = (id: string, selected: boolean) => {
    const updatedSources = sources.map((source) =>
      source.fileId === id ? { ...source, selected } : source
    );
    dispatch(setSources(updatedSources));
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h4>Sources</h4>
      </div>
      <div className="sidebar-body">
        <div className="source-controls">
          <UploadDialog />
          <div className="checkbox-container">
            <label htmlFor="select-all" className="source-label">
              Select all sources
            </label>
            <Checkbox.Root
              className="checkbox-root"
              checked={sources.every((s) => s.selected)}
              onCheckedChange={handleSelectAll}
              id="select-all"
            >
              <Checkbox.Indicator className="checkbox-indicator">
                <CheckIcon />
              </Checkbox.Indicator>
            </Checkbox.Root>
          </div>
        </div>
        <ScrollArea.Root className="scroll-area">
          <ScrollArea.Viewport className="viewport">
            {sources.map((source) => (
              <div key={source.fileId} className="source-item">
                <label
                  htmlFor={`source-${source.fileId}`}
                  className="source-label"
                >
                  {source.name}
                </label>
                <Checkbox.Root
                  className="checkbox-root"
                  checked={source.selected}
                  //onClick={() => handleSourceToggle(source.id)}
                  onCheckedChange={(selected: boolean) =>
                    handleSelectSource(source.fileId, selected)
                  }
                  id={`source-${source.fileId}`}
                >
                  <Checkbox.Indicator className="checkbox-indicator">
                    <CheckIcon />
                  </Checkbox.Indicator>
                </Checkbox.Root>
              </div>
            ))}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar className="scrollbar" orientation="vertical">
            <ScrollArea.Thumb className="thumb" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </div>
  );
};

export default SidePanel;
