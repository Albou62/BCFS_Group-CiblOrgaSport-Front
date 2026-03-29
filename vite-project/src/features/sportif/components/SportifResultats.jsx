import React, { useEffect, useState } from 'react';
import { getManchesByEpreuve, getResultatsByManche, getPodiumByManche } from '../../../services/competitionService';
import PodiumDisplay from '../../arbitrage/PodiumDisplay'; // On réutilise ton beau podium !

const SportifResultats = ({ token, epreuve, monAthleteId }) => {
    const [resultats, setResultats] = useState([]);
    const [podiumData, setPodiumData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!epreuve?.id) return;
            try {
                // 1. On récupère la dernière manche publiée
                const manches = await getManchesByEpreuve(token, epreuve.id);
                if (manches.length > 0) {
                    const derniereManche = manches[manches.length - 1];

                    // 2. On récupère les résultats et le podium en parallèle
                    const [list, podiumDto] = await Promise.all([
                        getResultatsByManche(token, derniereManche.id),
                        getPodiumByManche(token, derniereManche.id)
                    ]);

                    // 3. Formatage du podium (même logique que pour l'arbitre)
                    if (podiumDto) {
                        const formatMedal = (res) => {
                            if (!res) return null;
                            return {
                                ...res,
                                nom: res.nomAthlete || `Athlète #${res.athleteId}`,
                                resultat: res.temps && res.temps !== "00:00:00" ? res.temps : res.score?.toString()
                            };
                        };
                        setPodiumData([formatMedal(podiumDto.orResultat), formatMedal(podiumDto.argentResultat), formatMedal(podiumDto.bronzeResultat)].filter(Boolean));
                    }

                    setResultats(list);
                }
            } catch (err) {
                console.error("Erreur chargement résultats sportif:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [epreuve, token]);

    if (loading) return <p>Chargement de vos performances...</p>;
    if (resultats.length === 0) return <p>Les résultats ne sont pas encore publiés pour cette épreuve.</p>;

    return (
        <div style={{ padding: '1rem' }}>
            <h2 style={{ textAlign: 'center', color: '#1e293b' }}>📊 Classement Officiel : {epreuve.nom}</h2>

            {/* On affiche le podium pour l'ambiance */}
            <PodiumDisplay podium={podiumData} />

            <div style={{ marginTop: '2rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                        <tr>
                            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Rang</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Athlète</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Résultat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultats.map((res, index) => {
                            const isMe = res.athleteId === monAthleteId;
                            return (
                                <tr key={res.id} style={{
                                    backgroundColor: isMe ? '#f0f9ff' : 'transparent',
                                    fontWeight: isMe ? 'bold' : 'normal',
                                    borderBottom: '1px solid #e2e8f0'
                                }}>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {index + 1} {index === 0 && '🥇'}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {res.nomAthlete} {isMe && <span style={{ color: '#0ea5e9', marginLeft: '5px' }}>(Moi)</span>}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {res.temps && res.temps !== "00:00:00" ? res.temps.split(':').pop() : res.score}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SportifResultats;