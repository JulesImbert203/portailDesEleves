// src/components/blocs/BlocSondage.jsx
import { useEffect, useState } from 'react';
import { obtenirDataUser, verifierSuperutilisateur } from '../../api/api_utilisateurs';
import { obtenirSondageDuJour, voterSondage } from '../../api/api_sondages';
import { obtenirIdUser } from '../../api/api_global';
import { useLayout } from './../../layouts/Layout';
import { useNavigate } from 'react-router-dom';
import { Card, Button, ProgressBar } from 'react-bootstrap';

export default function BlocSondage({ reloadSondage }) {
  const [sondage, setSondage] = useState(null);
  const [loading, setLoading] = useState(true);
  const { reloadBlocSondage } = useLayout();
  const [voteUser, setVoteUser] = useState(null);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const navigate = useNavigate();

  const voterEtReload = async (id_vote) => {
    try {
      await voterSondage(id_vote);  // Attendre la fin du vote
      reloadBlocSondage();  // Recharger le sondage
    } catch (error) {
      console.error("Erreur lors du vote et du rechargement du sondage", error);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const check = await verifierSuperutilisateur()
      setIsSuperUser(check.is_superuser)
    }
    checkUser()
  })

  useEffect(() => {
    async function fetchSondageAndVote() {
      setLoading(true);
      try {
        const id_user = await obtenirIdUser();
        if (id_user) {
          const data_user = await obtenirDataUser(id_user);
          if (data_user) {
            setVoteUser(data_user.vote_sondaj_du_jour);
          }
        }
        const data_sondage = await obtenirSondageDuJour();
        setSondage(data_sondage);
      } catch (error) {
        console.error("Erreur lors de la récupération des données du sondage ou du vote :", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSondageAndVote();
  }, [reloadSondage]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  let content;

  if (sondage.is_sondage) {
    if (voteUser === null) {
      content = (
        <>
          <p className="h3 fw-bold">{sondage.question}</p>
          <div className="d-grid gap-2">
            {sondage.reponses.map((reponse, index) => (
              <Button variant="primary" key={index} onClick={() => voterEtReload(index + 1)}>
                {reponse}
              </Button>
            ))}
          </div>
        </>
      );
    } else {
      content = (
        <>
          <p className="h3 fw-bold">{sondage.question}</p>
          <div>
            {(() => {
              const totalVotes = sondage.votes.reduce((sum, v) => sum + v, 0);
              return sondage.reponses.map((reponse, index) => {
                const votes = sondage.votes[index];
                const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="d-flex justify-content-between">
                      <p>{reponse}</p>
                      <p className="text-muted"> {votes} votes ({percent.toFixed(1)}%)</p>
                    </div>
                    <ProgressBar now={percent} />
                  </div>
                );
              });
            })()}

          </div>
        </>
      );
    }
  } else {
    content = (
      <>
        <p className="h4 fw-bold text-center">Pas de sondage aujourd'hui</p>
        <Button variant='light border' onClick={() => navigate("/sondage/proposer")} style={{cursor : "pointer"}}>
          <img src="/assets/icons/plus.svg" alt="Bouton en forme de plus" style={{ width: "70px", transition: "transform 0.2s ease"}} />
          <p className="h6 text-center">Proposer un nouveau sondage</p>
        </Button>
      </>
    );
  }

  return (
    <Card className="bloc-global">
      <Card.Header as="h5" className="text-center">Sondage du jour</Card.Header>
      <Card.Body>
        {content}
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between">
        <Button
          variant="light"
          onClick={() => navigate("/sondage/proposer")}
        >
          <img src="/assets/icons/plus.svg" alt="Bouton en forme de plus" style={{ filter: "brightness(0) saturate(100%)", transition: "transform 0.2s ease" }} />
        </Button>
        {isSuperUser && <Button
          variant="light"
          onClick={() => navigate("/sondage/gerer")}
        >
          <img src="/assets/icons/manage.svg" alt="Bouton en rouage" style={{ filter: "brightness(0) saturate(100%)", transition: "transform 0.2s ease" }} />
        </Button>}
      </Card.Footer>
    </Card>
  );


}
