import axios from "axios";

// sessions
export const sessionApi = {
  __getSessions: "/getallsessions",
  __getSession: "/getsession",
  __addSession: "/addsession",
  __updateSession: "/updatesession",
  __restoreSession: "/restoresession",
};

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
  __addChannelMembers: "/addChannelMembers",
  __removeChannelMembers: "/removeChannelMembers",
  __getChannelMembers: "/getChannelMembers",
  __updateChannel: "/updateChannel",
  __addChannelSettings: "/addChannelSettings",
  __leaveChannel: "/leaveChannel",
  __channelUpload: "/channelUpload",
};

// User Messages
export const directMessageApi = {
  __add_Message: "/addmessage",
  __get_Messages: "/getmessages",
  __upload: "/upload",
};

export const userApi = {
  __AllUsers: "/all",
  __createUser: "/create",
};

export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api/chat",
  //timeout: 500,
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

// artificial delay
const timeout = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.3) {
        resolve();
      } else {
        reject(new Error("Random Error"));
      }
    }, 500);
  });
};
