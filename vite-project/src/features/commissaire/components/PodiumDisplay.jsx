import React from 'react';

function PodiumDisplay({ podium }) {
  if (podium.length === 0) return null;

  return (
    <div style={{marginTop:'3rem', padding:'2rem', background:'linear-gradient(to bottom, #f0fdf4, #fff)', borderRadius:'16px', border:'1px solid #bbf7d0', boxShadow:'0 10px 25px -5px rgba(0, 0, 0, 0.1)'}}>
      <h3 style={{textAlign:'center', color:'#15803d', fontSize:'1.5rem', marginBottom:'2rem', textTransform:'uppercase', letterSpacing:'1px'}}>🏆 Podium Officiel</h3>
      <div style={{display:'flex', justifyContent:'center', alignItems:'flex-end', gap:'20px'}}>
        <div style={{textAlign:'center', width:'100px'}}>
          {podium.length >= 2 ? (
            <>
              <div style={{fontWeight:'bold', marginBottom:'5px', color:'#334155'}}>{podium[1].nom}</div>
              <div style={{fontSize:'0.9rem', color:'#64748b', marginBottom:'5px'}}>{podium[1].resultat}</div>
              <div style={{height:'80px', background:'linear-gradient(180deg, #94a3b8 0%, #cbd5e1 100%)', borderRadius:'8px 8px 0 0', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'2rem', color:'white', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}>2</div>
              <div style={{fontSize:'2rem'}}>🥈</div>
            </>
          ) : <div style={{width:'100px'}}></div>}
        </div>

        <div style={{textAlign:'center', width:'120px'}}>
          {podium.length >= 1 && (
            <>
              <div style={{fontSize:'2.5rem', marginBottom:'-10px'}}>👑</div>
              <div style={{fontWeight:'bold', color:'#b45309', fontSize:'1.1rem', marginBottom:'5px'}}>{podium[0].nom}</div>
              <div style={{fontSize:'1rem', fontWeight:'bold', marginBottom:'5px', color:'#b45309'}}>{podium[0].resultat}</div>
              <div style={{height:'120px', background:'linear-gradient(180deg, #eab308 0%, #facc15 100%)', borderRadius:'8px 8px 0 0', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'3rem', color:'white', boxShadow:'0 10px 15px rgba(0,0,0,0.2)', border:'2px solid white'}}>1</div>
              <div style={{fontSize:'2.5rem'}}>🥇</div>
            </>
          )}
        </div>

        <div style={{textAlign:'center', width:'100px'}}>
          {podium.length >= 3 ? (
            <>
              <div style={{fontWeight:'bold', marginBottom:'5px', color:'#7c2d12'}}>{podium[2].nom}</div>
              <div style={{fontSize:'0.9rem', color:'#9a3412', marginBottom:'5px'}}>{podium[2].resultat}</div>
              <div style={{height:'60px', background:'linear-gradient(180deg, #c2410c 0%, #fdba74 100%)', borderRadius:'8px 8px 0 0', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'1.5rem', color:'white', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}>3</div>
              <div style={{fontSize:'2rem'}}>🥉</div>
            </>
          ) : <div style={{width:'100px'}}></div>}
        </div>
      </div>
    </div>
  );
}

export default PodiumDisplay;
