import database_helper
import sqlite3
import uuid, json, os
from string import ascii_lowercase, ascii_uppercase, digits
from random import choice
from gevent.wsgi import WSGIServer
from geventwebsocket import WebSocketError, WebSocketServer
from geventwebsocket.handler import WebSocketHandler
from flask import Flask, g, jsonify, request, redirect

app = Flask(__name__)

'''There can only be one valid session at a time. It means once the user is logged in, the other
possible session shall automatically be expired. In case of the application being opened on that
expired session, in some other browser or environment, the welcome view shall be
automatically displayed. '''

''' >> The server and client shall communicate asynchronously.
>> HTTP and WebSocket requests are used for implementing one way and two way communication between the client and server.
>> JSON shall be used as data exchange format.
'''

# Make the WSGI interface available at the top level so wfastcgi can get it.
# wsgi_app = app.wsgi_app
#socket_list = dict()
socket_list = dict() #{}

# Pruebas
print 'servidor iniciado'

@app.route('/', methods=['GET'])
def index():
    print '>>>>Iniciado'
    return redirect('static/client.html')
    
@app.route('/signin', methods=['POST'])
def sign_in():
    email = request.form['email']
    password = request.form['password']
    vlogin = database_helper.valid_login(email,password)

    if (vlogin):
        letters = "abcdefghiklmnopqrstuvwwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        token = "";
        token = (''.join(choice(ascii_uppercase + ascii_lowercase + digits) for i in range(36)));
        try:
            database_helper.add_logged_in_user(email,token)
            return jsonify(success = True, message = "Successfully signed in.", data = token)
        except sqlite3.IntegrityError:
               return jsonify(success = False, message = "You are already signed in.")
    else:
        return jsonify(success = False, message = "Wrong username or password")

@app.route('/signup', methods=['POST'])
def sign_up():
    email = request.form['email']
    password = request.form['password']
    firstname = request.form['firstname']
    familyname = request.form['familyname']
    gender = request.form['gender']
    city = request.form['city']
    country = request.form['country']

    #Is there already an user?
    user = database_helper.get_user_by_email(email)
    
    #If there isn't, signup
    if (user is None):
        if (type(email) is unicode
            and type(password) is unicode 
            and type(firstname) is unicode 
            and type(familyname) is unicode 
            and type(gender) is unicode
            and type(city) is unicode 
            and type(country) is unicode):

            database_helper.add_user(email,
                                     password,
                                     firstname,
                                     familyname,
                                     gender,
                                     city,
                                     country);
                  
            return jsonify(success = True, message = "Successfully created a new user.")
            
        else:
            return jsonify(success = False, message = "Form data missing or incorrect type.")

    else:
        return jsonify(success = False, message = "User already exists.")

@app.route('/signout', methods=['DELETE'])
def sign_out():
    # Check if the user is siggned in
    token = request.form['token']
    email = database_helper.get_email_by_token(token)
    # If it is:
    if(email is not None):
        database_helper.delete_logged_in_by_token(token)
        return jsonify(success = True, message = "Successfully signed out.")
    else:
        return jsonify(success = False, message = "You are not logged in.")

@app.route('/changePassword', methods=['POST'])
def change_password():
    token = request.form['token']
    old_password = request.form['oldpassword']
    new_password = request.form['newpassword']
    email = database_helper.get_email_by_token(token)
    # Check if the user exists:
    
    if (email is not None):
        password = database_helper.get_password(email[0])
        # Check if the passwords match
        if (password[0] == old_password):
            database_helper.set_password(email[0], new_password)
            return jsonify(success = True, message = "Password changed.")
        else:
            return jsonify(success = False, message = "Wrong password.")
    else:
        return jsonify(success = False, message = "You are not logged in.")

@app.route('/getUserDataByToken', methods=['POST'])
def get_user_data_by_token():
    token = request.form['token']
    #Check if there is such a user
    email = database_helper.get_email_by_token(token)

    if (email is not None):
        user = database_helper.get_user_by_email(email[0])
        if (user is None):
            return jsonify(success = False, message = "No such user.")
        else:
            u = {}
            u['email'] = user[0]
            u['firstname'] = user[1]
            u['familyname'] = user[2]
            u['gender'] = user[3]
            u['city'] = user[4]
            u['country'] = user[5]
            return jsonify(success = True, message = "User data retrieved.", data = u)
    else:
        return jsonify(success = False, message = "You are not logged in.")
    
@app.route('/getUserDataByEmail', methods=['POST'])
def get_user_data_by_email():
    token = request.form['token']
    email = request.form['email']
    # Check if the user is loggedin to ba able to search
    check = database_helper.get_email_by_token(token)

    if(check):
        user = database_helper.get_user_by_email(email)
        
        if (user is None):
            return jsonify(success = False, message = "No such user.")
        else:
            u = {}
            u['email'] = user[0]
            u['firstname'] = user[1]
            u['familyname'] = user[2]
            u['gender'] = user[3]
            u['city'] = user[4]
            u['country'] = user[5]
            return jsonify(success = True, message = "User messages retrieved.", data = u)   
    else:
        return jsonify(success = False, message = "You are not logged in.")
 #upiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii   
