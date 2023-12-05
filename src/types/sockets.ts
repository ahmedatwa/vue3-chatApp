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

 


export type {
  ChannelMessage,
  NewThreadMessage,
  AddMembers,
  NewChannel,
  JoinChannel,
};
