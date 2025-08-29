import React, { useEffect, useState, useSyncExternalStore } from 'react';
import '../../assets/styles/asso.css';
import { chargerAsso, estUtilisateurDansAsso, ajouterContenu, changerPhoto } from './../../api';
import AssoInfo from './AssoInfo';
import AssoMembres from './AssoMembres';
import { useLayout } from '../../layouts/Layout';
import AssoEvents from './AssoEvents';

function Asso({ id }) {
    const [asso, setAsso] = useState(null);
    const [isMembreDansAsso, setIsMembreDansAsso] = useState(null);
    const [isMembreAutorise, setIsMembreAutorise] = useState(null);

    const [activeTab, setActiveTab] = useState("info");

    const [isBannerDarkened, setIsBannerDarkened] = useState(false);
    const [isPhotoDarkened, setIsPhotoDarkened] = useState(false);

    const { setCurrentComponent } = useLayout();

    const changerPhotoLogoOuBanniere = (type_photo) => {
        document.getElementById('file-upload').setAttribute("data-type", type_photo);
        document.getElementById('file-upload').click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0]; // Récupère le fichier sélectionné directement
        const type_photo = event.target.getAttribute("data-type");

        if (file) {
            console.log(`Fichier sélectionné (${type_photo}) :`, file.name);
            try {
                await ajouterContenu(id, file); // Téléversement 
                try {
                    await changerPhoto(id, type_photo, file.name);
                    setCurrentComponent(null);
                    setTimeout(() => {
                        setCurrentComponent(<Asso key={Date.now()} id={id} />);
                    }, 0);
                } catch (error) {
                    console.error(`Erreur : ${error}`);
                }
            } catch (error) {
                alert(`Erreur lors du téléversement : ${error.message}`);
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const assoData = await chargerAsso(id);
                const membreData = await estUtilisateurDansAsso(id);
                setAsso(assoData);
                setIsMembreDansAsso(membreData.is_membre);
                setIsMembreAutorise(membreData.autorise);
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
            }
        };
        fetchData();
    }, [id]);


    if (asso === null || isMembreDansAsso === null) return <p>Chargement...</p>;

    return (
        <div className="asso-container">

            {/* Champ de fichier caché */}
            <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }} // Caché
                onChange={handleFileChange} // Téléverse automatiquement après sélection
            />



            {/* Bannière avec logo */}
            <div
                className="asso-banner"
                style={{
                    backgroundImage: asso.banniere_path
                        ? `url(http://127.0.0.1:5000/upload/associations/${asso.nom_dossier}/${asso.banniere_path})`
                        : 'none', // Si la bannière n'existe pas, pas d'image de fond
                    backgroundColor: asso.banniere_path ? 'transparent' : 'var(--global-style-secondary-color)', // Si la bannière n'existe pas, couleur de fond
                }}
            >
                {/*Accessible pour modifier les photos de l'asso*/}
                {isMembreAutorise && (
                    <>
                        {/* Overlay qui s'affiche uniquement si isDarkened est true */}
                        {isBannerDarkened && <div className="asso-overlay-banner"></div>}
                        <img id='asso-add-photo-banner' src='/assets/icons/add_photo.svg'
                            onMouseEnter={() => setIsBannerDarkened(true)}
                            onMouseLeave={() => setIsBannerDarkened(false)}
                            onClick={() => changerPhotoLogoOuBanniere('banniere')}
                        />
                    </>
                )}

                <img
                    className="asso-logo"
                    src={
                        asso.img
                            ? `http://127.0.0.1:5000/upload/associations/${asso.nom_dossier}/${asso.img}`
                            : '/assets/icons/group.svg'
                    }
                    alt={asso.nom}
                />

                {/*Accessible pour modifier les photos de l'asso*/}
                {isMembreAutorise && (
                    <>
                        {isPhotoDarkened && <div className="asso-overlay-profilpic"></div>}
                        <img id='asso-add-photo-profilpic' src='/assets/icons/add_photo.svg'
                            onMouseEnter={() => setIsPhotoDarkened(true)}
                            onMouseLeave={() => setIsPhotoDarkened(false)}
                            onClick={() => changerPhotoLogoOuBanniere('logo')}
                            alt="Modifier photo"
                        />
                    </>
                )}

            </div>


            <div className='asso-infos-principales'>
                <h2 className='asso-nom'>{asso.nom}</h2>
                {/* Administration de l'asso */}
                {isMembreAutorise &&
                    <div className='asso-admin'>
                        {isMembreDansAsso && <div className='badge_est_dans_asso'><p>Vous êtes dans l'asso</p></div>}
                    </div>}
            </div>



            {/* Menu */}
            <div className="asso-tabs">
                <div className={`asso-tab ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>Infos</div>
                <div className={`asso-tab ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}>Événements</div>
                <div className={`asso-tab ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>Membres</div>
                <div className={`asso-tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>Publications</div>
            </div>

            {/* Contenu des onglets */}
            <div className="asso-tab-content">
                {activeTab === "info" && <AssoInfo asso_id={asso.id} />}
                {activeTab === "events" && <AssoEvents asso_id={asso.id} />}
                {activeTab === "members" && <AssoMembres asso_id={asso.id} />}
                {activeTab === "posts" && <p>Publications ici...</p>}
            </div>
        </div >
    );
}

export default Asso;
