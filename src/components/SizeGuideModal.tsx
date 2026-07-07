'use client';

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
}

const sizeData = [
  { br: 34, usa: '3.5', cm: '21.6' },
  { br: 35, usa: '4.5', cm: '22.4' },
  { br: 36, usa: '5.5', cm: '23.3' },
  { br: 37, usa: '6', cm: '23.7' },
  { br: 38, usa: '7', cm: '24.5' },
  { br: 39, usa: '7.5', cm: '25.0' },
  { br: 40, usa: '8.5', cm: '25.8' },
  { br: 41, usa: '9.5', cm: '26.7' },
  { br: 42, usa: '10', cm: '27.1' },
];

export default function SizeGuideModal({ open, onClose }: SizeGuideModalProps) {
  return (
    <div className={`modal-overlay${open ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <button className="close-modal" onClick={onClose}>&times;</button>
        <h2>Tabela de Medidas</h2>
        <table>
          <thead>
            <tr><th>BR</th><th>USA</th><th>Comprimento do Pé (cm)</th></tr>
          </thead>
          <tbody>
            {sizeData.map((s, i) => (
              <tr key={i}>
                <td>{s.br}</td>
                <td>{s.usa}</td>
                <td>{s.cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
