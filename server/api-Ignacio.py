import flask
from flask import request, jsonify
import sqlite3

app = flask.Flask(__name__)
app.config["DEBUG"] = True

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404</h1><p>The resource could not be found.</p>", 404


@app.route('/api/v1/location', methods=['GET','PUT'])
def api_location():

    conn = sqlite3.connect('deepsky.db')
    #devuelve los valores encontrados por el cursor
    #en forma de diccionarios para mejorar el output de jsonify
    conn.row_factory = dict_factory
    cur = conn.cursor()
    #Checkear autenticacion usando esos atributos
    # if (request.authorization["username"] AND cur.execute(ENCONTRAR USERNAME)
    #request.authorization["password"]
    query_parameters = request.json

    latitude = query_parameters.get('lat')
    longitude = query_parameters.get('lon')

    user = login(request.authorization["username"], request.authorization["password"], cur)
    #Los query deben tener el mismo nombre que la columna a buscar
    if request.methods == 'GET':
        results = cur.execute(("SELECT lat, lon FROM users WHERE username=?;"), (user,))
        return jsonify(results)

    elif request.methods == 'PUT';
        cur.execute("UPDATE users SET lat=?, lon=? WHERE username=?;", (latitude, longitude, user))

    else:
        return error('Bad method')

    cur.close()

    conn.commit()

    conn.close()

@app.route('/api/v1/watchlist', methods=['DELETE', 'PUT', 'POST', 'GET'])
def api_watchlist():

    conn = sqlite3.connect('deepsky.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()
    query_parameters = request.json


    user = query_parameters.get('username')
    star_id = query_parameters.get('star_id')
    notes = query_parameters.get('notes')
    style = query_parameters.get('style')

    if request.methods == 'GET':
        results = cur.execute('SELECT watchlist.star_id, watchlist.notes, watchlist.style \
        FROM watchlist INNER JOIN users on users.?=watchlist.? ;', (user, user)
        return jsonify(results)

    #elif request.methods == 'PUT':


    elif request.methods == 'POST':
        cur.execute('INSERT INTO watchlist values(?, ?, ?, ?);', (star_id, notes, style, user))

    elif request.methods == 'DELETE':
        cur.execute('DELETE FROM watchlist where username = ?;', (user,))

    else:
        return error('Bad method')

    cur.close()

    conn.commit()

    conn.close()


@app.route('/api/v1/password', methods=['PUT'])
def api_password():

    conn = sqlite3.connect('deepsky.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()
    query_parameters = request.json

    user = query_parameters.get('username')
    password = query_parameters.get('password')

    if request.methods == 'PUT':
        cur.execute('UPDATE users SET password = ? WHERE username = ?', (password, user))

    else:
        return error('Bad method')

    cur.close()

    conn.commit()

    conn.close()


@app.route('/api/v1/watchlist/object', methods=['DELETE','PUT'])
def api_objects():

    conn = sqlite3.connect('deepsky.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()
    query_parameters = request.json

    user = query_parameters.get('username')

    if request.methods == 'PUT':
        pass

    elif request.methods == 'DELETE':


    else:
        return error('Bad method')

    cur.close()

    conn.commit()

    conn.close()



    #to_filter = []

    #id = query_parameters.get('id')
    #username = query_parameters.get('Usuario')
    #latitude = query_parameters.get('lat')
    #longitude = query_parameters.get('lon')

    #if id:
        #query += ' id=? AND'
        #to_filter.append(id)
    #if username:
        #query += ' Usuario=? AND'
        #to_filter.append(username)
    #if latitude:
        #query += ' lat=? AND'
        #to_filter.append(latitude)
    #if longitude:
        #query += ' lon=? AND'
        #to_filter.append(longitude)
    #if not (id or latitude or longitude or username):
    #    return page_not_found(404)

    #Cortar el query borrando el AND y agregar ;
    #query = query[:-4] + ';'

    #results = cur.execute(query, to_filter).fetchall()

    #return jsonify(results)

app.run()
