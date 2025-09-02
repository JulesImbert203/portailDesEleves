import React, { useEffect, useState } from 'react';
import { useLayout } from './../../layouts/Layout';  
import { obtenirListeDesUtilisateurs } from '../../api/baz';
import Trombi from './Trombi';
import PageUtilisateur from './PageUtilisateur';

function TrombiPromo({ promo }) {
    const { setCurrentComponent } = useLayout();
    const [cyclesSelectionnes, setCyclesSelectionnes] = useState(["ic", "ast", "ev", "vs"]); // Les cycles sont pré-cochés
    const [utilisateurs, setUtilisateurs] = useState([]);

    const cyclesDisponibles = ["ic", "ast", "ev", "vs", "isup"];

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
                            <div className='liste_utilisateurs_grid_item' key={user.id} onClick={() => setCurrentComponent(<PageUtilisateur id={user.id} />)}>
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

            <button onClick={() => setCurrentComponent(<Trombi />)}>Retour</button>
        </div>
    );
}

export default TrombiPromo;
