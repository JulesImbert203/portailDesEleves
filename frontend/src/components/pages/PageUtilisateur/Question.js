import { useState, useEffect } from "react";

import { obtenirQuestionsReponses, modifierQuestionsReponses } from "../../../api/api_utilisateurs";
import { Button, Form, Row, Col } from "react-bootstrap";

export default function TabQuestions({ id, autoriseAModifier }) {
    const [questionsReponses, setQuestionsReponses] = useState({});
    const [isGestion, setIsGestion] = useState(false);

    useEffect(() => {// Obtention des données utilisateur à afficher
        const chargerUtilisateur = async () => {
            const data = await obtenirQuestionsReponses(id);
            setQuestionsReponses(data);
        };
        chargerUtilisateur();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setQuestionsReponses({ ...questionsReponses, [name]: value })
    };

    const validerModifierEvent = () => {
        modifierQuestionsReponses(id, questionsReponses);
        setIsGestion(false);
    }

    return (<>
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Un peu plus sur moi</h2>
            {autoriseAModifier && <Button variant="outline-primary" onClick={() => setIsGestion(!isGestion)}>
                <img src="/assets/icons/edit.svg" alt="Edit" /> Éditer
            </Button>}
        </div>

        {!isGestion ? <>
            {Object.keys(questionsReponses).map(key => {
                return (<p key={key}><strong>{key.slice(3, -1)} :</strong> {questionsReponses[key]}</p>)
            })}
        </> : <Form>
            {Array.from(Object.keys(questionsReponses)).sort().map(key => {
                return (
                    <Form.Group as={Row} className="mb-3" key={key}>
                        <Form.Label column sm="4">{key.slice(3, -1)}</Form.Label>
                        <Col sm="8">
                            <Form.Control type="text" name={key} value={questionsReponses[key]} onChange={handleChange} />
                        </Col>
                    </Form.Group>
                )
            })}
            <div className="d-flex gap-2">
                <Button variant="success" onClick={validerModifierEvent}>Valider</Button>
                <Button variant="danger" onClick={() => setIsGestion(false)}>Annuler</Button>
            </div>
        </Form>}
    </>)
}