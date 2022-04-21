/* vim: set sts=4 sw=4 et :
 *
 * Demo Javascript app for negotiating and streaming a sendrecv webrtc stream
 * with a GStreamer app. Runs only in passive mode, i.e., responds to offers
 * with answers, exchanges ICE candidates, and streams.
 *
 * Author: Nirbheek Chauhan <nirbheek@centricular.com>
 */



// Set this to override the automatic detection in websocketServerConnect()
var ws_server;
var ws_port;
// Set this to use a specific peer id instead of a random one
var default_peer_id = 0;
// Override with your own STUN servers if you want
var rtc_configuration = {iceServers: [{urls: "stun:stun.services.mozilla.com"},
                                      {urls: "stun:stun.l.google.com:19302"}]};
// The default constraints that will be attempted. Can be overriden by the user.
var default_constraints = {video: true};

var connect_attempts = 0;
var peer_connection;
var send_channel;
var ws_conn;
// Promise for local stream after constraints are approved by the user
var local_stream_promise;

export const joinSession = () => {
    default_peer_id = "1";
    websocketServerConnect();
    //if (status == "Registered with server, waiting for call")
    onConnectClicked();
}

export const hostSession = () => {
    default_peer_id = "HOST";
    websocketServerConnect();
}

function onConnectClicked() {
     var callee_id = "HOST";
    sendToSocket('SESSION', callee_id);
}

function websocketServerConnect() {
    // TODO: Handle # of connection attempts
    // connect_attempts++;
    // if (connect_attempts > 10000) { // TODO: Inte det här
    //     setError("Too many connection attempts, aborting. Refresh page to try again");
    //     return;
    // }

    console.log("In websocketServerConnect...");

    if (window.location.protocol.startsWith ("file")) {
        // ws_server = ws_server || "127.0.0.1";
        ws_server = "localhost";
    } else if (window.location.protocol.startsWith ("http")) {
        ws_server = ws_server || window.location.hostname;
    } else {
        throw new Error ("Don't know how to connect to the signalling server with uri " + window.location);
    }

    var ws_port = 8443;
    var ws_url = 'ws://' + ws_server + ':' + ws_port;
    setStatus("Connecting to server " + ws_url);
    ws_conn = new WebSocket(ws_url);

    // When connected, immediately register with the server 
    ws_conn.addEventListener('open', (event) => {
        sendToSocket('REGISTER', {'content': null});
        setStatus("Registering with server");
    });
    ws_conn.addEventListener('error', onServerError);
    ws_conn.addEventListener('message', onServerMessage);
    ws_conn.addEventListener('close', onServerClose);
    
}

// "Private" functions

function resetState() {
    // This will call onServerClose()
    ws_conn.close();
}

function handleIncomingError(error) {
    setError("ERROR: " + error);
    resetState();
}

function getVideoElement() {
    return document.getElementById("remote-video");
}

function setStatus(text) {
    console.log("setStatus: ", text);
    status = text;
}

function setError(text) {
    console.error(text);
}

function resetVideo() {
    // Release the webcam and mic
    if (local_stream_promise)
        local_stream_promise.then(stream => {
            if (stream) {
                stream.getTracks().forEach(function (track) { track.stop(); });
            }
        });

    // Reset the video element and stop showing the last received frame
    var videoElement = getVideoElement();
    videoElement.pause();
    videoElement.src = "";
    videoElement.load();
}

// SDP offer received from peer, set remote description and create an answer
function onIncomingSDP(sdp) {
    peer_connection.setRemoteDescription(sdp).then(() => {
        setStatus("Remote SDP set");
        if (sdp.type != "offer")
            return;
        setStatus("Got SDP offer");
        local_stream_promise.then((stream) => {
            setStatus("Got local stream, creating answer");
            peer_connection.createAnswer()
                .then(onLocalDescription).catch(setError);
        }).catch(setError);
    }).catch(setError);
}

function generateOffer() {
    peer_connection.createOffer().then(onLocalDescription).catch(setError);
}

// ICE candidate received from peer, add it to the peer connection
function onIncomingICE(ice) {
    var candidate = new RTCIceCandidate(ice);
    peer_connection.addIceCandidate(candidate).catch(setError);
}

function onServerMessage(event) {
    switch (event.data) {
        case "REGISTER":
            setStatus("Registered with server, waiting for call");
            if (default_peer_id == "1")
                onConnectClicked();
            return;
        case "SESSION_OK":
            setStatus("Starting negotiation");
            if (!peer_connection)
                createCall(null).then (generateOffer);
            return;
        /*case "OFFER_REQUEST":
            // The peer wants us to set up and then send an offer
            if (!peer_connection)
                createCall(null).then (generateOffer);
            return;*/
        default:
            if (event.data.startsWith("ERROR")) {
                handleIncomingError(event.data);
                return;
            }
            // Handle incoming JSON SDP and ICE messages
            try {
                var msg = JSON.parse(event.data);
            } catch (e) {
                if (e instanceof SyntaxError) {
                    handleIncomingError("Error parsing incoming JSON: " + event.data);
                } else {
                    handleIncomingError("Unknown error parsing response: " + event.data);
                }
                return;
            }

            // Incoming JSON signals the beginning of a call
            if (!peer_connection) 
                createCall(msg);
            
            console.log("Incoming msg:\n"); 
            console.log(msg);

            if (msg.type == "SDP") {
                onIncomingSDP(msg.content.sdp);
            } else if (msg.type == "ICE") {
                onIncomingICE(msg.content.ice);
            } else {
                handleIncomingError("Unknown incoming JSON: " + msg);
            }
    }
}

