import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession, type SearchEngine } from '../hooks/useSession';
import { GestureController } from './GestureController';
import { Clipboard } from '@capacitor/clipboard';

interface MagicianViewProps {
  sessionId: string;
}

const SEARCH_ENGINES: { value: SearchEngine; label: string; icon: string }[] = [
  { value: 'web', label: 'Web', icon: '🌐' },
  { value: 'images', label: 'Imágenes', icon: '🖼️' },
  { value: 'maps', label: 'Maps', icon: '🗺️' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'news', label: 'Noticias', icon: '📰' },
  { value: 'shopping', label: 'Shopping', icon: '🛒' },
  { value: 'wikipedia', label: 'Wikipedia', icon: '📖' },
];

export function MagicianView({ sessionId }: MagicianViewProps) {
  const { session, setForcedQuery, setSearchEngine, clearForcedQuery, updateSpectator } = useSession(sessionId, 'magician');
  const [gesturesEnabled, setGesturesEnabled] = useState(true);
  const [queryInput, setQueryInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'waiting'>('waiting');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>('web');
  const queryInputRef = useRef<HTMLInputElement>(null);

  // Refs for callbacks to avoid circular dependency in handleSwipe
  const handleForceRef = useRef<() => void>(() => {});
  const handleClearRef = useRef<() => void>(() => {});

  // Update status based on spectator connection
  useEffect(() => {
    if (session?.spectator?.connected) setStatus('connected');
    else if (session?.spectator) setStatus('waiting');
    else setStatus('disconnected');
  }, [session]);

  // Sync selected engine with Firebase
  useEffect(() => {
    if (session?.control?.searchEngine && session.control.searchEngine !== selectedEngine) {
      setSelectedEngine(session.control.searchEngine);
    }
  }, [session?.control?.searchEngine]);

  // Track history when a query is forced
  useEffect(() => {
    const forcedQuery = session?.control?.forcedQuery;
    if (forcedQuery && forcedQuery !== history[0]) {
      setHistory(prev => [forcedQuery, ...prev.slice(0, 4)]);
    }
  }, [session?.control?.forcedQuery, history]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Enter' && queryInput.trim()) {
        handleForceRef.current();
      } else if (e.key === 'Escape') {
        handleClearRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queryInput]);

  // Force function - defined first so handleSwipe can use it via ref
  const handleForce = useCallback(() => {
    const query = queryInput.trim();
    if (!query) return;

    setForcedQuery(query);
    updateSpectator({ currentQuery: query });
    setQueryInput('');
    queryInputRef.current?.focus();
  }, [queryInput, setForcedQuery, updateSpectator]);

  // Clear function - defined first so handleSwipe can use it via ref
  const handleClear = useCallback(() => {
    clearForcedQuery();
    setQueryInput('');
    queryInputRef.current?.focus();
  }, [clearForcedQuery]);

  // Update refs after functions are defined
  handleForceRef.current = handleForce;
  handleClearRef.current = handleClear;

  // Search engine change handler
  const handleEngineChange = useCallback((engine: SearchEngine) => {
    setSelectedEngine(engine);
    setSearchEngine(engine);
  }, [setSearchEngine]);

  // Gesture handlers: swipe up = force last query, swipe down = clear
  const handleSwipe = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!gesturesEnabled) return;

    switch (direction) {
      case 'up':
        if (history[0]) {
          setQueryInput(history[0]);
          handleForceRef.current();
        } else if (queryInput.trim()) {
          handleForceRef.current();
        }
        break;
      case 'down':
        handleClearRef.current();
        break;
      case 'left':
      case 'right':
        break;
    }
  }, [gesturesEnabled, history, queryInput]);

  const handleHistoryClick = useCallback((query: string) => {
    setQueryInput(query);
    handleForceRef.current();
  }, []);

  // Clipboard copy using Capacitor
  const copyUrl = async (url: string) => {
    try {
      await Clipboard.write({ string: url });
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback
      navigator.clipboard?.writeText(url);
    }
  };

  const spectatorUrl = `${window.location.origin}/s/${sessionId}`;
  const accompliceUrl = `${window.location.origin}/a/${sessionId}`;

  return (
    <div className="magician-view">
      <header className="view-header">
        <h1>🔮 Predicción</h1>
        <div className={`status-indicator ${status}`}>
          {status === 'connected' && '🟢 Conectado'}
          {status === 'waiting' && '🟡 Esperando...'}
          {status === 'disconnected' && '🔴 Desconectado'}
        </div>
      </header>

      {/* Main Force Input - Always visible at top */}
      <section className="section force-section">
        <div className="force-input-group">
          <input
            ref={queryInputRef}
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleForceRef.current()}
            placeholder="¿Qué dijo el espectador? (país, carta, número...)"
            autoFocus
            className="force-input"
          />
          <button
            className="btn-force"
            onClick={handleForceRef.current}
            disabled={!queryInput.trim()}
          >
            FORZAR
          </button>
        </div>

        {/* Search Engine Selector */}
        <div className="engine-selector">
          {SEARCH_ENGINES.map((engine) => (
            <button
              key={engine.value}
              className={`engine-btn ${selectedEngine === engine.value ? 'active' : ''}`}
              onClick={() => handleEngineChange(engine.value)}
              title={engine.label}
            >
              {engine.icon} {engine.label}
            </button>
          ))}
        </div>

        {/* Keyboard hint */}
        <p className="keyboard-hint">
          ⌨ Enter = Forzar &nbsp;|&nbsp; Esc = Limpiar &nbsp;|&nbsp;
          👆 Swipe ↑ = Forzar última &nbsp;|&nbsp; 👇 Swipe ↓ = Limpiar
        </p>
      </section>

      {/* Quick History */}
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

      {/* Session URLs */}
      <section className="section">
        <h2>📋 Compartir</h2>
        <div className="url-list">
          <div className="url-item">
            <span className="url-label">Espectador:</span>
            <div className="url-row">
              <code>{spectatorUrl}</code>
              <button onClick={() => copyUrl(spectatorUrl)} className="btn-small">Copiar</button>
            </div>
          </div>
          <div className="url-item">
            <span className="url-label">Cómplice:</span>
            <div className="url-row">
              <code>{accompliceUrl}</code>
              <button onClick={() => copyUrl(accompliceUrl)} className="btn-small">Copiar</button>
            </div>
          </div>
        </div>
      </section>

      {/* Gesture Control Toggle */}
      <section className="section">
        <label className="toggle">
          <input
            type="checkbox"
            checked={gesturesEnabled}
            onChange={(e) => setGesturesEnabled(e.target.checked)}
          />
          <span>Swipes en bolsillo (↑ forzar última / ↓ limpiar)</span>
        </label>
        <GestureController sessionId={sessionId} enabled={gesturesEnabled} onSwipe={handleSwipe} />
      </section>

      {/* Live View of Spectator */}
      {session?.spectator && (
        <section className="section live-view">
          <h2>👁️ Vista Espectador</h2>
          <div className="live-info">
            <p><strong>Query actual:</strong> {session.spectator.currentQuery || '—'}</p>
            <p><strong>Estado:</strong> {session.spectator.connected ? '🟢 Activo' : '🔴 Inactivo'}</p>
          </div>
        </section>
      )}
    </div>
  );
}