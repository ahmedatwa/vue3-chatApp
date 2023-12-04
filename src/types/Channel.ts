type ChannelMembers = {
  _uuid: string;
  displayName: string;
  email: string;
  createdAt?: string; 
};

type ChannelSettings = {
  muteNotifications: string;
};
interface Channels {
  _id: number;
  _channelID: string;
  channelName: string;
  channelTopic: string;
  channelDescription: string;
  selected?: boolean;
  messagesDistributed?: boolean;
  membersDistributed?: boolean;
  messages: ChannelMessages[];
  pagination?: Pagination | null;
  members?: ChannelMembers[];
  newMessages?: NewChannelUnreadMessages | null;
  settings?: ChannelSettings;
  createdBy: string;
  createdAt: string;
}

interface ChannelMessages {
  _id: number;
  _channelID: string;
  from: string;
  fromName: string;
  content: string;
  files?: UploadedFiles[];
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  isUpdated?: boolean;
  isEdit?: boolean;
  editContent?: string;
  isReply?: boolean;
  isSeen?: boolean;
  isDelivered?: boolean;
  thread: MessageThread[];
}

type MessageThread = {
  _id: number;
  _messageID: number;
  _channelID: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  content: string;
  files?: File[];
  createdAt?: string;
};

type UploadedFiles = {
  _id: number | string;
  name: string;
  size: number;
  type: string;
  randomName: string;
  path: URL;
  _uuid: string;
  _channelID: string;
};

type NewChannelUnreadMessages = {
  total: number;
  from: string;
  lastMessage: string;
};

interface ChannelForm {
  channelName: string;
  channelTopic: string;
  channelDescription: string;
  members?: { _uuid: string; name: string }[];
}

interface SendChannelMessagePayload {
  content: string;
  files?: FileList;
}

interface SendThreadPayload {
  _messageID: number;
  _channelID: string;
  to: string;
  toName: string;
  content: string;
  files?: File[];
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

interface ChannelTyping {
  _channelID?: string;
  from: string;
  input: string;
  displayName: string;
}

export type {
  ChannelMessages,
  Channels,
  ChannelForm,
  SendChannelMessagePayload,
  ChannelMembers,
  ChannelSettings,
  MessageThread,
  SendThreadPayload,
  Pagination,
  ChannelTyping,
};
