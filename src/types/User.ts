interface User {
  _id: number;
  _uuid: string;
  _channelID: string;
  channelMembers?: {_uuid: string}[];
  userName: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  sessionID: string | null;
  self?: boolean;
  connected: boolean;
  selected?: boolean;
  typing?: boolean;
  settings?: UserSettings | null;
  messagesDistributed?: boolean;
  newMessages?: NewUnreadMessages | null;
  messages?: UserMessages[];
  createdAt: string;
  updatedAt?: string;
}

type Channel = {
  _channelID: string | number;
  lastMessage: string;
  createdAt: string;
  updatedAt?: string;
}
type UserSettings = {
  muteNotification: boolean
}
 
type NewUnreadMessages = {
  total?: number;
  lastMessage?: string;
}

type DBUserMessages = {
  _channelId: string;
  createdAt: string;
  updatedAt: string;
  content: UserMessages[]
}
type UserMessages = {
  _id: string | number;
  _roomID?: string | null
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
  image?: string
}

interface TypingEvent {
  from: string;
  name: string;
  isTyping: boolean;
}

interface UserSessionData {
  _id: number;
  _uuid: string;
  _channelID: string;
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

export type {
  User,
  UserMessages,
  DBUserMessages,
  CreateUserForm,
  UserProfile,
  TypingEvent,
  UserSessionData
};
