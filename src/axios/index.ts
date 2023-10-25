import axios from "axios";

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/chat`,
  //timeout: 500,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

instance.interceptors.request.use(function (config) {
  return new Promise((resolve) => setTimeout(() => {
      resolve(config);
  }, 500));
}, function (error) {
  return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  return Promise.reject(error);
});


const messageAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/chat`,
  //timeout: 500,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

// Add a request interceptor
messageAxios.interceptors.request.use(function (config) {
  return new Promise((resolve) => setTimeout(() => {
      resolve(config);
  }, 1000));
  //return config;
}, function (error) {
  return Promise.reject(error);
});

// Add a response interceptor
messageAxios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  return Promise.reject(error);
});

export {instance, messageAxios}