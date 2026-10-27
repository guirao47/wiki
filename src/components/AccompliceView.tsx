import { useState, useCallback, useEffect } from 'react';
import { useSession } from '../hooks/useSession';

interface AccompliceViewProps {
  sessionId: string;
}

const QUICK_EFFECTS = [
  { label: '🃏 ACAAN', query: 'ACAAN card trick revealed' },
  { label: '🌍 Ciudad', query: 'Madrid' },
  { label: '👤 Nombre', query: 'Juan Pérez' },
  { label: '🃏 Carta', query: 'as de copas' },
];

export function AccompliceView({ sessionId }: AccompliceViewProps) {
  const { session, setForcedQuery, clearForcedQuery } = useSession(sessionId, 'accomplice');
  const [queryInput, setQueryInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Track history when a query is forced
  useEffect(() => {
    const forcedQuery = session?.control?.forcedQuery;
    if (forcedQuery && forcedQuery !== history[0]) {
      setHistory(prev => [forcedQuery, ...prev.slice(0, 4)]);
    }
  }, [session?.control?.forcedQuery, history]);

  const sendForce = useCallback((query?: string) => {
    if (query) {
      setForcedQuery(query);
    }
  }, [setForcedQuery]);

  const handleForce = useCallback(() => {
    if (queryInput.trim()) {
      sendForce(queryInput.trim());
      setQueryInput('');
    }
  }, [queryInput, sendForce]);

  const handleClear = useCallback(() => {
    clearForcedQuery();
    setQueryInput('');
  }, [clearForcedQuery]);

  const handleHistoryClick = useCallback((query: string) => {
    setQueryInput(query);
    handleForce();
  }, [handleForce]);

  return (
    <div className="accomplice-view">
      <header className="view-header">
        <h1>🤝 Cómplice</h1>
        <div className="session-info">
          Sesión: <code>{sessionId}</code>
        </div>
      </header>

      {session?.spectator && (
        <section className="section live-monitor">
          <h2>📺 Monitor</h2>
          <div className="monitor-card">
            <p><strong>Query:</strong> {session.spectator.currentQuery || '—'}</p>
            <p><strong>Estado:</strong> {session.spectator.connected ? '🟢 Conectado' : '🔴 Desconectado'}</p>
          </div>
        </section>
      )}

      {/* Main Force Input */}
      <section className="section force-section">
        <div className="force-input-group">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleForce()}
            placeholder="¿Qué dijo el espectador?"
            autoFocus
            className="force-input"
          />
          <button
            className="btn-force"
            onClick={handleForce}
            disabled={!queryInput.trim()}
          >
            FORZAR
          </button>
        </div>
      </section>

      {/* Quick Effects */}
      <section className="section">
        <h2>⚡ Rápidos</h2>
        <div className="effects-grid">
          {QUICK_EFFECTS.map((effect) => (
            <button
              key={effect.label}
              className="effect-btn"
              onClick={() => sendForce(effect.query)}
              disabled={!session?.spectator?.connected}
            >
              {effect.label}
            </button>
          ))}
        </div>
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="section history-section">
          <div className="history-header">
            <h2>📜 Historial</h2>
            <button
              className="btn-toggle"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Ocultar' : `Ver ${history.length}`}
            </button>
          </div>
          {showHistory && (
            <div className="history-list">
              {history.map((q, i) => (
                <button
                  key={i}
                  className="history-item"
                  onClick={() => handleHistoryClick(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Clear button */}
      <section className="section">
        <button className="btn-secondary" onClick={handleClear} style={{ width: '100%' }}>
          Limpiar
        </button>
      </section>
    </div>
  );
}