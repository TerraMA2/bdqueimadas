#!/bin/bash

#########################################################################################
###
### Author: Jean Souza [jean.souza@funcate.org.br]
### Date: 2016-06-06
###
### Purpose: Runs the ImportFires.py script with the correct dates and times.
###
#########################################################################################

# Begin and end dates, which in the most of the cases will be the current date
beginDate=$(date -d 'today' +%Y-%m-%d)
endDate=$(date -d 'today' +%Y-%m-%d)

# Current hour, used to verify the correct begin and end times
hour=$(date -d 'today' +%H)

# Variable that indicates if occurred an error in the process
error=false

# Verifications to define the begin and end times, and in some cases the begin and end dates
if [ $hour -eq "03" ];
then
  beginDate=$(date -d 'yesterday' +%Y-%m-%d)

  beginTime="23:40:01"
  endTime="02:40:00"
elif [ $hour -eq "09" ];
then
  beginTime="02:40:01"
  endTime="08:40:00"
elif [ $hour -eq "12" ];
then
  beginTime="08:40:01"
  endTime="11:40:00"
elif [ $hour -eq "15" ];
then
  beginTime="11:40:01"
  endTime="14:40:00"
elif [ $hour -eq "18" ];
then
  beginTime="14:40:01"
  endTime="17:40:00"
elif [ $hour -eq "21" ];
then
  beginTime="17:40:01"
  endTime="20:40:00"
elif [ $hour -eq "00" ];
then
  beginDate=$(date -d 'yesterday' +%Y-%m-%d)
  endDate=$(date -d 'yesterday' +%Y-%m-%d)

  beginTime="20:40:01"
  endTime="23:40:00"
else
  error=true
  echo "Error: this script should be run in one of the following times: 00hrs / 03hrs / 09hrs / 12hrs / 15hrs / 18hrs / 21hrs"
fi

# If there is no errors the ImportFires.py is executed
if [ "$error" = false ];
then
  python /ImportFires/ImportFires.py $beginDate $beginTime $endDate $endTime
fi
