from app import create_app, db
from app.models import Association
from app.models import Utilisateur
import unicodedata
import random

_, app = create_app()

# Activer le contexte de l'application
with app.app_context():
            

     # Liste des associations à créer
    bde = Association(nom="BDE", description="Bureau des élèves", type_association="loi 1901", logo_path="Capture_decran_2024-08-16_162358.png", ordre_importance=1)
    bds = Association(nom="BDS", description="Bureau des sports", type_association="loi 1901", logo_path="logo_jump.png", ordre_importance=2)
    bda = Association(nom="BDA", description="Bureau des arts", type_association="loi 1901", logo_path="channels4_profile%20(2).jpg", banniere_path="bannerBDA.png", ordre_importance=3)        
    bde.id = 1
    bds.id = 2          
    bda.id = 3
    db.session.add(bde)
    db.session.add(bds)
    db.session.add(bda)
    db.session.commit()    
    print("Associations créées avec succès !")


    # Prénoms et noms français
    prenoms = [
        "Lucas", "Clara", "Maxime", "Charlotte", "Thomas", "Pauline", "Mathis", "Élise", "Gabriel", "Marie",
        "Arthur", "Sofia", "Henri", "Audrey", "Lucie", "Victor", "Camille", "Jean", "Alice", "Martin",
        "Hugo", "Bérénice", "Florian", "Iris", "Jérôme", "Olivier", "Lucie", "Léon", "Émilie", "Marc",
        "Isabelle", "Paul", "Nathalie", "Xavier", "Elise", "Morgan", "Gabrielle", "Simon", "Carla", "Julien",
        "Emma", "Quentin", "Laura", "Thibault", "Viviane", "Adrien", "Nathan", "Sophie", "Éric", "Amandine",
        "Romain", "Mélanie", "Yohan", "Noémie", "Alexandre", "Justine", "Antoine", "Sarah", "David", "Manon",
        "Benoît", "Johanna", "François", "Océane", "Guillaume", "Coralie", "Stéphane", "Élodie", "Cédric", "Morgane",
        "Arnaud", "Julie", "Gaspard", "Anaïs", "Louis", "Margaux", "Jules", "Victoria", "Damien", "Florence",
        "Michel", "Claire", "Pascal", "Marion", "Valentin", "Chloé", "Jean-Baptiste", "Cécile", "Kevin", "Laetitia"
    ]

    noms = [
        "Dupont", "Martin", "Bernard", "Lemoine", "Leclerc", "Robert", "Moreau", "Fournier", "Durand", "Blanc",
        "Rousseau", "Hernandez", "Roy", "Gauthier", "Jacques", "Caron", "Deschamps", "Boucher", "Charpentier", "Pires",
        "Delmas", "Laurent", "Houdin", "Mercier", "Dupuis", "Vallée", "Coulon", "Petit", "Renard", "Dufresne",
        "Roger", "Chauvin", "Benoit", "David", "Thomas", "Monnier", "Faure", "Morel", "Raymond", "Chapelain",
        "Bonnet", "Gérard", "Chevalier", "Lucas", "Renaud", "Marchand", "Colin", "Guillot", "Perrot", "Lejeune",
        "Bertin", "Baron", "Leduc", "Loiseau", "Texier", "Vaillant", "Millet", "Payet", "Delaunay", "Briand",
        "Pichon", "Delorme", "Gros", "Albert", "Mallet", "Weber", "Joubert", "Noël", "Descamps", "Lefort",
        "Maillard", "Maheu", "Peltier", "Verdier", "Bazin", "Laporte", "Turpin", "Poirier", "Legendre", "Paris",
        "Navarro", "Leconte", "Dumont", "Bouvet", "Charrier", "Cordier", "Blanchard", "Boucher", "Guichard", "Besson"
    ]

    random.shuffle(noms)
    cycles = ["ic"] * 50 + ["isup"] * 15 + ["ev"] * 10 + ["vs"] * 10 + ["ast"] * 15
    promotions = [20, 21, 22, 23, 24]
    utilisateurs = [(random.choice(prenoms), nom, random.choice(promotions), random.choice(cycles))
                    for nom in noms]  # On parcourt directement la liste des noms uniques

    for prenom, nom_de_famille, promotion, cycle in utilisateurs:
        nom_utilisateur = f"{promotion}{unicodedata.normalize('NFKD', nom_de_famille).encode('ascii', 'ignore').decode().lower()}"
        email = f"{nom_utilisateur}@example.com" 
        utilisateur = Utilisateur(
            nom_utilisateur=nom_utilisateur, 
            prenom=prenom, 
            nom_de_famille=nom_de_famille,  
            promotion=promotion, 
            email=email, 
            cycle=cycle,
            mot_de_passe_en_clair="1234"
        )
        db.session.add(utilisateur)

    db.session.commit()

print("100 utilisateurs créés avec succès !")

