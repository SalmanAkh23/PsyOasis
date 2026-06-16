const { WebSocketServer } = require('ws');
const http = require('http');
const { createHash, randomBytes } = require('crypto');

const PORT = process.env.SIGNALING_PORT || 3002;
const ROOM_EXPIRE_MS = 24 * 60 * 60 * 1000;

const rooms = new Map();
const connections = new Map();

function createRoom(roomId) {
  const room = {
    id: roomId,
    peers: new Map(),
    createdAt: Date.now(),
  };
  rooms.set(roomId, room);
  return room;
}

function hashId(id) {
  return createHash('sha256').update(id).digest('hex').slice(0, 8);
}

function send(ws, type, payload) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify({ type, ...payload }));
  }
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', rooms: rooms.size }));
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const peerId = randomBytes(8).toString('hex');
  connections.set(peerId, ws);
  let currentRoom = null;

  send(ws, 'connected', { peerId });

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {
      case 'join-room': {
        const roomId = msg.roomId || 'default';
        if (!rooms.has(roomId)) createRoom(roomId);
        const room = rooms.get(roomId);
        room.lastActive = Date.now();

        if (currentRoom) {
          const prev = rooms.get(currentRoom);
          if (prev) prev.peers.delete(peerId);
        }
        currentRoom = roomId;

        room.peers.set(peerId, { ws, joinedAt: Date.now() });
        send(ws, 'room-joined', { roomId, peerId, peerCount: room.peers.size });

        const otherPeers = [...room.peers.keys()].filter(id => id !== peerId);
        if (otherPeers.length > 0) {
          for (const otherId of otherPeers) {
            send(ws, 'peer-joined', { peerId: otherId });
            send(connections.get(otherId), 'peer-joined', { peerId });
          }
        }
        break;
      }

      case 'offer': {
        const target = connections.get(msg.to);
        if (target) send(target, 'offer', { from: peerId, sdp: msg.sdp });
        break;
      }

      case 'answer': {
        const target = connections.get(msg.to);
        if (target) send(target, 'answer', { from: peerId, sdp: msg.sdp });
        break;
      }

      case 'ice-candidate': {
        const target = connections.get(msg.to);
        if (target) send(target, 'ice-candidate', { from: peerId, candidate: msg.candidate });
        break;
      }

      case 'leave-room': {
        if (currentRoom) {
          const room = rooms.get(currentRoom);
          if (room) {
            room.peers.delete(peerId);
            for (const [pid] of room.peers) {
              send(connections.get(pid), 'peer-left', { peerId });
            }
            if (room.peers.size === 0) {
              setTimeout(() => {
                if (room.peers.size === 0) rooms.delete(currentRoom);
              }, ROOM_EXPIRE_MS);
            }
          }
          currentRoom = null;
        }
        break;
      }
    }
  });

  ws.on('close', () => {
    connections.delete(peerId);
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.peers.delete(peerId);
        for (const [pid] of room.peers) {
          send(connections.get(pid), 'peer-left', { peerId });
        }
      }
    }
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (room.peers.size === 0 && now - room.createdAt > ROOM_EXPIRE_MS) {
      rooms.delete(id);
    }
  }
}, 60 * 60 * 1000);

server.listen(PORT, () => {
  console.log(`PsyOasis signaling server running on port ${PORT}`);
});
