import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, X, Star, ExternalLink, Clock,
  LayoutGrid, Zap, Sparkles,
} from 'lucide-react';
import { APPS, GROUPS } from '../lib/apps.js';

const FAV_KEY   = 'xport_favorites';
const RECENT_KEY = 'xport_recent';

function readSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
  catch { return new Set(); }
}
function readList(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}
function saveSet(key, set) { localStorage.setItem(key, JSON.stringify([...set])); }
function saveList(key, list) { localStorage.setItem(key, JSON.stringify(list.slice(0, 8))); }

export default function Launcher() {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('All');
  const [favorites, setFavorites] = useState(() => readSet(FAV_KEY));
  const [recentIds, setRecentIds] = useState(() => readList(RECENT_KEY));

  useEffect(() => {
    saveSet(FAV_KEY, favorites);
  }, [favorites]);
  useEffect(() => {
    saveList(RECENT_KEY, recentIds);
  }, [recentIds]);

  const toggleFav = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openApp = (app) => {
    setRecentIds((prev) => [app.id, ...prev.filter((x) => x !== app.id)]);
    window.open(app.url, '_blank', 'noopener,noreferrer');
  };

  const openAllInGroup = () => {
    const list = filtered;
    if (!list.length) return;
    if (!confirm(`Open ${list.length} app${list.length === 1 ? '' : 's'} in new tabs?`)) return;
    list.forEach((a) => window.open(a.url, '_blank', 'noopener,noreferrer'));
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return APPS
      .filter((a) => group === 'All' || a.group === group)
      .filter((a) => !term ||
        a.name.toLowerCase().includes(term) ||
        a.tag.toLowerCase().includes(term))
      .sort((a, b) => {
        const fa = favorites.has(a.id) ? 0 : 1;
        const fb = favorites.has(b.id) ? 0 : 1;
        if (fa !== fb) return fa - fb;
        return a.name.localeCompare(b.name);
      });
  }, [q, group, favorites]);

  const recent = useMemo(() => {
    return recentIds
      .map((id) => APPS.find((a) => a.id === id))
      .filter(Boolean);
  }, [recentIds]);

  const totalApps = APPS.length;
  const favCount = favorites.size;

  return (
    <div className="page-enter" style={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} style={{ color: '#8B5CF6' }} />
            Launcher
          </h2>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="status-dot" />
            {totalApps} apps online · {favCount} pinned
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: 15, color: '#97A0B5', pointerEvents: 'none' }} />
        <input
          className="neu-input"
          style={{ paddingLeft: 40, paddingRight: q ? 46 : 14 }}
          placeholder="Search apps by name or tag…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button className="search-clear" onClick={() => setQ('')} title="Clear">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Group filter + Open all */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {GROUPS.map((g) => (
          <button
            key={g}
            className={'tool-btn' + (group === g ? ' active' : '')}
            onClick={() => setGroup(g)}
          >
            {g === 'All' ? <LayoutGrid size={13} /> : g === 'Admin' ? <Zap size={13} /> : <Sparkles size={13} />}
            {g}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="tool-btn" onClick={openAllInGroup} title="Open every visible app in new tabs">
          <ExternalLink size={13} />
          Open all ({filtered.length})
        </button>
      </div>

      {/* Recent row */}
      {recent.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div className="muted" style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .6, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={12} /> RECENTLY OPENED
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {recent.map((a) => {
              const Icon = a.icon;
              return (
                <button key={a.id} className="recent-chip" onClick={() => openApp(a)} title={a.url}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: a.color, display: 'inline-block' }} />
                  <Icon size={12} />
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* App grid */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div className="muted" style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .6 }}>
          {filtered.length} APP{filtered.length === 1 ? '' : 'S'}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: 12,
      }}>
        {filtered.map((a, i) => {
          const Icon = a.icon;
          const pinned = favorites.has(a.id);
          return (
            <button
              key={a.id}
              className="app-tile"
              onClick={() => openApp(a)}
              title={a.url}
              style={{ animation: `popIn .32s cubic-bezier(.4,0,.2,1) ${i * 0.02}s both` }}
            >
              <span
                className={'tile-pin' + (pinned ? ' pinned' : '')}
                onClick={(e) => toggleFav(a.id, e)}
                role="button"
                tabIndex={-1}
                title={pinned ? 'Unpin' : 'Pin to top'}
              >
                <Star size={12} fill={pinned ? '#F59E0B' : 'none'} />
              </span>

              <div className="app-tile-icon" style={{ background: a.color }}>
                <Icon size={24} />
              </div>
              <div className="app-tile-label">{a.name}</div>
              <div className="app-tile-tag">{a.tag}</div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="neu-card" style={{ padding: 30, textAlign: 'center', marginTop: 20, animation: 'slideUp .3s ease' }}>
          <Search size={28} style={{ color: '#97A0B5', marginBottom: 8 }} />
          <div className="muted" style={{ fontSize: 13 }}>No apps match "{q}"</div>
        </div>
      )}

      {/* Footer stat */}
      <div className="neu-card" style={{ padding: 14, marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="muted" style={{ fontSize: 10, fontWeight: 800, letterSpacing: .5 }}>TOTAL APPS</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{totalApps}</div>
        </div>
        <div style={{ height: 30, width: 1, background: 'rgba(163,177,198,0.4)' }} />
        <div>
          <div className="muted" style={{ fontSize: 10, fontWeight: 800, letterSpacing: .5 }}>PINNED</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{favCount}</div>
        </div>
        <div style={{ height: 30, width: 1, background: 'rgba(163,177,198,0.4)' }} />
        <div>
          <div className="muted" style={{ fontSize: 10, fontWeight: 800, letterSpacing: .5 }}>RECENT</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{recentIds.length}</div>
        </div>
      </div>
    </div>
  );
}
