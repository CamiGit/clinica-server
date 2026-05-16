const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');

const wss = new WebSocketServer({ 
  port: process.env.PORT || 8080,
  host: '0.0.0.0'
});

console.log('WebSocket server corriendo...');

wss.on('connection', (ws) => {
  console.log('Cliente conectado');

  const java = spawn('java', ['-jar', 'clinica.jar']);

  java.stdout.on('data', (data) => {
    const text = data.toString()
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
    ws.send(text);
  });

  java.stderr.on('data', (data) => {
    const text = data.toString()
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
    ws.send('[ERROR] ' + text);
  });

  ws.on('message', (msg) => {
    java.stdin.write(msg.toString() + '\n');
  });

  java.on('close', (code) => {
    ws.send('\n[Sesión terminada]');
  });

  ws.on('close', () => {
    java.kill();
    console.log('Cliente desconectado');
  });
});
