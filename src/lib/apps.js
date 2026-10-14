import {
  ShoppingBag, Globe2, ShieldCheck, KeyRound, LifeBuoy,
  Star, Undo2, FileText, Users, Package, ClipboardList,
  Wallet, Gift, Boxes, ScrollText,
} from 'lucide-react';

export const APPS = [
  { id: 'xmarket',         name: 'XMarket',         url: 'https://xmarket-app.onrender.com/',         icon: ShoppingBag,    color: '#8B5CF6', tag: 'Storefront', group: 'Public' },
  { id: 'xmarket-landing', name: 'XMarket Landing', url: 'https://xmarket-landing.onrender.com/',     icon: Globe2,         color: '#0EA5E9', tag: 'Marketing',  group: 'Public' },
  { id: 'xadmin',          name: 'XAdmin',          url: 'https://xadmin-marketplace.onrender.com/',  icon: ShieldCheck,    color: '#EF4444', tag: 'Console',    group: 'Admin' },
  { id: 'xaccess',         name: 'XAccess',         url: 'https://xaccess-client.onrender.com/',      icon: KeyRound,       color: '#F59E0B', tag: 'Auth',       group: 'Admin' },
  { id: 'xsupport',        name: 'XSupport',        url: 'https://xsupport-app.onrender.com/',        icon: LifeBuoy,       color: '#10B981', tag: 'Tickets',    group: 'Admin' },
  { id: 'xreviews',        name: 'XReviews',        url: 'https://xreviews-app.onrender.com/',        icon: Star,           color: '#EAB308', tag: 'Feedback',   group: 'Admin' },
  { id: 'xrefund',         name: 'XRefund',         url: 'https://xrefund-app.onrender.com/',         icon: Undo2,          color: '#06B6D4', tag: 'Refunds',    group: 'Admin' },
  { id: 'xquote',          name: 'XQuote',          url: 'https://xquote-app.onrender.com/',          icon: FileText,       color: '#6366F1', tag: 'Receipts',   group: 'Admin' },
  { id: 'xusers',          name: 'XUsers',          url: 'https://xusers-app.onrender.com/',          icon: Users,          color: '#7C3AED', tag: 'People',     group: 'Admin' },
  { id: 'xproducts',       name: 'XProducts',       url: 'https://xproducts-app.onrender.com/',       icon: Package,        color: '#F97316', tag: 'Catalog',    group: 'Admin' },
  { id: 'xorders',         name: 'XOrders',         url: 'https://xorders-app.onrender.com/',         icon: ClipboardList,  color: '#3B82F6', tag: 'Orders',     group: 'Admin' },
  { id: 'xtopups',         name: 'XTopups',         url: 'https://xtopups-app.onrender.com/',         icon: Wallet,         color: '#059669', tag: 'Wallet',     group: 'Admin' },
  { id: 'xpromos',         name: 'XPromos',         url: 'https://xpromos-app.onrender.com/',         icon: Gift,           color: '#EC4899', tag: 'Discounts',  group: 'Admin' },
  { id: 'xbundles',        name: 'XBundles',        url: 'https://xbundles-app.onrender.com/',        icon: Boxes,          color: '#14B8A6', tag: 'Bundles',    group: 'Admin' },
  { id: 'xaudit',          name: 'XAudit',          url: 'https://xaudit-app.onrender.com/',          icon: ScrollText,     color: '#64748B', tag: 'Logs',       group: 'Admin' },
];

export const GROUPS = ['All', 'Public', 'Admin'];
