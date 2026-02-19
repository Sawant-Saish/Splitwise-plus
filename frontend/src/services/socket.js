import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinGroup = (groupId) => {
  if (socket) socket.emit('join-group', groupId);
};

export const leaveGroup = (groupId) => {
  if (socket) socket.emit('leave-group', groupId);
};
