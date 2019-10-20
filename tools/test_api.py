import requests
import json

URL = 'https://dso.mbernardi.com.ar/api/v1/'

def test_add_user():

    r = requests.post(
        URL + '/users',
        data={
            "username": "apitest",
            "password": "apitest"
        },
        headers={
            "Content-Type": "application/json"
        }
    )

    # TODO
    # assert r.status_code == 200

def test_valid_login():

    r = requests.get(
        URL + '/login',
        headers={
            "Content-Type": "application/json",
            "Authorization": "apitest:apitest"
        }
    )
    #  data = r.json()

    # TODO
    assert r.status_code == 200
