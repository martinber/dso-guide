import sqlite3
from sqlite3 import Error

db = sqlite3.connect('dso-guide.db')

cur = db.cursor()

cur.execute('''
    CREATE TABLE users
    (
        username text UNIQUE NOT NULL CHECK
        (
            TYPEOF(username) = "text"
            AND LENGTH(username) >= 4 AND
            LENGTH(username) <= 32
        ),
        password text NOT NULL CHECK
        (
            TYPEOF(password) == "text"
        ),
        lat float CHECK
        (
            TYPEOF(lat) == "real"
            OR TYPEOF(lat) == "integer"
            AND lat >= -90
            AND lat <= 90
        ),
        lon float CHECK
        (
            TYPEOF(lon) == "real"
            OR TYPEOF(lat) == "integer"
            AND lon >= -180
            AND lon <= 180
        ),
        salt text CHECK
        (
            TYPEOF(salt) == "text"
        )
    );
    '''
)

cur.execute('''
    CREATE TABLE watchlist
    (
        star_id int NOT NULL CHECK
        (
            TYPEOF(star_id) == "integer"
            AND star_id >= 0
        ),
        notes text CHECK
        (
            TYPEOF(notes) == "text"
        ),
        style int CHECK
        (
            TYPEOF(style) == "integer"
        ),
        username text NOT NULL CHECK
        (
            TYPEOF(username) == "text"
        )
    );
    '''
)

cur.close()
db.commit()
db.close()
