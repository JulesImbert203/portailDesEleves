import React, { useState, useEffect } from "react";
import { chargerAsso, estUtilisateurDansAsso, modifierDescriptionAsso } from "../../api/api_associations";
import RichEditor, { RichTextDisplay } from '../blocs/RichEditor';

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
                console.log(error);
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
            <div className='asso-info-section'>
                <div className='asso-titre-description'>
                    <h2>Description de l'association</h2>
                    {isMembreAutorise && <div className='asso-button' id="asso-description-button" onClick={() => setIsEdition(true)}>
                        <img src="/assets/icons/edit.svg" alt="Copy" />
                        <p id="texteCopier">Éditer</p>
                    </div>}
                </div>
                {/*  */}
                {!isEdition && <div className='asso-description'>
                    <RichTextDisplay content={description}></RichTextDisplay>
                </div>}
                {/* Modification de description */}
                {isEdition && <>
                    <RichEditor value={newDescription} onChange={setNewDescription} />
                    <div className='buttons-container'>
                        <div className='valider-button' onClick={handleModifierDescription}>
                            <img src="/assets/icons/check-mark.svg" alt="Valider" />
                            <p>Valider</p>
                        </div>
                        <div className='annuler-button' onClick={annulerModifierDescription}>
                            <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                            <p>Annuler</p>
                        </div>
                    </div>
                </>}
            </div>
        </>
    )
}

export default AssoInfo;