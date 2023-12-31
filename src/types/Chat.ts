interface Snackbar {
  title?: string;
  type: string;
  text: string | undefined;
  code?: number;
  timeout?: number;
  location?: string;
  isSnackbar?: boolean;
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
  _uuid: string;
  _channelID: string;
  name: string;
  size: number;
  type: string;
  randomName: string;
  path: string;
  url: string;
  createdAt?: string;
};

type TenorGifs = {
  name: string;
  size: number;
  id: string | number;
  type: string;
  src: string;
};

type MessageThread = {
  _id?: number;
  _messageID: number;
  _channelID?: string;
  from: string;
  fromName?: string;
  to: string;
  toName?: string;
  content: string;
  files?: File[];
  createdAt?: string;
};

interface SendThreadPayload {
  _messageID: number | string;
  _channelID: string | number | null;
  content: string;
  files?: File[] | TenorGifs | null;
  to?: string | null;
  toName?: string | null;
  createdAt?: string;
}

interface MessagePagination {
  limit: number;
  offset: number;
  total: number;
}

interface Typing {
  from: string;
  _channelID?: string;
  displayName: string;
  input: number;
}

interface SearchUsers {
  _uuid: string | number;
  displayName: string;
  email: string;
  createdAt?: string;
}

interface NewUserForm {
  firstName: string;
  lastName: string;
  email: string;
}

interface MessageReactions {
  _id?: number;
  emoji: string;
  _uuid: string;
  _messageID: number | string;
  total?: number;
  displayName: string;
}

export type {
  Snackbar,
  Alert,
  UploadSettings,
  UploadedFiles,
  MessageThread,
  MessagePagination,
  Typing,
  SearchUsers,
  NewUserForm,
  MessageReactions,
  SendThreadPayload,
  TenorGifs
};
