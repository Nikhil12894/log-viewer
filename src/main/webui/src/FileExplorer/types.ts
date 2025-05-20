export interface LogMetadata {
  size: number;
}

export interface LogViewerProps {
  initialChunkSize?: number;
  maxLines?: number;
  autoScroll?: boolean;
}

export type LogEvent = {
  data: string;
  type: "chunk" | "error" | "complete";
};
