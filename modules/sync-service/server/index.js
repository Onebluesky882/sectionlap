const http = require('http')
const WebSocket = require('ws')
const { setupWSConnection } = require('y-websocket/bin/utils')

const PORT = process.env.SYNC_PORT || 1234

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('sync-service ok\n')
})

const wss = new WebSocket.Server({ server })

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req)
})

server.listen(PORT, () => {
  console.log(`sync-service: y-websocket server listening on ws://localhost:${PORT}`)
  console.log('Connect with room name as URL path, e.g. ws://localhost:1234/<roomName>')
})
