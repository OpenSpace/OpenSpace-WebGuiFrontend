import env from '../../api/Environment.js';


/*
// TODO: Städa upp bland dessa variabler
//var signalingServer = 'localhost';
var signalingServer = '155.98.19.66';
var signalingPort = 8443;
// Dummy value to check if we have a valid peer ID */


var peerID = 100;
const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
let id = urlParams.get('id');
if (id) {
    peerID += parseInt(id);
}

// TODO: Other STUN servers could be chosen
var rtc_configuration = {iceServers: [{urls: "stun:stun.services.mozilla.com"},
                                      {urls: "stun:stun.l.google.com:19302"}]};

var default_constraints;
var peer_connection;
var wsConnection;
var local_stream_promise;
var nIceCandidates = 0;
var minIceCandidatesRequired = 6;
var haveIceConnectionStateChange = false;
var sentFlagSdp = false;
var sentFlagIce = false;

export const joinSession = () => {
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
    var signalingUrl =
        `ws://${env.signalingAddress}:${env.signalingPort}`;
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
            if (!peer_connection) {
                setStatus("Offer request received while having no peer connetion.");
                createCall(null).then (generateOffer);
            }
            else {
                setStatus("Offer request received but peer connection exists, so ignore.");
            }
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
            if (!peer_connection) {
                setStatus("Received 'default' server message while having no peer connection.");
                createCall(msg);
            }
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

async function artificialDelayAfterGetLocalStream(text) {
    setStatus('Adding artificial wait here to avoid possible race condition.');
    await sleep(3500);
    setStatus('Arbitrary delay.');
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

    //local_stream_promise = getLocalStream().then((stream) => {
    local_stream_promise = dummyVideoStream().then((stream) => {
        setStatus('Adding local stream');
        peer_connection.addStream(stream);
        return stream;
    }).catch(setError);

    artificialDelayAfterGetLocalStream();

    if (msg != null && msg.type != "SDP") {
        setError("First message wasn't an SDP message");
    }

    peer_connection.onicecandidateerror = (event) => {
        if (event.errorCode >= 300 && event.errorCode < 700) {
            setStatus(
                `Standardized ICE error ${event.errorCode} occurred` +
                `: ${event.errorText}`
            );
        }
        else if (event.errorCode >= 700 && event.errorCode < 800) {
            setStatus(
                `Browser-generated ICE error ${event.errorCode} occurred` +
                `: ${event.errorText}`
            );
        }
        else {
            setStatus(
                `Unknown ICE error ${event.errorCode} occurred` +
                `: ${event.errorText}`
            );
        }
    };

    peer_connection.onconnectionstatechange = (event) => {
        setStatus(`onconnectionstatechange: ${event.type}`);
    }

    peer_connection.oniceconnectionstatechange = async (event) => {
        setStatus(`oniceconnectionstatechange: ${event.type}`);
        haveIceConnectionStateChange = true;
    }
    peer_connection.onicegatheringstatechange = (event) => {
        setStatus(`onicegatheringstatechange: ${event.type}`);
    }
    peer_connection.onnegotiationneeded = (event) => {
        setStatus(`onnegotiationneeded: ${event.type}`);
    }
    peer_connection.onsignalingstatechange = (event) => {
        setStatus(`onsignalingstatechange: ${event.type}`);
    }
    peer_connection.ondatachannel = (event) => {
        setStatus(`ondatachannel: ${event.type}`);
    }


    if (msg != null)
        setStatus("Created peer connection for call, waiting for SDP");

    return local_stream_promise;
}

async function sleep(ms) {
    let newPromise = new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, ms);
    });
    await newPromise;
}

// SDP offer received from peer, set remote description and create an answer
function onIncomingSDP(sdp) {
    setStatus(`>>onIncomingSDP`);
    peer_connection.setRemoteDescription(sdp).then(async function () {
        setStatus("Remote SDP set");
        if (sdp.type != "offer")
            return;
        setStatus("Got SDP offer");

        // Wait here until we have received the exepected number of ICE
        // candidates. It seems that proceeding with the steps below causes
        // a streaming video failure it the steps happen before all of the
        // ICE candidates have been received (race condition).
        while (nIceCandidates < minIceCandidatesRequired) {
            await sleep(750);
        }
        setStatus(`Received ${nIceCandidates} ICE candidates.`);
        //while (!haveIceConnectionStateChange) {
        await sleep(500); //Another arbitrary wait
        //}
        local_stream_promise.then((stream) => {
            setStatus("Got local stream, creating answer");
            peer_connection.createAnswer()
                .then(onLocalSDPDescription).catch(setError);
        }).catch(setError);
    }).catch(setError);
}

// Local description was set, send it to peer
function onLocalSDPDescription(desc) {
    setStatus(">>onLocalSDPDescription");
    peer_connection.setLocalDescription(desc).then(function() {
        setStatus("Sending SDP " + desc.type);
        var sdp = {'sdp': peer_connection.localDescription};
        sendToSocket('SDP', sdp);
        sentFlagSdp = true;
    });
}

// Generate an SDP (offer/answer)
function generateOffer() {
    setStatus("generateOffer()");
    peer_connection.createOffer().then(onLocalSDPDescription).catch(setError);
}

// ICE candidate received from peer, add it to the peer connection
function onIncomingICE(ice) {
    setStatus(`onIncomingICE(): '${ice.candidate}'`);
    var candidate = new RTCIceCandidate(ice);
    peer_connection.addIceCandidate(candidate).catch(setError);

    if (++nIceCandidates >= minIceCandidatesRequired) {
        peer_connection.onicecandidate = (event) => {
            if (event.candidate == null) {
                setStatus("onicecandidate with null ICE Candidate; ignoring");
                return;
            }
            else {
                setStatus('onicecandidate');
            }
            let icemsg = {'ice': event.candidate};
            sendToSocket('ICE', icemsg);
            sentFlagIce = true;
        };
    }
}

// Get the video component id in the GUI
function getVideoElement() {
    setStatus("getVideoElement()");
    return document.getElementById("remote-video");
}

// Receive the streamed video track 
/*async*/ function onRemoteTrack(event) {
    setStatus(`onRemoteTrack called`);
    if (getVideoElement().srcObject !== event.streams[0]) {
        setStatus("onRemoteTrack() with different event");
/*        // Introduce a wait until SDP and ICE responses have been sent before setting
        // the video element to the provided stream
        let waitCount = 0;
        setStatus('In onRemoteTrack, waiting for SDP and ICE send flags');
        while (waitCount < 10 && (!sentFlagSdp || !sentFlagIce)) {
            await sleep(500);
            waitCount++;
        }
        setStatus('Done waiting for SDP and ICE send flags');
        await sleep(500);
        setStatus('Final onRemoteTrack wait.');
        setStatus(`onRemoteTrack() with different event. Have ${event.streams.length} streams; setting to stream 0.`);
*/
        getVideoElement().srcObject = event.streams[0];
    }
}

// Get the local stream (not really necessary for GStreamer)
function getLocalStream() {
    var constraints = default_constraints;
    setStatus("getLocalStream()");

    // Add local stream 
    if (navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia(constraints);
    } else {
        setError("Browser doesn't support getUserMedia!");
    }
}

function dummyVideoStream() {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;

    const context = canvas.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const stream = canvas.captureStream(10);
    const videoTrack = stream.getVideoTracks()[0];

    let theStream = new MediaStream([videoTrack]);
    return Promise.resolve(theStream);
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
    const stringified = JSON.stringify(fullMsg);
    setStatus(`sendToSocket: '${message_type.type}'.`)

    wsConnection.send(stringified);
}
