import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './CoordinateHelper.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

mapboxgl.accessToken = MAPBOX_TOKEN;

const CoordinateHelper = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [coordinates, setCoordinates] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [geoJsonOutput, setGeoJsonOutput] = useState('');

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [105.85, 21.05], // Hà Nội
      zoom: 12
    });

    map.current.on('load', () => {
      // Thêm source cho polygon đang vẽ
      map.current.addSource('drawing', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Layer hiển thị polygon
      map.current.addLayer({
        id: 'drawing-fill',
        type: 'fill',
        source: 'drawing',
        paint: {
          'fill-color': '#FF6B6B',
          'fill-opacity': 0.3
        }
      });

      map.current.addLayer({
        id: 'drawing-outline',
        type: 'line',
        source: 'drawing',
        paint: {
          'line-color': '#FF6B6B',
          'line-width': 2
        }
      });

      // Xử lý click để thêm điểm
      map.current.on('click', (e) => {
        if (isDrawing) {
          const newCoord = [e.lngLat.lng, e.lngLat.lat];
          const newCoordinates = [...coordinates, newCoord];
          setCoordinates(newCoordinates);
          updateMap(newCoordinates);
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [coordinates, isDrawing]);

  const updateMap = (coords) => {
    if (coords.length < 3) return;

    // Đóng polygon bằng cách thêm điểm đầu vào cuối
    const closedCoords = [...coords, coords[0]];

    const geoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [closedCoords]
          }
        }
      ]
    };

    map.current.getSource('drawing').setData(geoJson);
    
    // Tạo output GeoJSON
    const output = JSON.stringify({
      type: 'Feature',
      properties: {
        name: 'Tên khu vực',
        type: 'Loại khu vực',
        color: '#FF6B6B'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [closedCoords]
      }
    }, null, 2);

    setGeoJsonOutput(output);
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setCoordinates([]);
    setGeoJsonOutput('');
    map.current.getSource('drawing').setData({
      type: 'FeatureCollection',
      features: []
    });
  };

  const finishDrawing = () => {
    if (coordinates.length < 3) {
      alert('Cần ít nhất 3 điểm để tạo polygon!');
      return;
    }
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    setCoordinates([]);
    setGeoJsonOutput('');
    setIsDrawing(false);
    map.current.getSource('drawing').setData({
      type: 'FeatureCollection',
      features: []
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(geoJsonOutput);
    alert('Đã copy GeoJSON vào clipboard!');
  };

  return (
    <div className="coordinate-helper">
      <div className="helper-header">
        <h2>🛠️ Công Cụ Lấy Tọa Độ</h2>
        <p>Click trên bản đồ để vẽ polygon và lấy tọa độ GeoJSON</p>
      </div>
      
      <div className="helper-controls">
        <button 
          onClick={startDrawing}
          className={`btn ${isDrawing ? 'active' : ''}`}
          disabled={isDrawing}
        >
          ✏️ Bắt đầu vẽ
        </button>
        <button 
          onClick={finishDrawing}
          className="btn"
          disabled={!isDrawing || coordinates.length < 3}
        >
          ✅ Hoàn thành
        </button>
        <button 
          onClick={clearDrawing}
          className="btn btn-danger"
        >
          🗑️ Xóa
        </button>
      </div>

      <div className="helper-content">
        <div className="map-section">
          <div ref={mapContainer} className="helper-map" />
          {isDrawing && (
            <div className="drawing-status">
              <span className="pulse"></span>
              Đang vẽ... Click trên bản đồ để thêm điểm ({coordinates.length} điểm)
            </div>
          )}
        </div>

        <div className="output-section">
          <h3>Kết quả:</h3>
          
          <div className="coordinates-list">
            <h4>Danh sách tọa độ ({coordinates.length} điểm):</h4>
            <div className="coords-display">
              {coordinates.map((coord, index) => (
                <div key={index} className="coord-item">
                  <span className="coord-index">{index + 1}</span>
                  <code>[{coord[0].toFixed(6)}, {coord[1].toFixed(6)}]</code>
                </div>
              ))}
            </div>
          </div>

          {geoJsonOutput && (
            <div className="geojson-output">
              <div className="output-header">
                <h4>GeoJSON Output:</h4>
                <button onClick={copyToClipboard} className="btn-copy">
                  📋 Copy
                </button>
              </div>
              <pre>{geoJsonOutput}</pre>
            </div>
          )}

          <div className="instructions">
            <h4>Hướng dẫn:</h4>
            <ol>
              <li>Click "Bắt đầu vẽ"</li>
              <li>Click trên bản đồ để thêm các điểm</li>
              <li>Click "Hoàn thành" khi đã vẽ xong</li>
              <li>Copy GeoJSON và paste vào file districts.json</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinateHelper;
