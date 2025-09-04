import { useState, useEffect } from "react";

import { obtenirQuestionsReponses, verifierSuperutilisateur, obtenirIDActuel, modifierQuestionsReponses } from "../../../api/api_utilisateurs";

export default function TabQuestions({ id }) {
    const [questionsReponses, setQuestionsReponses] = useState({});
    const [isGestion, setIsGestion] = useState(false);
    const [currentID, setCurrentID] = useState(-1);
    const [autoriseAModifier, setAutoriseAModifier] = useState(false);

    useEffect(() => {// Obtention des données utilisateur à afficher
        const chargerUtilisateur = async () => {
            const data = await obtenirQuestionsReponses(id);
            setQuestionsReponses(data);
            console.log(data)
        };
        chargerUtilisateur();
        console.log(questionsReponses)
    }, [id]);

    useEffect(() => {// Obtention de l'id de l'utilisateur qui consulte
        const fetchCurrentID = async () => {
            const cuurId = await obtenirIDActuel();
            setCurrentID(cuurId)
            if (id === cuurId || (await verifierSuperutilisateur()).is_superuser) {
                setAutoriseAModifier(true);
            }
        }
        fetchCurrentID();
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
        <div className='asso-info-section'>
            <div className='asso-titre-description'>
                <h2>Un peu plus sur moi</h2>
                {autoriseAModifier && <div className='asso-button' id="asso-description-button" onClick={() => setIsGestion(!isGestion)}>
                    <img src="/assets/icons/edit.svg" alt="Copy" />
                    <p id="texteCopier">Éditer</p>
                </div>}
            </div>
        </div>
        {!isGestion && <>
            <div className='asso-bloc-interne'>
                {Object.keys(questionsReponses).map(key => {
                    return (<p>{key.slice(3, -1)} : {questionsReponses[key]}</p>)
                })}
            </div>
        </>}
        {isGestion && <>
            <div className='asso-bloc-interne'>
                {Array.from(Object.keys(questionsReponses)).sort().map(key => {
                    return (<p>
                        {key.slice(3, -1)} : <input type="text" name={key} value={questionsReponses[key]} onChange={handleChange} ></input>
                    </p>)
                })}
            </div>
            <div className='buttons-container'>
                <div className='valider-button' onClick={validerModifierEvent}>
                    <img src="/assets/icons/check-mark.svg" alt="Ajouter" />
                    <p>Ajouter</p>
                </div>
                <div className='annuler-button' onClick={() => setIsGestion(false)}>
                    <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                    <p>Annuler</p>
                </div>
            </div>
        </>}
        {/* {isGestion && <div className='asso-bloc-interne'>
            <p>Titre : <input value={newPost.titre} name='titre' type='text' onChange={handleChange} /></p>
        </div>} */}
    </>)
}

