const EVENT_CONNECTION = 'connection'
const EVENT_CALL = 'call'
const EVENT_OFFER = 'offer'
const EVENT_ANSWER = 'answer'
const EVENT_CANDIDATE = 'candidate'
const EVENT_DISCONNECT_USER = 'disconnect-user'

const EVENT_DISCONNECT = 'disconnect'

class SocketService {
  constructor(http) {
    this.init(http)
  }

  init(http) {
    this.io = require('socket.io')(http)

    this.io.on(EVENT_CONNECTION, (socket) => {
      
      const room = socket.handshake.query.room
      const query = socket.handshake.query
      
      if (!room) {
        socket.disconnect()
      } else {
        
        console.log(`\n`)
        console.log(`##############################################`)
        console.log(` Sala ${query.room_name}`)
        console.log(` Entrou ${query.user}`)
        console.log(`##############################################`)
        console.log(`\n`)
        
        socket.join(room)
        console.log('requesting offers')
        socket.to(room).emit(EVENT_CALL, { id: socket.id,query })

        socket.on(EVENT_OFFER, (data,query) => {
          console.log(query);
          console.log(`${socket.id} offering ${data.id}`)
          socket.to(data.id).emit(EVENT_OFFER, {
            id: socket.id,
            offer: data.offer,
            data: query
          })
        })

        socket.on(EVENT_ANSWER, (data,query) => {
          console.log(query);
          console.log(`${socket.id} answering ${data.id}`)
          socket.to(data.id).emit(EVENT_ANSWER, {
            id: socket.id,
            answer: data.answer,
            data: query
          })
        })

        socket.on(EVENT_CANDIDATE, (data,query) => {
          console.log(query);
          console.log(`${socket.id} sending a candidate to ${data.id}`)
          socket.to(data.id).emit(EVENT_CANDIDATE, {
            id: socket.id,
            candidate: data.candidate,
            data: query
          })
        })

        socket.on(EVENT_DISCONNECT, () => {
          console.log(query);
          console.log(`${query.user} disconnected`)
          this.io.emit(EVENT_DISCONNECT_USER, {
            id: socket.id,
            data: query
          })
        })
      }
    })
  }
}

module.exports = (http) => {
  return new SocketService(http)
}