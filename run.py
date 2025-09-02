# Permet de run l'application
from app import create_app

socketio, app = create_app()

if __name__ == "__main__":
    for rule in app.url_map.iter_rules():
        print(rule)
    socketio.run(app, debug=True)
