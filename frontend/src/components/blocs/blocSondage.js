// src/components/blocs/BlocSondage.jsx
import React, { useEffect, useState } from 'react';
import {obtenirIdUser, obtenirDataUser, obtenirSondageDuJour, voterSondage } from '../../api';
import {useLayout} from './../../layouts/Layout';  
import ProposerSondage from '../pages/ProposerSondage';
import GererSondages from '../pages/GererSondages';

export default function BlocSondage({ reloadSondage }) {
  const [sondage, setSondage] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentComponent, reloadBlocSondage} = useLayout();
  const [voteUser, setVoteUser] = useState(null);
  const voterEtReload = async (id_vote) => {
    try {
      await voterSondage(id_vote);  // Attendre la fin du vote
      reloadBlocSondage();  // Recharger le sondage
    } catch (error) {
      console.error("Erreur lors du vote et du rechargement du sondage", error);
    }
  };
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

  if (sondage.is_sondage) {
    if (voteUser === null) {
      return (
        <div className="bloc-global">
          <h3>Sondage du jour</h3>
          <p>{sondage.question}</p>
          <div>
            {sondage.reponses.map((reponse, index) => (
              <button key={index} onClick={() => voterEtReload(index + 1)}>
                {reponse}
              </button>
            ))}
          </div>
          <button onClick={() => setCurrentComponent(<ProposerSondage />)}>
            Proposer un sondage
          </button>
          <button onClick={() => setCurrentComponent(<GererSondages />)}>
            Gerer les sondages
          </button>
        </div>
      );
    } else {
      return (
        <div className="bloc-global">
          <h3>Sondage du jour</h3>
          <p>{sondage.question}</p>
          <div>
            {sondage.reponses.map((reponse, index) => (
              <p key={index}>
                {reponse} - {sondage.votes[index]} votes
              </p>
            ))}
          </div>
          <button onClick={() => setCurrentComponent(<ProposerSondage />)}>
            Proposer un sondage
          </button>
          <button onClick={() => setCurrentComponent(<GererSondages />)}>
            Gerer les sondages
          </button>
        </div>
      );
    }
  } else {
    return (
      <div className="bloc-global">
        <h3>Pas de sondage Aujourd'hui </h3>
        <button className="bloc-global-button" onClick={() => setCurrentComponent(<ProposerSondage />)}>
          Proposer un sondage
        </button>
        <button className="bloc-global-button" onClick={() => setCurrentComponent(<GererSondages />)}>
          Gerer les sondages
        </button>
      </div>
    );
  }
  
}
