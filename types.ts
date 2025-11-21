export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
}

export interface CoverPageData {
  title: string;
  subtitle: string;
  abstract: string;
}

export enum AIStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
