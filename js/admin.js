let socket;

$(function() {
    socket = new WebSocket('ws://localhost:8180');
    console.log(socket);

    socket.onopen = function(event) {
        console.log('Connection opened');
        
    };

    socket.onmessage = function(event) {
        // var m = JSON.parse(event.data);
        console.log('Message received: ' + event.data);
    };

    socket.onerror = function(event) {
        console.log('Error: ' + event.data);
    };

    socket.onclose = function(event) {
        console.log('Connection closed');
    };
});