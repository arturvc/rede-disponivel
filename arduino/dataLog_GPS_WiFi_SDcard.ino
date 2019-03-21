/*
     Projeto REDE DISPONIVEL
    rede disponível é um projeto de coleta e visualização geolocalizada de nomes de rede WiFi (SSID)
    http://arturvc.net.br/rededisponivel/
    Data logger usando o WiFi shield e o módulo de SD Card com módulo de GPS
*/

// como ligar o módulo de GPS: Brincado com Ideias, Módulos para Arduino - Vídeo 06 - GPS NEO-6M, https://youtu.be/scOAzTiOes4


#include <SoftwareSerial.h>
#include <TinyGPS.h>


#include <SPI.h>
#include <WiFi.h>

#include <SD.h>
File arquivo;


SoftwareSerial softSerial(5, 6); // RX e TX no Arduino (consequentemente, TX e RX no módulo GPS)
TinyGPS moduloGPS;

void setup() {
  pinMode(A0, OUTPUT);
  softSerial.begin(9600);
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  //Serial.println("Iniciando o sistema...");

  // Serial.print("Inicializando o SD card...");
  if (!SD.begin(4)) {
    // Serial.println("Inicialização falhou!");
    while (1);
  }
  // Serial.println("Inicialização concluída.");



  // =========================== Gravar no SD Card... ===========================

  arquivo = SD.open("log21mar.txt", FILE_WRITE);
  if (arquivo) {
    arquivo.println("==========");
    arquivo.close();
    Serial.println("OK!");
    piscarLed(5, 500);
  } else {
    Serial.println("ERROR");
  }
  delay(5000);
}

void loop() {
  bool recebido = false;

  while (softSerial.available()) {
    char charNovos = softSerial.read();
    recebido = moduloGPS.encode(charNovos);
  }

  if (recebido) {
    // Serial.println("#INÍCIO#");
    piscarLed(2, 500);
    String msgGPS = "### ";
    unsigned long idadeInfo;
    int ano;
    byte mes, dia, hora, minuto, segundo, centesimo;
    long latitude, longitude;
    moduloGPS.crack_datetime(&ano, &mes, &dia, &hora, &minuto, &segundo, &centesimo, &idadeInfo);
    moduloGPS.get_position(&latitude, &longitude, &idadeInfo);

    msgGPS += hora;
    msgGPS += ":";
    msgGPS += minuto;
    msgGPS += ":";
    msgGPS += segundo;
    msgGPS += ":";
    msgGPS += centesimo;
    msgGPS += ", ";
    msgGPS += latitude;
    msgGPS += ", ";
    msgGPS += longitude;
    Serial.println(msgGPS);


    // =========================== Gravar no SD Card... ===========================

    arquivo = SD.open("log13mar.txt", FILE_WRITE);
    if (arquivo) {
      arquivo.println(msgGPS);
      arquivo.close();
      Serial.println("OK!");
      piscarLed(2, 250);
    } else {
      Serial.println("ERROR");
      piscarLed(1, 10000);
    }



    // =========================== Scanear redes de WiFI...

    //Serial.println("** Scan Networks **");
    int numSsid = WiFi.scanNetworks();
    if (numSsid == -1) {
      // Serial.println("Couldn't get a wifi connection");
      while (true);
    }

    // print the network number and name for each network found:
    for (int thisNet = 0; thisNet < numSsid; thisNet++) {
      String msgSSID = "";
      msgSSID += WiFi.SSID(thisNet);
      msgSSID += ", ";
      msgSSID += WiFi.RSSI(thisNet);
      msgSSID += ", ";

      int thisType = WiFi.encryptionType(thisNet);
      switch (thisType) {
        case ENC_TYPE_WEP:
          //          Serial.println("WEP");
          msgSSID += "WEP";
          break;
        case ENC_TYPE_TKIP:
          //Serial.println("WPA");
          msgSSID += "WPA";
          break;
        case ENC_TYPE_CCMP:
          //Serial.println("WPA2");
          msgSSID += "WPA2";
          break;
        case ENC_TYPE_NONE:
          //Serial.println("None");
          msgSSID += "None";
          break;
        case ENC_TYPE_AUTO:
          //Serial.println("Auto");
          msgSSID += "Auto";
          break;
      }

      Serial.println(msgSSID);

      // =========================== Gravar no SD Card... ===========================
      arquivo = SD.open("log13mar.txt", FILE_WRITE);

      // if the file opened okay, write to it:
      if (arquivo) {
        arquivo.println(msgSSID);
        arquivo.close();
        Serial.println("OK!");
        piscarLed(1, 50);
      } else {
        Serial.println("ERROR");
        piscarLed(1, 10000);
      }


    }
    // Serial.println("#FIM#");


    delay(10000);
  }
}


void piscarLed(int qt, int tempo) {
  for (int i = 0; i < qt; i++) {
    digitalWrite(A0, HIGH);
    delay(tempo);
    digitalWrite(A0, LOW);
    delay(tempo);

  }
}
