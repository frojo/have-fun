import WebSocket, { WebSocketServer } from 'ws';


let t = 0;

const wss = new WebSocketServer({ port: 8069 });

wss.on('connection', function connection(conn) {

  conn.on('message', function message(m) {

    // TODO: sanitation?
    
    const packet = JSON.parse(m);
    const type = packet.type;

    if (type == "ping") {
      const pongPacket = {
	type: "pong",
	data: {
	  pingtime: packet.data.pingtime,
	  tick: t
	}
      }
      conn.send(JSON.stringify(pongPacket));

    } else if (type == "agent-update") {
    }

    console.log('received: %s', m);
  });

});


function sendAgentUpdate() {
  let packet = JSON.stringify({
    type: "agent-update",
    data: "data for all agents"
  });


  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(packet);
    }
  });

  //openConnections.forEach((conn) => {
  //  conn.sendUTF(packet);
  //})

  setTimeout(sendAgentUpdate, 1000/3);
}
sendAgentUpdate();


function doTick() {
  t++;

  //for (var key in agentState) {
  //  let agent = agentState[key];
  //  agentState[key] = updateAgent(agent, t);
  //}
  setTimeout(doTick, 1000 / 60);
}
doTick();
