import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, X, Star, ExternalLink, Clock,
  LayoutGrid, Zap, Sparkles, Plus, Edit2, Trash2, Save,
} from 'lucide-react';
import {
  GROUPS, ICON_NAMES, iconFor,
  fetchApps, createApp, updateApp, deleteApp,
} from '../lib/apps.js';

const FAV_KEY    = 'xport_favorites';
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

const BLANK = {
  id: '', name: '', url: '', icon: 'AppWindow',
  color: '#6366F1', tag: '', group_name: 'Moderator',
  sort_order: 100, active: true,
};

export default function Launcher() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('All');
  const [favorites, setFavorites] = useState(() => readSet(FAV_KEY));
  const [recentIds, setRecentIds] = useState(() => readList(RECENT_KEY));
  const [editing, setEditing] = useState(null);   // null | row being edited | {..BLANK, __new:true}
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { items } = await fetchApps();
    setApps(items || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { saveSet(FAV_KEY, favorites); }, [favorites]);
  useEffect(() => { saveList(RECENT_KEY, recentIds); }, [recentIds]);

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
    return apps
      .filter((a) => a.active !== false)
      .filter((a) => group === 'All' || a.group_name === group)
      .filter((a) => !term ||
        a.name.toLowerCase().includes(term) ||
        (a.tag || '').toLowerCase().includes(term))
      .sort((a, b) => {
        const fa = favorites.has(a.id) ? 0 : 1;
        const fb = favorites.has(b.id) ? 0 : 1;
        if (fa !== fb) return fa - fb;
        const sa = Number(a.sort_order) || 0;
        const sb = Number(b.sort_order) || 0;
        if (sa !== sb) return sa - sb;
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [apps, q, group, favorites]);

  const recent = useMemo(() => {
    return recentIds
      .map((id) => apps.find((a) => a.id === id))
      .filter(Boolean);
  }, [recentIds, apps]);

  const totalApps = apps.filter((a) => a.active !== false).length;
  const favCount = favorites.size;

  /* ─── CRUD handlers ─── */
  const startNew = () => setEditing({ ...BLANK, __new: true });
  const startEdit = (app, e) => {
    e.stopPropagation();
    setEditing({ ...app });
  };
  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.id.trim()) return alert('id is required (e.g. "xmarket")');
    if (!editing.name.trim()) return alert('name is required');
    if (!editing.url.trim()) return alert('url is required');
    setSaving(true);
    const payload = {
      id: editing.id.trim(),
      name: editing.name.trim(),
      url: editing.url.trim(),
      icon: editing.icon,
      color: editing.color,
      tag: editing.tag || '',
      group_name: editing.group_name || 'Moderator',
      sort_order: Number(editing.sort_order) || 0,
      active: editing.active !== false,
    };
    const { error } = editing.__new
      ? await createApp(payload)
      : await updateApp(editing.id, payload);
    setSaving(false);
    if (error) return alert(error.message);
    setEditing(null);
    load();
  };

  const removeApp = async (app, e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${app.name}"? This cannot be undone.`)) return;
    const { error } = await deleteApp(app.id);
    if (error) return alert(error.message);
    load();
  };

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
            {loading ? 'Loading…' : `${totalApps} apps · ${favCount} pinned`}
          </p>
        </div>
        <button className="tool-btn" onClick={startNew} title="Add app">
          <Plus size={13} /> Add
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: 15, color: '#97A0B5', pointerEvents: 'none' }} />
        <input className="neu-input"
          style={{ paddingLeft: 40, paddingRight: q ? 46 : 14 }}
          placeholder="Search apps by name or tag…"
          value={q} onChange={(e) => setQ(e.target.value)} />
        {q && (
          <button className="search-clear" onClick={() => setQ('')} title="Clear">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Group filter + Open all */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {GROUPS.map((g) => (
          <button key={g}
            className={'tool-btn' + (group === g ? ' active' : '')}
            onClick={() => setGroup(g)}>
            {g === 'All' ? <LayoutGrid size={13} /> : g === 'Admin' ? <Zap size={13} /> : <Sparkles size={13} />}
            {g}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="tool-btn" onClick={openAllInGroup}>
          <ExternalLink size={13} /> Open all ({filtered.length})
        </button>
      </div>

      {/* Recent chips */}
      {recent.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div className="muted" style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .6, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={12} /> RECENTLY OPENED
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {recent.map((a) => {
              const Icon = iconFor(a.icon);
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

      {/* Grid */}
      <div className="muted" style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .6, marginBottom: 10 }}>
        {loading ? 'LOADING…' : `${filtered.length} APP${filtered.length === 1 ? '' : 'S'}`}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
        {filtered.map((a, i) => {
          const Icon = iconFor(a.icon);
          const pinned = favorites.has(a.id);
          return (
            <button key={a.id} className="app-tile" onClick={() => openApp(a)} title={a.url}
              style={{ animation: `popIn .32s cubic-bezier(.4,0,.2,1) ${i * 0.02}s both` }}>
              {/* pin */}
              <span className={'tile-pin' + (pinned ? ' pinned' : '')}
                onClick={(e) => toggleFav(a.id, e)} role="button" tabIndex={-1}
                title={pinned ? 'Unpin' : 'Pin to top'}>
                <Star size={12} fill={pinned ? '#F59E0B' : 'none'} />
              </span>

              {/* edit/delete row */}
              <span className="tile-tools">
                <span onClick={(e) => startEdit(a, e)} role="button" tabIndex={-1} title="Edit">
                  <Edit2 size={11} />
                </span>
                <span onClick={(e) => removeApp(a, e)} role="button" tabIndex={-1} title="Delete">
                  <Trash2 size={11} />
                </span>
              </span>

              <div className="app-tile-icon" style={{ background: a.color }}>
                <Icon size={24} />
              </div>
              <div className="app-tile-label">{a.name}</div>
              <div className="app-tile-tag">{a.tag || a.group_name}</div>
            </button>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="neu-card" style={{ padding: 30, textAlign: 'center', marginTop: 20, animation: 'slideUp .3s ease' }}>
          <Search size={28} style={{ color: '#97A0B5', marginBottom: 8 }} />
          <div className="muted" style={{ fontSize: 13 }}>No apps match "{q}"</div>
        </div>
      )}

      {/* Footer stats */}
      <div className="neu-card" style={{ padding: 14, marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stat label="TOTAL" value={totalApps} />
        <Divider />
        <Stat label="PINNED" value={favCount} />
        <Divider />
        <Stat label="RECENT" value={recentIds.length} />
      </div>

      {/* Edit / New modal */}
      {editing && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={cancelEdit}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto',
            background: '#EEF1F6', borderRadius: '20px 20px 0 0', padding: 20,
            boxShadow: '0 -8px 30px rgba(163,177,198,0.5)',
            animation: 'slideUp .28s cubic-bezier(.4,0,.2,1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>
                {editing.__new ? 'New app' : `Edit ${editing.name}`}
              </div>
              <button onClick={cancelEdit} className="neu-btn" style={{ padding: 8, borderRadius: 10 }}>✕</button>
            </div>

            <Field label="ID *" hint="unique key — lowercase, e.g. xmarket">
              <input className="neu-input" value={editing.id} disabled={!editing.__new}
                onChange={(e) => setEditing({ ...editing, id: e.target.value })} />
            </Field>
            <Field label="Name *">
              <input className="neu-input" value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label="URL *">
              <input className="neu-input" value={editing.url}
                onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Icon">
                <select className="neu-input" value={editing.icon}
                  onChange={(e) => setEditing({ ...editing, icon: e.target.value })}>
                  {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="Color">
                <input className="neu-input" type="color" value={editing.color}
                  onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Tag">
                <input className="neu-input" value={editing.tag}
                  onChange={(e) => setEditing({ ...editing, tag: e.target.value })} />
              </Field>
              <Field label="Group">
                <select className="neu-input" value={editing.group_name}
                  onChange={(e) => setEditing({ ...editing, group_name: e.target.value })}>
                  {['Admin', 'Moderator', 'Public'].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Sort order">
                <input className="neu-input" type="number" value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} />
              </Field>
              <Field label="Active">
                <label className="neu-btn" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={editing.active !== false}
                    onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                    style={{ width: 18, height: 18 }} />
                  <span style={{ fontSize: 13 }}>Visible in launcher</span>
                </label>
              </Field>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={saveEdit} disabled={saving} className="neu-btn-primary"
                style={{ flex: 1, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Save size={14} /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={cancelEdit} className="neu-btn"
                style={{ flex: 1, padding: 12 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div className="muted" style={{ fontSize: 10, fontWeight: 800, letterSpacing: .5 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
function Divider() { return <div style={{ height: 30, width: 1, background: 'rgba(163,177,198,0.4)' }} />; }
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="muted" style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .4, marginBottom: 5 }}>
        {label.toUpperCase()} {hint && <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 600 }}>· {hint}</span>}
      </div>
      {children}
    </div>
  );
}
