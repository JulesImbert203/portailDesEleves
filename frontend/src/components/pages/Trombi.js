import React, { useEffect, useState } from 'react';
import {useLayout} from './../../layouts/Layout';  
import { obtenirListeDesPromos } from '../../api/baz';
import '../../assets/styles/trombi.css'; 
import TrombiPromo from './TrombiPromo';

function Trombi() {
    const [listePromos, setListePromos] = useState(null);
    const { setCurrentComponent } = useLayout();
    
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
                        onClick={() => setCurrentComponent(<TrombiPromo promo = {promo}/>)}
                    >
                        {promo}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Trombi;
