import React, { useState, useEffect } from "react";
import { chargerAsso, estUtilisateurDansAsso, modifierDescriptionAsso } from "../../../api/api_associations";
import RichEditor, { RichTextDisplay } from '../../blocs/RichEditor';
import { Button } from "react-bootstrap";

function AssoInfo({ asso_id }) {
    const [isEdition, setIsEdition] = useState(false);
    const [description, setDescription] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [isMembreAutorise, setIsMembreAutorise] = useState(false);

    const handleModifierDescription = async () => {
        if (newDescription !== null) {
            try {
                await modifierDescriptionAsso(asso_id, newDescription);
                setDescription(newDescription);
                setIsEdition(false);
            } catch (error) {
                console.err(error);
            }
        }
    };

    const annulerModifierDescription = () => {
        setNewDescription(description);
        setIsEdition(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const asso = await chargerAsso(asso_id);
                const membreData = await estUtilisateurDansAsso(asso_id);
                setIsMembreAutorise(membreData.autorise);
                setDescription(asso.description)
                setNewDescription(asso.description)
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
            }
        };
        fetchData();
    }, [asso_id]);

    return (
        <>
            {/* Description de l'asso */}
            <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Description de l'association</h2>
                    {isMembreAutorise && <Button variant="outline-primary" onClick={() => setIsEdition(!isEdition)}>
                        <img src="/assets/icons/edit.svg" alt="Copy" />
                        Éditer
                    </Button>}
                </div>
                {/*  */}
                {!isEdition && <div>
                    <RichTextDisplay content={description}></RichTextDisplay>
                </div>}
                {/* Modification de description */}
                {isEdition && <>
                    <RichEditor value={newDescription} onChange={setNewDescription} />
                    <div className="d-flex gap-2 mt-3">
                        <Button variant="success" onClick={handleModifierDescription}>
                            <img src="/assets/icons/check-mark.svg" alt="Valider" />
                            Valider
                        </Button>
                        <Button variant="danger" onClick={annulerModifierDescription}>
                            <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                            Annuler
                        </Button>
                    </div>
                </>}
            </div>
        </>
    )
}

export default AssoInfo;