from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from sqlalchemy import asc

from app.models.models_chat import Message

controllers_chat = Blueprint('controllers_chat', __name__)

@controllers_chat.get("/more/<int:last_sent>")
@login_required
def more_chat_message(last_sent: int):
    """
    Renvoie plus de messages à afficher, le dernier vu étant *last_sent*
    """
    messages = Message.query.filter(Message.id < last_sent).order_by(asc(Message.date)).limit(100)
    return jsonify([message.to_dict(current_user.id) for message in messages])