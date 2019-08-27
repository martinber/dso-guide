import flask
from flask import request, jsonify, render_template
import sqlite3
import hashlib, os, binascii

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
    """ Devuelve true o false """
    if cursor.execute('SELECT username FROM users WHERE username=?;',(user,)).fetchone():

        database_password = cursor.execute('SELECT password FROM users WHERE username=?;',(user,)).fetchone()
        salt = cursor.execute('SELECT salt FROM users WHERE username=?;',(user,)).fetchone()
        salt = salt['salt']
        salt = salt.encode('utf-8')
        pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        pwdhash = binascii.hexlify(pwdhash)
        pwdhash = pwdhash.decode('utf-8')

        if pwdhash == database_password['password']:
            return True
        else:
            return False
    else:
        return False

@app.errorhandler(404)
def page_not_found(e):
    return "404", 404
@app.errorhandler(401)
def invalid_credentials(e):
    return "401 \n"
@app.errorhandler(405)
def method_not_allowed(e):
    return "405"
@app.errorhandler(500)
def internal_server_error(e):
    return "500"

class Database:

    def __init__(self):
        self.cur = None
        self.conn = None

    def __enter__(self):
        self.conn = sqlite3.connect('deepsky.db')
        self.conn.row_factory = dict_factory
        self.cur = self.conn.cursor()
        return self

    def __exit__(self, type, value, traceback):
        self.cur.close()
        self.conn.commit()
        self.conn.close()

@app.route('/api/v1/login', methods=['GET'])
def api_login():
    with Database() as db:

        query_parameters = request.json

        if method == 'GET':
            user = request.authorization["username"]
            password = request.authorization["password"]
            if login(user, password, db.cur):
                return "200", 200
            else:
                return "Unauthorized", 401
        else:
            return "Method not allowed \n", 405

@app.route('/api/v1/location', methods=['GET', 'PUT'])
def api_location():

    with Database() as db:

        query_parameters = request.json

        user = request.authorization["username"]
        password = request.authorization["password"]

        if login(user, password, db.cur):

            if request.method == 'GET':
                results = db.cur.execute(("SELECT lat, lon FROM users WHERE username=?;"), (user,)).fetchone()
                return jsonify(results), 200

            elif request.method == 'PUT':
                latitude = query_parameters.get('lat')
                longitude = query_parameters.get('lon')

                try:
                    db.cur.execute("UPDATE users SET lat=?, lon=? WHERE username=?;", (latitude, longitude, user))
                    return "Operation Successful \n", 200

                except sqlite3.IntegrityError:
                    return "Wrong constraints \n ", 500
            else:
                return "Method not allowed \n", 405
        else:
            return "Unauthorized \n", 401

@app.route('/api/v1/users', methods=['POST'])
def api_addusers():

    with Database() as db:

        query_parameters = request.json

        if request.method == 'POST':
            user = query_parameters.get('username')
            password = query_parameters.get('password')
            salt = hashlib.sha256(os.urandom(8)).hexdigest().encode('ascii')
            pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
            pwdhash = binascii.hexlify(pwdhash)
            pwdhash = pwdhash.decode('utf-8')
            salt = salt.decode('utf-8')
            lat = 0
            lon = 0

            try:
                db.cur.execute('INSERT INTO users values (?, ?, ?, ?, ?);', (user, pwdhash, lat, lon, salt))
                return "Operation Successful \n", 200
            except sqlite3.IntegrityError:
                return "User already exist \n ", 500
        else:
            return "Method not allowed \n", 405

@app.route('/api/v1/watchlist', methods=['DELETE', 'POST', 'GET'])
def api_watchlist():

    query_parameters = request.json


    with Database() as db:
        user = request.authorization["username"]
        password = request.authorization["password"]

        if login(user, password, db.cur):

            if request.method == 'GET':
                results = db.cur.execute('SELECT watchlist.star_id, watchlist.notes,\
                 watchlist.style FROM watchlist INNER JOIN users on \
                 users.username=watchlist.username where users.username = ?;', (user,)).fetchall()
                return jsonify(results)

            elif request.method == 'POST':
                star_id = query_parameters.get('star_id')
                notes = query_parameters.get('notes')
                style = query_parameters.get('style')
                try:
                    if db.cur.execute('SELECT * FROM watchlist where username = ? and star_id = ?;', (user, star_id)).fetchall():
                        return "Already exist \n", 200 #fijarse si es 200
                    else:
                        db.cur.execute('INSERT INTO watchlist values(?, ?, ?, ?);', (star_id, notes, style, user))
                        return "Operation Successful \n", 200
                except sqlite3.IntegrityError:
                    return "Could not add to the list", 500

            elif request.method == 'DELETE':
                db.cur.execute('DELETE FROM watchlist where username = ?;', (user,))
                return "Operation Successful \n", 200
            else:
                return "Method not allowed \n", 405

        else:
            return invalid_credentials(401)

@app.route('/api/v1/password', methods=['PUT'])
def api_password():

    query_parameters = request.json

    with Database() as db:

        user = request.authorization["username"]
        password = request.authorization["password"]

        if login(user, password, db.cur):
            if request.method == 'PUT':
                new_password = query_parameters.get('password')
                try:
                    db.cur.execute('UPDATE users SET password = ? WHERE username = ?', (new_password, user))
                    return "Operation Successful \n", 200

                except sqlite3.IntegrityError:
                    return "Wrong data \n", 500
            else:
                return "Method not allowed \n", 405
        else:
            return invalid_credentials(401)

@app.route('/api/v1/watchlist/object', methods=['DELETE','PUT'])
def api_objects():

    query_parameters = request.json

    with Database() as db:
        user = request.authorization["username"]
        password = request.authorization["password"]

        if login(user, password, db.cur):
            if request.method == 'PUT':
                star_id = query_parameters.get('star_id')
                notes = query_parameters.get('notes')
                style = query_parameters.get('style')

                try:
                    db.cur.execute('UPDATE watchlist ')
                    return "Operation Successful \n", 200
                except sqlite3.IntegrityError:
                    return "Wrong constraint", 500

            elif request.method == 'DELETE':
                star_id = query_parameters.get('star_id')

                try:
                    db.cur.execute('DELETE from watchlist WHERE username = ? and star_id = ?;', user, star_id)
                    return "Operation Successful \n", 200
                except sqlite3.IntegrityError:
                    return "Could not delete the object \n", 500
            else:
                return "Method not allowed \n", 405
        else:
            return "Unauthorized", 401

if __name__ == "__main__":

    app.run(host="localhost", port=5000)
