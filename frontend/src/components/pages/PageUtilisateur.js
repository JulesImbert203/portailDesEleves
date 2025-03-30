import React, { useEffect, useState } from 'react';
import { obtenirDataUser } from '../../api';

function PageUtilisateur({ id }) {
    const [donneesUtilisateur, setDonneesUtilisateur] = useState([]);

    // Charger les donnees de l'utilisateur
    useEffect(() => {
        const chargerUtilisateur = async () => {
            const data = await obtenirDataUser(id);
            setDonneesUtilisateur(data);
        };
        chargerUtilisateur();
    }, [id]);

    if (donneesUtilisateur === null) {return (<p>Chargement...</p>);}

    return (
        <div className='Pageutilisateur'>
            <h1>{donneesUtilisateur.prenom} {donneesUtilisateur.nom_de_famille}</h1>
        </div>
    );
}
export default PageUtilisateur;
