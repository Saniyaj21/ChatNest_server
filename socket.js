import { Server } from 'socket.io';

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    // You can add more socket event handlers here

    socket.on('disconnect', () => {
      console.log('A user disconnected', socket.id);
    });
  });

  

  return io;
} 