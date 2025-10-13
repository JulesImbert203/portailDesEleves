// TODO REMOVE THIS CLASS !!!

mport { Card, Button, Form } from "react-bootstrap";
import { BASE_URL } from "../../api/base";
import { useNavigate } from "react-router-dom";

export default function UserCard({ user, isGestion, isModifying, t1, f1, t2, f2, values, validate }) {
    const navigate = useNavigate();

    return (
        <Card key={user.id} className="text-center">
            <div className="position-relative">
                {isGestion && <>
                    <Button variant="danger" size="sm" className="position-absolute top-0 end-0" title={t1} onClick={f1} style={{ zIndex: 1 }}>
                        <img src="/assets/icons/delete.svg" alt="suppression du membre" />
                    </Button>
                    <Button variant="primary" size="sm" className="position-absolute top-0 start-0" title={t2} onClick={f2} style={{ zIndex: 1 }}>
                        <img src="/assets/icons/edit.svg" alt="modification de rôle" />
                    </Button>
                </>}
                <Card.Img
                    variant="top"
                    src={`${BASE_URL}/upload/utilisateurs/09brique.jpg`}
                    alt={`${user.nom_utilisateur}`}
                    onClick={() => navigate(`/utilisateur/${user.id}`)}
                    style={{ cursor: "pointer" }}
                />
            </div>
            <Card.Body>
                <Card.Title className="h6 bold">{user.nom_utilisateur}</Card.Title>
                {!isModifying && <Card.Text>{user.role}</Card.Text>}
                {isModifying && <>
                    {values.map((elt) =>
                        <Form.Group className="mb-2">
                            <Form.Label>{elt.label}</Form.Label>
                            <Form.Control value={elt.value} onChange={elt.onChange} />
                        </Form.Group>
                    )}
                    <Button variant="success" onClick={validate}>Valider</Button>
                </>}
            </Card.Body>
            {isGestion && !isModifying && <Card.Footer>Position : {user.position}</Card.Footer>}
        </Card>
    );
}