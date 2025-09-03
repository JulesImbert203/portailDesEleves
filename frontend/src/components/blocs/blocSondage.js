// src/components/blocs/BlocSondage.jsx
import React, { useEffect, useState } from 'react';
import {obtenirDataUser } from '../../api/api_utilisateurs';
import {obtenirSondageDuJour, voterSondage} from '../../api/api_sondages';
import { obtenirIdUser } from '../../api/api_global';
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

  let content;

  if (sondage.is_sondage) {
    if (voteUser === null) {
      content = (
        <>
          <h3 className='sondage_titre'>Sondage du jour</h3>
          <p className='sondage_question'>{sondage.question}</p>
          <div className='sondage_reponses_container'>
            {sondage.reponses.map((reponse, index) => (
              <button className='sondage_reponse' key={index} onClick={() => voterEtReload(index + 1)}>
                {reponse}
              </button>
            ))}
          </div>
        </>
      );
    } else {
      content = (
        <>
          <h3 className='sondage_titre'>Sondage du jour</h3>
          <p className='sondage_question'>{sondage.question}</p>
          <div>
            {(() => {
              const totalVotes = sondage.votes.reduce((sum, v) => sum + v, 0);
              return sondage.reponses.map((reponse, index) => {
                const votes = sondage.votes[index];
                const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                const isUserVote = voteUser === index + 1;
                return (
                  <div key={index}>
                    <div className='sondage_question_stats_container'>
                      <p className='sondage_question_post_vote'>{reponse}</p>
                      <p className='sondage_stats_question'> {votes} votes ({percent.toFixed(1)}%)</p>
                    </div>
                    <div className='sondage_progress_bar_empty'>
                      <div style={{
                        background: '#035BA2',
                        width: `${percent}%`,
                        height: '100%',
                        borderRadius: '4px'
                      }} />
                    </div>
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
        <h3 className='sondage_question'>Pas de sondage aujourd'hui</h3>
        <div className='sondage_gros_plus_container' onClick={() => setCurrentComponent(<ProposerSondage />)}>
          <img className='sondage_gros_plus' src="assets/icons/plus.svg" />
        </div>
      </>
    );
  }

  return (
    <div className="bloc-global">
      {content}
      <div className="gestion_sondage_container">
        <button
          className="gestion_sondage_button"
          onClick={() => setCurrentComponent(<ProposerSondage />)}
        >
          <img src="assets/icons/plus.svg" className='sondage_icon_button'/>
        </button>
        <button
          className="gestion_sondage_button"
          onClick={() => setCurrentComponent(<GererSondages />)}
        >
          <img src="assets/icons/manage.svg" className='sondage_icon_button'/>
        </button>
      </div>
    </div>
  );

  
}
