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
            AND LENGTH(username) >= 4
            AND LENGTH(username) <= 32
        ),
        password text NOT NULL CHECK
        (
            TYPEOF(password) == "text"
        ),
        lat real NOT NULL CHECK
        (
            (TYPEOF(lat) == "real" OR TYPEOF(lat) == "integer")
            AND lat >= -90
            AND lat <= 90
        ),
        lon real NOT NULL CHECK
        (
            (TYPEOF(lon) == "real" OR TYPEOF(lat) == "integer")
            AND lon >= -180
            AND lon <= 180
        ),
        salt text NOT NULL CHECK
        (
            TYPEOF(salt) == "text"
        ),
        disabled integer NOT NULL CHECK
        (
            TYPEOF(disabled) == "int"
            AND (disabled == 0 OR disabled == 1)
        )
    );
    '''
)

cur.execute('''
    CREATE TABLE watchlist
    (
        dso_id integer NOT NULL CHECK
        (
            TYPEOF(dso_id) == "integer"
            AND dso_id >= 0
        ),
        notes text NOT NULL CHECK
        (
            TYPEOF(notes) == "text"
        ),
        style integer NOT NULL CHECK
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
