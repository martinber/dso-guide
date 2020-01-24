# DSO Guide

Astronomy web app.

Search catalogs of deep sky objects and plan your observations.

## Running

- `docker build -t dso-guide ./`

- `docker run -it -p 80:80 dso-guide:latest`

## Tools used

- Server-side:

    - Webserver: NGINX.

    - Web API: Flask and uWSGI.

    - Database: SQLite3 on Python.

    - Docker container: Based on [nginx-uwsgi-flask-alpine-docker](https://github.com/hellt/nginx-uwsgi-flask-alpine-docker).

- Client-side:

    - JQuery.

    - Sky chart: [D3-celestial](https://github.com/ofrohn/d3-celestial).

    - Sky surveys: [Aladin Lite](http://aladin.u-strasbg.fr/#AladinLite).

    - Location map: [Leaflet](https://leafletjs.com/).

- Web API tests: [Postman](https://www.getpostman.com/products).

## TODO

### Now

- Rebuild database, check best practices (backups? migrations?), rename
  `star_id` to `dso_id` or `obj_id`. Rename db on repository to `dso-guide.db`.

- Code review

- Add contact info

- Server admin scripts

- Getting started and about page

- Add cardinal points

- "Save" button is disabled when sorting the watchlist

### Later

- Show all objects on Aladin map so it is easier to discover objects on catalog
	by looking around.

- Check if we can assume `Content-Type: application/json`

- Better Flask logging

- Moon calendar

- Links to catalogs

- Filter invisible objects, now or any time of the year

- Export watchlist to file

- More names for DSOs

- Add close button to location warning

- Sometimes leaflet map shows antarctica when opening

- Allow manual ordering of watchlist, reflect it on server

- Check that sometimes forms send GET instead of PUT

- Add explanation of lat/lon format (hovering over help icon?)

- Option to hide columns. Careful with column widths on CSS

- Show ocular sizes on aladin, also show horizon

- Bigger logo

- Optimize watchlist and catalog tables adding, deleting, updating. Also when
  changing location

- Check what happens with timezones

- Add note saying that times are always e.g. UTC-6. Including future times, even
  if in the future DST is applied

- Printed version

- Captcha

- Server admin scripts

- Send errors to server and log

- Show "Select location" if no plot yet

- Broken aladin fullscreen?

- Check security

- Generate atlases for every object: [example](https://www.deepskylog.org/atlas.pdf.php?zoom=17&object=M+18)

- Show this project to Aladin and Celestial devs.

- Make the Celestial chart configurable (grid, constellations, star sizes, etc.)

- Show form location on map, e.g. when logging in

- Indicate current day/time on plot

## Installation

- Reserve names: `admin`, `administrator`, `dso-guide`, `dsoguide`, `webmaster`,
  `hostmaster`, `root`, `info`. `test` is reserved for testing.

## References

- [Catalogs and observation lists](http://www.messier.seds.org/xtra/similar/catalogs.html)

- [Logging with Flask](https://stackoverflow.com/a/39284642)

- https://realpython.com/handling-email-confirmation-in-flask/

- [API requests from JS](https://stackoverflow.com/questions/36975619/how-to-call-a-rest-web-service-api-from-javascript)

- https://stackoverflow.com/questions/33861987/sql-music-playlist-database-design

- https://launchschool.com/books/sql/read/table_relationships

### Security

- https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

- [HMAC explanation](https://www.ida.liu.se/~TDP024/labs/hmacarticle.pdf)

- https://stackoverflow.com/questions/549/the-definitive-guide-to-form-based-website-authentication

- https://www.owasp.org/index.php/Main_Page

- Check:

    - XSS

    - CSRF

    - SQL Injection

    - Hashing, salt

    - Captcha

## Inspired on

- https://heavens-above.com/skychart2.aspx

- [DeepSkyLog](https://www.deepskylog.org/index.php?indexAction=view_atlaspagesv)

    - Generates atlases for every object: [example](https://www.deepskylog.org/atlas.pdf.php?zoom=17&object=M+18)

    - Shows images for every object: [example](https://archive.stsci.edu/cgi-bin/dss_search?v=poss2ukstu_red&r=0+24+5.0&d=-72+-5&e=J2000&h=60.0&w=60&f=gif&c=none&fov=NONE&v3=)
