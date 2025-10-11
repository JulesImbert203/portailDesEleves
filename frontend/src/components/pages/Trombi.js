import React, { useEffect, useState } from 'react';
import { obtenirListeDesPromos } from '../../api/api_utilisateurs';
import { useNavigate } from 'react-router-dom';
import { Container, ListGroup } from 'react-bootstrap';

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
        <Container className="py-4">
            <h1>Trombinoscopes</h1>
            <ListGroup>
                {listePromos.map((promo, index) => (
                    <ListGroup.Item 
                        action 
                        onClick={() => navigate(`/trombi/get/${promo}`)}
                        key={index}
                    >
                        {promo}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
}

export default Trombi;