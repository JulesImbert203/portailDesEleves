import { useEffect, useState } from "react";
import Select from "react-select";
import '../../../assets/styles/utilisateur.css';
import { chargerUtilisateursParPromo, modifierInfos } from "../../../api/api_utilisateurs";

function DropDownSelect({ options, open, setOpen, selected, setSelected, single }) {
    return (<div>
        {/* Button to open dropdown */}
        <button
            onClick={() => setOpen((prev) => !prev)}
            style={{ padding: "0.5rem 1rem", width: "100%" }}
        >
            {single ? selected.label :
                selected.length === 0 ? "Select options..." : selected.map((opt) => opt.label).join(", ")}
        </button>

        {/* Dropdown menu */}
        {open && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, }}                    >
                <Select
                    options={options}
                    value={selected}
                    onChange={(opt) => {
                        setSelected(opt);
                        setOpen(false); // close on selection
                    }}
                    isMulti={!single}
                    autoFocus
                    placeholder="Search..."
                    menuIsOpen={true} // always open inside the popover
                    styles={{
                        menu: (provided) => ({ ...provided, position: "relative" }),
                    }}
                />
            </div>
        )}
    </div>);
}


export default function TabInfo({ id, donneesUtilisateur, autoriseAModifier }) {
    const [isGestion, setIsGestion] = useState(false);
    const [userInfos, setUserInfos] = useState({
        promo: donneesUtilisateur.promotion,
        date_de_naissance: donneesUtilisateur.date_de_naissance,
        chambre: donneesUtilisateur.chambre,
        ville_origine: donneesUtilisateur.ville_origine,
        instruments: donneesUtilisateur.instruments
    });

    const copyToClipboard = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
            }).catch((err) => {
                console.error("Erreur lors de la copie : ", err);
            });
        } else {
            console.log("La fonctionnalité de copier dans le presse-papiers n'est pas supportée.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfos({ ...userInfos, [name]: value })
    };

    const validerModifierInfos = () => {
        modifierInfos(id, userInfos);
        setIsGestion(false);
    }

    const [openP, setOpenP] = useState(false);
    const [selectedP, setSelectedP] = useState([]);
    const [optionsP, setOptionsP] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await chargerUtilisateursParPromo(donneesUtilisateur.promotion - 1);
            setOptionsP(data.map(elt => ({ value: elt.id, label: elt.prenom + " " + elt.nom })));
        };
        fetchData();
    }, []);

    const [openC, setOpenC] = useState(false);
    const [selectedC, setSelectedC] = useState([]);
    const [optionsC, setOptionsC] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await chargerUtilisateursParPromo(donneesUtilisateur.promotion);
            setOptionsC(data.map(elt => ({ value: elt.id, label: elt.prenom + " " + elt.nom })));
        };
        fetchData();
    }, []);

    return (<>
        {autoriseAModifier && <div className='asso-button' id="asso-description-button" onClick={() => setIsGestion(!isGestion)}>
            <img src="/assets/icons/edit.svg" alt="Copy" />
            <p id="texteCopier">Éditer</p>
        </div>}
        <h2 className='user-nom'>
            {donneesUtilisateur.prenom} {donneesUtilisateur.surnom !== null && `'${donneesUtilisateur.surnom}'`} {donneesUtilisateur.nom}
        </h2>
        <div className='user-info-contact'>
            {/* Section Téléphone */}
            <div className="user-contact">
                <img src="/assets/icons/phone.svg" alt="Phone" className="user-icon" />
                <div className='asso-button'>
                    <img src="/assets/icons/copy.svg" alt="Copy" className="user-icon" onClick={() => copyToClipboard(donneesUtilisateur.telephone || '01 23 45 67 89')} />
                    <p id="texteCopier">copier</p>
                </div>
                <p className='user-donnee-contact'>{donneesUtilisateur.telephone || '01 23 45 67 89'}</p> {/* Mettre le numéro réel ici */}
            </div>

            {/* Section Email */}
            <div className="user-contact">
                <img src="/assets/icons/mail.svg" alt="Mail" className="user-icon" />
                <div className='copyButton'>
                    <img src="/assets/icons/copy.svg" alt="Copy" className="user-icon copy" onClick={() => copyToClipboard(donneesUtilisateur.email || 'example@mail.com')} />
                    <p id="texteCopier">copier</p>
                </div>
                <p className='user-donnee-contact'>{donneesUtilisateur.email || 'example@mail.com'}</p> {/* Mettre l'email réel ici */}
            </div>
        </div>


        {!isGestion && <>
            <p>Promo : {userInfos.promo}</p>
            <p>Ville d'origine : {userInfos.ville_origine}</p>
            <p>Chambre : {userInfos.chambre}</p>
            <p>Instruments : {userInfos.instruments}</p>
        </>}
        {isGestion && <>
            <p>Promo : {userInfos.promo}</p>
            <p>Ville d'origine : <input type="text" name="ville_origine" value={userInfos.ville_origine} onChange={e => handleChange(e)} ></input></p>
            <p>Chambre : <input type="text" name="chambre" value={userInfos.chambre} onChange={e => handleChange(e)} ></input></p>
            <p>Instruments : <input type="text" name="instruments" value={userInfos.instruments} onChange={e => handleChange(e)} ></input></p>
            Co : <DropDownSelect options={optionsC} open={openC} setOpen={setOpenC} selected={selectedC} setSelected={setSelectedC} single={true} />
            Parrainne : <DropDownSelect options={optionsP} open={openP} setOpen={setOpenP} selected={selectedP} setSelected={setSelectedP} single={false} />
            <div className='buttons-container'>
                <div className='valider-button' onClick={validerModifierInfos}>
                    <img src="/assets/icons/check-mark.svg" alt="Ajouter" />
                    <p>Ajouter</p>
                </div>
                <div className='annuler-button' onClick={() => setIsGestion(false)}>
                    <img src="/assets/icons/cross-mark.svg" alt="Annuler" />
                    <p>Annuler</p>
                </div>
            </div>
        </>}
    </>
    );
}

