import { Link } from 'react-router-dom';

export default function OrderSuccess() {
  return (
    <div className="success-page">
      <div className="success-box">
        <div className="success-icon">✓</div>
        <h1>Bestellung erfolgreich!</h1>
        <p>Vielen Dank für deine Bestellung. Wir bereiten dein Sushi gerade frisch zu.</p>
        <p className="success-eta">Voraussichtliche Lieferzeit: <strong>30–45 Minuten</strong></p>
        <Link to="/" className="btn-back-home">← Zurück zur Speisekarte</Link>
      </div>
    </div>
  );
}
