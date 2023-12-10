import axios from "axios";

// sessions
export const sessionApi = {
  // checked 
  __getSession: "/getSession",
  __updateSession: "/updateSession",
  __restoreSession: "/restoreSession",
  __addSession: "/addSession",
};

// User 
export const userApi = {
  __getAllUsers: "/getAllUsers",
  __getAllChannels: "/getAllChannels",
  __createUser: "/createUser",
  __getUser: "/getUser"
}
// Channels
export const channelApi = {
  __getChannels: "/channels/getChannels",
  __getChannelMessages: "/channels/getChannelMessages",
  __getTotalChannelMessages: "/channels/getTotalChannelMessages",
  __addChannel: "/channels/addChannel",
  __addChannelMessage: "/channels/addChannelMessage",
  __addChannelMessageThread: "/channels/addChannelMessageThread",
  __updateChannelMessage: "/channels/updateChannelMessage",
  __deleteChannelMessage: "/channels/deleteChannelMessage",
  __archiveChannel: "/channels/archiveChannel",
  __updateChannelMembers: "/channels/updateChannelMembers",
  __getChannelMembers: "/channels/getChannelMembers",
  __updateChannel: "/channels/updateChannel",
  __addChannelSettings: "/channels/addChannelSettings",
  __leaveChannel: "/channels/leaveChannel",
  __channelUpload: "/channels/channelUpload",
};

// User Messages
export const directMessageApi = {
  __sendMessage: "/directmessages/addDirectMessage",
  __getUserDirectMessages: "/directmessages/getUserDirectMessages",
  __upload: "/directmessages/upload",
  __addDirectMessagesMembers: "/directmessages/addDirectMessagesMembers",
  __getUserDirectMessageChannels: "/directmessages/getUserDirectMessageChannels",
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