@app.route('/getUserMessagesByToken', methods=['POST'])
def get_user_messages_by_token():
    token = request.form['token']
    email = database_helper.get_email_by_token(token)
    # Check if the user is loggedin
    if (email is None):
        return jsonify(success = False, message = "You are not logged in.")
    else:
        user = database_helper.get_user_by_email(email[0])
        if (user is None):
            return jsonify(success = False, message = "No such user.")
        else:
            messages = database_helper.get_messages_by_email(email[0])
            return jsonify(success = True, message = "User messages retrieved.", data = messages)

@app.route('/getUserMessagesByEmail', methods=['POST'])
def get_user_messages_by_email():
    token = request.form['token']
    email = request.form['email']
    # Check if the user is loggedin
    check = database_helper.get_email_by_token(token)
    user = database_helper.get_user_by_email(email)
    if (check is not None):
        if (user is None):
            return jsonify(success = False, message = "No such user.")
        else:
            messages = database_helper.get_messages_by_email(email)
            return jsonify(success = True, message = "User messages retrieved.", data = messages)
    else:
        return jsonify(success = False, message = "You are not logged in.")        

@app.route('/getEmailByToken', methods=['POST'])
def get_email_token():
    token = request.form['token']
    email = database_helper.get_email_by_token(token)
    if (email):
        return jsonify(success = True, message = "There is your email.", data = email[0])
    else:
        return jsonify(success = False, message = "You are not logged in.")

@app.route('/postMessage', methods=['POST'])
def post_message():
    token = request.form['token']
    message = request.form['message']
    toEmail = request.form['email']
    fromEmail = database_helper.get_email_by_token(token)
    toUser = database_helper.get_user_by_email(toEmail)
    #check if fromEmail is signed in
    if (fromEmail):
        if (toUser is None):
            return jsonify(success = False, message = "No such user.")
        else:
            try:
                database_helper.post_message(fromEmail[0], toEmail, message);
                return jsonify(success = True, message = "Message posted.")
            # Catching IntegrityError
            except sqlite3.IntegrityError:
                return jsonify(success = False, message = "This message is already posted.")           
    else:
        return jsonify(success = False, message = "You are not logged in.")

@app.route('/getToken', methods=['POST'])
def getToken():
    email = request.form['email']
    token = database_helper.get_token_by_email(email)
    if token:
        return jsonify(success = True, message = "There is your token.", data = token[0][0])
    else:
        return jsonify(success = False, message = "No token find.")

@app.route('/deleteOnlineUsers', methods=['DELETE'])
def deleteOUs():
    database_helper.delete_all_logged_in();
    return jsonify(success = True, message = "All logged_in users deleted");

@app.route('/deleteOnlineUser', methods=['DELETE'])
def deleteOUr():
    email = request.form['email']
    database_helper.delete_logged_in_by_email(email);
    return jsonify(success = True, message = "User deleted from loggedin.");

@app.route("/getchart", methods=['POST'])
def get_stats():
    token = request.form['token']
    # Get the data from db
    email = database_helper.get_email_by_token(token)
    if email:
        print email;
        # get user statistics
        sent_ = database_helper.get_num_messages_sent(email[0])
        received_ = database_helper.get_num_messages_received(email[0])
        online_ = database_helper.get_num_users_online()
        u={}
        u["sent"] = sent_[0]
        u["received"] = received_[0]
        u["online"] = online_[0]
        
        return jsonify(success = True, message = "This is the data for chart.", data = u)
    else:
        return jsonify(success = False, message = "You are not logged in.")

activeusers={}
inactiveusers = []

# WEBSOCKET

@app.route('/websocket')
def websocket():
    print "INTO WEBSOCKET"
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        while True:
            try:
                msg = ws.receive()
                message = json.loads(msg)

                # To start ws
                if message["id"] == "start":
                    print "WS Start"

                # To kick the user from the previous session
                if message["id"] == "email":		
                    print "MESSAGE IS EMAIL"		
                    if message["email"] in socket_list:
                        socket_list[message["email"]].send(json.dumps(dict(id = "sign_out")))	
                        print ""+json.dumps(dict(id = "sign_out"))		
                    socket_list[message["email"]] = ws
                
                # To update the chart
                elif message["id"] == "update_chart":
                    token = message["token"]
                    email = database_helper.get_email_by_token(token)
                    print email;
				    # get user statistics
                    sent_ = database_helper.get_num_messages_sent(email[0])
                    received_ = database_helper.get_num_messages_received(email[0])
                    online_ = database_helper.get_num_users_online()

                    ws.send(json.dumps(dict(id = "update_chart", sent = sent_[0], received = received_[0], online = online_[0])))
            
            except WebSocketError as e:
                print(str(e))

    return

# END WEBSOCKET

if __name__ == '__main__':
    app.debug=True
    
    http_server = WSGIServer(('',5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()