from flask import Flask, request, jsonify
import sqlite3
import hashlib
import binascii
import re
import os
import logging.handlers
import time
import traceback

DB_PATH = os.environ.get('DSO_DB_PATH', './dso-guide.db')
LOG_PATH = os.environ.get('DSO_LOG_PATH', './dso-guide.log')

app = Flask(__name__)
app.config["DEBUG"] = True

# TODO
def dict_factory(cursor, row):
    #devuelve los valores encontrados por el cursor
    #en forma de diccionarios para mejorar el output de jsonify
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def login(user, password, cursor):
    """
    Authenticate username and password

    Returns false if username/password invalid
    """
    if cursor.execute(
            "SELECT username FROM users WHERE username=?;",
            (user,)
        ).fetchone():

        database_password = cursor.execute(
            "SELECT password FROM users WHERE username=?;",
            (user,)
        ).fetchone()

        salt = cursor.execute(
            "SELECT salt FROM users WHERE username=?;",
            (user,)
        ).fetchone()

        salt = salt["salt"]
        salt = salt.encode("utf-8")
        pwdhash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
        pwdhash = binascii.hexlify(pwdhash)
        pwdhash = pwdhash.decode("utf-8")

        if pwdhash == database_password["password"]:
            return True
        else:
            return False
    else:
        return False

@app.errorhandler(404)
def page_not_found(e):
    return "404 Page not found", 404
@app.errorhandler(401)
def invalid_credentials(e):
    return "Unauthorized", 401
@app.errorhandler(405)
def method_not_allowed(e):
    return "Method not allowed", 405
@app.errorhandler(500)
def internal_server_error(e):
    return "Internal Server Error", 500

class Database:

    def __init__(self):
        self.cur = None
        self.conn = None

    def __enter__(self):
        self.conn = sqlite3.connect(DB_PATH)
        self.conn.row_factory = dict_factory
        self.cur = self.conn.cursor()
        return self

    def __exit__(self, type, value, traceback):
        self.cur.close()
        self.conn.commit()
        self.conn.close()

@app.route("/api/v1/login", methods=["GET"])
def api_login():

    with Database() as db:

        if request.method == "GET":
            user = request.authorization["username"].lower()
            password = request.authorization["password"]
            if login(user, password, db.cur):
                return "Login Successful", 200
            else:
                return "Unauthorized", 401
        else:
            return "Method not allowed", 405

@app.route("/api/v1/location", methods=["GET", "PUT"])
def api_location():

    with Database() as db:

        query_parameters = request.json
        user = request.authorization["username"].lower()
        password = request.authorization["password"]

        if login(user, password, db.cur):

            if request.method == "GET":

                results = db.cur.execute(
                    "SELECT lat, lon FROM users WHERE username=?;",
                    (user,)
                ).fetchone()

                return jsonify(results), 200

            elif request.method == "PUT":
                latitude = query_parameters.get("lat")
                longitude = query_parameters.get("lon")

                try:
                    db.cur.execute(
                        "UPDATE users SET lat=?, lon=? WHERE username=?;",
                        (latitude, longitude, user)
                    )
                    return "Operation Successful", 200

                except sqlite3.IntegrityError:
                    return "Wrong constraints", 500
            else:
                return "Method not allowed", 405
        else:
            return "Unauthorized", 401

@app.route("/api/v1/users", methods=["POST"])
def api_addusers():

    with Database() as db:

        query_parameters = request.json

        if request.method == "POST":
            user = query_parameters.get("username").lower()
            password = query_parameters.get("password")
            pattern = r"[^\_\-a-z0-9]"

            if re.search(pattern, user):
                return "Character not accepted \n", 406

            else:
                if len(password) < 8:
                    return "Too short \n", 411
                else:
                    salt = hashlib.sha256(os.urandom(8)).hexdigest().encode("ascii")
                    pwdhash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
                    pwdhash = binascii.hexlify(pwdhash)
                    pwdhash = pwdhash.decode("utf-8")
                    salt = salt.decode("utf-8")
                    lat = 0
                    lon = 0

                    try:
                        db.cur.execute(
                            "INSERT INTO users VALUES (?, ?, ?, ?, ?);",
                            (user, pwdhash, lat, lon, salt)
                        )
                        return "Operation Successful", 200

                    except sqlite3.IntegrityError:
                        return "User already exists", 500
        else:
            return "Method not allowed", 405

@app.route("/api/v1/watchlist", methods=["DELETE", "POST", "GET"])
def api_watchlist():

    query_parameters = request.json

    with Database() as db:
        user = request.authorization["username"].lower()
        password = request.authorization["password"]

        if login(user, password, db.cur):

            if request.method == "GET":

                results = db.cur.execute(
                    """SELECT watchlist.star_id, watchlist.notes, watchlist.style
                       FROM watchlist
                       INNER JOIN users ON users.username=watchlist.username
                       WHERE users.username = ?;""",
                    (user,)
                ).fetchall()

                return jsonify(results)

            elif request.method == "POST":

                star_id = query_parameters.get("star_id")
                notes = query_parameters.get("notes")
                style = query_parameters.get("style")

                try:
                    if db.cur.execute(
                            """SELECT * FROM watchlist
                               WHERE username = ? AND star_id = ?;""",
                            (user, star_id)
                        ).fetchall():

                        return "Already exists", 200

                    else:
                        db.cur.execute(
                            "INSERT INTO watchlist VALUES (?, ?, ?, ?);",
                            (star_id, notes, style, user)
                        )

                        return "Operation successful", 200

                except sqlite3.IntegrityError:
                    return "Wrong constraints", 500

            elif request.method == "DELETE":
                db.cur.execute(
                    "DELETE FROM watchlist WHERE username = ?;",
                    (user,)
                )
                return "Operation successful", 200

            else:
                return "Method not allowed", 405

        else:
            return "Unauthorized", 401

