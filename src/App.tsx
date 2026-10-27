import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Landing } from './components/Landing';
import { MagicianView } from './components/MagicianView';
import { SpectatorView } from './components/SpectatorView';
import { AccompliceView } from './components/AccompliceView';
import './styles/global.css';

function MagicianWrapper() {
  const { sessionId } = useParams<{ sessionId: string }>();
  return <MagicianView sessionId={sessionId || ''} />;
}

function SpectatorWrapper() {
  return <SpectatorView sessionId="search" />;
}

function AccompliceWrapper() {
  const { sessionId } = useParams<{ sessionId: string }>();
  return <AccompliceView sessionId={sessionId || ''} />;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/m/:sessionId" element={<MagicianWrapper />} />
        <Route path="/wiki/search" element={<SpectatorWrapper />} />
        <Route path="/a/:sessionId" element={<AccompliceWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;