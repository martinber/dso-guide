# dark-sky-planner

Astronomy web app.

Search catalogs of deep sky objects and plan your observations with a printable
star chart

## Running

- `docker build -t dark-sky-planner ./`

- `docker run -it -p 80:80 dark-sky-planner:latest`

## TODO

- Cuando hago POST a /login no debería andar porque no existe ese endpoint, me
  devuelve 200 OK con un cuerpo de mensaje que dice "405". Chequear que no siga
  pasando eso en otros tipos de error. Comando que usé:
  `curl -u 'carlo:teve' --request PUT http://127.0.0.1/api/v1/login`

- Cuando hago GET a /login me da error de Bad Gateway porquer el Python tira una
  excepción:

  ```
  Traceback (most recent call last):
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 2463, in __call__
    return self.wsgi_app(environ, start_response)
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 2449, in wsgi_app
    response = self.handle_exception(e)
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 1866, in handle_exception
    reraise(exc_type, exc_value, tb)
  File "/usr/lib/python3.7/site-packages/flask/_compat.py", line 39, in reraise
    raise value
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 2446, in wsgi_app
    response = self.full_dispatch_request()
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 1951, in full_dispatch_request
    rv = self.handle_user_exception(e)
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 1820, in handle_user_exception
    reraise(exc_type, exc_value, tb)
  File "/usr/lib/python3.7/site-packages/flask/_compat.py", line 39, in reraise
    raise value
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 1949, in full_dispatch_request
    rv = self.dispatch_request()
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 1935, in dispatch_request
    return self.view_functions[rule.endpoint](**req.view_args)
  File "./main.py", line 72, in api_login
    if method == 'GET':
  NameError: name 'method' is not defined
  ```

- Hice
  `curl -u 'carlo:teve' --request PUT http://127.0.0.1/api/v1/location --data '{"lat":32,"lon":64}'`
  y me devolvió 502 Bad Gateway, es porque Python tiró una excepción:

  ```
  Traceback (most recent call last):
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 2463, in __call__
    return self.wsgi_app(environ, start_response)
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 2449, in wsgi_app
    response = self.handle_exception(e)
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 1866, in handle_exception
    reraise(exc_type, exc_value, tb)
  File "/usr/lib/python3.7/site-packages/flask/_compat.py", line 39, in reraise
    raise value
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 2446, in wsgi_app
    response = self.full_dispatch_request()
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 1951, in full_dispatch_request
    rv = self.handle_user_exception(e)
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 1820, in handle_user_exception
    reraise(exc_type, exc_value, tb)
  File "/usr/lib/python3.7/site-packages/flask/_compat.py", line 39, in reraise
    raise value
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 1949, in full_dispatch_request
    rv = self.dispatch_request()
  File "/usr/lib/python3.7/site-packages/flask/app.py", line 1935, in dispatch_request
    return self.view_functions[rule.endpoint](**req.view_args)
  File "./main.py", line 99, in api_location
    latitude = query_parameters.get('lat')
  AttributeError: 'NoneType' object has no attribute 'get'
  ```

## Tools

- Flask

- [D3-celestial](https://github.com/ofrohn/d3-celestial)

  - Looking at the source of
    [this example](https://armchairastronautics.blogspot.com/p/skymap.html)
    apparently we need D3 version 3 and D3-geo-projection version 0 (but I use
    version 1 because version 0 returns 404).

- Javascript

- https://swagger.io/specification/

- https://www.getpostman.com/products

## Tutorials

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

## Things to copy

- Sky map: https://heavens-above.com/skychart2.aspx

- [DeepSkyLog](https://www.deepskylog.org/index.php?indexAction=view_atlaspagesv)

    - Generates atlases for every object: [example](https://www.deepskylog.org/atlas.pdf.php?zoom=17&object=M+18)

    - Shows images for every object: [example](https://archive.stsci.edu/cgi-bin/dss_search?v=poss2ukstu_red&r=0+24+5.0&d=-72+-5&e=J2000&h=60.0&w=60&f=gif&c=none&fov=NONE&v3=)

- [Catalogs and observation lists](http://www.messier.seds.org/xtra/similar/catalogs.html)

- [Aladin](https://aladin.u-strasbg.fr/AladinLite/doc/)

## Consigna

Queremos hacer una aplicación web que consista de una Web API REST, una base de
datos SQL y del lado del cliente una página web con Javascript.

La idea que tenemos es hacer algo similar a la página
https://heavens-above.com/skychart2.aspx que muestra un mapa del cielo actual en
un lugar determinado para por ejemplo salir a mirar con el telescopio. Esa
página hace muchas cosas, lo que tiene de similar a lo que queremos hacer es que
permite crear usuarios, ver un mapa del cielo y tiene una versión para Android
nativa. Las funciones de nuestro sitio serían:

- Mostrar el cielo en un lugar y momento determinado usando la librería
    https://github.com/ofrohn/d3-celestial

- La posibilidad de editar una lista de objetos astronómicos favoritos (para que
    ciertas nebulosas/estrellas/planetas se resalten en el mapa del cielo).

- Posibilidad de crear e iniciar sesión con un usuario. En la cuenta de usuario
    se guardaría la ubicación (coordenadas de tu ciudad) y la lista de favoritos
    para que sigan disponibles otro día.

- Considerar principios básicos de seguridad (no guardar contraseñas en texto
    plano, usar https, impedir XSS, etc.).

- Dejar la posibilidad de realizar en un futuro una aplicación para móviles
    nativa a partir de la Web API (pero no implementarla).

Las cosas a implementar serían:

- Del lado del servidor:

    - Una base de datos SQL con los usuarios, contraseñas, y listas de favoritos.

    - Un servidor que provea la Web API y maneje la base de datos, lo pensamos
        hacer con Python y Flask.

    - Un servidor web (o el mismo servidor Flask) que provea un sitio web
        estático.

- Del lado del cliente:

    - Página web con código javascript que accede a la Web API para tomar
        información y muestra el mapa con la librería d3-celestial.

## Desarrollo

- Primero investigamos un poco por arriba antes de mandar la consigna para saber
    si era realizable. También determinamos medio general hasta donde queremos
    llegar, las tecnologías a usar y las funcionalidades de la app

- Después de enviar la consigna hicimos unas pruebas rápidas para asegurarnos
    que vamos bien.

    - Martin hizo un HTML, CSS y JS para probar si d3-celestial funciona y si es
        fácil hacer una consulta a una API REST desde JS

    - Augusto hizo un programa en python y flask para ver si es facil hacer la
        REST API

    - Ignacio se instaló SQLite y se aprendió el lenguaje SQL

- Después un día decidimos lo más específico posible los requerimientos para
    definir bien: Las tablas SQL y la API REST.

- Después nos dimos cuenta que lo que hacemos en javascript se llama AJAX.

- Al principio ibamos a usar javascript puro pero cuando llegamos a hacer la
    parte de AJAX empezamos a usar jQuery

### Selección de servidor SQL

- SQLite:

- MySQL:

