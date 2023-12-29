import type {
  MessageThread,
  MessagePagination,
  MessageReactions,
  UploadedFiles
} from "./Chat";

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
  pagination: MessagePagination | null;
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

type UserMessages = {
  _id: string | number;
  from: string;
  to: string;
  content: string;
  editContent?: string;
  fromSelf?: boolean;
  files?: UploadedFiles[];
  seen?: boolean;
  last?: boolean;
  thread?: MessageThread[];
  reactions?: MessageReactions[];
  isUpdated?: boolean;
  isEdit?: boolean;
  updatedAt?: string;
  createdAt: string;
};

interface UserSessionData {
  _id: number;
  _uuid: string;
  sessionID: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  image: string;
  connected: boolean;
  settings?: UserSettings | null;
  createdAt: string;
}

interface DirectMessageChannels {
  _channelID: string;
  from: string;
  to: string;
  createdAt: string;
}

type DBUserMessages = {
  _channelId: string;
  createdAt: string;
  updatedAt: string;
  content: UserMessages[];
};

type LastSelectedEl = {
  _id: string | number;
  key: string;
};
export type {
  User,
  UserMessages,
  UserSessionData,
  DirectMessageChannels,
  UserSettings,
  DBUserMessages,
  LastSelectedEl,
};
