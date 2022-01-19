import WebSocket, { WebSocketServer } from 'ws';


let t = 0;

const agentState = {};

const wss = new WebSocketServer({ port: 8069 });

wss.on('connection', function connection(conn) {
  let uuid;

  conn.on('message', function message(m) {

    // TODO: sanitation?
    
    const packet = JSON.parse(m);
    const type = packet.type;
    const data = packet.data;

    console.log("type = " + type);
    if (type == "ping") {
      const pongPacket = {
	type: "pong",
	data: {
	  pingtime: data.pingtime,
	  tick: t
	}
      }
      conn.send(JSON.stringify(pongPacket));
    } else if (type == "agent-update") {
      uuid = data.uuid;
      console.log("uuid = " + uuid);
      agentState[uuid] = data;
      console.log(agentState);
    }

    console.log('received: %s', m);
  });

  conn.on('close', function close() {
    delete agentState[uuid];
    console.log("Client has disconnected.");
  });

});




function sendAgentUpdate() {
  let packet = JSON.stringify({
    type: "agent-update",
    data: agentState
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
