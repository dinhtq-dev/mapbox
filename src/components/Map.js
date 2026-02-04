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
  const buttonMarkersRef = useRef([]);
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
        // bearing: 25,   // Xoay map: 0 = Bắc lên trên, 25 = xoay theo chiều kim đồng hồ (nhìn từ hướng Tây Bắc)
        // pitch: 0,     // 0 = nhìn vuông góc từ trên xuống (không nghiêng)
        // minZoom: 14,   // Hạn chế thu nhỏ: không cho zoom ra xa hơn mức 9
        // maxZoom: 22
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
            0, 0.25,    // Zoom nhỏ: mờ nhẹ
            10, 0.4,   // Zoom trung bình: mờ vừa
            15, 0.55   // Zoom lớn: vẫn hơi mờ
          ]
        }
      });

      // Layer viền mặc định (mỏng, màu theo từng block)
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

      // Source + layer viền nổi bật khi hover hoặc click (vẽ riêng 1 block lên trên)
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

      // Nút (button) tại tâm mỗi block — click mở popup
      const getPolygonCentroid = (ring) => {
        if (!ring || ring.length === 0) return [0, 0];
        let sumLng = 0, sumLat = 0, n = ring.length;
        for (let i = 0; i < n; i++) {
          sumLng += ring[i][0];
          sumLat += ring[i][1];
        }
        return [sumLng / n, sumLat / n];
      };
      // Chỉ show button khi properties có field buttonName (khai báo trong JSON)
      const seenIds = new Set();
      const buttonPoints = (districtsData.features || [])
        .filter((f) => {
          const props = f.properties || {};
          const hasButtonName = props.buttonName != null && String(props.buttonName).trim() !== '';
          if (!hasButtonName) return false;
          if (f.geometry?.type !== 'Polygon' || !f.geometry.coordinates?.[0]?.length) return false;
          const id = f.id ?? props.id;
          if (seenIds.has(id)) return false;
          seenIds.add(id);
          return true;
        })
        .map((f) => {
          const coords = f.geometry.coordinates[0];
          return {
            type: 'Feature',
            id: f.id,
            geometry: { type: 'Point', coordinates: getPolygonCentroid(coords) },
            properties: { ...(f.properties || {}) }
          };
        });
      // Nút HTML: dạng pill, padding theo text, 1 button/block (chỉ khi có buttonName)
      const allFeatures = districtsData.features || [];
      const buttonMarkers = [];
      buttonPoints.forEach((point) => {
        const fullFeature = allFeatures.find(
          (f) => Number(f.id) === Number(point.id) || f.properties?.id === point.properties?.id
        );
        if (!fullFeature) return;
        const coords = point.geometry.coordinates;
        const color = point.properties?.color || '#64748b';
        const label = String(point.properties?.buttonName || '').trim() || 'Xem';
        const el = document.createElement('button');
        el.className = 'map-block-button';
        el.type = 'button';
        el.style.borderColor = color;
        // Thêm text vào button
        const buttonText = document.createTextNode(label);
        el.appendChild(buttonText);
        // Thêm mũi tên chỉ xuống - có viền và màu nền
        const arrowWrapper = document.createElement('span');
        arrowWrapper.className = 'map-block-button-arrow-wrapper';
        
        // Mũi tên viền (lớn hơn, màu border)
        const arrowBorder = document.createElement('span');
        arrowBorder.className = 'map-block-button-arrow-border';
        arrowBorder.style.borderTopColor = color;
        
        // Mũi tên nền (nhỏ hơn, màu trắng)
        const arrowFill = document.createElement('span');
        arrowFill.className = 'map-block-button-arrow-fill';
        
        arrowWrapper.appendChild(arrowBorder);
        arrowWrapper.appendChild(arrowFill);
        el.appendChild(arrowWrapper);
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          setHighlightBorder(fullFeature);
          openPopupForFeature(fullFeature, coords);
        });
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(coords)
          .addTo(map.current);
        buttonMarkers.push(marker);
      });
      buttonMarkersRef.current = buttonMarkers;

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

      // Popup hiện tại (đóng trước khi mở cái mới)
      let currentPopup = null;

      // Hàm: vẽ viền border quanh 1 block (dùng khi hover hoặc click)
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

      const openPopupForFeature = (feature, lngLat) => {
        const district = feature.properties || {};
        const featureIndex = allFeatures.findIndex(
          (f) => Number(f.id) === Number(feature.id) || (f.properties?.id != null && f.properties.id === feature.properties?.id)
        );
        const cardIndex = featureIndex >= 0 ? featureIndex : Number(feature.id) - 1;
        if (cardIndex >= 0) {
          setSelectedCardIndex(cardIndex);
          requestAnimationFrame(() => {
            const cardEl = document.getElementById(`card-${cardIndex}`);
            if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
        }
        const fieldsHTML = CARD_FIELDS.map(({ key, keyAlt, label }) => {
          const value = district[key] ?? district[keyAlt];
          if (value == null || value === '') return '';
          return `<div class="popup-card__row"><span class="popup-card__label">${escape(label)}</span><span class="popup-card__value">${escape(formatValue(value))}</span></div>`;
        }).filter(Boolean).join('');
        const detailUrl = district.link || district.url || district.website || '#';
        const imgUrl = district.image ? String(district.image).trim() : '';
        const popupHTML = `
          <div class="popup-card">
            <div class="popup-card__inner">
              ${imgUrl ? `<div class="popup-card__image-wrap">${district.type ? `<span class="popup-card__image-badge">${escape(district.type)}</span>` : ''}<img src="${escape(imgUrl)}" alt="${escape(district.name || '')}" loading="lazy" onerror="this.style.display='none'" /></div>` : ''}
              <div class="popup-card__body">
                ${district.name ? `<h3 class="popup-card__title">${escape(district.name)}</h3>` : ''}
                <div class="popup-card__fields">${fieldsHTML}</div>
                <a href="${escape(detailUrl)}" class="popup-card__btn" target="_blank" rel="noopener noreferrer">Xem chi tiết</a>
              </div>
            </div>
          </div>
        `;
        if (currentPopup) {
          currentPopup.remove();
          currentPopup = null;
        }

        if (district.name) {
          const popup = new mapboxgl.Popup({
            maxWidth: '400px',
            closeButton: true,
            closeOnClick: false,
            anchor: 'bottom',
            offset: [0, -10],
            className: 'custom-popup'
          })
            .setLngLat(lngLat)
            .setHTML(popupHTML || '<div class="popup-card"><div class="popup-card__body"><p>Không có thông tin</p></div></div>');
          popup.once('open', () => {
            requestAnimationFrame(() => {
              const el = popup.getElement();
              if (el) {
                el.classList.add('is-positioned');
                const content = el.querySelector('.mapboxgl-popup-content');
                if (content) content.classList.add('is-positioned');
              }
            });
          });
          popup.addTo(map.current);
          currentPopup = popup;
        };
        }
        

      // Hover: đưa chuột vào block → pointer, hiện viền block
      map.current.on('mousemove', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['districts-fill']
        });
        if (features.length > 0) {
          map.current.getCanvas().style.cursor = 'pointer';
          setHighlightBorder(features[0]);
        } else {
          map.current.getCanvas().style.cursor = '';
          clearHighlightBorder();
        }
      });

      // Rời chuột khỏi vùng block → ẩn viền
      map.current.on('mouseleave', 'districts-fill', () => {
        map.current.getCanvas().style.cursor = '';
        clearHighlightBorder();
      });

      // Xử lý click vào block (fill) → show popup (click vào nút HTML xử lý trong marker)
      // map.current.on('click', (e) => {
      //   const features = map.current.queryRenderedFeatures(e.point, { layers: ['districts-fill'] });
      //   if (features.length === 0) return;
      //   const feature = features[0];
      //   if (!feature || !feature.properties) return;
      //   setHighlightBorder(feature);
      //   openPopupForFeature(feature, e.lngLat);
      // });
      });
    } catch (error) {
      console.error('Lỗi khi khởi tạo map:', error);
    }

    // Cleanup
    return () => {
      buttonMarkersRef.current.forEach((m) => m.remove());
      buttonMarkersRef.current = [];
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
