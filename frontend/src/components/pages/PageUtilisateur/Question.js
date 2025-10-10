import { useState, useEffect } from "react";

import { obtenirQuestionsReponses, modifierQuestionsReponses } from "../../../api/api_utilisateurs";
import '../../../assets/styles/utilisateur.scss';

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
            {Object.keys(questionsReponses).map(key => {
                return (<p key={key}>{key.slice(3, -1)} : {questionsReponses[key]}</p>)
            })}
        </>}
        {isGestion && <>
            {Array.from(Object.keys(questionsReponses)).sort().map(key => {
                return (<p key={key}>
                    {key.slice(3, -1)} : <input type="text" name={key} value={questionsReponses[key]} onChange={handleChange} ></input>
                </p>)
            })}
            <div className='valider-button' onClick={validerModifierEvent}>
                <img src="/assets/icons/check-mark.svg" alt="Ajouter" />
                <p>Ajouter</p>
            </div>
            <div className='annuler-button' onClick={() => setIsGestion(false)}>
                <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                <p>Annuler</p>
            </div>
        </>}
        {/* {isGestion && <div className='asso-bloc-interne'>
            <p>Titre : <input value={newPost.titre} name='titre' type='text' onChange={handleChange} /></p>
        </div>} */}
    </>)
}

