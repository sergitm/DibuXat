"use strict";

$('#canva').on('mousedown', iniciarDibuix);
$('#canva').on('mouseup', tancarLinia);

let coordsArray = [];
let socket;


$(function() {
    socket = new WebSocket('ws://localhost:8180');
    console.log(socket);

    socket.onopen = function(event) {
        console.log('Connection opened');
       
    };

    socket.onmessage = function(event) {
        var m = JSON.parse(event.data);
        console.log('Message received: ' + event.data);
    };

    socket.onerror = function(event) {
        console.log('Error: ' + event.data);
    };

    socket.onclose = function(event) {
        console.log('Connection closed');
    };
});

function iniciarDibuix(e){
    let newG = "<g id='grup_linies' fill='white' stroke='black' stroke-width='5'></g>";
    let canva = document.getElementById('canva');
    canva.innerHTML += newG;
    let x1=e.pageX;
    let y1=e.pageY;
    guardarCoords(x1, y1);
    $('#canva').bind('mousemove', {x1: x1, y1: y1} , dibuix);
}

function dibuix(event){
    let linia = getCoords(event.pageX, event.pageY);
    let grup = document.getElementById('grup_linies');
    grup.innerHTML += linia;
}

function tancarLinia(){
    $('#canva').unbind('mousemove');
}

function getCoords(x, y){
    guardarCoords(x, y);
    let coordi;
    let coordf;
    coordf = coordsArray[coordsArray.length -1];
    coordi = coordsArray[coordsArray.length -2];
    let nova_linia = `<line x1='${coordi.x}' y1='${coordi.y}' x2='${coordf.x}' y2='${coordf.y}' />`;
    return nova_linia;
}

function guardarCoords(x, y){
    let coordenades = {x : x, y : y};
    coordsArray.push(coordenades);
}