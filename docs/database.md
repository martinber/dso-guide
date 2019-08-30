Database
========

SQL tables we are going to use

Users table
-----------

- Name: `users`

- Columns:

    - `user`: TEXT, `length >= 4` characters and no special characters except for `_` and `-`

    - `password`: TEXT

    - `salt`: TEXT

    - `lat`: REAL, values between -90 and 90

    - `long`: REAL, values between -180 and 180

Favourites table
---------------

- Name: `watchlist`

- Columns: 

    - `star_id`: INT

    - `notes`: TEXT

    - `style`: INT, values 0-4

    - `username`: TEXT
