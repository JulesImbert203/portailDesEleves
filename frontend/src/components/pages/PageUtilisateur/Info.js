import { useEffect, useState } from "react";
import Select from "react-select";


import '../../../assets/styles/utilisateur.css';
import { chargerUtilisateursParPromo } from "../../../api/api_utilisateurs";

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


export default function TabInfo({ donneesUtilisateur, autoriseAModifier }) {
    const [isGestion, setIsGestion] = useState(false);
    const [userInfos, setUserInfos] = useState([
        ["Promo ", donneesUtilisateur.promotion, "text"],
        ["Date de naissance ", donneesUtilisateur.date_de_naissance, "date"],
        ["Chambre ", donneesUtilisateur.chambre, "text"],
        ["Ville d'origine ", donneesUtilisateur.ville_origine, "text"],
        ["Instruments joués ", donneesUtilisateur.instruments, "text"],
    ]);

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

    const handleChange = (ind, e) => {
        const { name, value } = e.target;
        console.log(name, value)
        userInfos[ind][1] = value;
    };

    const validerModifierInfos = () => {

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
            {userInfos.map(elt => {
                return (<p>{elt[0]} : {elt[1]}</p>)
            })}
        </>}
        {isGestion && <>
            {userInfos.map((elt, ind) => {
                return (<p>
                    {elt[0]} : <input type={elt[2]} name={elt[0]} value={elt[1]} onChange={e => handleChange(ind, e)} ></input>
                </p>)
            })}
            Co : <DropDownSelect options={optionsC} open={openC} setOpen={setOpenC} selected={selectedC} setSelected={setSelectedC} single={true}/>
            Parrainne : <DropDownSelect options={optionsP} open={openP} setOpen={setOpenP} selected={selectedP} setSelected={setSelectedP} single={false}/>
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

