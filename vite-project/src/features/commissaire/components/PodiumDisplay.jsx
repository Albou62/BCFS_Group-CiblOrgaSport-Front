import React from 'react';

function PodiumDisplay({ podium }) {
  if (!podium || podium.length === 0) return null;

  const formatResult = (raw, item) => {
    if (item && item.score !== null && item.score !== undefined) {
      return item.score.toString();
    }
    if (!raw || raw === "00:00:00") return "-";
    return raw.split(':').pop().replace(/^0+(?=\d)/, '') || '0';
  };

  return (
    <div style={{ marginTop: '3rem', padding: '2rem', background: 'linear-gradient(to bottom, #f1f5f9, #fff)', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
      <h3 style={{ textAlign: 'center', color: '#1e293b', fontSize: '1.5rem', marginBottom: '2rem', textTransform: 'uppercase', fontWeight: 'bold' }}>🏆 Podium Officiel</h3>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', minHeight: '250px' }}>

        {/* 2ème PLACE (Argent) - Index 1 */}
        <div style={{ textAlign: 'center', width: '110px' }}>
          {podium.length >= 2 ? (
            <>
              <div style={{ fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>{podium[1].nom}</div>
              <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>
                {formatResult(podium[1].resultat, podium[1])} {/* CORRIGÉ : index 1 partout */}
              </div>
              <div style={{ height: '90px', background: 'linear-gradient(180deg, #94a3b8 0%, #cbd5e1 100%)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>2</div>
              <div style={{ fontSize: '2rem', marginTop: '5px' }}>🥈</div>
            </>
          ) : <div style={{ width: '110px' }}></div>}
        </div>

        {/* 1ère PLACE (Or) - Index 0 */}
        <div style={{ textAlign: 'center', width: '130px' }}>
          {podium.length >= 1 && (
            <>
              <div style={{ fontSize: '2.5rem', marginBottom: '-5px' }}>👑</div>
              <div style={{ fontWeight: 'bold', color: '#854d0e', fontSize: '1.2rem', marginBottom: '4px' }}>{podium[0].nom}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#a16207', marginBottom: '8px' }}>
                {formatResult(podium[0].resultat, podium[0])} {/* CORRIGÉ : index 0 partout */}
              </div>
              <div style={{ height: '130px', background: 'linear-gradient(180deg, #eab308 0%, #facc15 100%)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3.5rem', color: 'white', boxShadow: '0 10px 15px rgba(0,0,0,0.2)', border: '2px solid white' }}>1</div>
              <div style={{ fontSize: '2.5rem', marginTop: '5px' }}>🥇</div>
            </>
          )}
        </div>

        {/* 3ème PLACE (Bronze) - Index 2 */}
        <div style={{ textAlign: 'center', width: '110px' }}>
          {podium.length >= 3 ? (
            <>
              <div style={{ fontWeight: 'bold', color: '#7c2d12', marginBottom: '4px' }}>{podium[2].nom}</div>
              <div style={{ fontSize: '1rem', color: '#9a3412', fontWeight: '600', marginBottom: '8px' }}>
                {formatResult(podium[2].resultat, podium[2])}
              </div>
              <div style={{ height: '65px', background: 'linear-gradient(180deg, #c2410c 0%, #fb923c 100%)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>3</div>
              <div style={{ fontSize: '2rem', marginTop: '5px' }}>🥉</div>
            </>
          ) : <div style={{ width: '110px' }}></div>}
        </div>

      </div>
    </div>
  );
}

export default PodiumDisplay;