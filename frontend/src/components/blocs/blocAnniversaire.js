
import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { obtenirProchainsAnnivs } from '../../api/api_utilisateurs';
import { Link } from 'react-router-dom';

// "undefined" means the URL will be computed from the `window.location` object

export default function BlocAnniversaire() {
    const [annivs, setAnnivs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await obtenirProchainsAnnivs();
            setAnnivs(data.sort((x, y) => new Date(x.date_de_naissance) - new Date(y.date_de_naissance)));
        };
        fetchData();
    }, []);

    return <Card id="bloc-anniversaire" className="bloc-global">
        <Card.Header as="h5" className="text-center">Anniversaires</Card.Header>
        <Card.Body>
            {annivs.map(elt => {
                return (
                    <div key={elt[0]} className='mb-3'>
                        <p className='mb-0'>{new Date(elt[0]).toLocaleString("fr-FR", { day: "numeric", month: "long" })}</p>
                        {elt[1].map(user => {
                            const prenom = user[0];
                            const nom = user[1];
                            const cycle = user[2];
                            const promo = user[3];
                            const id = user[4];
                            return <p className="mb-0" key={id}><Link to={`/utilisateur/${id}`}>{`${prenom} ${nom} ${cycle}${promo}`}</Link></p>
                        })}
                    </div>)
            })}
        </Card.Body>
    </Card>
}