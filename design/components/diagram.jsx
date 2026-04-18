// diagram.jsx — The central family-tree canvas (relationship diagram)
// Rendering style: formal Japanese legal-document aesthetic — Mincho type,
// warm paper background, monochrome card heads with a colored accent rail,
// crisp hairline connectors drawn in SVG.

const CARD_W = 224;
const CARD_MIN_H = 118;

// ============================================================
//  Person card (the "name-plate" on the diagram)
// ============================================================
function DiagramCard({ p, x, y, tagsOn, selected }) {
  const color = ROLE_COLORS[p.role] || ROLE_COLORS['無関係'];
  const docs = ROLE_DOCS[p.role] || [];
  const roleLabel = p.role || '';

  return (
    <div className={`dcard ${selected?'is-sel':''}`}
      style={{ left: x, top: y, width: CARD_W, minHeight: CARD_MIN_H }}>
      {/* Accent rail — colored vertical strip on the left */}
      <div className="dcard__rail" style={{ background: color.fg }} />

      {/* Header: role + BSZ mark */}
      <div className="dcard__head">
        <div className="dcard__role">
          <span className="dcard__role-dot" style={{ background: color.fg }}/>
          <span>{roleLabel}</span>
        </div>
        {p.isBSZ && (
          <div className="dcard__hanko" title="被相続人">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <circle cx="12" cy="12" r="10" fill="none" stroke="#8c2a2b" strokeWidth="1.4"/>
              <text x="12" y="16" textAnchor="middle"
                fontFamily="Shippori Mincho, serif" fontSize="11" fontWeight="700"
                fill="#8c2a2b">被</text>
            </svg>
          </div>
        )}
      </div>

      {/* Body: name (large, Mincho) + facts */}
      <div className="dcard__body">
        <div className="dcard__name">{p.name || '—'}</div>
        {p.relation && <div className="dcard__relation">{p.relation}</div>}

        <dl className="dcard__meta">
          {p.birth && (
            <>
              <dt>出生</dt><dd>{p.birth}</dd>
            </>
          )}
          {p.death && (
            <>
              <dt>死亡</dt><dd>{p.death}</dd>
            </>
          )}
          {!p.isBSZ && p.address && (
            <>
              <dt>住所</dt><dd className="dcard__addr">{p.address}</dd>
            </>
          )}
        </dl>
      </div>

      {/* Document tags */}
      {tagsOn && docs.length > 0 && (
        <div className="dcard__docs">
          {docs.map(d => <span key={d} className="dcard__tag">{d}</span>)}
        </div>
      )}
    </div>
  );
}

// ============================================================
//  Diagram header block — formal document-style title
// ============================================================
function DiagramHeader({ data, x=48, y=32 }) {
  const bsz = data.people.find(p => p.isBSZ);
  return (
    <div className="dheader" style={{ left: x, top: y }}>
      <div className="dheader__kicker">相続関係説明図</div>
      <div className="dheader__title">
        <span className="dheader__title-lead">被相続人</span>
        <span className="dheader__title-name">{bsz?.name || ''}</span>
      </div>
      <div className="dheader__rule"/>
      <dl className="dheader__meta">
        <dt>最 後 の 本 籍</dt><dd>{data.honseki}</dd>
        <dt>最 後 の 住 所</dt><dd>{data.lastAddr}</dd>
        <dt>登記簿上の住所</dt><dd>{data.regAddr}</dd>
      </dl>
    </div>
  );
}

function DiagramFooter({ x, y }) {
  return (
    <div className="dfooter" style={{ left: x, top: y }}>
      戸籍謄抄本及び除籍謄本は還付した
    </div>
  );
}

