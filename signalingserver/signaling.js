// 
// OpenSpace Streaming Thesis
//

const signalingPort = 8443;
const { WebSocketServer } = require('ws');
const ws = new WebSocketServer({port: signalingPort});

// Variables that contain information about what peers are on the server and are connected to each other
let peers = [];
let sessions = [];
let queuedCalls = [];

printServerStatus("Signaling server started, listening at port: " + signalingPort);

ws.on('connection', function connection(ws, req) {

    ws.on('message', function message(data) {
        let msg = JSON.parse(data.toString());
        let msg_type = msg.type;
        
        let caller_id = msg.caller_id;
        let recipient_id;
        let wso;

        switch(msg_type) {
            // Register the clients on the server
            case "REGISTER":
                printServerStatus("Caller **" + caller_id + "** has joined the session.");
                
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
                            printServerStatus("Found a call request from " + queuedCalls[i]);
                            wso = peers[queuedCalls[i]].ws;

                            sessions[queuedCalls[i]] = queuedCalls[i+1];
                            sessions[queuedCalls[i+1]] = queuedCalls[i];
                            queuedCalls.splice(i, 2);

                            wso.send(("SESSION_OK").toString());
                        }
                    }
                }
                return;

            // Start a session between two clients
            case "SESSION":
                recipient_id = parseInt(msg.content);

                printServerStatus(caller_id + " is requesting a session with " + recipient_id)

                if(peers[recipient_id]){
                    // TODO: Right now, this array is the object that keeps the record of who has contacted who
                    // through the server. This could be optimized in a number of ways, for example:
                    // * Create a nested array so that a peer can have more than one connection registered
                    // * Index the array in some more efficient way than just the ID. For "bigger" ID numbers
                    //   this structure might not be the best 
                    sessions[caller_id] = recipient_id;
                    sessions[recipient_id] = caller_id;

                    ws.send(("SESSION_OK").toString());
                }
                else {
                    printServerStatus("Recipient " + recipient_id + " not found, added to queue.")
                    queuedCalls.push(caller_id, recipient_id);
                }
                return;
            
            // Relay SDP between peers
            case "SDP":
                recipient_id = sessions[caller_id];
                if (recipient_id == caller_id) return;
                wso = peers[recipient_id].ws;
                printServerStatus("**SDP** received from peer " + caller_id + ", sending to peer " + recipient_id);
                wso.send(JSON.stringify(msg));
                
                return;

            // Relay ICE between peers
            case "ICE":
                recipient_id = sessions[caller_id];
                if (recipient_id == caller_id) return;
                wso = peers[recipient_id].ws;
                printServerStatus("--ICE-- received from peer " + caller_id + ", sending to peer " + recipient_id);
                wso.send(JSON.stringify(msg));

                return;

            // TODO: Create a case for UNREGISTER, so that a peer can unregister/leave the server properly

            default:  
                printServerStatus("Unknown message received from peer" + caller_id + ": " + msg);
            
        }

        
    })
})

function printServerStatus(text) {
    console.log(text);
    console.log("----------------------");
}