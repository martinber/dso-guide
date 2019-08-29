# API

## Schema

All API resources must be accessed through this URL https://dsp.mbernardi.com.ar: . Data must be sent and will
be received in JSON format.

## Authentication

Done via HTTP header Basic Authentication.
Example via curl:
 `curl -u {username:password}`
This is obligatory for ANY API resource that is trying to be accessed,
and it MUST be sent on each request, except to create a new user,
for this refer to Users.

## Location

Allowed methods: 'GET'; 'PUT'

### GET

Obtain user's location.
Request:
```
curl -u {username:password} --request GET https://dsp.mbernardi.com.ar/api/v1/location
```
Response:

TODO

### PUT

Modify user's location.
Request:
```
curl -u {username:password} --header "Content-Type: application/json" \
    --request PUT \
    --data '{"lat":32,"lon":64}' \
    https://dsp.mbernardi.com.ar/api/v1/location
```

| Name | Type | Description |
| --- |:---:| ---:|
| lat | real | New latitude |
| lon | real | New longitude |


Response:

TODO

## Password

Allowed method: 'PUT'

### PUT

Change your password.

Request:
```
curl -u {username:password} --header "Content-Type: application/json" \
    --request PUT \
    --data '{"new_password":"password"}' \
    https://dsp.mbernardi.com.ar/api/v1/password
```

| Name | Type | Description |
| --- |:---:| ---:|
| password      | string | New password |

Response:

TODO

## Watchlist

Allowed methods: 'GET'; 'POST'; 'DELETE'

### GET

Obtain user's watchlist.

Request:
```
curl -u {username:password} --request GET https://mbernardi.com.ar/api/v1/watchlist
```
Response:

TODO

### POST

Add a new star to the watchlist

Request:
```
curl -u {username:password} --header "Content-Type: application/json" \
    --request POST \
    --data '{"star_id":3,"notes":"It's awesome - Rittano 2019","style":1}' \
    https://dsp.mbernardi.com.ar/api/v1/watchlist
```
| Name | Type | Description |
| --- |:---:| ---:|
| star_id     | real | id object identifying the star |
| notes      | string     | comment about the star |
| style      | real     |   TODO |

Response:

TODO

### DELETE

Clears the watchlist

Request:
```
curl -u {username:password} --request DELETE https://dsp.mbernardi.com.ar/api/v1/watchlist
```

Response:

TODO

FALTA VER COMO DOCUMENTAR LO DE /watchlist/X
