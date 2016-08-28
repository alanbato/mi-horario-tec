/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var colores = ["blue", "green", "yellow", "red", "cyan", "lightGray", "orchid", "wheat"];
var coloresUsados = 0;
var materiaSeleccionada;
var siguienteColor;
var celdas = [];

$(document).ready(function () {

    cargarEventosPrincipales();
});


function agregarGrupo(json) {
    
    if (json.Empalme == "No") {
        for (var i in json.horarios) {
            
            var celda = obtenerCelda(json.horarios[i].dia, json.horarios[i].hora, json.horarios[i].duracion);
            pintarCeldas(celda, json.Color);
        }



        var text = $("<tr>" +
                "<td style='width: 10px; background: " + json.Color + "'></td>" +
                "<td><a id='" + json.Materia.id + "'  class='anchors' href='#'>" + json.Materia.nombre + "</a><br>" + "<span class='profesor'>" + json.profesor.nombre + "<br><b> Fecha ex: </b>" + json.FechaExamen.fecha + " " + json.FechaExamen.hora + "</span></td>" +
                "<td style='text-align: center'>" + json.Materia.unidades + "</td>" +
                "<td style='text-align: center'><img id = '" + json.idMateria + "-" + json.numGpo + "' class='delete' style='width:15px' src='images/crossmark.png'></td>" +
                "</tr>");


        $('#footerSelecc').before(text.hide().fadeIn());
}


function diaColunmna(dia) {
    switch (dia) {
        case "Lunes":
            return 0;
        case "Martes":
            return 1;
        case "Miercoles":
            return 2;
        case "Jueves":
            return 3;
        case "Viernes":
            return 4;
        case "Sabado":
            return 5;
    }
}

function obtenerColor(calificacion)
{
    if (calificacion > 7.5)
        return "green";
    else if (calificacion > 6)
        return "rgb(204,204,0)";
    else if (calificacion > 4)
        return "red";
    else
        return "darkRed";
}

function obtenerCelda (dia, hora, duracion)
{
    var horas = parseInt(hora.split(':')[0]);
    var media = hora.split(':')[1] == "30";

    var numFila = (horas - 6) * 2 - 1;

    if (media)
        numFila++;

    var numCol = diaColunmna(dia);
    var cantFilas = duracion / 30;

    return {fila: numFila, columna: numCol, cantidad: cantFilas}; 
}

function pintarCeldas(cell, color)
{
    var filas = $('#horario').find('tbody').find('tr');
    
    var cantFilas = cell.cantidad;
    var numFila = cell.fila;
    var numCol = cell.columna;
            
    for (var j = 0; j < cantFilas; j++) {
        var fila = j + numFila;
        var celda = filas.eq(fila).find('td').eq(numCol);

        celda.stop().animate({'background-color': color});
        
    }
}
