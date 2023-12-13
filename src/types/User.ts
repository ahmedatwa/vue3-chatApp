interface User {
  _id: number;
  _uuid: string;
  _channelID: string | null;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  connected: boolean | string;
  self?: boolean;
  visible: boolean;
  selected?: boolean;
  typing?: boolean;
  settings: UserSettings;
  newMessages?: NewUnreadMessages | null;
  messages?: UserMessages[];
  pagination: Pagination | null;
  messagesDistributed?: boolean;
  createdAt: string;
  updatedAt?: string;
}

type UserSettings = {
  theme: string;
  leftOff: boolean | string;
  muteConnectionNotif: boolean | string;
};

type NewUnreadMessages = {
  total?: number;
  lastMessage?: string;
};

type DBUserMessages = {
  _channelId: string;
  createdAt: string;
  updatedAt: string;
  content: UserMessages[];
};
type UserMessages = {
  _id: string | number;
  from: string;
  to: string;
  content: string;
  editContent?: string;
  fromSelf?: boolean;
  file?: File[] | null;
  seen?: boolean;
  last?: boolean;
  thread?: MessageThread[];
  isUpdated?: boolean;
  isEdit?: boolean;
  updatedAt?: string;
  createdAt: string;
};

type MessageThread = {
  _id: number;
  _messageID: number;
  from: string;
  to: string;
  content: string;
  files?: File[];
  createdAt?: string;
};

interface NewUserForm {
  firstName: string;
  lastName: string;
  email: string;
}

interface UserSessionData {
  _id: number;
  _uuid: string;
  sessionID: string;
  firstName: string;
  lastName: string;
  displayName: string;
  settings?: UserSettings | null;
  email: string;
  image: string;
  connected: boolean;
  createdAt: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

interface UserTyping {
  from: string;
  input: string;
  displayName: string;
  isTyping: boolean;
}

interface SendThreadPayload {
  _messageID: number | string;
  _channelID: string;
  from: string;
  to: string;
  content: string;
  files?: File[];
  createdAt?: string;
}

interface DirectMessageChannels {
  _channelID: string;
  from: string;
  to: string;
  createdAt: string;
}

interface SearchUsers {
  _uuid: string | number;
  displayName: string;
  email: string;
  createdAt: string;
}

export type {
  User,
  UserMessages,
  DBUserMessages,
  NewUserForm,
  UserTyping,
  UserSessionData,
  Pagination,
  SendThreadPayload,
  DirectMessageChannels,
  UserSettings,
  SearchUsers,
};
