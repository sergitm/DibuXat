"use strict";

$('#canva').on('mousedown', iniciarDibuixPath);
$('#canva').on('mouseup', tancarLinia);
$('.opcions').on('click', opcions);

let coordsArray = [];
let socket;
let color = "black";
let id = '';

$(function () {
    socket = new WebSocket('ws://localhost:8180');
    console.log(socket);

    socket.onopen = function (event) {
        console.log('Connection opened');

    };

    socket.onmessage = function (event) {
        var m = JSON.parse(event.data);
        switch(m.accio){
            case "id":
            id = m.id;
            break;

            default:
                break;
        }
        console.log('Message received: ' + event.data);
    };

    socket.onerror = function (event) {
        console.log('Error: ' + event.data);
    };

    socket.onclose = function (event) {
        console.log('Connection closed');
    };
});

function opcions(e) {
    console.log(e.target.id);
    switch (e.target.id) {
        case "black":
            color = "black";
            break;
        case "red":
            color = "red";
            break;
        case "blue":
            color = "blue"
            break;
        case "green":
            color = "green";
            break;
        case "white":
            color = "white";
            break;
            case "clear":
                $('#canva').empty();
                break;
        default:
            break;
    }
}

function iniciarDibuixPath(e){
    let x1 = e.offsetX;
    let y1 = e.offsetY;
    let path = `<path d='M ${x1} ${y1}' fill='none' name='${id}' stroke='${color}' stroke-width='3' />`;
    let canva = document.getElementById('canva');
    canva.innerHTML += path;
    guardarCoords(x1, y1);
    $('#canva').bind('mousemove', {
        x1: x1,
        y1: y1
    }, dibuixPath);
}

function dibuixPath(event){
    let paths = document.getElementsByTagName('path');
    guardarCoords(event.offsetX, event.offsetY);
    let dAttr = getdAttr();
    paths[paths.length-1].setAttribute('d', dAttr);
}

function iniciarDibuix(e) {
    let x1 = e.offsetX;
    let y1 = e.offsetY;
    let newG = "<g fill='white' stroke="+ color +" stroke-width='5'></g>";
    let path = `<path d='M ${x1} ${y1}' />`;
    let canva = document.getElementById('canva');
    canva.innerHTML += newG;
    guardarCoords(x1, y1);
    $('#canva').bind('mousemove', {
        x1: x1,
        y1: y1
    }, dibuix);
}

function dibuix(event) {
    let linia = getCoords(event.offsetX, event.offsetY);
    let grup = document.getElementsByTagName('g');
    grup[grup.length-1].innerHTML += linia;
}

function tancarLinia() {
    $('#canva').unbind('mousemove');
    var paths = $(`path[name="${id}"]`);
    let path = paths[paths.length - 1];
    socket.send(JSON.stringify({accio: 'newPath', path: path}));
    coordsArray = [];
}

function getCoords(x, y) {
    guardarCoords(x, y);
    let coordi;
    let coordf;
    coordf = coordsArray[coordsArray.length - 1];
    coordi = coordsArray[coordsArray.length - 2];
    let nova_linia = `<line x1='${coordi.x}' y1='${coordi.y}' x2='${coordf.x}' y2='${coordf.y}' />`;
    return nova_linia;
}

function getdAttr(){
    let str = "";
    for (let index = 0; index < coordsArray.length; index++) {
        const element = coordsArray[index];
        if (index === 0) {
            str += `M ${element.x} ${element.y}`;
        } else {
            str += ` L ${element.x} ${element.y}`;
        }
    }
    return str;
}

function guardarCoords(x, y) {
    let coordenades = {
        x: x,
        y: y
    };
    coordsArray.push(coordenades);
}