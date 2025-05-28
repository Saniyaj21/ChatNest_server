import express from 'express';
import 'dotenv/config';
import http from 'http';
import cors from 'cors';
import setupSocket from './socket.js';
import { connectDB } from './db/connect.js';
import globalMessagesRouter from './routes/globalMessages.js';
import userRouter from './routes/user.js';
import groupRouter from './routes/group.js';
import groupMessagesRouter from './routes/groupMessages.js';


//--------------- imports end here -----------------------||



const app = express();
const PORT = 8080;
const server = http.createServer(app);
connectDB()

// Middleware
app.use(cors({
  origin: "*",
  exposedHeaders: ['X-Total-Count'],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Total-Count"],
}));
app.use(express.json());

//--------------- middleware end here --------------------||





// Remove the Socket.io setup here and use the imported function
const io = setupSocket(server);

//--------------- socket.io end here ---------------------||






// Home Routes
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

//--------------- routes end here ------------------------||

// Global Messages Route
app.use('/api/global-messages', globalMessagesRouter);
// User Route
app.use('/api/user', userRouter);
// Group Route
app.use('/api/groups', groupRouter);
// Group Messages Route
app.use('/api/group-messages', groupMessagesRouter);







server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//--------------- server start here ----------------------||
