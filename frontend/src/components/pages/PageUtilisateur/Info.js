import { useState, useEffect } from "react";

import { obtenirDataUser } from "../../../api/api_utilisateurs";


export default function TabInfo({ id }) {
    const [donneesUtilisateur, setDonneesUtilisateur] = useState([]);
    useEffect(() => {
        const chargerUtilisateur = async () => {
            const data = await obtenirDataUser(id);
            setDonneesUtilisateur(data);
        };
        chargerUtilisateur();
    }, [id]);
    return (
        <>
            <p>Promo : {donneesUtilisateur.promotion}</p>
            <p>Date de naissance : {donneesUtilisateur.date_de_naissance}</p>
            <p>Chambre : {donneesUtilisateur.chambre}</p>
            <p>Ville d'origine : {donneesUtilisateur.ville_origine}</p>
            <p>Instruments joués : {donneesUtilisateur.instruments}</p>
            <p>Co : {donneesUtilisateur.co_nom}</p>
            <p>Parrain.e : {donneesUtilisateur.marrain_nom}</p>
        </>

    );
}

