import { useEffect, useState } from "react";
import Select from "react-select";
import '../../../assets/styles/utilisateur.scss';
import { chargerUtilisateursParPromo, modifierInfos, obtenirDataUser } from "../../../api/api_utilisateurs";
import { useLayout } from "../../../layouts/Layout";

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


export default function TabInfo({ id, autoriseAModifier }) {
    const { userData } = useLayout();
    const [isGestion, setIsGestion] = useState(false);
    const [userInfos, setUserInfos] = useState(
        {
            promo: 2,
            date_de_naissance: "0",
            chambre: "0",
            ville_origine: "Lens",
            instruments: []
        }
    );

    const [openP, setOpenP] = useState(false);
    const [selectedP, setSelectedP] = useState([]);
    const [optionsP, setOptionsP] = useState([]);

    const [openC, setOpenC] = useState(false);
    const [selectedC, setSelectedC] = useState([]);
    const [optionsC, setOptionsC] = useState([]);

    useEffect(() => {// Obtention des données utilisateur à afficher
        const fetchData = async () => {
            var data = await obtenirDataUser(id);
            setUserInfos({
                email: data.email,
                telephone: data.telephone,
                promo: data.promo,
                date_de_naissance: data.date_de_naissance,
                chambre: data.chambre,
                ville_origine: data.ville_origine,
                instruments: data.instruments ? data.instruments : []
            });
            if (!isNaN(parseInt(userInfos.promo))) {
                var data = await chargerUtilisateursParPromo(userInfos.promo - 1);
                setOptionsP(data.map(elt => ({ value: elt.id, label: elt.prenom + " " + elt.nom })));

                var data = await chargerUtilisateursParPromo(userInfos.promo);
                setOptionsC(data.map(elt => ({ value: elt.id, label: elt.promo + " " + elt.nom })));
            }
        };
        fetchData();
    }, [id]);

    const copyToClipboard = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
            }).catch((err) => {
                console.error("Erreur lors de la copie : ", err);
            });
        } else {
            console.err("La fonctionnalité de copier dans le presse-papiers n'est pas supportée.");
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

    const handleInstruChange = (e) => {
        const { name, value } = e.target;
        let temp = userInfos.instruments;
        temp[name] = [userInfos.instruments[name][0], value];
        setUserInfos({ ...userInfos, instruments: temp })
    }

    const handleInstruNameChange = (e) => {
        const { name, value } = e.target;
        var temp = userInfos.instruments;
        temp[name] = [value, userInfos.instruments[name][1]];
        setUserInfos({ ...userInfos, instruments: temp })
    }

    const ajouterInstru = () => {
        setUserInfos({ ...userInfos, instruments: [...userInfos.instruments, ["Piano", "1 an"]] })
    }

    return (<>
        {autoriseAModifier && <div className='asso-button' id="asso-description-button" onClick={() => setIsGestion(!isGestion)}>
            <img src="/assets/icons/edit.svg" alt="Copy" />
            <p id="texteCopier">Éditer</p>
        </div>}
        <div className='user-info-contact'>
            {/* Section Téléphone */}
            <div className="user-contact">
                <img src="/assets/icons/phone.svg" alt="Phone" className="user-icon" />
                <p className='user-donnee-contact'>{userInfos.telephone || '01 23 45 67 89'}</p> {/* Mettre le numéro réel ici */}
                <div className='asso-button'>
                    <img src="/assets/icons/copy.svg" alt="Copy" className="user-icon" onClick={() => copyToClipboard(userInfos.telephone || '01 23 45 67 89')} />
                    <p id="texteCopier">copier</p>
                </div>
            </div>

            {/* Section Email */}
            <div className="user-contact">
                <img src="/assets/icons/mail.svg" alt="Mail" className="user-icon" />
                <p className='user-donnee-contact'>{userInfos.email || 'example@mail.com'}</p> {/* Mettre l'email réel ici */}
                <div className='asso-button'>
                    <img src="/assets/icons/copy.svg" alt="Copy" className="user-icon copy" onClick={() => copyToClipboard(userInfos.email || 'example@mail.com')} />
                    <p id="texteCopier">copier</p>
                </div>
            </div>
        </div>

        {!isGestion ?
            <>
                <p>Promo : {userInfos.promo}</p>
                <p>Ville d'origine : {userInfos.ville_origine}</p>
                <p>Chambre : {userInfos.chambre}</p>
                <div><h3>Instruments</h3>
                    <ul>
                        {userInfos.instruments.map(elt => (<li>{elt[0]} : {elt[1]}</li>))}
                    </ul>
                </div>
            </>
            :
            <>
                <p>Promo : {userInfos.promo}</p>
                <p>Ville d'origine : <input type="text" name="ville_origine" value={userInfos.ville_origine} onChange={e => handleChange(e)} ></input></p>
                <p>Chambre : <input type="text" name="chambre" value={userInfos.chambre} onChange={e => handleChange(e)} ></input></p>
                <div><h3>Instruments</h3>
                    <ul>
                        {userInfos.instruments.map((elt, ind) => (<li><input value={elt[0]} name={ind} onChange={handleInstruNameChange}></input> : <input value={elt[1]} name={ind} onChange={handleInstruChange}></input></li>))}
                    </ul>
                    <button onClick={ajouterInstru}>Ajouter instrument</button>
                </div>
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

