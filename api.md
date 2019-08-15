API
===

Get location
------------

```
GET /api/v1/location
```

Response:

```
{
    "lat": 12.345,
    "long": 23.435,
}
```

Set location
------------

```
PUT /api/v1/location

{
    "lat": 12.345,
    "long": 23.435,
}
```

Set password
------------

```
PUT /api/v1/password

{
    "password": "newpassword",
}
```

Clear watchlist
---------------

```
DELETE /api/v1/watchlist
```

Get watchlist
-------------

```
GET /api/v1/watchlist
```

Response:

```
[
    {
        "id": 35,
        "notes": "qwertyuiop",
        "style": 3,
    },
    {
        "id": 12,
        "notes": "asdfghjkl",
        "style": 4,
    },
    {
        "id": 45,
        "notes": "zxcvbnm",
        "style": 2,
    },
]
```

Replace watchlist
-----------------

```
PUT /api/v1/watchlist

[
    {
        "id": 35,
        "notes": "qwertyuiop",
        "style": 3,
    },
    {
        "id": 12,
        "notes": "asdfghjkl",
        "style": 4,
    },
    {
        "id": 45,
        "notes": "zxcvbnm",
        "style": 2,
    },
]
```

Add to watchlist
----------------

```
POST /api/v1/watchlist

{
    "id": 45,
    "notes": "zxcvbnm",
    "style": 2,
}
```

Delete object on watchlist
--------------------------

```
DELETE /api/v1/watchlist/object?id=34
```
