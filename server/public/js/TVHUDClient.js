var ipcRenderer = require('electron').ipcRenderer;
var socket = io();

socket.on("forwardToClient", function(msg) {
    var event = JSON.parse(msg).event;
    ipcRenderer.send(event, msg);
});

ipcRenderer.on("clientResponse", function(sender, msg) {
    socket.emit("clientResponse", msg);
});

