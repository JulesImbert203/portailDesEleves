
import { useState, useEffect, useRef } from 'react';
import { obtenirProchainsAnnivs } from '../../api/api_utilisateurs';

// "undefined" means the URL will be computed from the `window.location` object

export default function BlocAnniversaire() {
    const [annivs, setAnnivs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await obtenirProchainsAnnivs();
            setAnnivs(data.sort((x, y) => new Date(x.date_de_naissance) - new Date(y.date_de_naissance)));
            console.log(data)
        };
        fetchData();
    }, []);

    return <>
        <h1>Anniversaires</h1>
        {annivs.map(elt => {
            return(
            <div>{elt.nom},
                {new Date(elt.date_de_naissance).toLocaleString("fr-FR", { day: "numeric", month: "long" })}
            </div>)
        })}
    </>
}