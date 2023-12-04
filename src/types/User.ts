interface User {
  _id: number;
  _uuid: string;
  userName: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  self?: boolean;
  connected: boolean;
  selected?: boolean;
  typing?: boolean;
  settings?: UserSettings | null;
  newMessages?: NewUnreadMessages | null;
  messages?: UserMessages[];
  messagesDistributed?: boolean;
  createdAt: string;
  updatedAt?: string;
}

type UserSettings = {
  muteNotification: boolean;
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
  _roomID?: string | null;
  from: string;
  to: string;
  room?: string;
  fromSelf?: boolean;
  content: string;
  file?: string | null;
  seen?: boolean;
  last?: boolean;
  createdAt: string;
};

interface CreateUserForm {
  userName: string;
  firstName: string;
  lastName: string;
}

interface UserProfile {
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
}

interface UserSessionData {
  _id: number;
  _uuid: string;
  userName: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  sessionID: string;
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

interface UserAppSettings {
  theme: string;
  leftOff: boolean;
  muteConnectionNotif: boolean;
  date?: string;
}

export type {
  User,
  UserMessages,
  DBUserMessages,
  CreateUserForm,
  UserProfile,
  UserTyping,
  UserSessionData,
  Pagination,
  UserAppSettings,
};
