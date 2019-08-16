import sqlite3
from sqlite3 import Error


db = sqlite3.connect('deepsky.db')

cur = db.cursor()

cur.execute('CREATE TABLE users (username text UNIQUE NOT NULL\
, password text NOT NULL, lat float, lon float, salt text);')

cur.execute('CREATE TABLE watchlist (star_id int, notes text,\)
style int, username text);')
