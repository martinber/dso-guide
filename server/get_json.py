import flask
from flask import request, jsonify, render_template
import sqlite3

app = flask.Flask(__name__)
app.config["DEBUG"] = True

@app.route('/api/v1/jsons',methods=['POST'])
def obtain_json_data():
    content = request.json
    print(content)
    return(content)

app.run()
