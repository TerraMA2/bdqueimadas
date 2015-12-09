# bdqueimadas - Banco de Dados de Queimadas

Este aplicativo permite visualizar os focos (ocorrência do fogo na vegetação) através de um Sistema de Informação Geográfica na Web, com opções de períodos, regiões de interesse, satélites, planos de informação (ex: desmatamento, hidrografia, estradas), além da exportação dos dados em formatos txt, html, shp e kmz.

A versão anterior deste aplicativo encontra-se operacional em: http://www.dpi.inpe.br/proarco/bdqueimadas.

## Dependencies

Below we show the list of third-party softwares and its versions that you need to run BDQueimadas:

- **Apache (Mandatory):** BDQueimadas runs on the Apache HTTP Server. You will need to have it installed in order to run BDQueimadas. Make sure to have at least version 2.4 installed. You can download it from: https://httpd.apache.org.

## Instructions for Running

Below we show the steps to run BDQueimadas:

- Place the application folder into the Apache root directory.

- Set the path to the TerraMA2 in the index.html file (bdqueimadas/views/index.html):

```
<script src="http://localhost/terrama2/webapp/js/terrama2.js" type="text/javascript"></script>
<link rel="stylesheet" href="http://localhost/terrama2/webapp/css/terrama2.css">
```
