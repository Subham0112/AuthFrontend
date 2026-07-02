import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API,
  withCredentials: true,
});

let logoutCallback: (() => void) | null = null;

export const registerLogout = (callback: () => void) => {
  logoutCallback = callback;
};
let isRefreshing = false;

type Subscriber = () => void;

let subscribers: Subscriber[] = [];

function subscribeTokenRefresh(cb: Subscriber) {
  subscribers.push(cb);
}

function onRefreshed() {
  subscribers.forEach((cb) => cb());
  subscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/refresh-token")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_API}/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        isRefreshing = false;
        onRefreshed();

        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        subscribers = [];
        logoutCallback?.();
        
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;