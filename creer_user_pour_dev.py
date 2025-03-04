# Cree des utilisateurs. c'est utile pour developper

from app import create_app, db
from app.models import Utilisateur

app = create_app()

# Activer le contexte de l'application
with app.app_context():
    # Liste des utilisateurs à créer
    utilisateurs = [
        ("23imbert", "Jules", "Imbert", 23, "jules@mail.com", "ic", "1234"),
        ("23fruchard", "Achille", "Fruchard", 23, "achille@mail.com", "ic", "1234"),
    ]

    for u in utilisateurs:
        nouvel_utilisateur = Utilisateur(*u)  # Décompresse la liste en arguments
        db.session.add(nouvel_utilisateur)

    # Valider les ajouts dans la base
    db.session.commit()

    print("Utilisateurs créés avec succès !")
