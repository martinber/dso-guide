import sqlite3
from sqlite3 import Error


db = sqlite3.connect('deepsky.db')

cur = db.cursor()

cur.execute('CREATE TABLE users \
(username text UNIQUE NOT NULL CHECK(typeof(username)=\"text\"), \
password text NOT NULL CHECK(typeof(password) == \"text\" ), \
lat float CHECK(typeof(lat) == \"real\" or typeof(lat) == "integer" and lat >= -90 and lat <=90), \
lon float CHECK(typeof(lon) == \"real\" or typeof(lat) == "integer" and lon >= -180 and lon <=180), \
salt text CHECK(typeof(salt) == \"text\"));')

cur.execute('CREATE TABLE watchlist \
(star_id int CHECK(typeof(star_id) == \"integer\" and star_id >= 1), \
notes text CHECK(typeof(notes) == \"text\"),\
style int CHECK(typeof(style) == \"integer\"), \
username text CHECK(typeof(username) == \"text\"));')

cur.execute('INSERT INTO users values (\'nano\', \'tuli\', -33.3, -62.4, \'asd123\');')
cur.execute('INSERT INTO users values (\'tincho\', \'ucacha\', -33.54, -62.321, \'asdasd\');')

cur.close()
db.commit()
db.close()