// ============================================================
//  Relationship lines (SVG) — auto-routed between cards.
//  For the standard test data we render:
//   - spouse: double line between 被相続人 ↔ 妻
//   - parent-child: from spouse midpoint → down → kids
// ============================================================
function DiagramLines({ data, layout }) {
  const byId = {};
  data.people.forEach(p => byId[p.id] = p);

  const pos = (id) => layout[id];
  const cx = (id) => pos(id).x + CARD_W/2;
  const cy = (id) => pos(id).y + CARD_MIN_H/2;
  const right = (id) => pos(id).x + CARD_W;
  const bot = (id) => pos(id).y + CARD_MIN_H;
  const top = (id) => pos(id).y;
  const left = (id) => pos(id).x;

  const lines = [];
  const drawnSp = new Set();

  // Spouse lines (double=current, single=ex)
  data.people.forEach(p => {
    if (p.spouse && byId[p.spouse]) {
      const key = [p.id, p.spouse].sort().join('-');
      if (drawnSp.has(key)) return;
      drawnSp.add(key);
      const a = p.id, b = p.spouse;
      const aLeft = left(a) < left(b) ? a : b;
      const aRight = aLeft === a ? b : a;
      const y = cy(aLeft); // same row assumed
      const x1 = right(aLeft), x2 = left(aRight);
      // double line (marriage)
      lines.push({ type:'line', x1, y1: y-3, x2, y2: y-3, key:`sp-${key}-1`, cls:'l-spouse' });
      lines.push({ type:'line', x1, y1: y+3, x2, y2: y+3, key:`sp-${key}-2`, cls:'l-spouse' });
    }
  });

  // Parent→child lines (for now: grouped by parent-pair)
  const childrenByPair = {};
  data.people.forEach(c => {
    if (!c.father && !c.mother) return;
    const key = [c.father, c.mother].filter(Boolean).sort().join('-');
    if (!childrenByPair[key]) childrenByPair[key] = { parents: [c.father, c.mother].filter(Boolean), kids: [] };
    childrenByPair[key].kids.push(c);
  });

  Object.values(childrenByPair).forEach(({parents, kids}) => {
    if (!parents.length || !kids.length) return;
    const parentMidX = parents.length === 2
      ? (right(Math.min(...parents.map(id => left(id) < left(parents[0])?id:parents[0]))) + left(Math.max(...parents.map(id => left(id) > left(parents[0])?id:parents[0])))) / 2
      : cx(parents[0]);
    const parentBottomY = Math.max(...parents.map(id => bot(id)));
    // simpler midX calc
    const ps = parents.map(id=>({ id, x: left(id), r: right(id) }));
    const midX = parents.length === 2
      ? (Math.max(...ps.map(p=>p.x)) + Math.min(...ps.map(p=>p.r))) / 2
      : cx(parents[0]);
    const parentY = parents.length === 2 ? cy(parents[0]) : bot(parents[0]);

    // Junction y — halfway between parent and kids
    const minKidTop = Math.min(...kids.map(k => top(k.id)));
    const jy = Math.round((parentBottomY + minKidTop) / 2);

    // vertical drop from parent midpoint to junction
    lines.push({ type:'line', x1: midX, y1: parentY, x2: midX, y2: jy, key:`pd-${midX}`, cls:'l-parent' });

    if (kids.length === 1) {
      const k = kids[0];
      lines.push({ type:'line', x1: midX, y1: jy, x2: cx(k.id), y2: jy, key:`h-${k.id}`, cls:'l-parent' });
      lines.push({ type:'line', x1: cx(k.id), y1: jy, x2: cx(k.id), y2: top(k.id), key:`d-${k.id}`, cls:'l-parent' });
    } else {
      const kxs = kids.map(k => cx(k.id));
      const lx = Math.min(...kxs), rx = Math.max(...kxs);
      lines.push({ type:'line', x1: lx, y1: jy, x2: rx, y2: jy, key:`hr-${lx}-${rx}`, cls:'l-parent' });
      kids.forEach(k => {
        lines.push({ type:'line', x1: cx(k.id), y1: jy, x2: cx(k.id), y2: top(k.id), key:`d-${k.id}`, cls:'l-parent' });
      });
    }
  });

  return (
    <svg className="dlines" width="100%" height="100%">
      {lines.map(l => (
        <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={l.cls === 'l-spouse' ? '#2a2620' : '#4a433b'}
          strokeWidth="1.2" strokeLinecap="square"/>
      ))}
    </svg>
  );
}

// ============================================================
//  Main canvas — combines paper, header, cards, lines, footer
// ============================================================
function DiagramCanvas({ data, layout, tagsOn=true, selectedId, width=820, height=700 }) {
  return (
    <div className="diagram-paper" style={{ width, height }}>
      <div className="paper-grain" aria-hidden/>
      <DiagramHeader data={data}/>
      <DiagramLines data={data} layout={layout}/>
      {data.people.map(p => {
        const pos = layout[p.id];
        if (!pos) return null;
        return (
          <DiagramCard key={p.id} p={p} x={pos.x} y={pos.y}
            tagsOn={tagsOn} selected={selectedId===p.id}/>
        );
      })}
      <DiagramFooter x={width - 280} y={height - 60}/>
    </div>
  );
}

// ============================================================
//  Canvas chrome: zoom toolbar, legend, status bar
// ============================================================
function CanvasBar({ zoom, setZoom, layout, onToggleLayout }) {
  return (
    <div className="canvas-bar">
      <div className="canvas-bar__left">
        <Legend/>
      </div>
      <div className="canvas-bar__right">
        <div className="canvas-bar__hint">
          <Icons.Move size={12}/> ドラッグで移動 ・ 範囲選択 ・ Shift+ホイールで拡大縮小
        </div>
        <div className="zoom-ctl">
          <button className="t-btn t-btn--icon" onClick={()=>setZoom(Math.max(30, zoom-10))}>
            <Icons.ZoomOut size={14}/>
          </button>
          <span className="zoom-ctl__value">{zoom}%</span>
          <button className="t-btn t-btn--icon" onClick={()=>setZoom(Math.min(200, zoom+10))}>
            <Icons.ZoomIn size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    ['被相続人','被'],
    ['相続人','相'],
    ['遺産分割','分'],
    ['数次相続人','数'],
    ['先死亡','先'],
    ['相続後死亡','後'],
  ];
  return (
    <div className="legend">
      <div className="legend__label">凡例</div>
      {items.map(([role]) => (
        <div key={role} className="legend__item">
          <span className="legend__dot" style={{ background: ROLE_COLORS[role].fg }}/>
          <span>{role}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  DiagramCard, DiagramHeader, DiagramFooter, DiagramLines, DiagramCanvas,
  CanvasBar, Legend, CARD_W, CARD_MIN_H,
});
