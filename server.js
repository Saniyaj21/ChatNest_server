import express from 'express';
import 'dotenv/config';
import http from 'http';
import cors from 'cors';
import setupSocket from './socket.js';

//--------------- imports end here -----------------------||



const app = express();
const PORT = 8080;
const server = http.createServer(app);

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







server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//--------------- server start here ----------------------||
