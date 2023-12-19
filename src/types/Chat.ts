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
  _channelID: string | null;
  content: string;
  files?: File[] | null;
  createdAt?: string;
}

interface MessagePagination {
  limit: number;
  offset: number;
  total?: number;
}

interface Typing {
  from: string;
  _channelID?: string;
  displayName: string;
  isTyping: boolean;
  input: number;
}

interface SearchUsers {
  _uuid: string | number;
  displayName: string;
  email: string;
  createdAt: string;
}

interface NewUserForm {
  firstName: string;
  lastName: string;
  email: string;
}

interface MessageReactions {
  emoji: string;
  _uuid: string;
  _messageID: number | string;
  total: number
  displayName: string
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
  SendThreadPayload
};
