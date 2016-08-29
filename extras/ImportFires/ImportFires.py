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
PGSQL_UNIQUE_KEY = "unique_key"
PGSQL_DB = None
PGSQL_CURSOR = None

# Path to the log file
LOG_FILE = "ImportFires.log"

# Variable responsible for keeping any exception that occur
EXCEPTION = None

# Variable responsible for keeping the process result
RESULT = ""

# Variable responsible for keeping the process protected areas fires function
PROCESS_FIRES_PA_FUNCTION = "public.processar_focos_uc_ti"

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
        MYSQL_CURSOR.execute("SET CHARACTER SET utf8;")

        PGSQL_DB = psycopg2.connect(host=PGSQL_HOST, user=PGSQL_USER, password=PGSQL_PASSWORD, database=PGSQL_DATABASE)
        PGSQL_CURSOR = PGSQL_DB.cursor()

        return True
    except Exception as e:
        global EXCEPTION
        EXCEPTION = str(e)

        return False

# Function responsible for executing the query with a range of given dates
def executeQueryRange(begin, end):
    try:
        query = "select id, LAT, LON, Data, Satelite, Municipio, Estado, Regiao, Pais, Vegetacao, Suscetibilidade, Precipitacao, NumDiasSemPrecip, Risco, BiomaBrasileiro, SateliteRef from " + MYSQL_TABLE + " where Data between %s and %s;"
        MYSQL_CURSOR.execute(query, [begin, end])

        return True
    except Exception as e:
        global EXCEPTION
        EXCEPTION = str(e)

        return False

# Function responsible for executing the query with dates bigger than a given date
def executeQueryBiggerThan(date):
    try:
        query = "select id, LAT, LON, Data, Satelite, Municipio, Estado, Regiao, Pais, Vegetacao, Suscetibilidade, Precipitacao, NumDiasSemPrecip, Risco, BiomaBrasileiro, SateliteRef from " + MYSQL_TABLE + " where Data >= %s;"
        MYSQL_CURSOR.execute(query, [date])

        return True
    except Exception as e:
        global EXCEPTION
        EXCEPTION = str(e)

        return False

# Retrieves the register with the bigger date/time from the PostgreSQL database
def getLastDateTime():
    try:
        query = "select data, hora from " + PGSQL_TABLE + " order by data desc, hora desc limit 1;"
        PGSQL_CURSOR.execute(query)

        return True
    except Exception as e:
        global EXCEPTION
        EXCEPTION = str(e)

        return False

# Converts a latitude from decimal format to DMS
def convertLatitudeToDMS(latitude):
    dmsCoordinate = ''

    signal = str(latitude)[:1]

    if signal == '-':
        latitude = str(latitude)[1:]
        dmsCoordinate += 'S '
    else:
        dmsCoordinate += 'N '

    valuesOne = str(latitude).split('.')
    dmsCoordinate += valuesOne[0] + ' '
    valuesTwo = str(float('0.' + valuesOne[1]) * 60).split('.')
    dmsCoordinate += valuesTwo[0] + ' ' + str(float('0.' + valuesTwo[1]) * 60)

    return dmsCoordinate

# Converts a longitude from decimal format to DMS
def convertLongitudeToDMS(longitude):
    dmsCoordinate = ''

    signal = str(longitude)[:1]

    if signal == '-':
        longitude = str(longitude)[1:]
        dmsCoordinate += 'O '
    else:
        dmsCoordinate += 'L '

    valuesOne = str(longitude).split('.')
    dmsCoordinate += valuesOne[0] + ' '
    valuesTwo = str(float('0.' + valuesOne[1]) * 60).split('.')
    dmsCoordinate += valuesTwo[0] + ' ' + str(float('0.' + valuesTwo[1]) * 60)

    return dmsCoordinate

