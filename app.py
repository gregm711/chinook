import sqlite3
from flask import Flask, g, render_template
import json
import pandas as pd
app = Flask(__name__)
DATABASE = '/Users/gregmiller/Downloads/Chinook_Sqlite.sqlite'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route("/<table>")
def tablePage(table):
    cur = get_db()
    tab = table.upper()
    tablesResult = cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    tableNames = [table[0] for table in tablesResult]
    query = "SELECT * FROM " + tab
    df = pd.read_sql_query(query, cur)
    columns = list(df.columns)
    return render_template("index.html", columns = columns, tables = tableNames)

@app.route('/data/<table>')
def combineData(table):
    cur = get_db()
    tab = table.upper()
    query = "SELECT * FROM " + tab
    df = pd.read_sql_query(query, cur)
    df =df.head(100)
    return df.to_json(orient='records')





if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)