function onServerClose(event) {
    setStatus('Disconnected from server');
    resetVideo();

    if (peer_connection) {
        peer_connection.close();
        peer_connection = null;
    }

    // Reset after a second
    //window.setTimeout(websocketServerConnect, 1000);
}

function onServerError(event) {
    setError("Unable to connect to server, did you add an exception for the certificate?")
    // Retry after 3 seconds
   // window.setTimeout(websocketServerConnect, 3000);
}

function getLocalStream() {
    // var textarea = document.getElementById('constraints');
    // try {
    //     constraints = JSON.parse(textarea.value);
    // } catch (e) {
    //     console.error(e);
    //     setError('ERROR parsing constraints: ' + e.message + ', using default constraints');
    //     constraints = default_constraints;
    // }

    var constraints = default_constraints;

    // Add local stream 
    if (navigator.mediaDevices.getDisplayMedia) {
        return navigator.mediaDevices.getDisplayMedia(constraints);
    } else {
        errorUserMediaHandler();
    }

    

}

function onRemoteTrack(event) {
    if (getVideoElement().srcObject !== event.streams[0]) {
        console.log('Incoming stream');
        getVideoElement().srcObject = event.streams[0];
    }
}

function errorUserMediaHandler() {
    setError("Browser doesn't support getUserMedia!");
}

const handleDataChannelOpen = (event) =>{
    console.log("dataChannel.OnOpen", event);
};

const handleDataChannelMessageReceived = (event) =>{
    console.log("dataChannel.OnMessage:", event, event.data.type);

    setStatus("Received data channel message");
    if (typeof event.data === 'string' || event.data instanceof String) {
        console.log('Incoming string message: ' + event.data);
        textarea = document.getElementById("text")
        textarea.value = textarea.value + '\n' + event.data
    } else {
        console.log('Incoming data message');
    }
    send_channel.send("Hi! (from browser)");
};

const handleDataChannelError = (error) =>{
    console.log("dataChannel.OnError:", error);
};

const handleDataChannelClose = (event) =>{
    console.log("dataChannel.OnClose", event);
};

function onDataChannel(event) {
    setStatus("Data channel created");
    let receiveChannel = event.channel;
    receiveChannel.onopen = handleDataChannelOpen;
    receiveChannel.onmessage = handleDataChannelMessageReceived;
    receiveChannel.onerror = handleDataChannelError;
    receiveChannel.onclose = handleDataChannelClose;
}

function createCall(msg) {
    // Reset connection attempts because we connected successfully
    connect_attempts = 0;

    console.log('Creating RTCPeerConnection');

    peer_connection = new RTCPeerConnection(rtc_configuration);
    send_channel = peer_connection.createDataChannel('label', null);
    send_channel.onopen = handleDataChannelOpen;
    send_channel.onmessage = handleDataChannelMessageReceived;
    send_channel.onerror = handleDataChannelError;
    send_channel.onclose = handleDataChannelClose;
    peer_connection.ondatachannel = onDataChannel;
    peer_connection.ontrack = onRemoteTrack;
    
    /* Send our video/audio to the other peer */
    local_stream_promise = getLocalStream().then((stream) => {
        console.log('Adding local stream');
        peer_connection.addStream(stream);
        return stream;
    }).catch(setError);


    if (msg != null && msg.type != "SDP") {
        console.log("WARNING: First message wasn't an SDP message!?");
    }

    peer_connection.onicecandidate = (event) => {
        // We have a candidate, send it to the remote party with the
        // same uuid
        if (event.candidate == null) {
                console.log("ICE Candidate was null, done");
                return;
        }

        let base = {'ice': event.candidate};
        sendToSocket('ICE', base);
    };

    if (msg != null)
        setStatus("Created peer connection for call, waiting for SDP");

    return local_stream_promise;
}

// Local description was set, send it to peer
function onLocalDescription(desc) {
    //console.log("Got local description: " + JSON.stringify(desc));
    peer_connection.setLocalDescription(desc).then(function() {
        setStatus("Sending SDP " + desc.type);
        var sdp = {'sdp': peer_connection.localDescription};
        sendToSocket('SDP', sdp);
       // ws_conn.send(JSON.stringify(sdp));
    });
}

function sendToSocket(type, content) {

    let id = {'caller_id': default_peer_id};
    let message_type = {'type': type};
    let message_content = {'content': content}
    const fullMsg = {
        ...message_type,
        ...message_content,
        ...id
    };
    ws_conn.send(JSON.stringify(fullMsg));
}