import { useEffect, useState } from "react";
import Select from "react-select";
import { chargerUtilisateursParPromo, modifierInfos, obtenirDataUser} from "../../../api/api_utilisateurs";
import { Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import { useLayout } from "../../../layouts/Layout";
import BoutonEditer from "../../elements/BoutonEditer";

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
        {autoriseAModifier && <BoutonEditer onClick={() => setIsGestion(!isGestion)}/>}
        
        <Row className="mb-3">
            <Col md={6}>
                <InputGroup className="mb-3">
                    <InputGroup.Text><img src="/assets/icons/phone.svg" alt="Phone" style={{width: '20px'}}/></InputGroup.Text>
                    <Form.Control value={userInfos.telephone || '01 23 45 67 89'} disabled/>
                    <Button variant="outline-secondary" onClick={() => copyToClipboard(userInfos.telephone || '01 23 45 67 89')}>Copier</Button>
                </InputGroup>
            </Col>
            <Col md={6}>
                <InputGroup className="mb-3">
                    <InputGroup.Text><img src="/assets/icons/mail.svg" alt="Mail" style={{width: '20px'}}/></InputGroup.Text>
                    <Form.Control value={userInfos.email || 'example@mail.com'} disabled/>
                    <Button variant="outline-secondary" onClick={() => copyToClipboard(userInfos.email || 'example@mail.com')}>Copier</Button>
                </InputGroup>
            </Col>
        </Row>

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
            <Form>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">Promo</Form.Label>
                    <Col sm="10">
                        <Form.Control value={userInfos.promo} disabled />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">Ville d'origine</Form.Label>
                    <Col sm="10">
                        <Form.Control type="text" name="ville_origine" value={userInfos.ville_origine} onChange={e => handleChange(e)} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">Chambre</Form.Label>
                    <Col sm="10">
                        <Form.Control type="text" name="chambre" value={userInfos.chambre} onChange={e => handleChange(e)} />
                    </Col>
                </Form.Group>
                
                <h3>Instruments</h3>
                {userInfos.instruments.map((elt, ind) => (
                    <Row key={ind} className="mb-2">
                        <Col>
                            <Form.Control value={elt[0]} name={ind} onChange={handleInstruNameChange}/>
                        </Col>
                        <Col>
                            <Form.Control value={elt[1]} name={ind} onChange={handleInstruChange}/>
                        </Col>
                    </Row>
                ))}
                <Button variant="outline-primary" size="sm" onClick={ajouterInstru}>Ajouter instrument</Button>

                <h3 className="mt-3">Relations</h3>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">Co</Form.Label>
                    <Col sm="10">
                        <DropDownSelect options={optionsC} open={openC} setOpen={setOpenC} selected={selectedC} setSelected={setSelectedC} single={true} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label column sm="2">Parrain(s)</Form.Label>
                    <Col sm="10">
                        <DropDownSelect options={optionsP} open={openP} setOpen={setOpenP} selected={selectedP} setSelected={setSelectedP} single={false} />
                    </Col>
                </Form.Group>

                <div className="d-flex gap-2 mt-3">
                    <Button variant="success" onClick={validerModifierInfos}>Valider</Button>
                    <Button variant="danger" onClick={() => setIsGestion(false)}>Annuler</Button>
                </div>
            </Form>
            }
    </>
    );
}