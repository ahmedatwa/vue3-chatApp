
// connected Users Type
interface User {
  _id?: number;
  uuid: string;
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
  from: string | number;
  to: string | number;
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
  uuid: string;
  username: string;
  sessionId: string;
  image: string;
  connected: boolean;
  createdAt: string;
}

type DBUsers = {
  _id: number;
  uuid: number | string;
  username: string;
  firstname: string;
  lastname: string;
  createdAt: string;
};

type LoggedUser = {
  _id: number;
  uuid: string;
  image: string;
  username: string;
  createdAt: string;
  sessionId: string;
};

type TypingEvent = {
  from: string;
  username: string;
  isTyping: boolean;
};

type Room = {
  _id: number;
  roomId: string;
  name: string;
  createdBy: string;
};

type Settings = {
  theme: string;
  connectionNotif: boolean;
};
// type SocketUserPayload = {
//   _id?: number;
//   uuid: string;
//   socketId: string;
//   username: string;
//   address: string;
//   connected: boolean,
//   image: string;
//   secure: boolean;
//   time: string;
//   self: boolean;
//   sessionId: string;
//   messages: userMessages[];
// };

export type {
  User,
  userMessages,
  UserSessionData,
  DBUsers,
  LoggedUser,
  TypingEvent,
  Room,
  Settings,
};
