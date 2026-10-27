import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateSession } from '../hooks/useSession';

export function Landing() {
  const navigate = useNavigate();
  const { create, createFixed } = useCreateSession();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    const id = await create();
    navigate(`/m/${id}`);
  };

  const handleFixed = async () => {
    setCreating(true);
    const id = await createFixed('search');
    navigate(`/m/${id}`);
  };

  return (
    <div className="landing">
      <div className="landing-card wikipedia-card">
        <div className="wikipedia-header">
          <svg className="wikipedia-logo" viewBox="0 0 48 48" width="48" height="48">
            <path fill="#000000" d="M24 4c6.6 0 12 5.4 12 12s-5.4 12-12 12-12-5.4-12-12 5.4-12 12-12zm0 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/>
            <path fill="#34A853" d="M24 4c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12c0-3.3-1.3-6.3-3.6-8.5H12v4.7h9.6v-4.7h8.4v-4.8H24V4z"/>
            <path fill="#FBBC05" d="M24 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-14c2.2 0 4.2.9 5.6 2.4l-3.6 3.6c-.9-1.3-2.3-2.4-4-2.4-4.4 0-8 3.6-8 8s3.6 8 8 8c2 0 3.7-.8 4.8-2.1l3.1 3.1C29.9 32.6 26.7 36 24 36c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.4 0 6.4 1.3 8.7 3.4l-2.8 2.8C29.3 8.1 26.7 6 24 6c-4.4 0-8 3.6-8 8s3.6 8 8 8zm0 0"/>
            <path fill="#EA4335" d="M36 24c0 1.3-.3 2.5-.8 3.6h-6.3v3.6h4.8c-.6 2-2.3 3.5-4.5 4.1v2.9h-4.8V24h6.3z"/>
          </svg>
          <span className="wikipedia-wordmark">Wikipedia</span>
        </div>

        <p className="wikipedia-tagline">La enciclopedia libre</p>

        <div className="search-form">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#5f6368" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 2.23-1.58l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar en Wikipedia"
              className="search-input"
              readOnly
              onClick={() => handleFixed()}
            />
          </div>
        </div>

        <div className="actions">
          <button className="btn-primary btn-large" onClick={handleCreate} disabled={creating}>
            {creating ? 'Creando...' : 'Buscar en Wikipedia'}
          </button>
          <div className="divider">o</div>
          <button className="btn-secondary" onClick={handleFixed} disabled={creating}>
            🔗 Link permanente (/wiki/search)
          </button>
        </div>

        <div className="info">
          <h3>Cómo funciona:</h3>
          <ol>
            <li>Pulsa <strong>"Buscar en Wikipedia"</strong> → se crea sesión <code>/wiki/search</code></li>
            <li>Comparte la URL <code>/wiki/search</code> al espectador</li>
            <li>Espectador abre URL → pone móvil <strong>boca abajo</strong></li>
            <li>Espectador dice en alto: país, carta, número...</li>
            <li>Tú escribes lo que dijo → <strong>FORZAR</strong> (o swipe ↑ en bolsillo)</li>
            <li>Espectador voltea → ve <strong>Wikipedia real</strong> con lo que dijo</li>
          </ol>
        </div>

        <p className="disclaimer">
          ⚠️ Solo uso personal/estudio. No distribuir. Inject 2 es producto comercial de Greg Rostami.
        </p>
      </div>
    </div>
  );
}