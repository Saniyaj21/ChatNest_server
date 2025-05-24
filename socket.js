import { Server } from 'socket.io';

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });
  const activeConnections = new Set();
  io.on('connection', (socket) => {
    activeConnections.add(socket.id);
    io.emit('activeUsers', activeConnections.size);
    console.log('A user connected', socket.id);
    // You can add more socket event handlers here

    socket.on('globalMessage', (msg) => {
      // Broadcast the message to all clients, including user info and timestamp
      io.emit('globalMessage', msg);
    });

    socket.on('typing', (typingData) => {
      // Broadcast typing status to all except the sender
      socket.broadcast.emit('typing', typingData);
    });

    socket.on('getActiveUsers', () => {
      // Send current active users count to the requesting client
      socket.emit('activeUsers', activeConnections.size);
    });

    socket.on('disconnect', () => {
      activeConnections.delete(socket.id);
      io.emit('activeUsers', activeConnections.size);
      console.log('A user disconnected', socket.id);
    });
  });



  return io;
}