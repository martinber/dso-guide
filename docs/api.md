# API

All API resources must be accessed through the URL
`https://dso.mbernardi.com.ar`. Data must be sent and will be received in JSON
format.

Curl commands are given as examples.

The `Content-Type: application/json` header must be sent when the request
contains JSON data.

## Authentication

Done via HTTP Basic Authentication.

Example:

```
curl -u {username:password}
```

This is obligatory for any API resource that is trying to be accessed, and it
must be sent on each request, except to create a new user, for this refer to
Users.

## Users

Allowed methods: 'POST'

### POST

Add a new user to the database. The user must have 4 characters or more with no
special ones except for "_" and "-". Password must have at least 8 characters.

Request:

```
curl --header "Content-Type: application/json" \
     --request POST \
     --data '{"username":"username", "password":"password"}' \
     https://dso.mbernardi.com.ar/api/v1/users
```

Response:

```
Operation Successful
```

## Location

Allowed methods: 'GET'; 'PUT'

### GET

Obtain user's location.

Request:

```
curl -u {username:password} \
     --request GET \
     https://dso.mbernardi.com.ar/api/v1/location
```

Response:

```
{
  "lat": value,
  "lon": value
}
```

### PUT

Modify user's location. Values MUST be:

- -90 <= lat <= 90
- -180 <= lon <= 180

Request:

```
curl -u {username:password} --header "Content-Type: application/json" \
    --request PUT \
    --data '{"lat":value,"lon":value}' \
    https://dso.mbernardi.com.ar/api/v1/location
```

| Name | Type | Description |
| --- |:---:| ---:|
| lat | real | New latitude |
| lon | real | New longitude |


Response:

```
Operation Successful
```

## Password

Allowed method: 'PUT'

### PUT

Change your password.

Request:

```
curl -u {username:password} --header "Content-Type: application/json" \
    --request PUT \
    --data '{"new_password":"password"}' \
    https://dso.mbernardi.com.ar/api/v1/password
```

| Name | Type | Description |
| --- |:---:| ---:|
| password      | string | New password |

Response:

```
Operation Successful
```

## Watchlist

Allowed methods: 'GET'; 'POST'; 'DELETE'

### GET

Obtain user's watchlist.

Request:

```
curl -u {username:password} \
     --request GET \
     https://mbernardi.com.ar/api/v1/watchlist
```

Response:

```
[
  {
    "notes": "asdasdads",
    "star_id": 12,
    "style": 1
  },
  {
    "notes": "asdasdads",
    "star_id": 11,
    "style": 1
  }
]
```

### POST

Add a new star to the watchlist.

Request:

```
curl -u {username:password} --header "Content-Type: application/json" \
    --request POST \
    --data '{"star_id":value,"notes":"Description","style":value}' \
    https://dso.mbernardi.com.ar/api/v1/watchlist
```

| Name | Type | Description |
| --- |:---:| ---:|
| star_id     | real | id object identifying the star |
| notes      | string     | comment about the star |
| style      | real     |   TODO |

Response:

```
Operation Successful
```

### DELETE

Clears the watchlist.

Request:
```
curl -u {username:password} --request DELETE https://dso.mbernardi.com.ar/api/v1/watchlist
```

Response:

```
Operation Successful
```

## Watchlist object

The endpoint is `/api/v1/watchlist/{star_id}` where `{star_id}` is an integer
that represents an object already on the watchlist.

Allowed methods: 'PUT'; 'DELETE'

### PUT

Change the notes or the style from a star on the watchlist.

Request:

```
curl -u {username:password} --header "Content-Type: application/json" \
    --request PUT \
    --data '{"star_id":value, "notes":"Description", "style":value}' \
    https://dso.mbernardi.com.ar/api/v1/watchlist/43
```

Response:

```
Operation Successful
```

### DELETE

Delete a single object from the watchlist.

Request:

```
curl -u {username:password} \
    --request PUT \
    https://dso.mbernardi.com.ar/api/v1/watchlist/43
```

Response:

```
Operation Successful
```
