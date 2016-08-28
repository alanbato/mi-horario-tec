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

function cargarEventosPrincipales() {
    $("#inputMateria").on("input", function () {

        $("#gruposDiv").slideUp(function () {
            $("#gruposTabla").find("tr:gt(0)").remove();
        });


        if ($("#inputMateria").val() != "")
        {
            mandarRequestMaterias($("#inputMateria").val(), $("#carrera").val(), $("#carrera").val() == 'todas' ? 'todos' : $("#seleccionarSemestre").val());
        } else {
            if ($("#carrera").val() == "todas")
            {
                $("#selectMateria").empty();
            } else {
                mandarRequestMaterias("", $("#carrera").val(), $("#carrera").val() == 'todas' ? 'todos' : $("#seleccionarSemestre").val());
            }


        }




    });

    $("#selectMateria").change(function () {
        seleccionarMateria($("#selectMateria").val(), $("#selectMateria").find('option:selected').text());
    });



    $("body").on("click", ".delete", function () {
        var materiaiD = $(this).attr("id").split("-")[0];
        var numGpo = $(this).attr("id").split("-")[1];
        var $esta = $(this);
        $esta.parent().parent().fadeOut('fast', function () {
            $esta.parent().parent().remove();
        });

        $.ajax({
            type: "GET",
            datatype: "json",
            url: "RequestController",
            data: "operation=eliminarGrupo&idMateria=" + materiaiD + "&numGpo=" + numGpo,
            success: eliminarGrupo
        });

    });
    
    $("body").on("mouseenter", ".grupoCl", function () {
        
        if ($(this).find('img').length > 0)
        {
            var numGpo  = $(this).find('img').first().attr('id').split('-')[1];
            for (var i in celdas[numGpo - 1])
            {
                siguienteColor = siguienteColor.replace(new RegExp('1[)]$'), '0.5)');
                pintarCeldas(celdas[numGpo - 1][i], siguienteColor);
            }
           
        }
    });
    
    $("body").on("mouseleave", ".grupoCl", function () {
        
        if ($(this).find('img').length > 0)
        {
            var numGpo  = $(this).find('img').first().attr('id').split('-')[1];
            for (var i in celdas[numGpo - 1])
            {
                pintarCeldas(celdas[numGpo - 1][i], 'transparent');
            }
           
        }
    });
    
    

    $("body").on("click", ".add", function () {

        var materiaiD = $(this).attr("id").split("-")[0];
        var numGpo = $(this).attr("id").split("-")[1];
        $.ajax({
            type: "GET",
            datatype: "json",
            url: "RequestController",
            data: "operation=agregarGrupo&idMateria=" + materiaiD + "&numGpo=" + numGpo,
            success: agregarGrupo
        });
    });

    $("body").on("click", ".anchors", function () {
        seleccionarMateria($(this).attr("id"), $(this).attr("id") + " - " + $(this).html());
        $("#selectMateria").val([]);

    });

    $("#carrera").change(function () {
        $("#gruposDiv").slideUp(function () {
            $("#gruposTabla").find("tr:gt(0)").remove();
        });
        if ($("#carrera").val() == "todas") {
            $("#semestreContainer").fadeOut();
            if ($("#inputMateria").val() != "") {
                mandarRequestMaterias($("#inputMateria").val(), "todas", "todos");
            } else {
                $("#selectMateria").empty();
            }
        } else {
            $("#semestreContainer").fadeIn();
            mandarRequestMaterias($("#inputMateria").val(), $("#carrera").val(), "todos");
            $.ajax({
                type: "GET",
                datatype: "json",
                url: "RequestController",
                data: "operation=obtenerSemestres&carrera=" + $("#carrera").val(),
                success: function (json) {
                    $("#seleccionarSemestre").empty();
                    $("#seleccionarSemestre").append($("<option value ='todos'>Todos</option>"));
                    for (var i in json.Semestres) {

                        $("#seleccionarSemestre").append($("<option value = '" + json.Semestres[i] + "'>" + json.Semestres[i] + "</option>"));
                    }
                }
            });
        }
    });

    $("#seleccionarSemestre").change(
            function () {
                $("#gruposDiv").slideUp(function () {
                    $("#gruposTabla").find("tr:gt(0)").remove();
                });
                mandarRequestMaterias($("#inputMateria").val(), $("#carrera").val(), $("#seleccionarSemestre").val());
            });



}

function mandarRequestMaterias(query, carrera, semestre) {
    var currentRequest = null;
    currentRequest = $.ajax({
        type: "POST",
        datatype: "json",
        url: "RequestController",
        data: {
            "operation": "obtenerMaterias",
            "query": query,
            "carrera": carrera,
            "semestre": semestre

        },
        beforeSend: function () {
            if (currentRequest != null) {
                currentRequest.abort();
            }
        },
        success: procesarMaterias
    });
}

function procesarMaterias(json) {
    $("#selectMateria").empty();

    for (var i in json.Resultados) {
        $('#selectMateria').append(new Option(json.Resultados[i].id + " - " + json.Resultados[i].nombre, json.Resultados[i].id));
    }
}

