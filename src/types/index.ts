
// connected Users Type
interface User {
  _id?: number;
  _uuid: string;
  username: string;
  self: boolean;
  connected: boolean;
  selected?: boolean;
  image: string;
  typing?: boolean;
  newMessages?: NewUnreadMessages | null;
  messages: userMessages[];
}

type NewUnreadMessages = {
  total?: number;
  lastMessage?: string;
}
type userMessages = {
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

interface UserSessionData {
  _id?: number;
  _uuid: string;
  username: string;
  sessionId: string;
  image: string;
  connected: boolean;
  createdAt: string;
}

type DBUser = {
  _id: number;
  _uuid: string;
  image: string;
  username: string;
  firstname: string;
  lastname: string;
  createdAt: string;
  sessionId?: string;
};

type TypingEvent = {
  from: string;
  username: string;
  isTyping: boolean;
};

type Settings = {
  theme: string;
  connectionNotif: boolean;
};

type Snackbar = {
  title?: string;
  type?: string;
  text: string;
}

// Channels
type Room = {
  _id: number;
  _roomId: string;
  name: string;
  selected?: boolean;
  messages: RoomMessages[];
  newMessages?: NewUnreadMessages | null;
  createdBy: string;
  createdAt: string;
  participants?: [] | null;
};

type RoomMessages = {
  _id: string | number;
  from: string | undefined;
  username: string | undefined;
  room: string | number;
  content: string;
  file?: string;
  createdAt: string;
  updatedAt?: string;
}

export type {
  User,
  userMessages,
  UserSessionData,
  DBUser,
  TypingEvent,
  Room,
  RoomMessages,
  Settings,
  Snackbar,
};
