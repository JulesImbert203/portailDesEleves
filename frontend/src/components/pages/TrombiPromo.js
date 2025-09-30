import React, { useEffect, useState } from 'react';
import { obtenirListeDesUtilisateurs } from '../../api/api_utilisateurs';
import { useNavigate, useParams } from 'react-router-dom';

function TrombiPromo() {
    const [cyclesSelectionnes, setCyclesSelectionnes] = useState(["ic", "ast", "ev", "vs"]); // Les cycles sont pré-cochés
    const [utilisateurs, setUtilisateurs] = useState([]);
    const navigate = useNavigate();

    const cyclesDisponibles = ["ic", "ast", "ev", "vs", "isup"];
    const { promo } = useParams();

    // Charger les utilisateurs lorsque les cycles sélectionnés changent
    useEffect(() => {
        const chargerUtilisateurs = async () => {
            if (cyclesSelectionnes.length === 0) {
                setUtilisateurs([]); // Vide la liste si aucune case n'est cochée
                return;
            }
            const data = await obtenirListeDesUtilisateurs(promo, cyclesSelectionnes);
            setUtilisateurs(data);
        };
        chargerUtilisateurs();
        console.log (promo)
    }, [promo, cyclesSelectionnes]);

    const toggleCycle = (cycle) => {
        setCyclesSelectionnes(prev =>
            prev.includes(cycle) ? prev.filter(c => c !== cycle) : [...prev, cycle]
        );
    };

    return (
        <div className='page_d_une_promo'>
            <h1>Promotion {promo}</h1>
            <div>
                {cyclesDisponibles.map(cycle => (
                    <label key={cycle}>
                        <input 
                            type="checkbox" 
                            value={cycle} 
                            checked={cyclesSelectionnes.includes(cycle)}
                            onChange={() => toggleCycle(cycle)}
                        />
                        {cycle}
                    </label>
                ))}
            </div>

            {cyclesSelectionnes.length > 0 ? (
                <div className='liste_utilisateurs_grid'>
                    <div className='liste_utilisateurs_grid_container'>
                        {utilisateurs.map(user => (
                            <div className='liste_utilisateurs_grid_item' key={user.id} onClick={() => navigate(`/utilisateur/${user.id}`)}>
                                {user.prenom} {user.surnom ? `'${user.surnom}'` : ''} {user.nom_de_famille}
                                <br />
                                {user.cycle} {user.promotion}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className='liste_utilisateurs'></div> // Affiche une page blanche si aucune case n'est cochée
            )}

            <button onClick={() => navigate("/trombi")}>Retour</button>
        </div>
    );
}

export default TrombiPromo;
