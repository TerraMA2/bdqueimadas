#!/usr/bin/python2

#########################################################################################
###
### Author: Jean Souza [jean.souza@funcate.org.br]
### Date: 2016-06-02
###
### Purpose: Import fires registers from its original database into a PostGIS database.
###
#########################################################################################

# MySQL related variables
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = "secreto"
MYSQL_DATABASE = "db"
MYSQL_TABLE = "db.tabela"
MYSQL_DB = None
MYSQL_CURSOR = None

# PostgreSQL related variables
PGSQL_HOST = "localhost"
PGSQL_USER = "postgres"
PGSQL_PASSWORD = "secreto"
PGSQL_DATABASE = "db"
PGSQL_TABLE = "public.tabela"
PGSQL_DB = None
PGSQL_CURSOR = None

# Path to the log file
LOG_FILE = "ImportFires.log"

# Variable responsible for keeping any exception that occur
EXCEPTION = None

# Variable responsible for keeping the process result
RESULT = ""

# Importing necessary packages
import MySQLdb
import psycopg2
import datetime
import sys

# Function responsible for creating the connections to the databases
def connect():
    try:
        global MYSQL_DB, MYSQL_CURSOR, PGSQL_DB, PGSQL_CURSOR

        MYSQL_DB = MySQLdb.connect(host=MYSQL_HOST, user=MYSQL_USER, passwd=MYSQL_PASSWORD, db=MYSQL_DATABASE)
        MYSQL_CURSOR = MYSQL_DB.cursor()

        PGSQL_DB = psycopg2.connect(host=PGSQL_HOST, user=PGSQL_USER, password=PGSQL_PASSWORD, database=PGSQL_DATABASE)
        PGSQL_CURSOR = PGSQL_DB.cursor()
        PGSQL_CURSOR.execute("SET CLIENT_ENCODING TO 'LATIN1';")

        return True
    except Exception as e:
        global EXCEPTION
        EXCEPTION = str(e)

        return False

# Function responsible for executing the query
def executeQuery(begin, end):
    try:
        query = "select id, LAT, LON, Data, Satelite, Municipio, Estado, Regiao, Pais, Precipitacao, NumDiasSemPrecip, Risco, BiomaBrasileiro from " + MYSQL_TABLE + " where Data between %s and %s;"
        MYSQL_CURSOR.execute(query, [begin, end])

        return True
    except Exception as e:
        global EXCEPTION
        EXCEPTION = str(e)

        return False

# Function responsible for inserting the data to the PostGIS database
def insertData(data):
    try:
        query = "INSERT INTO " + PGSQL_TABLE + " (id, lat, lon, data, horagmt, satelite, municipio, uf, regiao, pais, prec, ndiasschuv, risco, bioma, geom) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326));"
        PGSQL_CURSOR.execute(query, data)
        PGSQL_DB.commit()

        return True
    except Exception as e:
        global EXCEPTION
        EXCEPTION = str(e)

        return False

# Function responsible for closing the databases connections
def closeConnections():
    if MYSQL_CURSOR is not None:
        MYSQL_CURSOR.close()
    if PGSQL_CURSOR is not None:
        PGSQL_CURSOR.close()
    if MYSQL_DB is not None:
        MYSQL_DB.close()
    if PGSQL_DB is not None:
        PGSQL_DB.close()

    appendIntoResult("Connections closed with success")

# Function responsible for appending a given text to the process result
def appendIntoResult(text, insertDate=True):
    global RESULT

    if insertDate:
        RESULT += str(datetime.datetime.now()) + " - " + text + "\n"
    else:
        RESULT += text + "\n"

# Function responsible for appending an exception to the process result
def exception(text):
    if EXCEPTION is not None:
        appendIntoResult(text + ":\n\n" + EXCEPTION + "\n")
    else:
        appendIntoResult(text)

# Function responsible for writing into the log file
def writeLog(message):
    try:
        logFile = open(LOG_FILE, 'a')
        logFile.write(message)
        logFile.close()

        return True
    except Exception as e:
        global EXCEPTION
        EXCEPTION = str(e)

        return False

def validateDate(date):
    try:
        datetime.datetime.strptime(date, '%Y-%m-%d')
        return True
    except:
        return False

def validateTime(time):
    try:
        datetime.time(*map(int, time.split(':')))
        return True
    except:
        return False

def validateArguments(arguments):
    if len(arguments) < 5:
        appendIntoResult("Error: wrong number of arguments!\n\nUsage:\n")
        appendIntoResult("python " + arguments[0] + " {begin-date} {begin-time} {end-date} {end-time}", False)
        return False
    else:
        if not validateDate(arguments[1]):
            appendIntoResult("Error: invalid begin date!\n\nCorrect format: YYYY-MM-DD")
            return False
        else:
            if not validateDate(arguments[3]):
                appendIntoResult("Error: invalid end date!\n\nCorrect format: YYYY-MM-DD")
                return False
            else:
                if not validateTime(arguments[2]):
                    appendIntoResult("Error: invalid begin time!\n\nCorrect format: HH:MM:SS (24hrs)")
                    return False
                else:
                    if not validateTime(arguments[4]):
                        appendIntoResult("Error: invalid end time!\n\nCorrect format: HH:MM:SS (24hrs)")
                        return False
                    else:
                        return True

# Main function responsible for executing the importation
def performImportation():
    appendIntoResult("-----------------------------------------------------------------------", False)

    if validateArguments(sys.argv):
        begin = sys.argv[1] + " " + sys.argv[2]
        end = sys.argv[3] + " " + sys.argv[4]

        appendIntoResult("Starting the importation")

        if connect():
            appendIntoResult("Connections made with success")

            if executeQuery(begin, end):
                appendIntoResult("Query executed with success")

                rows = MYSQL_CURSOR.fetchall()

                appendIntoResult("Inserting data into the table")

                for i in range(0, int(MYSQL_CURSOR.rowcount)):
                    dateHour = str(rows[i][3]).split(' ')
                    date = dateHour[0].replace('-', '')
                    hour = dateHour[1].replace(':', '')

                    insertParameters = [ rows[i][0], rows[i][1], rows[i][2], date, hour, rows[i][4], rows[i][5], rows[i][6], rows[i][7][:3], rows[i][8], rows[i][9], rows[i][10], rows[i][11], rows[i][12], rows[i][2], rows[i][1] ]

                    if not insertData(insertParameters):
                        exception("Insert error")
                        break
            else:
                exception("Query error")
        else:
            exception("Connection error")

        closeConnections()

        appendIntoResult("End of the importation")

    writeLog(RESULT)

# Starting the importation
performImportation()