# Function responsible for inserting the data to the PostGIS database
def insertData():
    rows = MYSQL_CURSOR.fetchall()

    for i in range(0, int(MYSQL_CURSOR.rowcount)):
        if rows[i][3] is not None:
            dateHour = str(rows[i][3]).split(' ')
            date = dateHour[0]
            hour = dateHour[1]

            insertParameters = [ rows[i][0], rows[i][1], rows[i][2], convertLatitudeToDMS(rows[i][1]), convertLongitudeToDMS(rows[i][2]), date, hour, rows[i][4], rows[i][5], rows[i][6], rows[i][7], rows[i][8], rows[i][9], rows[i][10], rows[i][11], rows[i][12], rows[i][13], rows[i][14], rows[i][15], rows[i][2], rows[i][1] ]

            try:
                query = "INSERT INTO " + PGSQL_TABLE + " (id, lat, lon, lat_gms, lon_gms, data, hora, satelite, municipio, estado, regiao, pais, vegetacao, suscetibilidade, precipitacao, num_dias_sem_precipitacao, risco, bioma_brasileiro, satelite_referencia, geom) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326));"
                PGSQL_CURSOR.execute(query, insertParameters)
            except Exception as e:
                if str(e).split('\n')[0] == 'duplicate key value violates unique constraint "' + PGSQL_UNIQUE_KEY + '"':
                    PGSQL_DB.rollback()
                else:
                    global EXCEPTION
                    EXCEPTION = str(e)

                    return False
        else:
            appendIntoResult("Error inserting the following record: " + rows[i])

    PGSQL_DB.commit()

    return True

# Function responsible for processing the protected areas fires
def processFiresPA(begin, end):
    beginDate = datetime.datetime.strptime(begin, "%Y-%m-%d")
    endDate = datetime.datetime.strptime(end, "%Y-%m-%d")
    delta = datetime.timedelta(days=1)

    while beginDate <= endDate:
        try:
            query = "select " + PROCESS_FIRES_PA_FUNCTION + "(('" + beginDate.strftime("%Y-%m-%d") + "')::date);"
            PGSQL_CURSOR.execute(query)
        except Exception as e:
            global EXCEPTION
            EXCEPTION = str(e)

            return False

        beginDate += delta

    PGSQL_DB.commit()

    return True

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

# Function responsible for validating a date
def validateDate(date):
    try:
        datetime.datetime.strptime(date, '%Y-%m-%d')
        return True
    except:
        return False

# Function responsible for validating a time
def validateTime(time):
    try:
        datetime.time(*map(int, time.split(':')))
        return True
    except:
        return False

# Function responsible for validating the received arguments
def validateArguments(arguments):
    if len(arguments) < 5 and len(arguments) > 1:
        appendIntoResult("Error: wrong number of arguments!\n\nUsage:\n")
        appendIntoResult("python " + arguments[0] + " {begin-date} {begin-time} {end-date} {end-time} or python " + arguments[0], False)
        return False
    else:
        if len(arguments) == 1:
            return True
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
        appendIntoResult("Starting the importation")

        if connect():
            appendIntoResult("Connections made with success")

            if len(sys.argv) > 1:
                begin = sys.argv[1] + " " + sys.argv[2]
                end = sys.argv[3] + " " + sys.argv[4]

                if executeQueryRange(begin, end):
                    appendIntoResult("Query executed with success")
                    appendIntoResult("Inserting data into the table")

                    if not insertData():
                        exception("Insert error")
                    else:
                        if not processFiresPA(sys.argv[1], sys.argv[3]):
                            exception("Protected areas fires processing error")
                else:
                    exception("Query error")
            else:
                if getLastDateTime():
                    pgsqlRows = PGSQL_CURSOR.fetchall()
                    dateTime = str(pgsqlRows[0][0])[:4] + "-" + str(pgsqlRows[0][0])[4:-2] + "-" + str(pgsqlRows[0][0])[6:] + " " + pgsqlRows[0][1][:2] + ":" + pgsqlRows[0][1][2:-2] + ":" + pgsqlRows[0][1][4:]

                    if executeQueryBiggerThan(dateTime):
                        appendIntoResult("Query executed with success")
                        appendIntoResult("Inserting data into the table")

                        if not insertData():
                            exception("Insert error")
                        else:
                            if not processFiresPA(sys.argv[1], sys.argv[3]):
                                exception("Protected areas fires processing error")
                    else:
                        exception("Query error")
                else:
                    exception("Error retrieving data from the PostgreSQL database!")
        else:
            exception("Connection error")

        closeConnections()

        appendIntoResult("End of the importation")

    writeLog(RESULT)

# Starting the importation
performImportation()
