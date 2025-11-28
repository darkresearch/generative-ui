#!/usr/bin/env node

/**
 * WebSocket Server for Streamdown Debugger
 *
 * Relays markdown content from the web controller to any connected receivers.
 *
 * Usage:
 *   bun run server
 */

const WebSocket = require('ws');

const PORT = process.env.DEBUGGER_WS_PORT
  ? Number(process.env.DEBUGGER_WS_PORT)
  : 3001;

const wss = new WebSocket.Server({ port: PORT });

console.log(`🔌 Streamdown Debugger WebSocket server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('📱 Client connected');
  ws.on('close', () => {
    console.log('📴 Client disconnected');
  });

  ws.on('message', (message) => {
    // Relay to all other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(message);
      }
    });
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket server...');
  wss.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

