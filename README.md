# rede disponível
A **rede disponível** é um projeto de coleta e visualização geolocalizada de nomes de rede WiFi (SSID)
[arturvc.net.br/rededisponivel/](http://arturvc.net.br/rededisponivel/)


### Coleta de dados
Para a coleta dos dados é usado um Arduino com shield de WiFi, módulo de SD Card e módulo de GPS. O arquivo com o código está na pasta *Arduino*.  
Para mais informações sobre como ligar e usar o módulo de GPS, neste [link](https://youtu.be/scOAzTiOes4) do canal no YouTube *Brincando com Ideias* há uma explicação sobre o módulo de GPS NEO-6M. 

### Formatação dos dados
Para transformar os dados .txt salvo no SD Card para formato .JSON, usado na visualização do mapa, recomendo usar *Regular Expression* (REGEX), principalmente se a quantidade de dados for extensa. Esta [playlist](https://www.youtube.com/watch?v=7DG3kCDx53c&list=PLRqwX-V7Uu6YEypLuls7iidwHMdCM6o2w) do canal *Coding of Train* do Daniel Shiffman tem ótimas explicações e exemplos de uso de REGEX.

A formatação que faço de .txt para .json é um tanto manual e uso uma REGEX por vez, além de deletar alguns eventuais erros:  
* procurar: (###\s)(.*?)(\,)\s(.*?)(\,)\s(.*)<br/>
substituir: $1"hora": "$2",\n"lat": $4,\n"long": $6,\n"redes": [{

* procurar: (\[{\n)(\w.*?),\s(-\d{2}),\s(\w*)<br/>
substituir: $1"nome": "$2",\n"sinal": $3,\n"chave": "$4"\n},

* procurar: (\w.*?),\s(-\d{2}),\s(\w*)<br/>
substituir: {\n"nome": "$1",\n"sinal": $2,\n"chave": "$3"\n},

* procurar: },\n\s*("hora)<br/>
substituir: }\n]\n},\n{\n$1

* procurar: \[{\n\n\s*{<br/>
substituir: [{\n

* procurar: .*"hora".*\n.*\n.*\n.*\n\s*("hora)<br/>
substituir: $1

* procurar: ,\n\s*-\d\d.\n.*{\n<br/>
substituir:   

* procurar: ,\s,\s-\d\d,\s\w{4}\s("hora)<br/>
substituir: \n]\n},\n{\n$1

### Visualização de dados
Para visualizar os dados, uso a estrutura do [P5JS](http://p5js.org/) para carregar os dados coletados; a biblioteca de mapas [Leaflet](https://leafletjs.com/) com estilos de mapas do [Mapbox](https://www.mapbox.com/).   
É necessário uma chave (*access token*) da API do Mapbox para usar os estilos de mapas, caso contrário a imagem do mapa não é carregada. A chave pode ser criada [aqui](https://account.mapbox.com/). 