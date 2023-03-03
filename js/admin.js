let socket;
let icona = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>';

$('#clear').on('click', () => {
    socket.send(JSON.stringify({
        accio: "clearAll"
    }));
})
$('#config').on('click', configurar);

$(function () {
    socket = new WebSocket('ws://localhost:8180');
    console.log(socket);

    socket.onopen = function (event) {
        console.log('Connection opened');
        socket.send(JSON.stringify({
            accio: "admin"
        }));

    };

    socket.onmessage = function (event) {
        var m = JSON.parse(event.data);
        switch (m.accio) {
            case "close":
                alert("Només hi pot haver un administrador");
                break;
            case "config":
                //Modificar el tamany del canvas i el viewBox
                $('#canva').attr('width', m.width);
                $('#canva').attr('height', m.height);
                $('#canva').attr('viewBox', '0 0 ' + m.width + ' ' + m.height);
                break;
            case "updatePath":
                $('#canva').empty();
                m.paths.forEach(path => {
                    // console.log(path);
                    document.getElementById('canva').innerHTML += path;
                });
                break;
            case "clients":
                $(`#ids tbody`).empty();

                m.ids.forEach((id, index) => {
                    var td = `<td id='${id}'>${icona}</td>`
                    $(`#ids tbody`).append(`
                        <tr>
                            <td>${index}</td>
                            <td>${id}</td>
                            ${td}
                        </tr>
                    `);
                    $(td).on('click', () => {
                        socket.send(JSON.stringify({
                            accio: "clearClient",
                            id: id
                        }));
                    });
                });
                break;
            default:
                break;

        };
        console.log('Message received: ' + event.data);
    };

    socket.onerror = function (event) {
        console.log('Error: ' + event.data);
    };

    socket.onclose = function (event) {
        alert("S'ha tancat la connexió");
        window.location.href = '/';
    };
});

function configurar(e) {
    //agafar valor dels inputs
    let height = $('#height').val();
    let width = $('#width').val();
    let tolerancia = $('#tolerancia').val();

    //enviar missatge al servidor
    socket.send(JSON.stringify({
        accio: "config",
        height: height,
        width: width,
        tolerancia: tolerancia
    }));
}