import { Server } from 'socket.io';

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  let activeUsers = 0;
  io.on('connection', (socket) => {
    activeUsers++;
    io.emit('active users', activeUsers);
    console.log('A user connected', socket.id);
    // You can add more socket event handlers here

    socket.on('global message', (msg) => {
      // Broadcast the message to all clients, including user info and timestamp
      io.emit('global message', msg);
    });

    socket.on('typing', (typingData) => {
      // Broadcast typing status to all except the sender
      socket.broadcast.emit('typing', typingData);
    });

    socket.on('disconnect', () => {
      activeUsers = Math.max(0, activeUsers - 1);
      io.emit('active users', activeUsers);
      console.log('A user disconnected', socket.id);
    });
  });

  

  return io;
} 