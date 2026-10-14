import {
  ShoppingBag, Globe2, ShieldCheck, KeyRound, LifeBuoy,
  Star, Undo2, FileText, Users, Package, ClipboardList,
  Wallet, Gift, Boxes, ScrollText, AppWindow, Zap,
} from 'lucide-react';
import { supabase } from './supabase.js';

/* icon registry — DB stores icon as a string name */
export const ICONS = {
  ShoppingBag, Globe2, ShieldCheck, KeyRound, LifeBuoy,
  Star, Undo2, FileText, Users, Package, ClipboardList,
  Wallet, Gift, Boxes, ScrollText, AppWindow, Zap,
};

export const ICON_NAMES = Object.keys(ICONS);
export const GROUPS = ['All', 'Admin', 'Moderator', 'Public'];

export function iconFor(name) {
  return ICONS[name] || AppWindow;
}

/* ─── DB reads ─── */
export async function fetchApps() {
  const { data, error } = await supabase
    .from('xport_apps')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) return { items: [], error };
  return { items: data || [], error: null };
}

/* ─── DB writes ─── */
export async function createApp(row) {
  const { data, error } = await supabase
    .from('xport_apps')
    .insert(row)
    .select()
    .single();
  return { data, error };
}

export async function updateApp(id, patch) {
  const { data, error } = await supabase
    .from('xport_apps')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteApp(id) {
  const { error } = await supabase.from('xport_apps').delete().eq('id', id);
  return { error };
}
