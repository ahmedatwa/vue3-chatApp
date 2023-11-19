interface TypingEvent {
  from: string;
  name: string;
  isTyping: boolean;
}

interface Settings {
  theme: string;
  connectionNotif: boolean;
  date?: Date | string;
}

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
}

interface UploadSettings {
  accept: string;
  maxSize: number
  multiple: boolean
}

export type { TypingEvent, Settings, Snackbar, Alert, UploadSettings };
