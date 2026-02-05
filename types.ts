
export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  REFINING = 'REFINING'
}

export interface ImageData {
  id: string;
  originalUrl: string;
  processedUrl: string | null;
  file: File;
  width: number;
  height: number;
  status: 'pending' | 'processing' | 'done' | 'error';
}
