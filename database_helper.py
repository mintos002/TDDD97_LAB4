import sqlite3
from server import app
from flask import Flask, g, jsonify


#THINGS WE NEED FOR THE DB

DATABASE = 'database.db'

def connect_db():
	connection = sqlite3.connect("database.db");
	#connection.row_factory = sqlite3.Row;
	return connection
	
def close():
	get_db().close()

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def get_db():
	db = getattr(g, '_database', None)
	if db is None:
		db = g._database = connect_db()
	return db	
	
def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('database.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

# from http://flask.pocoo.org/docs/0.10/patterns/sqlite3/
def query_db(query, args=(), one=False):
	cur = get_db().execute(query, args)
	rv = cur.fetchall()
	cur.close()
	get_db().commit()
	return (rv[0] if rv else None) if one else rv

#END THINGS WE NEED FOR THE DB
#METHODS TO GET DATA

def get_password(email):
    psw = query_db("select password from User where email = ?", [email], True);
    return psw

def get_email_by_token(token):
    user = query_db("select email from Logged_in_users where token = ?", [token], True);
    return user;

def get_token_by_email(email):
    token = query_db("select token from Logged_in_users where email = ?", [email]);
    return token

def get_user_by_email(email):
    user = query_db("select email, firstname, familyname, gender, city, country from User where email = ?", [email], True);
    return user


def get_messages_by_email(email):
    messages = query_db("select fromEmail, message from Messages where toEmail = ?",[email]);
    return messages

def get_num_users_online():
	return query_db("select count(*) from Logged_in_users", one=True)
	
def get_num_messages_received(email):
	return query_db("select count(*) from Messages where toEmail=?", [email], True)
	
def get_num_messages_sent(email):
	return query_db("select count(*) from Messages where fromEmail=?", [email], True)

#END METHODS TO GET DATA

#METHDS TO MODIFY OR ADD DATA
def add_user(email, password, firstname, familyname, gender, city, country):
	r = query_db("insert into User VALUES (?, ?, ?, ?, ?, ?, ?)", [email, password, firstname, familyname, gender, city, country])
	return r

def add_logged_in_user(email, token):
	r = query_db("insert into Logged_in_users values (?,?)", [email, token])
	return r

def add_message(fromEmail, toEmail, message):
    r = query_db("insert into Messages values (?,?,?)",[fromEmail, toEmail, message]);
    return r

def delete_logged_in_by_email(email):
    r = query_db("delete from Logged_in_users where email = ?", [email]);
    return r

def delete_logged_in_by_token(token):
    r = query_db("delete from Logged_in_users where token = ?", [token]);
    return r

def delete_all_logged_in():
    r = query_db("delete from Logged_in_users;");
    return r

def delete_user_by_token(token):
    r = query_db("delete from User where token = ?", [token]);
    return r

def delete_user_by_email(email):
    r = query_db("delete from User where email = ?", [email]);
    return r

def set_password(email, newPass):
    r = query_db("update User set password = ? where email = ?", [newPass, email]);
    return r

def post_message(fromEmail, toEmail, message):
    r = query_db("insert into Messages values (?,?,?)", [fromEmail, toEmail, message]);
    return r
#END METHOD TO MODIFY OR ADD DATA

#OTHER METHODS
def valid_login(email, password):
	result = query_db("select * from User where email=? and password=?", [email, password], one=True)

	if result is None:
			return False
	else:
			return True

#END OTHER METHODS