import React from 'react';

const CARD_FIELDS = [
  { key: 'landArea', keyAlt: 'land_area', label: 'Total Land Area' },
  { key: 'rentalRate', keyAlt: 'rental_rate', label: 'Rental Rate' },
  { key: 'leaseTerm', keyAlt: 'lease_term', label: 'Lease Term' },
  { key: 'moveInDate', keyAlt: 'move_in_date', label: 'Lease Move-in Date' }
];

const formatValue = (v) => {
  if (v == null) return '—';
  if (typeof v === 'number') return Number.isInteger(v) ? Number(v).toLocaleString() : String(v);
  return String(v);
};

const DistrictCard = ({ district, isSelected, onClick, displayOrder }) => {
  const detailUrl = district.link || district.url || district.website || '#';

  const rows = CARD_FIELDS.map(({ key, keyAlt, label }) => {
    const value = district[key] ?? district[keyAlt];
    if (value == null || value === '') return null;
    return (
      <div key={key} className="popup-card__row">
        <span className="popup-card__label">{label}</span>
        <span className="popup-card__value">{formatValue(value)}</span>
      </div>
    );
  }).filter(Boolean);

  return (
    <article
      className={`list-card ${isSelected ? 'list-card--selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="popup-card__inner">
        {district.image && (
          <div className="popup-card__image-wrap">
            {district.type && <span className="popup-card__image-badge">{district.type}</span>}
            <img src={district.image} alt={district.name || 'Hình ảnh'} />
          </div>
        )}
        <div className="popup-card__body">
          {district.name && (
            <h3 className="popup-card__title">
              {displayOrder != null && <span className="popup-card__order">{displayOrder}.</span>}
              {district.name}
            </h3>
          )}
          <div className="popup-card__fields">{rows}</div>
          <a
            href={detailUrl}
            className="popup-card__btn"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Xem chi tiết
          </a>
        </div>
      </div>
    </article>
  );
};

export default DistrictCard;
