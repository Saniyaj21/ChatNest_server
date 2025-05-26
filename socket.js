//--------------- imports start here -----------------------||
import { Server } from 'socket.io';
import { saveGlobalMessage } from './controllers/globalMessageController.js';
//--------------- imports end here -------------------------||


//--------------- setupSocket function start here ----------||
export default function setupSocket(server) {
	const io = new Server(server, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
		},
		transports: ['websocket', 'polling'],
	});
	const activeConnections = new Set();





	//--------------- socket.io connection start here --------||
	io.on('connection', (socket) => {
		activeConnections.add(socket.id);
		io.emit('activeUsers', activeConnections.size);
		console.log('A user connected', socket.id);
		// You can add more socket event handlers here








		//--------------- globalMessage event start here --------||
		socket.on('globalMessage', async (msg) => {
			// Save the message to the database (non-blocking for perceived speed)
			saveGlobalMessage(msg).catch((err) => {
				console.error('Failed to save global message:', err);
			});
			// Broadcast the message to all clients.
			console.log('globalMessage event received', msg);
			io.emit('globalMessage', msg);
		});
		//--------------- globalMessage event end here ----------||










		//--------------- typing event start here ---------------||
		socket.on('typing', (typingData) => {
			// Broadcast typing status to all except the sender
			socket.broadcast.emit('typing', typingData);
		});
		//--------------- typing event end here -----------------||





		//--------------- getActiveUsers event start here -------||
		socket.on('getActiveUsers', () => {
			// Send current active users count to the requesting client
			socket.emit('activeUsers', activeConnections.size);
		});
		//--------------- getActiveUsers event end here ---------||






		//--------------- disconnect event start here -----------||
		socket.on('disconnect', () => {
			activeConnections.delete(socket.id);
			io.emit('activeUsers', activeConnections.size);
			console.log('A user disconnected', socket.id);
		});
		//--------------- disconnect event end here -------------||




	});
	//--------------- socket.io connection end here ----------||

	return io;
}
//--------------- setupSocket function end here ------------||