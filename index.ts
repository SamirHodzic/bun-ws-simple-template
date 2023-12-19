import { Server, ServerWebSocket } from 'bun';

const APP_PORT = 3000;
const WS_PORT = 3001;

Bun.serve({
  port: APP_PORT,
  fetch(req: Request) {
    // TODO: Should be replaced with proper React component and renderToReadableStream with hydration
    if (req.url.indexOf('.js') !== -1) {
      return new Response(Bun.file('./static/index.js'));
    } else if (req.url.indexOf('.css') !== -1) {
      return new Response(Bun.file('./static/style.css'));
    }

    return new Response(Bun.file('./static/index.html'));
  },
});

const messages: any[] = [];
let users: any[] = [];

const wsServer = Bun.serve({
  port: WS_PORT,
  fetch(req: Request, server: Server) {
    const success = server.upgrade(req, {
      data: { username: 'user_' + Math.random().toString(16).slice(12) },
    });

    return success
      ? undefined
      : new Response('Something went wrong :(', { status: 404 });
  },
  websocket: {
    open(ws: ServerWebSocket | any) {
      users.push(ws.data.username);
      ws.subscribe('chat');

      ws.publish(
        'chat',
        JSON.stringify({ type: 'NEW_USER', data: ws.data.username })
      );

      ws.send(JSON.stringify({ type: 'ALL_USERS', data: users }));
      ws.send(JSON.stringify({ type: 'ALL_MESSAGES', data: messages }));
    },
    message(ws: ServerWebSocket | any, data: any) {
      const message = JSON.parse(data);
      message.username = ws.data.username;
      messages.push(message);

      const messageToBroadcast = JSON.stringify({
        type: 'NEW_MESSAGE',
        data: message,
      });
      ws.send(messageToBroadcast);
      ws.publish('chat', messageToBroadcast, { exclude: [ws] });
    },
    close(ws: ServerWebSocket | any) {
      users = users.filter((username) => username !== ws.data.username);
      wsServer.publish(
        'chat',
        JSON.stringify({ type: 'REMOVE_USER', data: ws.data.username })
      );
      ws.unsubscribe('chat');
    },
  },
});

console.log(`Up and running at ${APP_PORT}`);
