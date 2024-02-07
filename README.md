Api manejada con Flask.

Configuracion del .env:
    - Debe estar en la raiz del proyecto.
    - En las 'x' van los datos de las DB, usuarios, secret key de flask (si se usa por .env, en este caso, hay una libreria que lo automatiza de manera random).

```
# MYSQL
MYSQL_HOST=x
MYSQL_USER=x
MYSQL_PASSWORD=x
MYSQL_DB=x

# FLASK
FLASK_SECRET_KEY=x

# Usuario
USER=x
password=x
```

Para crear un usuario simplemente se cambian las variables del .env y se ejecuta el ./create_user.py .
Esto ya que no me servia una ruta de /register porque necesitaba que los usuarios sean limitados y seleccionados.