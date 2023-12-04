

interface Snackbar {
  title?: string;
  type: string;
  text: string | undefined;
  code?: number;
  timeout?: number;
  location?: string;
}

type Alert = {
  type: string;
  title: string;
  text: string;
};

interface UploadSettings {
  accept: string;
  maxSize: number;
  multiple: boolean;
}



type UploadedFiles = {
  _id: number | string;
  name: string;
  size: number;
  type: string;
  randomName: string;
  path: URL;
  _uuid: string;
  _channelID: string;
};

export type {
  Snackbar,
  Alert,
  UploadSettings,
  UploadedFiles,
};
