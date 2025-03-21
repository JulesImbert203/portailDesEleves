from app import create_app, db
from app.models import Association
from app.models import Utilisateur

app = create_app()

# Activer le contexte de l'application
with app.app_context():
            
    # Liste des associations à créer
            jules = Utilisateur(nom_utilisateur="23imbert", prenom="Jules", nom_de_famille="Imbert", promotion=23, email="jules@exemple.com", cycle="ic", mot_de_passe_en_clair="1234")
            achille = Utilisateur(nom_utilisateur="23fruchard", prenom="Achille", nom_de_famille="Fruchard", promotion=23, email="achille@exemple.com", cycle="ic", mot_de_passe_en_clair="1234")
            louise = Utilisateur(nom_utilisateur="24deferran", prenom="Louise", nom_de_famille="De Ferran", promotion=24, email="louise@exemple.com", cycle="ic", mot_de_passe_en_clair="1234")

            bde = Association(nom="BDE", description="Bureau des élèves", type_association="loi 1901", logo_path="Capture_decran_2024-08-16_162358.png", ordre_importance=1)
            bds = Association(nom="BDS", description="Bureau des sports", type_association="loi 1901", logo_path="logo_jump.png", ordre_importance=2)
            bda = Association(nom="BDA", description="Bureau des arts", type_association="loi 1901", logo_path="channels4_profile%20(2).jpg", ordre_importance=3)
              
            bde.id = 1
            bds.id = 2          
            bda.id = 3
            

            db.session.add(jules)
            db.session.add(achille)
            db.session.add(louise)

            db.session.add(bde)
            db.session.add(bds)
            db.session.add(bda)

            db.session.commit()    
        
        

print("Associations créées avec succès !")