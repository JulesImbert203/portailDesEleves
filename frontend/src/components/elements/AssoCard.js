import { Card } from "react-bootstrap"
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../api/base";

export default function AssoCard({ asso }) {
    const navigate = useNavigate();

    return (<Card
        className="h-100 text-center"
        onClick={() => navigate(`/assos/get/${asso.id}`)}
        style={{ cursor: 'pointer' }}
    >
        <Card.Img
            variant="top"
            src={`${BASE_URL}/upload/associations/${asso.nom_dossier}/${asso.img}`}
            alt={asso.nom}
            style={{ height: '120px', objectFit: 'cover' }}
        />
        <Card.Body>
            <Card.Title>{asso.nom}</Card.Title>
            {asso.role && <Card.Text>{asso.role}</Card.Text>}
        </Card.Body>
    </Card>);
}
