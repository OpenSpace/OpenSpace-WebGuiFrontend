const wsPort = 8443;
const testPort = 8441; // TODO: Båda testerna kan inte köras på samm port obvi

// From LevelUpGitConnected
const http = require('http');
const { setFlagsFromString } = require('v8');
const server = require('websocket').server;
const httpServer = http.createServer(() => {});
httpServer.listen(testPort, () => {
    console.log('Server up! Now listening at port: ' + wsPort);
});
const wsServer = new server({
    httpServer,
});

// Nisse trials:
const { WebSocketServer } = require('ws');
const WebSocket = require('ws').Server;
const ws = new WebSocketServer({port: wsPort});
let peers = [];
let sessions = [];
let currID;
console.log("Trying to start signalling server...");

ws.on('connection', function connection(ws, req) {
    let ip = req.socket.remoteAddress; // TODO: Use to do good print things

    ws.on('message', function message(data) {
        //let msg = data.toString().replace('"', '').split(" "); //toString node function for buffer-messages
        // let msg_type = msg[0];
        // let msg_content = msg;
        // msg_content.shift();
        //if(peers[id]) {
        //    // Then what??
        //}
        console.log("----------------------");
        console.log("MESSAGE INCOMING: ");
        console.log(data.toString());

        let msg = JSON.parse(data.toString());
        let msg_type = msg.type;
        
        let caller_id = msg.caller_id;
        let callee_id;
        let wso;



        switch(msg_type) {
            // Register the clients on the server
            case "REGISTER":
                //console.log(require('os').hostname() + " (" + caller_id + ") has joined the session.");
                console.log("Caller **" + caller_id + "** has joined the session.");
                
                peers[caller_id] = ({
                    ws: ws,
                    status: 'none'
                })

                ws.send(("REGISTER").toString());
                console.log("----------------------");
                return;
            // Start a session between two clients
            case "SESSION":
                //callee_id = msg.content.callee_id;
                callee_id = msg.content;
                console.log(caller_id + " is requesting session with " + callee_id)

                // Save information about the session
                //peers[caller_id].status = 'session'; // TODO: Behövs detta?
                //peers[callee_id].status = 'session';
                // Save that these are the parties that are talking to each other
                sessions[caller_id] = callee_id;
                sessions[callee_id] = caller_id;

                ws.send(("SESSION_OK").toString());
                console.log("----------------------");
                
                return;

            case "SDP":
                callee_id = sessions[caller_id];
                if (callee_id == caller_id) return;
                wso = peers[callee_id].ws;
                console.log("**SDP** received from peer " + caller_id + ", sending to peer", callee_id);
                let sdp = msg.content.sdp;
                //ws.send(JSON.stringify(msg.content));
                wso.send(JSON.stringify(msg));
                console.log("----------------------");
                
                return;

            case "ICE":
                callee_id = sessions[caller_id];
                if (callee_id == caller_id) return;
                wso = peers[callee_id].ws;
                console.log("--ICE-- received from peer " + caller_id + ", sending to peer", callee_id);

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