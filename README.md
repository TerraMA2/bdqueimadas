# bdqueimadas - Banco de Dados de Queimadas

Este aplicativo permite visualizar os focos (ocorrência do fogo na vegetação) através de um Sistema de Informação Geográfica na Web, com opções de períodos, regiões de interesse, satélites, planos de informação (ex: desmatamento, hidrografia, estradas), além da exportação dos dados em formatos txt, html, shp e kmz.

A versão anterior deste aplicativo encontra-se operacional em: http://www.dpi.inpe.br/proarco/bdqueimadas.

## Instructions for Running

Below we show the steps to run BDQueimadas:

- Place the application folder into the Apache root directory.

- Set the correct path to TerraMA2 in the index.html file (bdqueimadas/views/index.html):

```
<script src="http://localhost/terrama2/webapp/js/terrama2.js" type="text/javascript"></script>
<link rel="stylesheet" href="http://localhost/terrama2/webapp/css/terrama2.css">
```
