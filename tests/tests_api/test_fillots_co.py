import requests


session = requests.Session()  # Utilisation d'une session persistante


def se_connecter(username:str="23imbert"): # mdp = "1234"
    LOGIN_URL = "http://127.0.0.1:5000/connexion"
    DATA = {
        "username": username,
        "password": "1234"
    }
    # Effectuer la requete de connexion
    response = session.post(LOGIN_URL, json=DATA)
    if response.status_code == 200:
        print("Connexion réussie !")
    else:
        print("Échec de la connexion :", response.text)

def verifier_authentification():
    EST_AUTH_URL = "http://127.0.0.1:5000/est_auth"
    response = session.get(EST_AUTH_URL, cookies=session.cookies)
    if response.status_code == 200:
        data = response.json()
        if data.get("etat_connexion"):
            print("L'utilisateur est connecté")
        else:
            print("L'utilisateur n'est pas connecté")
    else:
        print(f"Erreur lors de la vérification de l'authentification : {response.status_code}")

verifier_authentification()
se_connecter("23imbert")
verifier_authentification()


def se_deconnecter() :
    response = session.post("http://127.0.0.1:5000/deconnexion")

def print_infos(id):
    response = session.get(f'http://127.0.0.1:5000/api/users/obtenir_infos_profil/{id}')
    if response.status_code == 200:
        data = response.json()
        nom_utilisateur = data.get("nom_utilisateur", "Inconnu")
        co_nom = data.get("co_nom", "Inconnu")
        marrain_nom = data.get("marrain_nom", "Inconnu")
        fillots_dict = data.get("fillots_dict", {})
        noms_fillots = list(fillots_dict.values()) if isinstance(fillots_dict, dict) else []
        print(f"{nom_utilisateur} |Co : {co_nom}| Marrain : {marrain_nom}| Fillots :{', '.join(noms_fillots) if noms_fillots else 'Aucun'}")
    else:
        print("Erreur :", response.status_code, response.text)


"""co
se_connecter("23imbert")
response = session.post('http://127.0.0.1:5000/api/users/creer_co/2')
print_infos(1)
print_infos(2)
print_infos(3)
se_deconnecter()

se_connecter("23deferran")
response = session.post('http://127.0.0.1:5000/api/users/creer_co/2')
print_infos(1)
print_infos(2)
print_infos(3)
se_deconnecter()

se_connecter("23imbert")
response = session.post('http://127.0.0.1:5000/api/users/supprimer_co')
print_infos(1)
print_infos(2)
print_infos(3)
se_deconnecter()"""


"""
print_infos(1)
print_infos(2)
print_infos(3)

response = session.post('http://127.0.0.1:5000/api/users/select_fillots/2,3')
print(response.text)

print_infos(1)
print_infos(2)
print_infos(3)

response = session.post('http://127.0.0.1:5000/api/users/supprimer_fillots')
print(response.text)

print_infos(1)
print_infos(2)
print_infos(3)

se_deconnecter()

"""