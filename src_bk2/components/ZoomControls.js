import React from 'react';
import mapboxgl from 'mapbox-gl';
import districtsData from '../data/districts.json';

const ZoomControls = ({ map }) => {
  const zoomIn = () => {
    if (map && map.current) {
      map.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (map && map.current) {
      map.current.zoomOut();
    }
  };

  const fitBounds = () => {
    if (map && map.current) {
      // Lấy bounds từ districts data
      const bounds = new mapboxgl.LngLatBounds();
      
      districtsData.features.forEach((feature) => {
        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0].forEach((coord) => {
            bounds.extend(coord);
          });
        }
      });

      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000
      });
    }
  };

  const btnBase = {
    width: '40px',
    height: '40px',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  };

  return (
    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        type="button"
        onClick={zoomIn}
        title="Phóng to"
        aria-label="Phóng to"
        style={{ ...btnBase, background: 'white', color: '#334155' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
      >
        +
      </button>
      <button
        type="button"
        onClick={zoomOut}
        title="Thu nhỏ"
        aria-label="Thu nhỏ"
        style={{ ...btnBase, background: 'white', color: '#334155' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
      >
        −
      </button>
      <button
        type="button"
        onClick={fitBounds}
        title="Xem toàn bộ bản đồ"
        aria-label="Xem toàn bộ bản đồ"
        style={{ ...btnBase, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none' }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        ⊞
      </button>
    </div>
  );
};

export default ZoomControls;
