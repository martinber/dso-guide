import flask
from flask import request, jsonify, render_template
import sqlite3

app = flask.Flask(__name__)
app.config["DEBUG"] = True

def dict_factory(cursor, row):
    #devuelve los valores encontrados por el cursor
    #en forma de diccionarios para mejorar el output de jsonify
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def login(user, password, cursor):
    if cursor.execute('SELECT username FROM users WHERE username=?;',(user,)):
        database_password = cursor.execute('SELECT password FROM users WHERE username=?;',(user,))
        if password == database_password.fetchone()['password']:
            return user
        else:
            return invalid_credentials(401)
    else:
        return invalid_credentials(401) #en realidad erro el usuario

@app.errorhandler(404)
def page_not_found(e):
    return 404
@app.errorhandler(401)
def invalid_credentials(e):
    return 401



@app.route('/api/v1/location', methods=['GET'])
def api_filter():

    conn = sqlite3.connect('deepsky.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()
    user = login(request.authorization["username"],request.authorization["password"],cur)
    results = cur.execute('SELECT * FROM users WHERE username=?', (user,))

    return jsonify(results.fetchone())

app.run()
