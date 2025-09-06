import { useState, useEffect } from "react";

import '../../../assets/styles/liste_assos.css';
import '../../../assets/styles/liste_assos.css';

import { useLayout } from "../../../layouts/Layout";
import { obtenirAssosUtilisateur } from "../../../api/api_utilisateurs";
import { BASE_URL } from "../../../api/base";
import Asso from "../Asso";


export default function TabAsso({ id }) {
    const [assosActuelles, setAssosActuelles] = useState([]);
    const [assosAnciennes, setAssosAnciennes] = useState([]);
    const { setCurrentComponent } = useLayout();

    useEffect(() => {
        const chargerAssos = async () => {
            const data = await obtenirAssosUtilisateur(id);
            setAssosActuelles(data.associations_actuelles);
            console.log(assosActuelles)
        };
        chargerAssos();
    }, [id]);

    const handleClick = (asso) => {
        //selectAsso(asso); // Stocke les infos de l'asso sélectionnée
        setCurrentComponent(<Asso id={asso} />); // Change de composant
    };

    return (
        <div>
            {assosActuelles.map((asso) => (
                <div
                    key={asso.id}
                    className="liste-assos__grid-item"
                    onClick={() => handleClick(asso.asso_id)}
                >
                    <img
                        src={`http://${BASE_URL}/upload/associations/${asso.nom_dossier}/${asso.img}`}
                        alt={asso.nom}
                        className="liste-assos__image"
                    />
                    <p className="liste-assos__name">{asso.nom}</p>
                    <p className="asso-membre-role">{asso.role}</p>
                </div>
            ))}
        </div>
    );
}

