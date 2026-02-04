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
        minZoom: 5,   // Hạn chế thu nhỏ: không cho zoom ra xa hơn mức 9
        maxZoom: 22
      });

      map.current.on('error', (e) => {
        console.error('Lỗi Mapbox:', e);
      });

      map.current.on('load', () => {
      // Thêm source dữ liệu các khu vực
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
            0, 0.4,    // Zoom nhỏ: opacity thấp hơn
            10, 0.6,   // Zoom trung bình: opacity bình thường
            15, 0.7    // Zoom lớn: opacity cao hơn
          ]
        }
      });

      // Thêm layer viền cho các khu vực
      map.current.addLayer({
        id: 'districts-outline',
        type: 'line',
        source: 'districts',
        minzoom: 0,
        maxzoom: 24,
        paint: {
          'line-color': '#fff',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,      // Zoom nhỏ: đường mỏng
            10, 2,     // Zoom trung bình: đường vừa
            15, 3      // Zoom lớn: đường dày hơn
          ]
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

      // Fit bounds với padding để không sát mép
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15 // Giới hạn zoom tối đa khi fit bounds
      });

      // Xử lý click vào khu vực: popup + focus/scroll card bên trái
      map.current.on('click', 'districts-fill', (e) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          const district = feature.properties;

          const cardIndex = feature.id != null
            ? Number(feature.id)
            : districtsData.features.findIndex(
                (f) => f.properties?.id === feature.properties?.id || String(f.properties?.name) === String(feature.properties?.name)
              );
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
            { key: 'landArea', keyAlt: 'land_area', label: 'Land Area' },
            { key: 'rentalRate', keyAlt: 'rental_rate', label: 'Rental Rate' },
            { key: 'moveInDate', keyAlt: 'move_in_date', label: 'Move-in Date' }
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
          
          const popup = new mapboxgl.Popup({
            maxWidth: '400px',
            closeButton: true,
            closeOnClick: true,
            anchor: 'bottom',
            offset: [0, -10],
            className: 'custom-popup'
          })
            .setLngLat(e.lngLat)
            .setHTML(popupHTML);

          popup.once('open', () => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const el = popup.getElement();
                if (el) el.classList.add('is-positioned');
              });
            });
          });
          popup.addTo(map.current);
        }
      });

      // Thay đổi cursor khi hover
      map.current.on('mouseenter', 'districts-fill', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'districts-fill', () => {
        map.current.getCanvas().style.cursor = '';
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

  return (
    <div className="app-layout">
      <aside className="list-panel">
        <div className="list-panel__inner">
          {features.map((feature, index) => (
            <div key={feature.properties?.id ?? feature.id ?? index} id={`card-${index}`}>
              <DistrictCard
                district={feature.properties || {}}
                isSelected={selectedCardIndex === index}
                onClick={() => setSelectedCardIndex(index)}
              />
            </div>
          ))}
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
