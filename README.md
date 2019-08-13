# dark-sky-planner

Astronomy web app.

Search catalogs of deep sky objects and plan your observations with a printable
star chart

## Tools

- Flask

- [D3-celestial](https://github.com/ofrohn/d3-celestial)

  - Looking at the source of
    [this example](https://armchairastronautics.blogspot.com/p/skymap.html)
    apparently we need D3 version 3 and D3-geo-projection version 0 (but I use
    version 1 because version 0 returns 404).

- Javascript

## Tutorials

- https://realpython.com/handling-email-confirmation-in-flask/

- [HMAC explanation](https://www.ida.liu.se/~TDP024/labs/hmacarticle.pdf)

## Things to copy

- Sky map: https://heavens-above.com/skychart2.aspx

- [DeepSkyLog](https://www.deepskylog.org/index.php?indexAction=view_atlaspagesv)

    - Generates atlases for every object: [example](https://www.deepskylog.org/atlas.pdf.php?zoom=17&object=M+18)

    - Shows images for every object: [example](https://archive.stsci.edu/cgi-bin/dss_search?v=poss2ukstu_red&r=0+24+5.0&d=-72+-5&e=J2000&h=60.0&w=60&f=gif&c=none&fov=NONE&v3=)

- [Catalogs and observation lists](http://www.messier.seds.org/xtra/similar/catalogs.html)

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

### Selección de servidor SQL

- SQLite: Liviano y simple. Lo maloqes
