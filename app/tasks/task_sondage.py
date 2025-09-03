from .. import scheduler
from app.controllers.controllers_sondages import sondage_suivant

from datetime import datetime

@scheduler.task('cron', id='task_sondage', minute="*")
def task_sondage():
    print(f"Nouveau sondage")
    with scheduler.app.app_context():
        sondage_suivant ()
