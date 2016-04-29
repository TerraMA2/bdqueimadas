# bdqueimadas - Banco de Dados de Queimadas

Este aplicativo permite visualizar os focos (ocorrência do fogo na vegetação) através de um Sistema de Informação Geográfica na Web, com opções de períodos, regiões de interesse, satélites, planos de informação (ex: desmatamento, hidrografia, estradas), além da exportação dos dados em formatos txt, html, shp e kmz.

A versão anterior deste aplicativo encontra-se operacional em: http://www.dpi.inpe.br/proarco/bdqueimadas.

## Dependências

Para executar o BDQueimadas você vai precisar instalar alguns softwares de terceiros. Abaixo listamos quais são os softwares e suas versões:

- **Node.js (Obrigatório):** Para que o BDQueimadas funcione é necessário que o interpretador Node.js esteja instalado na versão 4.2.3 (ou versões superiores). O software pode ser baixado em: https://nodejs.org/.

## Instruções para Execução

Abaixo mostramos os passos para executar o BDQueimadas:

- Execute o clone da aplicação para o diretório desejado:

```
git clone https://github.com/TerraMA2/bdqueimadas.git
```

- Acesse o diretório da aplicação via linha de comando e execute o seguinte comando:

```
npm start
```

- Por padrão o sistema vai rodar na porta 35000, caso deseje alterar, acesse o arquivo bdqueimadas/bin/www:

```
var portNumber = '35000';
```
