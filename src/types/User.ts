interface User {
  _id?: number;
  _uuid: string;
  userName: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
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

type DBUserMessages = {
  _channelId: string;
  createdAt: string;
  updatedAt: string;
  content: userMessages[]
}
type userMessages = {
  _id?: string | number;
  _threadId?: string | null
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



type DBUser = {
  _id: number;
  _uuid: string;
  image: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  sessionID: string;
};


interface CreateUserForm {
  userName: string;
  firstName: string;
  lastName: string;
}
export type {
  User,
  userMessages,
  DBUser,
  DBUserMessages,
  CreateUserForm
};
