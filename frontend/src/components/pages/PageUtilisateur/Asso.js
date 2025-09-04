import { useState, useEffect } from "react";

import { obtenirDataUser } from "../../../api/api_utilisateurs";


export default function TabAsso({ id }) {
    const [donneesUtilisateur, setDonneesUtilisateur] = useState([]);

    useEffect(() => {
        const chargerUtilisateur = async () => {
            const data = await obtenirDataUser(id);
            setDonneesUtilisateur(data);
        };
        chargerUtilisateur();
    }, [id]);

    return (
        <p>Assos : {donneesUtilisateur.associations_actuelles}</p>
    );
}

