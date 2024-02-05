import datetime
import pytz, os
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template, redirect
from flask_mysqldb import MySQL

load_dotenv()

app = Flask(__name__)

app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB')

mysql = MySQL(app)

@app.route("/")
def index():
    fechaAyer = datetime.datetime.now().date() - datetime.timedelta(days=1)
    return redirect(f"/view_status?timestamp_from={fechaAyer}", code=302)

def get_clients():
    cur = mysql.connection.cursor()
    cur.execute('SELECT id, name FROM clients;')
    return cur.fetchall()

# ruta para interactuar con axios y obtener los datos de la tabla
@app.route('/api/view_status')
def api_view_status():
    page = request.args.get('page', 1, type=int)
    items_per_page = 100
    offset = (page - 1) * items_per_page
    timestamp_from = request.args.get('timestamp_from', '')
    selected_clid = request.args.get('id_filter', '')

    base_query = '''
        SELECT
            rs.clid AS cliente_id,
            c.name AS cliente_nombre,
            rs.task AS task,
            rs.ts AS ts1,
            COALESCE(rs.ts_end, '') AS ts2,
            LPAD(COALESCE(TIMESTAMPDIFF(MINUTE, rs.ts, rs.ts_end), 0), 8, ' ') AS mins,
            COALESCE(rs.rqst_data, ' ') AS data,
            COALESCE(rs.ipaddr, ' ') AS ipaddr
        FROM r_status rs
        LEFT JOIN clients c ON rs.clid = c.id
    '''

    where_clause = 'WHERE rs.ts >= %s'
    sqlparms = [timestamp_from]

    if selected_clid and selected_clid != '0':
        where_clause += ' AND rs.clid = %s'
        sqlparms.append(selected_clid)

    sqlparms.extend([items_per_page, offset])

    final_query = f"{base_query} {where_clause} ORDER BY rs.clid, rs.ts DESC LIMIT %s OFFSET %s;"

    cur = mysql.connection.cursor()
    cur.execute(final_query, sqlparms)
    sts = cur.fetchall()

    # guarda los resultados en un diccionario para el json
    sts_dicts = [dict(zip([column[0] for column in cur.description], row)) for row in sts]

    # Determinar si hay páginas anteriores o siguientes
    has_previous = page > 1
    # si hay pag. siguiente 
    has_next = len(sts) == items_per_page

    return jsonify({
        'items': sts_dicts,
        'hasPrevious': has_previous,
        'hasNext': has_next
    })


@app.route('/view_status')
def view_status():
    page = request.args.get('page', 1, type=int)
    timestamp_from = request.args.get('timestamp_from', '')
    selected_clid = request.args.get('id_filter', '')

    clients = get_clients()

    return render_template("bootstrap_table.html",
                           title='Status',
                           clients=clients,
                           selected_clid=selected_clid,
                           page=page,
                           timestamp_from=timestamp_from)

@app.route('/get_id_options')
def get_id_options():
    clients = get_clients()
    id_options = [{'id': client[0], 'name': client[1]} for client in clients]
    return jsonify(id_options)

## task= tarea
## agg_task= agrupador de tareas (para indicar inicio->fin)
## agg_job= agrupador de trabajos (por si queremos conglomerar un conjunto de tareas) (¿¿??)

@app.route("/v1/statusinsert", methods=['POST'])
def insert_status():
    try:
        if request.method == 'POST':
            ipaddr = request.remote_addr
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            now_local = datetime.datetime.now(pytz.timezone("America/Argentina/Buenos_Aires")).strftime("%Y-%m-%d %H:%M:%S")
            p_clid = request.form.get('clid')
            p_task = request.form.get('task')
            p_agg_task = request.form.get('agg_task')
            p_agg_job = request.form.get('agg_job')
            p_data = request.form.get('data')
            msg = "ERROR"
            data = "Error desconocido."

            # Si no informan cliente no hacemos nada
            if not p_clid:
                msg = "ERROR"
                data = "Client."
                return jsonify({msg:data})
            
            cur = mysql.connection.cursor()

            ## Existe la task+agg_task?
            ##  esto es para hacer un update en lugar de un insert
            ##  la idea es utilizar la tarea que junte el inicio+fin
            ##  en caso que exista esa combinacion, se actualiza el ts_end
            sqlstm = "SELECT COUNT(*) FROM r_status WHERE clid=%s and task=%s AND agg_task=%s"
            sqlparms = (p_clid, p_task, p_agg_task)
            cur.execute(sqlstm, sqlparms)
            result = cur.fetchone()
            if not p_agg_task or result[0] == 0:
                # si no tiene "unificador" de tareas o no encontro el registro, hacemos el INSERT
                sqlstm = "INSERT INTO r_status (clid, task, ts, agg_task, agg_job, rqst_data, ipaddr, ts_ins) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
                sqlparms = (p_clid, p_task, now_local, p_agg_task, p_agg_job, p_data, ipaddr, now)
                cur.execute(sqlstm, sqlparms)
                msg = "OK"
                data = "Status agregado correctamente"
            else:
                sqlstm = "UPDATE r_status SET ts_end=%s,rqst_data=%s,ts_upd=%s WHERE clid=%s AND task=%s AND agg_task=%s"
                sqlparms = (now_local, p_data, now, p_clid, p_task, p_agg_task)
                data = sqlstm, sqlparms
                cur.execute(sqlstm, sqlparms)
                msg = "OK"
                data = "Status modificado correctamente. clid={} ; task={} ; ext_id={}".format(p_clid, p_task, p_agg_task)
        else:
            return render_template("bootstrap_table.html", title='Status')

        mysql.connection.commit()
        return jsonify({msg:data})

    except Exception as ex:

        return jsonify({"ExError":str(ex)})
    finally:
        cur.close()
        mysql.connection.close()

@app.errorhandler(404)
def not_found(error=None):
    message = {
        'status': 404,
        'message': 'Not Found: ' + request.url,
    }
    resp = jsonify(message)
    resp.status_code = 404
    return render_template("404.html", title='Not Found')

@app.errorhandler(500)
def internal_error(error=None):
    message = {
        'status': 500,
        'message': 'Internal Error: ' + request.url,
    }
    resp = jsonify(message)
    resp.status_code = 500
    return render_template("404.html", title='Internal Error')

@app.errorhandler(405)
def method_not_allowed(error=None):
    message = {
        'status': 405,
        'message': 'Method Not Allowed: ' + request.url,
    }
    resp = jsonify(message)
    resp.status_code = 405
    return render_template("404.html", title='Method Not Allowed')

if __name__ == '__main__':
    app.run(debug=True, port=8001)
