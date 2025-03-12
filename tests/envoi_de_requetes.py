import requests

URL = "http://127.0.0.1:5000/api/users/supprimer_co"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer <token>"  # Si besoin d'auth
}

response = requests.post(URL, headers=HEADERS)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())  # Si la réponse est au format JSON
