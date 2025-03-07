from app import create_app, db
from app.models import Association

app = create_app()

# Activer le contexte de l'application
with app.app_context():
    # Liste des associations à créer
    associations = [
        ('BDE',  'Le BDE est une association qui organise des événements pour les élèves de l\'école.','loi 1901'),
        ('BDS', 'Le BDS est une association qui organise des événements sportifs pour les élèves de l\'école.','loi 1901'),
        ('BDA', 'Le BDA est une association qui organise des événements artistiques pour les élèves de l\'école.','loi 1901'),
    ]

    for a in associations:
        if not Association.query.filter_by(nom=a[0]).first():
            nouvelle_association = Association(*a)  # Décompresse la liste en arguments
            db.session.add(nouvelle_association)

    # Valider les ajouts dans la base
    db.session.commit()

    print("Associations créées avec succès !")