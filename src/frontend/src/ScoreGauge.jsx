import React from 'react';

const ScoreGauge = ({ score }) => {
    // Score is 0-100
    // Angle mapping: 0 -> -90deg, 100 -> 90deg
    const angle = (score / 100) * 180 - 90;

    let color = "#ef4444"; // Red
    let text = "Low Match";
    if (score >= 40) {
        color = "#eab308"; // Yellow
        text = "Medium Match";
    }
    if (score >= 70) {
        color = "#22c55e"; // Green
        text = "High Match";
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ position: 'relative', width: '200px', height: '100px', overflow: 'hidden' }}>
                {/* Background Arc */}
                <div style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    border: '20px solid #334155',
                    position: 'absolute',
                    top: '0',
                    left: '10px',
                    boxSizing: 'border-box'
                }}></div>

                {/* Colored Zones (Simplified visual) */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '10px',
                    width: '180px',
                    height: '90px',
                    background: `conic-gradient(from 270deg, #ef4444 0deg 72deg, #eab308 72deg 126deg, #22c55e 126deg 180deg)`,
                    borderTopLeftRadius: '90px',
                    borderTopRightRadius: '90px',
                    opacity: 0.3
                }}></div>

                {/* Needle */}
                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '50%',
                    width: '4px',
                    height: '80px',
                    background: '#f8fafc',
                    transformOrigin: 'bottom center',
                    transform: `translateX(-50%) rotate(${angle}deg)`,
                    transition: 'transform 1s ease-out',
                    borderRadius: '2px',
                    zIndex: 10
                }}></div>

                {/* Center Pivot */}
                <div style={{
                    position: 'absolute',
                    bottom: '-10px',
                    left: '50%',
                    width: '20px',
                    height: '20px',
                    background: '#f8fafc',
                    borderRadius: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 11
                }}></div>
            </div>

            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: color }}>{score}%</div>
                <div style={{ fontSize: '14px', color: '#94a3b8' }}>{text}</div>
            </div>
        </div>
    );
};

export default ScoreGauge;
