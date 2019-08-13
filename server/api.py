import flask
from flask import jsonify, request

app = flask.Flask(__name__)
app.config["DEBUG"] = True

location = [
    {'id': 0,
     'nombre': 'martin',
     'apellido': 'bernardi',
     'ubicacion': 'ucacha'},
    {'id': 1,
     'nombre': 'augusto',
     'apellido': 'remedi',
     'ubicacion': 'rio cuarto'},
    {'id': 2,
     'nombre': 'ignacio',
     'apellido': 'rittano',
     'ubicacion': 'rio cuarto'},
]

@app.route('/api/v1/resources/all', methods = ['GET'])
def get_all_locations():
    resp = jsonify(location)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

app.run()
