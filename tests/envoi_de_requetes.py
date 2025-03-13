import requests


session = requests.Session()  # Utilisation d'une session persistante


LOGIN_URL = "http://127.0.0.1:5000/connexion"
DATA = {
    "username": "23imbert",
    "password": "1234"
}

# Effectuer la requete de connexion
response = session.post(LOGIN_URL, data=DATA)

if response.status_code == 200:
    print("Connexion réussie !")
else:
    print("Échec de la connexion :", response.text)


API_URL = 'http://127.0.0.1:5000/api/users/creer_co/2'
response = session.post(API_URL)

print("Response JSON:", response.json())