@app.route("/api/v1/password", methods=["PUT"])
def api_password():

    query_parameters = request.json

    with Database() as db:

        user = request.authorization["username"].lower()
        password = request.authorization["password"]

        if login(user, password, db.cur):
            if request.method == "PUT":
                new_password = query_parameters.get("new_password")

                if len(new_password) < 8:
                    return "Too short", 411

                else:
                    salt = hashlib.sha256(os.urandom(8)).hexdigest().encode("ascii")
                    pwdhash = hashlib.pbkdf2_hmac("sha256", new_password.encode("utf-8"), salt, 100000)
                    pwdhash = binascii.hexlify(pwdhash)
                    pwdhash = pwdhash.decode("utf-8")
                    salt = salt.decode("utf-8")
                    try:
                        db.cur.execute(
                            """UPDATE users SET password = ?, salt = ?
                               WHERE username = ? ;""",
                            (pwdhash, salt, user)
                        )
                        return "Operation successful", 200

                    except sqlite3.IntegrityError:
                        return "Wrong data", 500
            else:
                return "Method not allowed", 405
        else:
            return "Unauthorized", 401

@app.route("/api/v1/watchlist/<int:star_id>", methods=["DELETE", "PUT"])
def api_objects(star_id):

    query_parameters = request.json

    with Database() as db:
        user = request.authorization["username"].lower()
        password = request.authorization["password"]

        if login(user, password, db.cur):
            if request.method == "PUT":
                if (star_id != query_parameters.get("star_id")):
                    return "Wrong parameters", 409

                else:
                    notes = query_parameters.get("notes")
                    style = query_parameters.get("style")

                    try:
                        db.cur.execute(
                            """UPDATE watchlist
                               SET notes = ?, style = ?
                               WHERE username = ? AND star_id = ?;""",
                            (notes, style, user, star_id)
                        )
                        return "Operation successful", 200

                    except sqlite3.IntegrityError:
                        return "Wrong constraints", 500

            elif request.method == "DELETE":

                try:
                    db.cur.execute(
                        """DELETE FROM watchlist
                           WHERE username = ? AND star_id = ?;""",
                        (user, star_id)
                    )
                    return "Operation successful", 200

                except sqlite3.IntegrityError:
                    return "Could not delete the object", 500
            else:
                return "Method not allowed", 405
        else:
            return "Unauthorized", 401

# Logging: https://stackoverflow.com/a/39284642

handler = logging.handlers.RotatingFileHandler(LOG_PATH, maxBytes=10000, backupCount=3)
logger = logging.getLogger(__name__)
logger.setLevel(logging.ERROR)
logger.addHandler(handler)

@app.after_request
def log_requests(response):
    """ Logging after every request. """
    # TODO: Should avoid duplication of registry in the log,
    # since that 500 is already logged via @app.errorhandler
    # I cant use the condition `if response.status_code != 500` because
    # sometimes I return 500 without exceptions

    try:
        timestamp = time.strftime('[%Y-%b-%d %H:%M]')

        username = None
        if request.authorization:
            username = request.authorization.get("username")
        username = username or "{unauthenticated}"

        request_data = None
        if "password" in request.full_path:
            request_data = "{not logging data because of plaintext password}"
        else:
            try:
                request_data = request.json
            except:
                request_data = "{invalid JSON}"

        logger.error(
            '%s %s %s %s %s %s %s\n%s\n%s',
            timestamp,
            request.remote_addr,
            request.method,
            request.scheme,
            request.full_path,
            username,
            response.status,
            request_data,
            response.data
        )

    except:
        timestamp = time.strftime('[%Y-%b-%d %H:%M]')
        tb = traceback.format_exc()
        logger.error("Error logging %s %s", timestamp, tb)


    return response

@app.errorhandler(Exception)
def log_exceptions(e):
    """ Logging after every Exception. """

    try:
        timestamp = time.strftime('[%Y-%b-%d %H:%M]')
        tb = traceback.format_exc()

        username = None
        if request.authorization:
            username = request.authorization.get("username")
        username = username or "{unauthenticated}"

        request_data = None
        if "password" in request.full_path:
            request_data = "{not logging data because of plaintext password}"
        else:
            try:
                request_data = request.json
            except:
                request_data = "{invalid JSON}"


        logger.error(
            '%s %s %s %s %s 5xx INTERNAL SERVER ERROR\n%s\n%s\n%s',
            timestamp,
            request.remote_addr,
            request.method,
            request.scheme,
            request.full_path,
            username,
            request_data,
            tb
        )

    except:
        timestamp = time.strftime('[%Y-%b-%d %H:%M]')
        tb = traceback.format_exc()
        logger.error("Error logging %s %s", timestamp, tb)

    return "Internal Server Error", 500

if __name__ == "__main__":

    app.run(host="localhost", port=5000)
