const express = require('express')
const app = express()
const http = require('http').createServer(app)
const port = process.env.PORT || 3000
require('./SocketService')(http)

class App {
  constructor(port) {
    this.port = port
  }

  start() {
    app.get('/health', (req, res) => {
      res.send({
        status: 'UP'
      })
    })

    app.use(express.static('public'))

    http.listen(this.port, () => {
      console.log(`Servidor rodando na porta: ${this.port}`)
    })
  }
}

module.exports = (port) => {
  return new App(port)
}