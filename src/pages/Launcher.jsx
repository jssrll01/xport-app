import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { APPS } from '../lib/apps.js';

export default function Launcher() {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!q.trim()) return APPS;
    const t = q.trim().toLowerCase();
    return APPS.filter((a) => a.name.toLowerCase().includes(t));
  }, [q]);

  const openApp = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="page-enter" style={{ padding: 16, paddingBottom: 40 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Launcher</h2>
      <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
        Tap any app to open it in a new tab
      </p>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: 15, color: '#97A0B5' }} />
        <input
          className="neu-input"
          style={{ paddingLeft: 40 }}
          placeholder="Search apps…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: 12,
      }}>
        {filtered.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.name}
              className="app-tile"
              onClick={() => openApp(a.url)}
              title={a.url}
            >
              <div className="app-tile-icon" style={{ background: a.color }}>
                <Icon size={24} />
              </div>
              <div className="app-tile-label">{a.name}</div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="neu-card" style={{ padding: 30, textAlign: 'center' }}>
          <div className="muted">No apps match "{q}"</div>
        </div>
      )}
    </div>
  );
}
