const SERVER_PORT = process.env.PORT || 10000;
const app = require('./src/App')(SERVER_PORT)

app.start()