'use client';

import { useState, useEffect, useRef } from 'react';

interface AddressData {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

interface AddressModalProps {
  onUse: (address: AddressData) => void;
  onClose: () => void;
}

export default function AddressModal({ onUse, onClose }: AddressModalProps) {
  const [address, setAddress] = useState<AddressData>({
    street: '', number: '', complement: '',
    neighborhood: '', city: '', state: '', zip_code: '',
  });
  const [loading, setLoading] = useState(true);
  const numberRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      onClose();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=pt`,
            { headers: { 'User-Agent': 'shops-all/1.0' } }
          );
          const data = await res.json();
          const addr = data.address || {};

          const rawStreet = addr.road || addr.pedestrian || addr.street || '';
          const match = rawStreet.match(/^(.+?),\s*(\d+)$/);
          setAddress({
            street: match ? match[1].trim() : rawStreet,
            number: match ? match[2] : '',
            complement: '',
            neighborhood: addr.suburb || addr.neighbourhood || addr.district || '',
            city: addr.city || addr.town || addr.village || addr.municipality || '',
            state: addr.state ? addr.state.substring(0, 2).toUpperCase() : '',
            zip_code: addr.postcode || '',
          });
        } catch {
          onClose();
          return;
        } finally {
          setLoading(false);
        }
      },
      () => {
        onClose();
      },
      { timeout: 10000 }
    );
  }, [onClose]);

  useEffect(() => {
    if (!loading && numberRef.current) {
      const el = numberRef.current;
      el.focus();
      setTimeout(() => el.focus(), 300);
    }
  }, [loading]);

  const handleChange = (field: keyof AddressData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAddress(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (loading) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="address-modal" onClick={e => e.stopPropagation()}>
        <div className="address-modal-header">
          <h3>Usar endereço atual?</h3>
          <button className="address-modal-close" onClick={onClose}>&times;</button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Detectamos o endereço abaixo. Confirme o número e clique em "Usar Endereço".
        </p>
        <div className="address-modal-fields">
          <input
            placeholder="Rua"
            value={address.street}
            onChange={handleChange('street')}
            className="address-modal-input"
          />
          <input
            ref={numberRef}
            placeholder="Número"
            value={address.number}
            onChange={handleChange('number')}
            className="address-modal-input"
            inputMode="numeric"
          />
          <input
            placeholder="Complemento (opcional)"
            value={address.complement}
            onChange={handleChange('complement')}
            className="address-modal-input"
          />
          <input
            placeholder="Bairro"
            value={address.neighborhood}
            onChange={handleChange('neighborhood')}
            className="address-modal-input"
          />
          <input
            placeholder="Cidade"
            value={address.city}
            onChange={handleChange('city')}
            className="address-modal-input"
          />
          <div className="address-modal-row">
            <input
              placeholder="UF"
              value={address.state}
              onChange={handleChange('state')}
              className="address-modal-input"
              maxLength={2}
              style={{ flex: 1 }}
            />
            <input
              placeholder="CEP"
              value={address.zip_code}
              onChange={handleChange('zip_code')}
              className="address-modal-input"
              inputMode="numeric"
              style={{ flex: 2 }}
            />
          </div>
        </div>
        <div className="address-modal-actions">
          <button
            className="address-modal-btn address-modal-btn-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="address-modal-btn address-modal-btn-primary"
            onClick={() => onUse(address)}
          >
            Usar Endereço
          </button>
        </div>
      </div>
    </div>
  );
}
