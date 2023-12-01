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

interface Typing {
  _channelID: string;
  from: string;
  input: string;
  displayName: string;
}

interface AddMembers {
  channelName: string;
  from: string;
  to: string;
}

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
export type {
  ChannelMessage,
  NewThreadMessage,
  Typing,
  AddMembers,
  NewChannel,
  JoinChannel,
};
