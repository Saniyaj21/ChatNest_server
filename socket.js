//--------------- imports start here -----------------------||
import { Server } from 'socket.io';
import { saveGlobalMessage } from './controllers/globalMessageController.js';
import { saveGroupMessage } from './controllers/groupMessageController.js';
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
	// Group members tracking: { groupId: Map<userId, userObject> }
	const groupMembers = {};





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

		//--------------- groupMessage event start here --------||
		socket.on('groupMessage', async (msg) => {
			try {
				console.log('Received group message:', msg);
				// Save the message to the database
				const savedMessage = await saveGroupMessage(msg);
				console.log('Saved group message:', savedMessage);
				// Broadcast the message to all clients in the group
				io.emit(`groupMessage:${msg.groupId}`, msg);
				console.log('Broadcasted message to group:', msg.groupId);
			} catch (err) {
				console.error('Failed to save group message:', err);
			}
		});
		//--------------- groupMessage event end here ----------||

		//--------------- typing event start here ---------------||
		socket.on('typing', (typingData) => {
			// Broadcast typing status to all except the sender
			socket.broadcast.emit('typing', typingData);
		});
		//--------------- typing event end here -----------------||

		//--------------- groupTyping event start here ----------||
		socket.on('groupTyping', (typingData) => {
			// Validate groupId
			if (!typingData.groupId) {
				console.error('Missing groupId in typing event');
				return;
			}
			// Broadcast typing status to all in the group except the sender
			socket.broadcast.to(`group:${typingData.groupId}`).emit(`groupTyping:${typingData.groupId}`, typingData);
			console.log(`Broadcasting typing status for group ${typingData.groupId}:`, typingData);
		});
		//--------------- groupTyping event end here ------------||

		//--------------- joinGroup event start here ------------||
		socket.on('joinGroup', ({ groupId, user }) => {
			if (!user || !user.userId) {
				console.error('joinGroup: missing user or userId', { groupId, user });
				return;
			}
			socket.join(`group:${groupId}`);
			if (!groupMembers[groupId]) groupMembers[groupId] = new Map();
			groupMembers[groupId].set(user.userId, user);
			// Attach group info to socket for cleanup on disconnect
			if (!socket.joinedGroups) socket.joinedGroups = new Set();
			socket.joinedGroups.add(groupId);
			// Broadcast updated group members
			io.to(`group:${groupId}`).emit('groupActiveUsers', Array.from(groupMembers[groupId].values()));
			console.log(`User ${user.userId} joined group ${groupId}`);
		});
		//--------------- joinGroup event end here --------------||

		//--------------- leaveGroup event start here -----------||
		socket.on('leaveGroup', ({ groupId, user }) => {
			if (!user || !user.userId) {
				console.error('leaveGroup: missing user or userId', { groupId, user });
				return;
			}
			socket.leave(`group:${groupId}`);
			if (groupMembers[groupId]) {
				groupMembers[groupId].delete(user.userId);
				io.to(`group:${groupId}`).emit('groupActiveUsers', Array.from(groupMembers[groupId].values()));
			}
			if (socket.joinedGroups) socket.joinedGroups.delete(groupId);
			console.log(`User ${user.userId} left group ${groupId}`);
		});
		//--------------- leaveGroup event end here -------------||

		//--------------- getActiveUsers event start here -------||
		socket.on('getActiveUsers', () => {
			// Send current active users count to the requesting client
			socket.emit('activeUsers', activeConnections.size);
		});
		//--------------- getActiveUsers event end here ---------||

		//--------------- disconnect event start here -----------||
		socket.on('disconnect', () => {
			// Remove user from all groups they joined
			if (socket.joinedGroups && socket.joinedGroups.size > 0 && socket.user) {
				socket.joinedGroups.forEach((groupId) => {
					if (groupMembers[groupId]) {
						groupMembers[groupId].delete(socket.user.userId);
						io.to(`group:${groupId}`).emit('groupActiveUsers', Array.from(groupMembers[groupId].values()));
					}
				});
			}
			activeConnections.delete(socket.id);
			io.emit('activeUsers', activeConnections.size);
			console.log('A user disconnected', socket.id);
		});
		//--------------- disconnect event end here -------------||

		// Attach user info to socket on connection (for disconnect cleanup)
		socket.on('setUser', (user) => {
			socket.user = user;
		});
	});
	//--------------- socket.io connection end here ----------||

	return io;
}
//--------------- setupSocket function end here ------------||