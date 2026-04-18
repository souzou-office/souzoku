// icons.jsx — small line icon set in the Lucide/Phosphor style (1.5px stroke)

function Icon({ d, size = 16, stroke = 1.5, fill, style, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={fill || 'none'} stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }} {...rest}>
      {typeof d === 'string' ? <path d={d} /> : d}
    </svg>
  );
}

const Icons = {
  Undo: (p) => <Icon {...p} d="M3 7v6h6 M3 13a9 9 0 1 0 3-6.7L3 10" />,
  Redo: (p) => <Icon {...p} d="M21 7v6h-6 M21 13a9 9 0 1 1-3-6.7L21 10" />,
  Wand: (p) => <Icon {...p} d="M15 4V2 M15 10V8 M11 6h-2 M21 6h-2 M18 9l-1-1 M12 3l-1-1 M18 3l-1 1 M12 9l-1 1 M6 20l8-8 M8 14l2 2" />,
  Save: (p) => <Icon {...p} d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8" />,
  Upload: (p) => <Icon {...p} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12" />,
  Tag: (p) => <Icon {...p} d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z M7 7h.01" />,
  Layout: (p) => <Icon {...p} d="M3 3h18v18H3z M12 3v18 M3 9h18" />,
  LayoutH: (p) => <Icon {...p} d="M3 3h18v18H3z M3 12h18 M9 3v18" />,
  Print: (p) => <Icon {...p} d="M6 9V3h12v6 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M18 14H6v7h12z" />,
  Send: (p) => <Icon {...p} d="M22 2 11 13 M22 2l-7 20-4-9-9-4 20-7z" />,
  Plus: (p) => <Icon {...p} d="M12 5v14 M5 12h14" />,
  Minus: (p) => <Icon {...p} d="M5 12h14" />,
  Trash: (p) => <Icon {...p} d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />,
  Chevron: (p) => <Icon {...p} d="m6 9 6 6 6-6" />,
  ChevronRight: (p) => <Icon {...p} d="m9 6 6 6-6 6" />,
  ChevronLeft: (p) => <Icon {...p} d="m15 6-6 6 6 6" />,
  Search: (p) => <Icon {...p} d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z M21 21l-4.3-4.3" />,
  X: (p) => <Icon {...p} d="M18 6 6 18 M6 6l12 12" />,
  Check: (p) => <Icon {...p} d="M20 6 9 17l-5-5" />,
  User: (p) => <Icon {...p} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  Scale: (p) => <Icon {...p} d="M12 3v18 M7 3h10 M7 3l-4 8a4 4 0 0 0 8 0L7 3 M17 3l-4 8a4 4 0 0 0 8 0L17 3 M5 21h14" />,
  Copy: (p) => <Icon {...p} d="M16 3H4v12 M20 7H8v14h12V7z" />,
  Link: (p) => <Icon {...p} d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 1 0-7-7l-1 1 M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 1 0 7 7l1-1" />,
  Info: (p) => <Icon {...p} d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01" />,
  ZoomIn: (p) => <Icon {...p} d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z M21 21l-4.3-4.3 M11 8v6 M8 11h6" />,
  ZoomOut: (p) => <Icon {...p} d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z M21 21l-4.3-4.3 M8 11h6" />,
  Move: (p) => <Icon {...p} d="M5 9l-3 3 3 3 M9 5l3-3 3 3 M15 19l-3 3-3-3 M19 9l3 3-3 3 M2 12h20 M12 2v20" />,
  Calendar: (p) => <Icon {...p} d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z M16 2v4 M8 2v4 M3 10h18" />,
  Home: (p) => <Icon {...p} d="m3 12 9-9 9 9 M5 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10" />,
  Users: (p) => <Icon {...p} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M17 3.13a4 4 0 0 1 0 7.75" />,
  Menu: (p) => <Icon {...p} d="M3 12h18 M3 6h18 M3 18h18" />,
  Hanko: (p) => (
    <Icon {...p} d={<g>
      <circle cx="12" cy="10" r="6" fill="none" />
      <path d="M9 8h6 M12 7v6 M6 20h12" />
    </g>} />
  ),
  Sparkle: (p) => <Icon {...p} d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />,
  Paper: (p) => <Icon {...p} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z M14 2v6h6 M8 13h8 M8 17h5" />,
  Eye: (p) => <Icon {...p} d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  Settings: (p) => <Icon {...p} d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 1-2 0l-.1-.1a2 2 0 0 0-2.7.7l-.2.3a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.4a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.3a2 2 0 0 0 2.7.7l.1-.1a2 2 0 0 1 2 0l.2.1a2 2 0 0 1 1 1.7V20a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 1 2 0l.1.1a2 2 0 0 0 2.7-.7l.2-.3a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.4a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.3a2 2 0 0 0-2.7-.7l-.1.1a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  HelpCircle: (p) => <Icon {...p} d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3 M12 17h.01" />,
  ArrowRight: (p) => <Icon {...p} d="M5 12h14 M12 5l7 7-7 7" />,
  ArrowLeft: (p) => <Icon {...p} d="M19 12H5 M12 19l-7-7 7-7" />,
  Grid: (p) => <Icon {...p} d="M3 3h8v8H3z M13 3h8v8h-8z M3 13h8v8H3z M13 13h8v8h-8z" />,
  BookOpen: (p) => <Icon {...p} d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />,
};

Object.assign(window, { Icon, Icons });
