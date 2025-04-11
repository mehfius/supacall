const { Server } = require('socket.io'); // Adicione esta linha

const EVENT_CONNECTION = 'connection';
const EVENT_CALL = 'call';
const EVENT_OFFER = 'offer';
const EVENT_ANSWER = 'answer';
const EVENT_CANDIDATE = 'candidate';
const EVENT_DISCONNECT_USER = 'disconnect-user';
const EVENT_DISCONNECT = 'disconnect';
const EVENT_USER_CONNECTED = 'user-connected';
const EVENT_USER_LIST = 'user-list';


class SocketService {
  constructor(http) {
    this.users = {}; // Initialize users object
    this.init(http);
  }

  init(http) {
    this.io = new Server(http, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on(EVENT_CONNECTION, (socket) => {
      const room = socket.handshake.query.room;
      const query = socket.handshake.query;

      if (!room) {
        socket.disconnect();
      } else {
        console.log(`\x1b[32m${query.user} joined the room ${query.room_name}\x1b[0m`); // Keep color

        // Ensure room exists in users object
        if (!this.users[room]) {
          this.users[room] = [];
        }

        // Add user to the room's user list
        this.users[room].push({ userId: socket.id, userName: query.user });

        // Send updated user list to the new user
        const otherUsers = this.users[room].filter(user => user.userId !== socket.id);
        socket.emit(EVENT_USER_LIST, otherUsers);

        // Get existing users in the room (excluding the new user)
        const existingUsers = this.users[room].filter(user => user.userId !== socket.id);

        // Emit user connected event to all users in the room
        this.io.to(room).emit(EVENT_USER_CONNECTED, { id: socket.id, userName: query.user, existingUsers });


        socket.join(room);
        
        // Notificar a sala inteira (incluindo o próprio usuário)
        this.io.to(room).emit(EVENT_CALL, { id: socket.id, query });

        socket.on(EVENT_OFFER, (data) => { // Removido o parâmetro query
          console.log(`${socket.id} offering ${data.id}`);
          socket.to(data.id).emit(EVENT_OFFER, {
            id: socket.id,
            offer: data.offer,
            data: query // Usa o query do handshake
          });
        });

        socket.on(EVENT_ANSWER, (data) => {
          console.log(`${socket.id} answering ${data.id}`);
          socket.to(data.id).emit(EVENT_ANSWER, {
            id: socket.id,
            answer: data.answer,
            data: query
          });
        });

        socket.on(EVENT_CANDIDATE, (data) => {
          console.log(`${socket.id} sending a candidate to ${data.id}`);
          socket.to(data.id).emit(EVENT_CANDIDATE, {
            id: socket.id,
            candidate: data.candidate,
            data: query
          });
        });

        socket.on(EVENT_DISCONNECT, () => {
          console.log(`\x1b[35m${query.user} disconnected from room ${query.room_name}\x1b[0m`); // Keep color and add room name
          // Emitir para a sala inteira
          this.io.to(room).emit(EVENT_DISCONNECT_USER, {
            id: socket.id,
            data: query
          });

          // Remove user from the room's user list
          if (this.users[room]) {
            this.users[room] = this.users[room].filter(user => user.userId !== socket.id);

             // If the room is empty, remove the room entry
            if (this.users[room].length === 0) {
              delete this.users[room];
            }
          }
        });
      }
    });
  }
}

module.exports = (http) => {
  return new SocketService(http);
};