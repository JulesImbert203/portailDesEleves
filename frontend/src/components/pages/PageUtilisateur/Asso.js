import { useState, useEffect } from "react";

import '../../../assets/styles/liste_assos.css';
import '../../../assets/styles/asso.css';

import { obtenirAssosUtilisateur } from "../../../api/api_utilisateurs";
import { BASE_URL } from "../../../api/base";
import { useNavigate } from "react-router-dom";


export default function TabAsso({ id }) {
    const [assosActuelles, setAssosActuelles] = useState([]);
    const [assosAnciennes, setAssosAnciennes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const chargerAssos = async () => {
            const data = await obtenirAssosUtilisateur(id);
            setAssosActuelles(data.associations_actuelles);
        };
        chargerAssos();
    }, [id]);

    const handleClick = (asso) => {
        //selectAsso(asso); // Stocke les infos de l'asso sélectionnée
        navigate(`/assos/get/${asso}`); // Change de composant
    };

    return (<>
        <div className="liste-assos">
            <h2>Assos actuelles</h2>
            <div className="liste-assos__grid">
                <div className="liste-assos__grid-container">
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
            </div>
        </div>
        <div className="liste-assos">
            <h2>Anciennes assos</h2>
            <div className="liste-assos__grid">
                <div className="liste-assos__grid-container">
                    {assosAnciennes.map((asso) => (
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
            </div>
        </div>
    </>);
}

