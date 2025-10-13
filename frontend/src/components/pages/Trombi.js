import React, { useEffect, useState } from 'react';
import { obtenirListeDesPromos } from '../../api/api_utilisateurs';
import { useNavigate } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';
import '../../assets/styles/asso.scss';
import '../../assets/styles/trombi.scss';

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
            <div className="member-grid">
                {listePromos.map((promo, index) => (
                    <Card onClick={() => navigate(`/trombi/get/${promo}`)} key={index} className="text-center trombi-card">
                        <Card.Body>
                            <Card.Title>{promo}</Card.Title>
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </Container>
    );
}

export default Trombi;