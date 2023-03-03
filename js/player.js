"use strict";

$('#canva').on('mousedown', iniciarDibuixPath);
$('#canva').on('mouseup', tancarLinia);
$('#canva').on('mouseleave', tancarLinia);
$('#colors div').on('click', opcions);


let coordsArray = [];
let socket;
let color = "black";
let id = '';
let path;

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

            case "updatePath":
            $('#canva').empty();
            m.paths.forEach(path => {
                console.log(path);
                document.getElementById('canva').innerHTML += path;
            });
            
            break;

            case "config":
                //Modificar el tamany del canvas i el viewBox
                $('#canva').attr('width', m.width);
                $('#canva').attr('height', m.height);
                $('#canva').attr('viewBox', '0 0 ' + m.width + ' ' + m.height);
                break;

            default:
                break;
        }
    };

    socket.onerror = function (event) {
        console.log('Error: ' + event.data);
    };

    socket.onclose = function (event) {
        alert("S'ha tancat la connexió");
        window.location.href = '/';
    };
});

function opcions(e) {
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
                socket.send(JSON.stringify({accio: "clear"}));
                break;
            case "desfer":
                socket.send(JSON.stringify({accio: "desfer"}));
                break;
        default:
            break;
    }
}

function iniciarDibuixPath(e){
    let x1 = e.offsetX;
    let y1 = e.offsetY;
    path = `<path d='M ${x1} ${y1}' fill='none' name='${id}' stroke='${color}' stroke-width='3' />`;
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

function tancarLinia() {
    $('#canva').unbind('mousemove');
    var paths = $(`path[name="${id}"]`);
    var path = paths[paths.length - 1];
    socket.send(JSON.stringify({accio: 'newPath', path: path.outerHTML}));
    coordsArray = [];
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