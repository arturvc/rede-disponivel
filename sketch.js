// rede disponível é um projeto de coleta e visualização geolocalizada de nomes de rede WiFi (SSID)
// http://arturvc.net.br/rededisponivel/


let mapaLeaflet;
let pontosWiFi = [];
let marcador = [];
let iconeTxt = [];
let nomes = [];
let limitesLatLong;
let titulo;
let titulosViewport = [];


function setup() {
  noCanvas();
  titulo = select('#tituloH1');
  loadJSON("logSSID.json", carregarJSON);
}


function carregarJSON(dados) {
  pontosWiFi = dados;
  for (var i = 0; i < pontosWiFi.length; i++) {
    pontosWiFi[i].lat /= 1000000;
    pontosWiFi[i].long /= 1000000;
  }
  carregarSSID();
}


function carregarSSID() {
  for (let i = 0; i < pontosWiFi.length; i++) {
    for (let j = 0; j < pontosWiFi[i].redes.length; j++) {
      if (j == 0) {
        nomes[i] = pontosWiFi[i].redes[j].nome;
      } else {
        nomes[i] += " <br> " + pontosWiFi[i].redes[j].nome;
      }
    }
  }

  limitesDoMapa();
  carregarPontos();
}

function limitesDoMapa() {
  let latOrdenando = [];
  let longOrdenando = [];
  for (let i = 0; i < pontosWiFi.length; i++) {
    latOrdenando.push(pontosWiFi[i].lat);
    longOrdenando.push(pontosWiFi[i].long);
  }
  latOrdenando.sort();
  longOrdenando.sort();

  let offSet = 0.002;
  latOrdenando[0] += offSet;
  longOrdenando[0] += offSet;
  latOrdenando[latOrdenando.length - 1] -= offSet * 2;
  longOrdenando[longOrdenando.length - 1] -= offSet * 2;
  limitesLatLong = [
    [latOrdenando[0], longOrdenando[0]],
    [latOrdenando[latOrdenando.length - 1], longOrdenando[longOrdenando.length - 1]]
  ];
}

function carregarPontos() {

  let nAleatorio = int(random(pontosWiFi.length));
  mapaLeaflet = L.map('mapid', {
    //zoomDelta: 2,
    //zoomSnap: 1,
    //wheelPxPerZoomLevel: 10
  }).setView([pontosWiFi[nAleatorio].lat, pontosWiFi[nAleatorio].long], 16);
  //mapaLeaflet.fitBounds(limitesLatLong); // max zoom to see whole polygon
  mapaLeaflet.setMaxBounds(limitesLatLong); // restrict map view to polygon bounds
  mapaLeaflet.setMinZoom(12);
  //mapaLeaflet.options.minZoom = map.getZoom(); // restrict user to zoom out 
  L.tileLayer(' https://api.mapbox.com/styles/v1/arturvc/cjsvpnlid6sr21fnzimik8nrr/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
    accessToken: 'Insira o seu TOKEN do Map Box aqui, entre as aspas - disponível em https://account.mapbox.com/'
  }).addTo(mapaLeaflet);
  for (let i = 0; i < pontosWiFi.length; i++) {
    iconeTxt[i] = L.divIcon({
      className: 'icone-textual',
      html: nomes[i]
    });
    if (pontosWiFi[i].redes.length == 1) {
      marcador[i] = L.marker([pontosWiFi[i].lat, pontosWiFi[i].long], {
        icon: iconeTxt[i]
      }).bindPopup("neste ponto " + pontosWiFi[i].lat + ", " + pontosWiFi[i].long + "<br>estava disponível " + pontosWiFi[i].redes.length + " SSID");;
    } else {
      marcador[i] = L.marker([pontosWiFi[i].lat, pontosWiFi[i].long], {
        icon: iconeTxt[i]
      }).bindPopup("neste ponto " + pontosWiFi[i].lat + ", " + pontosWiFi[i].long + "<br>estavam disponíveis " + pontosWiFi[i].redes.length + " SSID");;
    }
    marcador[i].addTo(mapaLeaflet);
  }

  titulosViewport.length = 0;
  for (let i = 0; i < pontosWiFi.length; i++) {
    for (let j = 0; j < pontosWiFi[i].redes.length; j++) {

      let moveu = mapaLeaflet.getBounds().contains(marcador[i].getLatLng());
      if (moveu) {
        titulosViewport.push(pontosWiFi[i].redes[j].nome);
      } else {}
    }
  }
  atualizarNomes();
}

function atualizarNomes() {
  mapaLeaflet.on('moveend ', function (e) {
    titulosViewport.length = 0;
    for (let i = 0; i < pontosWiFi.length; i++) {
      for (let j = 0; j < pontosWiFi[i].redes.length; j++) {

        let moveu = mapaLeaflet.getBounds().contains(marcador[i].getLatLng());
        if (moveu) {
          titulosViewport.push(pontosWiFi[i].redes[j].nome);
        } else {}
      }
    }
  });
}

function draw() {
  if (titulosViewport.length < 1) {
    titulo.html("rede disponível");
  } else {
    if (frameCount % 40 <= 4) {
      let x = int(random(titulosViewport.length));
      titulo.html("rede <strong>" + titulosViewport[x] + "</strong> disponível");
    }
  }
}