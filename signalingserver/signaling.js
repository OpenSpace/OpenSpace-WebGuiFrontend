const wsPort = 8443;
//const wsAdress = "localhost";
const wsAdress = "192.168.1.39";

// Nisse trials:
const { WebSocketServer } = require('ws');
const ws = new WebSocketServer({port: wsPort});
let peers = [];
let sessions = [];
let queuedCalls = [];
console.log("Signaling server started, listening at port: ", wsPort);

ws.on('connection', function connection(ws, req) {

    ws.on('message', function message(data) {
        console.log("----------------------");
        console.log("MESSAGE INCOMING: ");
        console.log(data.toString());

        let msg = JSON.parse(data.toString());
        let msg_type = msg.type;
        
        let caller_id = msg.caller_id;
        let recipient_id;
        let wso;

        switch(msg_type) {
            // Register the clients on the server
            case "REGISTER":
                console.log("Caller **" + caller_id + "** has joined the session.");
                
                peers[caller_id] = ({
                    ws: ws,
                    status: 'none'
                })

                ws.send(("REGISTER").toString());

                // If this client has a requested call, reply SESSION_OK to the original caller
                if (queuedCalls.length > 0) {
                    console.log("Found queued calls");
                    for (let i = 0; i < queuedCalls.length; i += 2) {
                        if (parseInt(caller_id) == queuedCalls[i+1]) {
                            console.log("Found a call request from ", queuedCalls[i]);
                            wso = peers[queuedCalls[i]].ws;

                            sessions[queuedCalls[i]] = queuedCalls[i+1];
                            sessions[queuedCalls[i+1]] = queuedCalls[i];
                            queuedCalls.splice(i, 2);

                            wso.send(("SESSION_OK").toString());
                        }
                    }
                }

                console.log("----------------------");
                return;

            // Start a session between two clients
            case "SESSION":
                recipient_id = parseInt(msg.content);

                console.log(caller_id + " is requesting session with " + recipient_id)

                if(peers[recipient_id]){
                    sessions[caller_id] = recipient_id;
                    sessions[recipient_id] = caller_id;

                    ws.send(("SESSION_OK").toString());
                }
                else {
                    console.log("Recipient ", recipient_id, " not found, added to queue.")
                    queuedCalls.push(caller_id, recipient_id);
                }

                console.log("----------------------");
                
                return;

            case "SDP":
                recipient_id = sessions[caller_id];
                if (recipient_id == caller_id) return;
                wso = peers[recipient_id].ws;
                console.log("**SDP** received from peer " + caller_id + ", sending to peer", recipient_id);
                wso.send(JSON.stringify(msg));

                console.log("----------------------");
                
                return;

            case "ICE":
                recipient_id = sessions[caller_id];
                if (recipient_id == caller_id) return;
                wso = peers[recipient_id].ws;
                console.log("--ICE-- received from peer " + caller_id + ", sending to peer", recipient_id);

                //ws.send(JSON.stringify(msg.content));
                wso.send(JSON.stringify(msg));
                console.log("----------------------");

                return;

            default:  
                console.log("Unknown message received from peer" + caller_id + ": " + msg);
                console.log("----------------------");

            
        }

        
    })
})


//----------------------------------------------------- STOP NOTHING TO SEE HERE ------------------------------------------------------------------------------------




/*const { WebSocketServer } = require('ws');

const WebSocket = require('ws').Server;

const wsPort = 1337;
const wsAdress = 'localhost';

const ws = new WebSocketServer({port: wsPort});

let peers = [];

let sessions = [];
let currID;

ws.on('connection', function connection(ws, req) {
    let ip = req.socket.remoteAddress;
    console.log("User connected from: " + ip + " with client: ");

    ws.on('message', function message(data) {
        let msg = data.toString().replace('"', '').split(" "); //toString node function for buffer-messages
        console.log("Fick medd: " + msg);
        currID = msg[1].trim();
        if(peers[currID]) console.log(peers[currID].status);

        switch(msg[0]) {
            case "HELLO": 
                console.log("It's hello from: ", msg[1].trim());
                peers[currID] = ({
                    ws: ws,
                })
                ws.send(("HELLO").toString())
                return;
            case "SESSION":
                let calleeID = msg[2].trim();
                console.log("Requesting session between: ", currID, calleeID)
                peers[currID].status = 'session';
                peers[calleeID].status = 'session';
                ws.send(("SESSION_OK").toString())
                //Add check if not connected etc.
                return;
            case "sdp":
                console.log("SDP received!")
            default:
                console.log("It ain't hello")

        }

    })
})

//TODO: peers, sessions, rooms. Find way to receive peer status and get the other peer in session.
*/