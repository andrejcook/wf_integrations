import Cookies from 'js-cookie';
import { io } from 'socket.io-client';

export const initSocket = () => {
  const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY ?? 'authToken';
  const BASE_URL = process.env.NEXT_PUBLIC_REST_BASE_ENDPOINT ?? '';

  const cookies = Cookies.get(AUTH_TOKEN_KEY);

  let token = '';
  if (cookies) {
    token = JSON.parse(cookies)['token'];
  }
  return io(BASE_URL, {
    transportOptions: {
      polling: {
        extraHeaders: {
          authorization: 'Bearer ' + token,
        },
      },
    },
  });
};

export const socketEffect = (socket: any, events = []) => {
  if (socket) {
    events.forEach((event: any) => socket.on(event.name, event.on));
    return () => {
      events.forEach((event: any) => socket.off(event.name));
    };
  }
};
