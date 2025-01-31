import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import * as Progress from "@radix-ui/react-progress";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import "./UploadDialog.css";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { addSources } from "../redux/appSlice";
import { useState } from "react";

export default function UploadDialog() {
  const dispatch = useDispatch<AppDispatch>();
  const sources = useSelector((state: RootState) => state.app.sources);
  const [open, setOpen] = useState(false);

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      formData.append("files", file);
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(addSources(data.jobs));
        console.log("Upload successful", data);

        // Close the dialog after successful upload
        setOpen(false);
      } else {
        console.error("Upload failed", response.statusText);
      }
    } catch (error) {
      console.error("Error while uploading", error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="upload-button">
          <PlusIcon /> Add source
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Dialog.Title className="DialogTitle">Agrega fuentes</Dialog.Title>
          <Dialog.Description className="DialogDescription">
            Las fuentes permiten que GBrain base sus respuestas en la
            información que más te interesa. (Ejemplos: planes de marketing,
            lecturas de cursos, notas de investigación, transcripciones de
            reuniones, documentos de ventas, etcétera)
          </Dialog.Description>
          <Form.Root>
            <div className="UploadContainer">
              <Form.Field name="upload">
                <div className="UploadBox">
                  <label htmlFor="upload-source" className="UploadLabel">
                    Upload Sources
                  </label>
                  <input
                    id="upload-source"
                    type="file"
                    multiple
                    accept=".pdf,.txt,.md,.mp3"
                    className="UploadInput"
                    onChange={handleFileChange}
                  />
                </div>
              </Form.Field>
              <div className="OptionsContainer">
                <button className="OptionButton">Google Drive</button>
                <button className="OptionButton">Website Link</button>
                <button className="OptionButton">YouTube</button>
                <button className="OptionButton">Paste Text</button>
              </div>
            </div>
          </Form.Root>
          <div className="ProgressBarContainer">
            <label className="ProgressLabel">Límite de fuentes</label>
            <Progress.Root
              className="ProgressRoot"
              value={sources.length}
              max={50}
            >
              <Progress.Indicator
                className="ProgressIndicator"
                style={{ width: `${(sources.length / 50) * 100}%` }}
              />
            </Progress.Root>
            <span className="ProgressCount">{sources.length}/50</span>
          </div>
          <Dialog.Close asChild>
            <button className="IconButton CloseButton" aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
