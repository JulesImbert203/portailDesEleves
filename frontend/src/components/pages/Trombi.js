import React, { useEffect, useState } from 'react';
import '../../assets/styles/trombi.css';
import { obtenirListeDesPromos } from '../../api/api_utilisateurs';
import { useNavigate } from 'react-router-dom';

function Trombi() {
    const [listePromos, setListePromos] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                let promoData = await obtenirListeDesPromos();
                promoData = promoData.filter(p => p !== null).sort((a, b) => b.localeCompare(a));
                setListePromos(promoData);
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
            }
        };
        fetchData();
    }, []);


    if (listePromos === null) {
        return <p>Chargement...</p>;
    }

    return (
        <div className="trombinoscope">
            <h1>Trombinoscopes</h1>
            <div className='liste_promos'>
                {listePromos.map((promo, index) => (
                    <div 
                        className='promo_dans_liste' 
                        key={index} 
                        onClick={() => navigate(`/trombi/get/${promo}`)}
                    >
                        {promo}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Trombi;
