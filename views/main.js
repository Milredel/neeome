var socket = io();
 
socket.on('brain event', function(event){
    console.log(event);
});