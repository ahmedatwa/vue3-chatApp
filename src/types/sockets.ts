interface ChannelMessage {
  _id: number;
  _channelID: string;
  from: string;
  fromName: string;
  content: string;
  createdAt: string;
}

interface NewThreadMessage {
  _id: number;
  _messageID: number;
  _channelID: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  content: string;
  createdAt: string;
}

type AddMembers = {
  _id: number;
  _channelID: string;
  channelName: string;
  from: string;
  email: string;
  fromName: string;
  to: string;
  toName: string;
  createdAt: string;
};

// interface AddMembers {
//   channelName: string;
//   createdAt: string;
//   displayName: string;
//   email: string;
//   from: string;
//   to: string
// }

interface NewChannel {
  _channelID: string;
  name: string;
  createdBy: string | number;
}

interface JoinChannel {
  userName: string;
  channelName: string;
  createdBy: string | number;
}

// Direct
interface NewDirectMessage {
  _channelID: string;
  _id: string | number;
  from: string;
  to: string;
  content: string;
  editContent?: string;
  fromSelf?: boolean;
  file?: File[] | null;
  seen?: boolean;
  last?: boolean;
  thread?: [];
  isUpdated?: boolean;
  isEdit?: boolean;
  updatedAt?: string;
  createdAt: string;
}

interface NewDirectThreadMessage {
  _id: number;
  _messageID: number;
  _channelID: string;
  from: string;
  to: string;
  content: string;
  createdAt: string;
}

export type {
  ChannelMessage,
  NewThreadMessage,
  AddMembers,
  NewChannel,
  JoinChannel,
  NewDirectMessage,
  NewDirectThreadMessage,
};
