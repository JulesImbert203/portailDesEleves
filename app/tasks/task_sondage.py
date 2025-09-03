from .. import scheduler
from app.controllers.controllers_sondages import sondage_suivant

from datetime import datetime

# TODO: faire en sorte que ce soit chaque jour, pas chaque minute (décommenter la fin de la ligne)
@scheduler.task('cron', id='task_sondage', minute="*")# day="*", hour="0")
def task_sondage():
    print(f"Nouveau sondage")
    with scheduler.app.app_context():
        sondage_suivant ()
