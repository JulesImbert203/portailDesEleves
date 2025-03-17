# Documentation de l'API

## Liens entre les utilisateurs

---
__`/api/users/creer_co/int:new_co_id`__

- Paramètre : new_co_id (int)

Crée un lien de co avec un autre utilisateur. Si l'un des deux utilisateurs a déjà un co, l'ancien lien est supprimé avant la création du nouveau. Si l'utilisateur cible n'existe pas, une erreur 404 est renvoyée.

---

__`/api/users/supprimer_co`__

Supprime le lien de co de l'utilisateur connecté. Si l'utilisateur n'a pas de co, une erreur 404 est renvoyée.

---

__`/api/users/select_fillots/string:fillots_id_list`__

- Paramètre : fillots_id_list (string) : Liste d'IDs séparés par des virgules (exemple : "26,54,1").

 Ajoute des fillots à l'utilisateur connecté. Si un fillot a déjà un marrain ou si le format des IDs est invalide, une erreur 500 ou 400 est renvoyée. Si l'utilisateur a déjà des fillots, une erreur 500 est générée.

---

__`/api/users/supprimer_fillots`__

Supprime tous les fillots de l'utilisateur connecté. Aucun message d'erreur n'est renvoyé si l'utilisateur n'a pas de fillots. En cas de problème de marrainage (par exemple l'un des fillots n'a pas cet utilisateur comme marrain), une erreur 500 est renvoyée.