function procesarGrupos(json, misP) {

    var text;
    celdas = [];
    siguienteColor = json.Color;
    for (var i in json.Grupos) {
        var conHorario = true;
        var empalme = json.Grupos[i].Empalme;
        
        var horariosGrupo = [];
        for (var j in json.Grupos[i].horarios)
        {
            horariosGrupo.push(obtenerCelda(json.Grupos[i].horarios[j].dia, json.Grupos[i].horarios[j].hora, json.Grupos[i].horarios[j].duracion));
        }
        celdas.push(horariosGrupo);
        
        text += "<tr class='grupoCl" + (empalme ? " tachado" : "") + "'>" +
                "<td>" + json.Grupos[i].numGpo + "</td>" +
                "<td>" + json.Grupos[i].profesor.nombre.trunc(35) + "</td>" +
                "<td>";
        if (json.Grupos[i].horariosCod.length == 0) {
            text += "Sin Horario";
            conHorario = false;
        } else {
            for (var j in json.Grupos[i].horariosCod) {
                text += json.Grupos[i].horariosCod[j];
                if (j < json.Grupos[i].horariosCod.length - 1) {
                    text += "<br>";
                }
            }
        }

        var misProfesoresCalif = "";

        if (json.Grupos[i].profesor.link != "")
        {
            var calif = json.Grupos[i].profesor.calificacion;
            misProfesoresCalif = "<a target='_blank' href = '" + json.Grupos[i].profesor.link + "' style = 'color : " + obtenerColor(calif) + "'>" + calif + "</a>";
        } else
        {
            misProfesoresCalif = "<span>??</span>";
        }


        text += "</td>" +
                "<td style='text-align: center' id='" + json.Grupos[i].numGpo + "'>" + misProfesoresCalif + "</td>" +
                "<td style='text-align: center'> " + (conHorario && !empalme ? "<img id = '" + json.Grupos[i].idMateria + "-" + json.Grupos[i].numGpo + "' class = 'add' style='width:25px' src='images/checkmarkGreen.png'>" : "") + "</td>" +
                "</tr>";
    }

    $('#headings').after(text);
    $("#gruposDiv").slideDown();



}


function seleccionarMateria(id, nombreMat)
{
    $("#gruposTabla").find("tr:gt(0)").remove();
    $.ajax({
        type: "POST",
        datatype: "json",
        url: "RequestController",
        data: {
            "operation": "obtenerGrupos",
            "idMateria": id
        },
        timeout: 1000,
        tryCount: 0,
        retryLimit: 3,
        success: function (json) {
            procesarGrupos(json, true);
            materiaSeleccionada = id;
        },
        error: function (xhr, textStatus, errorThrown) {
            if (textStatus == 'timeout') {
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
                return;
            }
        }
    });

    $('#materiaSelecc').html(nombreMat);

}


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


        var unidadesSelecc = parseInt($("#totalUnidades").html());
        unidadesSelecc += json.Materia.unidades;

        $("#totalUnidades").html(unidadesSelecc);

        if ($("#gruposDiv").css("display") != "none") {
            $.ajax({
                type: "GET",
                datatype: "json",
                url: "RequestController",
                data: "operation=obtenerGrupos&idMateria=" + materiaSeleccionada,
                timeout: 1000,
                tryCount: 0,
                retryLimit: 3,
                success: function (json)
                {
                    actualizarEmpalmes(json);
                }
            });
        }

    } else {
        alert("Empalme");
    }
}

function eliminarGrupo(json) {
    var filas = $('#horario').find('tbody').find('tr');

    for (var i in json.horarios) {
        var hora = json.horarios[i].hora;
        var horas = parseInt(hora.split(':')[0]);
        var media = hora.split(':')[1] == "30";

        var numFila = (horas - 6) * 2 - 1;

        if (media)
            numFila++;

        var numCol = diaColunmna(json.horarios[i].dia);
        var cantFilas = json.horarios[i].duracion / 30;

        for (var j = 0; j < cantFilas; j++) {
            var fila = j + numFila;

            var celda = filas.eq(fila).find('td').eq(numCol);
            celda.animate({'background-color': "transparent"});

        }
    }

    var unidadesSelecc = parseInt($("#totalUnidades").html());
    unidadesSelecc -= json.Materia.unidades;

    $("#totalUnidades").html(unidadesSelecc);


    if ($("#gruposDiv").css("display") != "none") {
        $.ajax({
            type: "GET",
            datatype: "json",
            url: "RequestController",
            data: "operation=obtenerGrupos&idMateria=" + materiaSeleccionada,
            timeout: 1000,
            tryCount: 0,
            retryLimit: 3,
            success: function (json)
            {
                actualizarEmpalmes(json);
            }
        });
    }




}

function actualizarEmpalmes(json) {
    for (var i in json.Grupos) {
        var $row = $("#" + json.Grupos[i].numGpo).parent();

        if (json.Grupos[i].Empalme) {
            if (!$row.hasClass("tachado")) {
                $row.addClass("tachado");
                $row.children().eq(4).children().eq(0).remove();

            }
        } else {
            if ($row.hasClass("tachado")) {
                $row.removeClass("tachado");
                $row.children().eq(4).html("<img id = '" + json.Grupos[i].idMateria + "-" + json.Grupos[i].numGpo + "' class = 'add' style='width:25px' src='images/checkmarkGreen.png'>");
            }
        }

    }

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


String.prototype.trunc = String.prototype.trunc ||
        function (n) {
            return (this.length > n) ? this.substr(0, n - 1) + '&hellip;' : this;
        };