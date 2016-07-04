#!/bin/bash

#########################################################################################
###
### Author: Jean Souza [jean.souza@funcate.org.br]
### Date: 2016-06-06
###
### Purpose: Runs the ImportFires.py script.
###
#########################################################################################

today=`date +%Y-%m-%d`
yesterday=`date -d "yesterday" +%Y-%m-%d`

python /home/jean/MyDevel/ImportFires/ImportFires.py $yesterday 00:00:00 $today 23:59:59
