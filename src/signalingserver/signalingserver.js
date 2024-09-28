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

printServerStatus(`Signaling server started, listening at port: ${signalingPort}`);

ws.on('connection', function connection(ws, req) {

    ws.on('message', function message(data) {
        let msg = JSON.parse(data.toString());
        let msg_type = msg.type;

        switch(msg_type) {
            // Register the clients on the server
            case "REGISTER":
                printServerStatus(`Caller ${msg.caller_id} has joined the session.`);
                registerPeer(msg.caller_id, ws);
                ws.send(("REGISTER").toString());

                if (doesPeerHaveQueuedSessionInvite(msg.caller_id)) {
                    handleAndRemoveQueuedSessionInvite(msg.caller_id);
                }
                else if (isPeerRegistered(msg.caller_id)) {
                    let sessionPartner = sessionPartnerForThisPeer(msg.caller_id);
                    if (sessionPartner !== 0) {
                        //Handle the case for a refresh/reconnect
                        printServerStatus(
                            `Sending reset message back to ID ${sessionPartner}`);
                        let wsForReply = websocketHandleForPeer(sessionPartner);
                        if (wsForReply) {
                            wsForReply.send(("SESSION_OK").toString());
                        }
                    }
                }
                break;

            // Start a session between two clients
            case "SESSION":
                let recipient_id = parseInt(msg.content);
                printServerStatus(`${msg.caller_id} request session w/ ${recipient_id}`);
                if (isPeerRegistered(recipient_id)) {
                    assignSessionBetweenPeers(msg.caller_id, recipient_id);
                }
                else {
                    printServerStatus(`Recipient ${recipient_id} not found.`);
                    queueSessionRequest(msg.caller_id, recipient_id);
                }
                break;

            // Relay SDP between peers
            case "SDP":
                relayMessageBetweenPeers("SDP", msg);
                break;

            // Relay ICE between peers
            case "ICE":
                relayMessageBetweenPeers("ICE", msg);
                break;

            // TODO: Create a case for UNREGISTER, so that a peer can unregister/leave the server properly
            default:
                printServerStatus(`Unknown msg rx'd from peer ${msg.caller_id}: ${msg}`);
                break;
        }
        return;
    })
})

//Assign a session between peers by setting the partner id of each peer to the other
//Finish by sending a 'SESSION_OK' confirmation to the host
// host - the id of the peer who requested this session
// guest - the id of the peer recipient of this session request
function assignSessionBetweenPeers(host, guest) {
    assignSessionPartnerToPeer(host, guest);
    assignSessionPartnerToPeer(guest, host);
    let wsOfHost = websocketHandleForPeer(host);
    if (wsOfHost) {
        wsOfHost.send(("SESSION_OK").toString());
    }
}

//Queue a session request for the case where host requests a session with guest, but
//guest has not yet registered with the signaling server.
// host - the id of the peer who requested this session
// guest - the id of the peer recipient of this session request, but is not registered
function queueSessionRequest(host, guest) {
    printServerStatus(`queue session request from ${host} to ${guest}`);
    queuedCalls.push({
        from: host,
        to: guest
    });
}

//Checks if a peer has a pre-existing, queued invitation for a session
// Returns true if a queued session request exists
function doesPeerHaveQueuedSessionInvite(invitee) {
    for (const q of queuedCalls) {
        if (q.to == parseInt(invitee)) {
            printServerStatus(`Found session invite from ${q.from} to ${q.to}`);
            return true;
        }
    }
    printServerStatus(`No session invites found for ${invitee}`);
    return false;
}

//Looks through all queued session invites for an invitation to the specified
//peer id. If one is found, then the session is assigned between the peers,
//and a response is sent to the host who requested the session.
// invitee - the peer id who may have been previously invited
function handleAndRemoveQueuedSessionInvite(invitee) {
    for (let i = 0; i < queuedCalls.length; i++) {
        if (queuedCalls[i].to == parseInt(invitee)) {
            let inviter = queuedCalls[i].from;
            printServerStatus(`Found a call request from ${inviter}`);
            assignSessionBetweenPeers(inviter, invitee);
            queuedCalls.splice(i, 1); //Remove the invite
            break;
        }
    }
}

//Relay a message (un-modified by signaling server) between peers
// typeName - either 'SDP' or 'ICE' which is the message header
// message - the struct containing the message contents and other details
function relayMessageBetweenPeers(typeName, message) {
    recipient_id = sessionPartnerForThisPeer(message.caller_id);
    if (recipient_id !== message.caller_id) {
        wsForSend = websocketHandleForPeer(recipient_id);
        if (wsForSend) {
            printServerStatus(`${typeName} received from peer ${message.caller_id}` +
                `, sending to peer ${recipient_id}`);
            wsForSend.send(JSON.stringify(message));
        }
        else {
            printServerStatus(`${typeName} received from peer ${message.caller_id}` +
                `, but no websocket handle for recipient ${recipient_id}`);
        }
    }
}

//Given a peer id, get the id of the other peer that is assigned a session
// peer_id - want to know the id of the other peer that is in a session with this peer
// returns the id of the other peer in the session, or 0 if no session exists for peer
function sessionPartnerForThisPeer(peer_id) {
    if (sessions[peer_id]) {
        return sessions[peer_id];
    }
    return 0;
}

//Assign the partner of the current peer
// peer - the current peer to be assigned a partner
// partner - the peer id of the partner for this session
function assignSessionPartnerToPeer(peer, partner) {
    sessions[peer] = partner;
}

//Determines if a peer id has registered itself with the signaling server, and is thus
//available for a session
// returns true if the peer id is registered with the signaling server
function isPeerRegistered(peer_id) {
    return (peers[peer_id] != null);
}

//Register a peer with the signaling server
// id - the peer id to register
// websocketHandle - handle to the websocket object to communicate with this peer
function registerPeer(id, websocketHandle) {
    peers[id] = ({
        ws: websocketHandle,
        status: 'none'
    });
    printServerStatus(`registerPeer(${id}) with wsHandle: ${websocketHandle}`);
}

//Get the handle to the websocket used to communicate with the specified peer
// id - the peer to get websocket handle for
// returns the websocket handle, or null if that peer id is not registered
function websocketHandleForPeer(id) {
    printServerStatus(`websocketHandleForPeer(${id})`);
    if (isPeerRegistered(id)) {
        return peers[id].ws;
    }
    else {
        return null;
    }
}

function printServerStatus(text) {
    console.log(text);
}