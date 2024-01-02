import type { MessageThread, UploadedFiles, MessagePagination, MessageReactions } from "./Chat"

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
  totalMessages: number;
  pagination?: MessagePagination | null;
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
  reactions?: MessageReactions[];
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


export type {
  ChannelMessages,
  Channels,
  ChannelForm,
  SendChannelMessagePayload,
  ChannelMembers,
  ChannelSettings,
};
