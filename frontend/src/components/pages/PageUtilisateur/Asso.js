import { useState, useEffect } from "react";

import '../../../assets/styles/liste_assos.scss';
import '../../../assets/styles/asso.scss';

import { Row, Container } from "react-bootstrap";
import { obtenirAssosUtilisateur } from "../../../api/api_utilisateurs";
import { BASE_URL } from "../../../api/base";
import { useNavigate } from "react-router-dom";
import AssoCard from "../../elements/AssoCard";


export default function TabAsso({ id }) {
    const [assosActuelles, setAssosActuelles] = useState([]);
    const [assosAnciennes, setAssosAnciennes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const chargerAssos = async () => {
            const data = await obtenirAssosUtilisateur(id);
            setAssosActuelles(data.associations_actuelles);
            console.log(assosActuelles)
        };
        chargerAssos();
    }, [id]);

    const handleClick = (asso) => {
        //selectAsso(asso); // Stocke les infos de l'asso sélectionnée
        navigate(`/assos/get/${asso}`); // Change de composant
    };

    return (<>
        <Container className="py-4">
            <h2>Assos actuelles</h2>
            <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4 justify-content-center">
                {assosActuelles.map((asso) => (
                    <AssoCard asso={asso} />
                ))}
            </Row>
        </Container>
        <Container className="py-4">
            <h2>Assos anciennes</h2>
            <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4 justify-content-center">
                {assosAnciennes.map((asso) => (
                    <AssoCard asso={asso} />
                ))}
            </Row>
        </Container>
    </>);
}

