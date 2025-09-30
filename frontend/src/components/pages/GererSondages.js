import { useState, useEffect } from "react";
import { useLayout } from './../../layouts/Layout';
import { obtenirSondagesEnAttente, validerSondage, supprimerSondage, sondageSuivant } from '../../api/api_sondages';
import { useNavigate } from "react-router-dom";

function GererSondages() {
    const { reloadBlocSondage} = useLayout();
    const [sondagesEnAttente, setSondagesEnAttente] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const suivantEtReload = async () => {
        await sondageSuivant(); 
        reloadBlocSondage();
    }

    useEffect(() => {
        fetchSondages();
    }, []);

    async function fetchSondages() {
        setLoading(true);
        try {
            const data = await obtenirSondagesEnAttente();
            if (data && data.sondages) {
                setSondagesEnAttente(data.sondages);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des sondages :", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleValidation(id_sondage) {
        try {
            await validerSondage(id_sondage);
            setSondagesEnAttente(sondagesEnAttente.filter(s => s.id !== id_sondage));
        } catch (error) {
            console.error("Erreur lors de la validation du sondage :", error);
        }
    }

    async function handleSuppression(id_sondage) {
        try {
            await supprimerSondage(id_sondage);
            setSondagesEnAttente(sondagesEnAttente.filter(s => s.id !== id_sondage));
        } catch (error) {
            console.error("Erreur lors de la suppression du sondage :", error);
        }
    }

    if (loading) {
        return (
            <div>
                <h1>Gestion des sondages en attente</h1>
                <p>Chargement des sondages ... </p>
                <button onClick={() => navigate("/")}>Retour</button>
            </div>
        );
    }

    return (
        <div>
            <h1>Gestion des sondages en attente</h1>
            {sondagesEnAttente.length === 0 ? (
                <p>Aucun sondage en attente.</p>
            ) : (
                <table border="1">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Question</th>
                            <th>Réponses</th>
                            <th>Proposé par</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sondagesEnAttente.map((sondage) => (
                            <tr key={sondage.id}>
                                <td>{sondage.id}</td>
                                <td>{sondage.question}</td>
                                <td>
                                    <ul>
                                        <li>{sondage.reponse1}</li>
                                        <li>{sondage.reponse2}</li>
                                        {sondage.reponse3 && <li>{sondage.reponse3}</li>}
                                        {sondage.reponse4 && <li>{sondage.reponse4}</li>}
                                    </ul>
                                </td>
                                <td>{sondage.propose_par_user_id}</td>
                                <td>{sondage.date_sondage}</td>
                                <td>
                                    <button onClick={() => handleValidation(sondage.id)} >Valider
                                    </button>
                                    <button onClick={() => handleSuppression(sondage.id)} >Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <button onClick={() => suivantEtReload()} >Passer au sondage suivant
            </button>
            <button onClick={() => navigate("/")}>Retour</button>
        </div>
    );
}

export default GererSondages;
