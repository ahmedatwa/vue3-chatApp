import axios from "axios";

// sessions
export const _sessionApi = {
  // checked
  getSession: "/getSession",
  updateSession: "/updateSession",
  restoreSession: "/restoreSession",
  addSession: "/addSession",
};

// User
export const _userApi = {
  getAllUsers: "/getAllUsers",
  getAllChannels: "/getAllChannels",
  createUser: "/createUser",
  getUser: "/getUser",
  updateUserSettings: "/updateUserSettings",
  updateUser: "/updateUser",
  getUserFilesDownloads: "/getUserFilesDownloads",
  downloadFile: "/downloadFile",
  clearDownloads: "/clearDownloads"
};
// Channels
export const _channelApi = {
  getChannels: "/channels/getChannels",
  getChannelMessages: "/channels/getChannelMessages",
  getTotalChannelMessages: "/channels/getTotalChannelMessages",
  addChannel: "/channels/addChannel",
  addChannelMessage: "/channels/addChannelMessage",
  addChannelMessageThread: "/channels/addChannelMessageThread",
  updateChannelMessage: "/channels/updateChannelMessage",
  deleteChannelMessage: "/channels/deleteChannelMessage",
  archiveChannel: "/channels/archiveChannel",
  updateChannelMembers: "/channels/updateChannelMembers",
  getChannelMembers: "/channels/getChannelMembers",
  updateChannel: "/channels/updateChannel",
  addChannelSettings: "/channels/addChannelSettings",
  leaveChannel: "/channels/leaveChannel",
  channelUpload: "/channels/channelUpload",
  updateMessageReaction: "/channels/updateMessageReaction",
};

// User Messages
export const _directMessageApi = {
  sendMessage: "/directmessages/addDirectMessage",
  getUserDirectMessages: "/directmessages/getUserDirectMessages",
  getUserTotalMessages: "/directmessages/getUserTotalMessages",
  addDirectMessagesMembers: "/directmessages/addDirectMessagesMembers",
  getUserDirectMessageChannels: "/directmessages/getUserDirectMessageChannels",
  sendThreadMessage: "/directmessages/sendThreadMessage",
  updateMessage: "/directmessages/updateMessage",
  deleteMessage: "/directmessages/deleteMessage",
  updateMessageReaction: "/directmessages/updateMessageReaction",
  getMessageThread: "/directmessages/getMessageThread",
  upload: "/directmessages/upload",
  deleteFile: "/directmessages/deleteFile",
};

export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

instance.interceptors.request.use(
  function (config) {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(config);
      }, 500)
    );
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);
