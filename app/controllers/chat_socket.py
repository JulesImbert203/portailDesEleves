from .. import socketio
from flask_socketio import emit, join_room, leave_room
import json
from datetime import datetime

from flask_login import login_required, current_user

@socketio.on('connect')
def join():
    print (current_user.is_anonymous)
    if current_user.is_authenticated:
        print (f"{current_user} joined the chat")
        emit("message", f"{current_user.id} joined the chat")
    else:
        print("bs")
        return False  # not allowed here


@socketio.on('message')
def handle_message(data):
    data["time"] = str(datetime.now ().strftime ("%H:%M"))
    data["author"] = current_user.promotion + current_user.nom_de_famille.lower()
    print(data)
    emit("message", (data), broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    emit("message", f"{current_user.id} left the chat", broadcast=True)
