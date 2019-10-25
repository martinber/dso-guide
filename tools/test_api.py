import requests
from requests.auth import HTTPBasicAuth
import json

# URL = "https://dso.mbernardi.com.ar/api/v1/"
URL = "http://127.0.0.1/api/v1/"
test_username = "apitest"
test_password = "apitesting"
default_headers = { "Content-Type": "application/json" }

def test_add_user():

    r = requests.post(
        URL + "users",
        headers=default_headers,
        data=json.dumps({
            "username": test_username,
            "password": test_password
        })
    )
    assert r.status_code == 200

def test_login():

    r = requests.get(
        URL + "login",
        headers=default_headers,
        auth=HTTPBasicAuth(test_username, test_password)
    )
    assert r.content == b"Login Successful"
    assert r.status_code == 200

def test_login_invalid():

    r = requests.get(
        URL + "login",
        headers=default_headers,
        auth=HTTPBasicAuth(test_username, test_password + "qwerty")
    )
    assert r.content == b"Unauthorized"
    assert r.status_code == 401

def test_location():

    # Test correct location, both integer and float

    r = requests.put(
        URL + "location",
        headers=default_headers,
        auth=HTTPBasicAuth(test_username, test_password),
        data=json.dumps({
            "lat": 40.23425,
            "lon": -20.3
        })
    )
    assert r.content == b"Operation Successful"
    assert r.status_code == 200

    r = requests.get(
        URL + "location",
        headers=default_headers,
        auth=HTTPBasicAuth(test_username, test_password),
    )
    assert r.content == b"Operation Successful"
    assert r.status_code == 200


def test_watchlist():
    # Replace, add, modify, delete and get
    pass
