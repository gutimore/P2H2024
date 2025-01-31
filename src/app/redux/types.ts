export interface Source {
  fileId: string;
  name: string;
  selected: boolean;
}

export interface SelectedChunk {
  fileId: string;
  page: number;
  lines: {
    from: number;
    to: number;
  };
}

export interface AppState {
  sources: Source[];
  selectedChunk: SelectedChunk | null;
}
