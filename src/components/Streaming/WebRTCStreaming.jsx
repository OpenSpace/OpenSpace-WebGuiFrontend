// TODO: Städa upp bland dessa variabler
//var signalingServer = 'localhost';
var signalingServer = 'localhost';
var signalingPort = 8443;
// Dummy value to check if we have a valid peer
var peerID = 0;
// TODO: Other STUN servers could be chosen
var rtc_configuration = {iceServers: [{urls: "stun:stun.services.mozilla.com"},
                                      {urls: "stun:stun.l.google.com:19302"}]};

var default_constraints;
var peer_connection;
var wsConnection;
var local_stream_promise;

export const joinSession = () => {
    // TODO: Set this value dynamically
    peerID = '2';
    // The peer that is joining the session should not share any media (video:false)
    default_constraints = 
        {
            'width': 1680, 
            'height': 1050,
            'video': false,
        }
    websocketServerConnect();
}

// Creates a connection between the peer and the signaling server
function websocketServerConnect() {
    var signalingUrl = 'ws://' + signalingServer + ':' + signalingPort;
    setStatus("Connecting to server " + signalingUrl);
    wsConnection = new WebSocket(signalingUrl);

    // When connected, immediately register with the server 
    wsConnection.addEventListener('open', (event) => {
        sendToSocket('REGISTER', {'content': null});
        setStatus("Registering with server");
    });

    wsConnection.addEventListener('error', onServerError);
    wsConnection.addEventListener('message', onServerMessage);
    wsConnection.addEventListener('close', onServerClose);

}

// Set error if connection fails
function onServerError(event) {
    setError("Unable to connect to server")
}

// Handle all (known) message types from the signaling server
function onServerMessage(event) {
    switch (event.data) {
        // Successful registration
        case "REGISTER":
            setStatus("Registered peer " + peerID + " with server.");
            return;
        // TODO: Add a case "SESSION_OK" if you implement caller functionality for the viewer

        // The host asks for an SDP answer to their offer
        case "OFFER_REQUEST":
            // The peer wants us to set up and then send an offer
            if (!peer_connection)
                createCall(null).then (generateOffer);
            return;

        // Basically error handling if we receive an unknown message
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

            // Handle SDP or ICE messages
            if (msg.type == "SDP") {
                onIncomingSDP(msg.content.sdp);
            } else if (msg.type == "ICE") {
                onIncomingICE(msg.content.ice);
            } else {
                handleIncomingError("Unknown incoming JSON: " + msg);
            }
    }
}

// Close the connection properly is server is disconnected
function onServerClose(event) {
    setStatus('Disconnected from server');
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

    if (peer_connection) {
        peer_connection.close();
        peer_connection = null;
    }

}

// Prints the error in the browser console
function setError(text) {
    console.error(text);
}

// Prints the status in the browser console
function setStatus(text) {
    console.log("setStatus: ", text);
}


// Handle error by closing the connection
function handleIncomingError(error) {
    setError("ERROR: " + error);
    wsConnection.close();
}

// Set up of the call
function createCall(msg) {
    setStatus('Creating RTCPeerConnection');

    peer_connection = new RTCPeerConnection(rtc_configuration);
    peer_connection.ontrack = onRemoteTrack;

    // TODO: This functioanlity is in theory not necessary for us, since the viewer shouldn't
    // share any media. But as it is now, this must still be in place since the host expects something
    // in return. However, our stream here does not contain anything since we set the constraints
    // to video:false
    local_stream_promise = getLocalStream().then((stream) => {
        setStatus('Adding local stream');
        peer_connection.addStream(stream);
        return stream;
    }).catch(setError);


    if (msg != null && msg.type != "SDP") {
        setError("First message wasn't an SDP message");
    }

    peer_connection.onicecandidate = (event) => {
        if (event.candidate == null) {
                setError("ICE Candidate was null");
                return;
        }

        let icemsg = {'ice': event.candidate};
        sendToSocket('ICE', icemsg);
    };

    if (msg != null)
        setStatus("Created peer connection for call, waiting for SDP");

    return local_stream_promise;
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

// Local description was set, send it to peer
function onLocalDescription(desc) {
    peer_connection.setLocalDescription(desc).then(function() {
        setStatus("Sending SDP " + desc.type);
        var sdp = {'sdp': peer_connection.localDescription};
        sendToSocket('SDP', sdp);
    });
}

// Generate an SDP (offer/answer)
function generateOffer() {
    peer_connection.createOffer().then(onLocalDescription).catch(setError);
}

// ICE candidate received from peer, add it to the peer connection
function onIncomingICE(ice) {
    var candidate = new RTCIceCandidate(ice);
    peer_connection.addIceCandidate(candidate).catch(setError);
}

// Get the video component id in the GUI
function getVideoElement() {
    return document.getElementById("remote-video");
}

// Receive the streamed video track 
function onRemoteTrack(event) {
    if (getVideoElement().srcObject !== event.streams[0]) {
        getVideoElement().srcObject = event.streams[0];
    }
}

// Get the local stream (not really necessary for GStreamer)
function getLocalStream() {
    var constraints = default_constraints;

    // Add local stream 
    if (navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia(constraints);
    } else {
        setError("Browser doesn't support getUserMedia!");
    }

}

// Send message to the signaling server
function sendToSocket(type, content) {

    let id = {'caller_id': peerID};
    let message_type = {'type': type};
    let message_content = {'content': content}
    const fullMsg = {
        ...message_type,
        ...message_content,
        ...id
    };
    wsConnection.send(JSON.stringify(fullMsg));
}