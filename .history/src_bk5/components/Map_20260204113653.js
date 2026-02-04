import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import districtsData from '../data/districts.json';
import ZoomControls from './ZoomControls';
import DistrictCard from './DistrictCard';

// Lưu ý: Bạn cần thay thế token này bằng Mapbox token của bạn
// Đăng ký miễn phí tại: https://account.mapbox.com/
// Token mặc định này có thể không hoạt động, bạn cần đăng ký và lấy token của riêng mình
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'YOUR_TOKEN_HERE') {
  console.error('Vui lòng cấu hình Mapbox token trong file .env hoặc Map.js');
}

mapboxgl.accessToken = MAPBOX_TOKEN;

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);

  useEffect(() => {
    if (map.current) return; // Khởi tạo map chỉ một lần

    if (!mapContainer.current) {
      console.error('Map container không tồn tại');
      return;
    }

    // Khởi tạo map
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11', // Style miễn phí
        center: [105.85, 21.05], // Tọa độ trung tâm (sẽ được override bởi fitBounds)
        zoom: 10,
        bearing: 25,   // Xoay map: 0 = Bắc lên trên, 25 = xoay theo chiều kim đồng hồ (nhìn từ hướng Tây Bắc)
        pitch: 0,     // 0 = nhìn vuông góc từ trên xuống (không nghiêng)
        minZoom: 14,   // Hạn chế thu nhỏ: không cho zoom ra xa hơn mức 9
        maxZoom: 22
      });

      map.current.on('error', (e) => {
        console.error('Lỗi Mapbox:', e);
      });

      map.current.on('load', () => {
      // Thêm source dữ liệu các khu vực (GeoJSON có top-level "id" cho từng feature)
      map.current.addSource('districts', {
        type: 'geojson',
        data: districtsData
      });

      // Thêm layer để tô màu các khu vực
      // Không giới hạn zoom - hiển thị ở mọi mức zoom
      map.current.addLayer({
        id: 'districts-fill',
        type: 'fill',
        source: 'districts',
        minzoom: 0,  // Hiển thị từ zoom 0 (toàn cầu)
        maxzoom: 24, // Đến zoom 24 (chi tiết nhất)
        paint: {
          'fill-color': [
            'get',
            'color'
          ],
          'fill-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.25,    // Zoom nhỏ: mờ nhẹ
            10, 0.4,   // Zoom trung bình: mờ vừa
            15, 0.55   // Zoom lớn: vẫn hơi mờ
          ]
        }
      });

      // Layer viền mặc định (mỏng, màu nhạt)
      map.current.addLayer({
        id: 'districts-outline',
        type: 'line',
        source: 'districts',
        minzoom: 0,
        maxzoom: 24,
        paint: {
          'line-color': ['get', 'color'],
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            0, 1.5,
            10, 2,
            15, 3
          ],
          'line-opacity': 0.8
        }
      });

      // Source + layer viền nổi bật khi hover/click (vẽ riêng 1 feature lên trên)
      map.current.addSource('districts-highlight', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.current.addLayer({
        id: 'districts-highlight-outline',
        type: 'line',
        source: 'districts-highlight',
        minzoom: 0,
        maxzoom: 24,
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 5,
          'line-opacity': 1
        }
      });

      // Thêm layer labels (tên khu vực)
      map.current.addLayer({
        id: 'districts-labels',
        type: 'symbol',
        source: 'districts',
        minzoom: 0,
        maxzoom: 24,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 10,     // Zoom nhỏ: chữ nhỏ
            10, 14,    // Zoom trung bình: chữ vừa
            15, 18     // Zoom lớn: chữ lớn hơn
          ],
          'text-allow-overlap': false,
          'text-ignore-placement': false
        },
        paint: {
          'text-color': '#333',
          'text-halo-color': '#fff',
          'text-halo-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            10, 2,
            15, 3
          ]
        }
      });

      // Tự động zoom để hiển thị tất cả khu vực
      const bounds = new mapboxgl.LngLatBounds();
      districtsData.features.forEach((feature) => {
        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0].forEach((coord) => {
            bounds.extend(coord);
          });
        }
      });

      // Fit bounds với padding, giữ góc xoay mặc định (nhìn vuông góc từ trên, map xoay hướng)
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15,
        bearing: -70,  // Giữ xoay map theo hướng đã chọn
        pitch: 0      // Nhìn thẳng từ trên xuống
      });

      // Hàm vẽ viền border quanh 1 block (hover hoặc click)
      const setHighlightBorder = (feature) => {
        if (!feature || !feature.geometry) return;
        const src = map.current.getSource('districts-highlight');
        if (!src) return;
        const color = (feature.properties && feature.properties.color) || '#2563eb';
        src.setData({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: { color }, geometry: feature.geometry }]
        });
      };
      const clearHighlightBorder = () => {
        const src = map.current.getSource('districts-highlight');
        if (src) src.setData({ type: 'FeatureCollection', features: [] });
      };

      // Hover: đưa chuột vào block thì hiện viền
      map.current.on('mousemove', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['districts-fill'] });
        if (features.length > 0) {
          map.current.getCanvas().style.cursor = 'pointer';
          setHighlightBorder(features[0]);
        } else {
          map.current.getCanvas().style.cursor = '';
          clearHighlightBorder();
        }
      });

      // Rời chuột khỏi vùng map (khu vực vẽ) thì ẩn viền
      map.current.on('mouseleave', 'districts-fill', () => {
        map.current.getCanvas().style.cursor = '';
        clearHighlightBorder();
      });

      // Xử lý click vào khu vực: popup + focus/scroll card bên trái + giữ viền quanh block đó
      map.current.on('click', 'districts-fill', (e) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          setHighlightBorder(feature);
          const district = feature.properties;

          const features = districtsData.features || [];
          const featureIndex = features.findIndex(
            (f) => Number(f.id) === Number(feature.id)
              || (f.properties?.id != null && f.properties.id === feature.properties?.id)
          );
          const cardIndex = featureIndex >= 0 ? featureIndex : (Number(feature.id) - 1);
          if (cardIndex >= 0) {
            setSelectedCardIndex(cardIndex);
            requestAnimationFrame(() => {
              const cardEl = document.getElementById(`card-${cardIndex}`);
              if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
          }

          const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
          const formatValue = (v) => {
            if (v == null) return '—';
            if (typeof v === 'number') return Number.isInteger(v) ? Number(v).toLocaleString() : String(v);
            return String(v);
          };

          const CARD_FIELDS = [
            { key: 'landArea', keyAlt: 'land_area', label: 'Total Land Area' },
            { key: 'rentalRate', keyAlt: 'rental_rate', label: 'Rental Rate' },
            { key: 'leaseTerm', keyAlt: 'lease_term', label: 'Lease Term' },
            { key: 'moveInDate', keyAlt: 'move_in_date', label: 'Lease Move-in Date' }
          ];
          const fieldsHTML = CARD_FIELDS.map(({ key, keyAlt, label }) => {
            const value = district[key] ?? district[keyAlt];
            if (value == null || value === '') return '';
            return `
              <div class="popup-card__row">
                <span class="popup-card__label">${escape(label)}</span>
                <span class="popup-card__value">${escape(formatValue(value))}</span>
              </div>
            `;
          }).filter(Boolean).join('');

          const detailUrl = district.link || district.url || district.website || '#';

          let popupHTML = `
            <div class="popup-card">
              <div class="popup-card__inner">
                ${district.image ? `
                  <div class="popup-card__image-wrap">
                    ${district.type ? `<span class="popup-card__image-badge">${escape(district.type)}</span>` : ''}
                    <img src="${district.image}" alt="${escape(district.name || 'Hình ảnh')}" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling && this.nextElementSibling.classList.add('popup-card__image-placeholder--show');" />
                    <div class="popup-card__image-placeholder" aria-hidden="true">Không tải được ảnh</div>
                  </div>
                ` : ''}
                <div class="popup-card__body">
                  <div class="popup-card__fields">
                    ${fieldsHTML}
                  </div>
                  <a href="${escape(detailUrl)}" class="popup-card__btn" target="_blank" rel="noopener noreferrer">Xem chi tiết</a>
                </div>
              </div>
            </div>
          `;

          if (district.name) {
            
          }
          
          const popup = new mapboxgl.Popup({
            maxWidth: '400px',
            closeButton: true,
            closeOnClick: true,
            anchor: 'bottom',
            offset: [0, -10],
            className: 'custom-popup'
          })
            .setLngLat(e.lngLat)
            .setHTML(district.name ? popupHTML : '');

          popup.once('open', () => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const el = popup.getElement();
                if (el && district.name) el.classList.add('is-positioned');
              });
            });
          });
          popup.addTo(district.name && map.current);
        }
      });
      });
    } catch (error) {
      console.error('Lỗi khi khởi tạo map:', error);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const features = districtsData.features || [];
  const featuresWithName = features
    .filter((f) => f.properties?.name)
    .sort((a, b) => {
      const na = String(a.properties?.name || '');
      const nb = String(b.properties?.name || '');
      const order = ['SX1', 'SX2', 'SX3', 'SX4'];
      const ia = order.indexOf(na);
      const ib = order.indexOf(nb);
      if (ia !== -1 && ib !== -1) return ia - ib;
      return na.localeCompare(nb);
    });

  return (
    <div className="app-layout">
      <aside className="list-panel">
        <div className="list-panel__inner">
          {featuresWithName.map((feature, displayIndex) => {
            const originalIndex = features.indexOf(feature);
            return (
              <div key={feature.properties?.id ?? feature.id ?? originalIndex} id={`card-${originalIndex}`}>
                <DistrictCard
                  district={feature.properties || {}}
                  isSelected={selectedCardIndex === originalIndex}
                  onClick={() => setSelectedCardIndex(originalIndex)}
                  displayOrder={displayIndex + 1}
                />
              </div>
            );
          })}
        </div>
      </aside>
      <div className="map-panel">
        <div ref={mapContainer} className="map-panel__map" />
        <ZoomControls map={map} />
      </div>
    </div>
  );
};

export default Map;
