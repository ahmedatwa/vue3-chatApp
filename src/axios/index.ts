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
  __getChannels: "/getChannels",
  __getChannelMessages: "/getChannelMessages",
  __getTotalChannelMessages: "/getTotalChannelMessages",
  __addChannel: "/addChannel",
  __addChannelMessage: "/addChannelMessage",
  __addChannelMessageThread: "/addChannelMessageThread",
  __updateChannelMessage: "/updateChannelMessage",
  __deleteChannelMessage: "/deleteChannelMessage",
  __archiveChannel: "/archiveChannel",
  __updateChannelMembers: "/updateChannelMembers",
  __getChannelMembers: "/getChannelMembers",
  __updateChannel: "/updateChannel",
  __addChannelSettings: "/addChannelSettings",
  __leaveChannel: "/leaveChannel",
  __channelUpload: "/channelUpload",
};

// User Messages
export const directMessageApi = {
  __sendMessage: "/addDirectMessage",
  __getUserDirectMessages: "/getUserDirectMessages",
  __upload: "/upload",
};


export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api/chat",
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