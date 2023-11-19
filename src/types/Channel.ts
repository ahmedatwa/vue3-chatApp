type ChannelMembers = {
  _uuid: string;
  name: string;
};

type ChannelSettings = {
  channelNotifications: string;
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
  messagesTotal?: number;
  members: ChannelMembers[];
  newMessages?: NewChannelUnreadMessages | null;
  settings?: ChannelSettings;
  createdBy: string;
  createdAt: string;
}

interface ChannelMessages {
  _id: number;
  _channelID: string | number;
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
  thread?: MessageThread[];
}

type MessageThread = {
  _id: number;
  _messageID: number;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  filess: File[];
  createdAt: string;
};
type ChannelMessageReply = {
  content: string;
  files?: FileList | null;
  relatedId?: string | number;
  relatedContent?: string;
  editContent?: string;
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

interface SendMessageThreadPayload {
  _messageID: number;
  _channelID: string | number;
  to: string;
  toName: string;
  content: string;
  files?: File[];
}

export type {
  ChannelMessages,
  Channels,
  ChannelForm,
  UploadedFiles,
  SendChannelMessagePayload,
  ChannelMessageReply,
  ChannelMembers,
  ChannelSettings,
  MessageThread,
  SendMessageThreadPayload
};
