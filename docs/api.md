API
===

Schema
------
All API resources must be accessed through this URL: . Data must be sent and will
be received in json format.

Authentication
--------------
Done via curl command.
 `curl -u {username:password}`
This is obligatory for ANY API resource that is trying to be accessed, and it
MUST be sent on each curl request.

Location
---------
Allowed methods: 'GET'; 'PUT'

Obtain user's location.
Request:
```
curl -u {username:password} --request GET http://URL/api/v1/location
```
Response:
```

TODO(ponerla bien)

Request:
```
curl -u {username:password} --header "Content-Type: application/json" \
    --request PUT \
    --data '{"lat":"32","password":"64"}' \
    http://localhost:5000/api/v1/location
```
| Name | Type | Description |
| --- |:---:| ---:|
| lat      | integer | New latitude |
| lon      | integer     |   New longitude |


Response:

```
{
    "lat": 12.345,
    "long": 23.435,
}
```

Password
------------
Allowed method: 'PUT'

Change your password

Request:
```
curl -u {username:password} --header "Content-Type: application/json" \
    --request PUT \
    --data '{"password":"new_password"}' \
    http://localhost:5000/api/v1/password
```
Response:
TODO

Watchlist
-----------
Allowed methods: 'GET'; 'POST'; 'DELETE'

Lets you access, add an entry or delete your watchlist.

Request:
```
curl -u {username:password} --request GET http://URL/api/v1/watchlist
```
Response:
TODO

Request:
```
curl -u {username:password} --header "Content-Type: application/json" \
    --request POST \
    --data '{"star_id":"INTEGER","notes":"STRING","style":"INTEGER"}' \
    http://localhost:5000/api/v1/watchlist
```
| Name | Type | Description |
| --- |:---:| ---:|
| star_id     | integer | id object identifying the star |
| notes      | string     | comment about the star |
| style      | integer     |   TODO |

Response:
TODO

Request:
```
curl -u {username:password} --request DELETE http://URL/api/v1/watchlist
```

Response:
TODO

Watchlist Objects
-----------
Allowed methods: 'PUT'; 'DELETE'

Lets you delete a single entry of your watchlist or change "notes" and "style".

Request:
```
curl -u {username:password} --header "Content-Type: application/json" \
    --request PUT \
    --data '{"star_id":"INTEGER","notes":"STRING","style":"INTEGER"}' \
    http://localhost:5000/api/v1/watchlist/object?id=INTEGER
```
QUIZAS MODIFIQUEMOS ESTA PARTE PORQUE NO SE SI HACE FALTA EL SIGNO DE PREGUNTA
