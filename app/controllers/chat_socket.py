from flask_login import login_required, current_user
from sqlalchemy import desc, asc

from app.models.models_chat import Message
from app import db

from .. import socketio
from flask_socketio import emit, join_room, leave_room
import json
from datetime import datetime


@socketio.on('connect')
def join():
    if current_user.is_authenticated:
        messages = Message.query.order_by(desc(Message.date)).limit(100)
        for message in messages[::-1]:
            to_send = message.to_dict(current_user.id)
            emit ("message", to_send)
    else:
        return False  # not allowed here


@socketio.on('message')
def handle_message(data):
    if current_user.is_authenticated:
        print (data)
        message = Message (data["text"], current_user.id, datetime.now ())
        message.save ()
        to_send = message.to_dict(current_user.id)
        emit ("message", to_send)
    else:
        return False

@socketio.on('disconnect')
def handle_disconnect():
    return
