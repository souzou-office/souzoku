// app-diagram.jsx — diagram canvas (cards, lines, legend)

function DiagramHeader({ data }) {
  const bsz = data.people.find(p => p.isBSZ);
  return (
    <div className="dheader" style={{left:48, top:32}}>
      <div className="dheader__kicker">相続関係説明図</div>
      <div className="dheader__title">
        <span className="dheader__title-lead">被相続人</span>
        <span className="dheader__title-name">{bsz?.name || ''}</span>
      </div>
      <div className="dheader__rule"/>
      <dl className="dheader__meta">
        {data.honseki && <><dt>最 後 の 本 籍</dt><dd>{data.honseki}</dd></>}
        {data.lastAddr && <><dt>最 後 の 住 所</dt><dd>{data.lastAddr}</dd></>}
        {data.regAddr && <><dt>登記簿上の住所</dt><dd>{data.regAddr}</dd></>}
      </dl>
    </div>
  );
}

function DiagramFooter({ x, y }) {
  return (
    <div className="dfooter" style={{left:x, top:y}}>
      戸籍謄抄本及び除籍謄本は還付した
    </div>
  );
}

function DiagramCard({ p, x, y, h, tagsOn, selected, onMouseDown, cardRef }) {
  const color = ROLE_COLORS[p.role] || ROLE_COLORS['無関係'];
  const docs = ROLE_DOCS[p.role] || [];
  const birthStr = dateToStr(p,'birth');
  const deathStr = dateToStr(p,'death');
  return (
    <div ref={cardRef} className={`dcard ${selected?'is-sel':''}`}
      style={{left:x, top:y, width:CARD_W}}
      onMouseDown={onMouseDown}
      data-pid={p.id}>
      <div className="dcard__rail" style={{background:color.fg}}/>
      <div className="dcard__head">
        <div className="dcard__role">
          <span className="dcard__role-dot" style={{background:color.fg}}/>
          <span>{p.role || ''}</span>
        </div>
        {p.isBSZ && (
          <div className="dcard__hanko" title="被相続人">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <circle cx="12" cy="12" r="10" fill="none" stroke="#8c2a2b" strokeWidth="1.4"/>
              <text x="12" y="16" textAnchor="middle" fontFamily="Shippori Mincho, serif" fontSize="11" fontWeight="700" fill="#8c2a2b">被</text>
            </svg>
          </div>
        )}
      </div>
      <div className="dcard__body">
        <div className="dcard__name">{p.name || '—'}</div>
        {p.relation && <div className="dcard__relation">{p.relation}</div>}
        <dl className="dcard__meta">
          {birthStr && <><dt>出生</dt><dd>{birthStr}</dd></>}
          {deathStr && <><dt>死亡</dt><dd>{deathStr}</dd></>}
          {!p.isBSZ && p.address && <><dt>住所</dt><dd className="dcard__addr">{p.address}</dd></>}
        </dl>
      </div>
      {tagsOn && docs.length > 0 && (
        <div className="dcard__docs">
          {docs.map(d => <span key={d} className="dcard__tag">{d}</span>)}
        </div>
      )}
    </div>
  );
}

function DiagramLines({ people, positions, sizes, layoutDir }) {
  const byId = {}; people.forEach(p => byId[p.id]=p);
  const pos = id => positions[id];
  const sz = id => sizes[id] || { w:CARD_W, h:130 };
  const has = id => positions[id] && sizes[id];
  const cx = id => Math.round(pos(id).x + sz(id).w/2);
  const cy_ = id => Math.round(pos(id).y + sz(id).h/2);
  const top_ = id => pos(id).y;
  const bot = id => pos(id).y + sz(id).h;
  const left = id => pos(id).x;
  const right = id => pos(id).x + sz(id).w;

  const lines = [];
  const drawnSp = new Set();
  const spouseMid = {};
  const horiz = layoutDir === 'horizontal';

  // Spouse lines
  people.forEach(p => {
    const drawSp = (sid, isEx) => {
      if (!has(p.id) || !has(sid)) return;
      const key = Math.min(p.id,sid) + '-' + Math.max(p.id,sid);
      if (drawnSp.has(key)) return;
      drawnSp.add(key);
      const color = isEx ? '#888' : '#8c2a2b';
      if (horiz) {
        const tid = top_(p.id) < top_(sid) ? p.id : sid;
        const bid = tid === p.id ? sid : p.id;
        const x = Math.round((cx(tid)+cx(bid))/2);
        const y1 = bot(tid), y2 = top_(bid);
        if (isEx) lines.push({ k:'sp-'+key, x1:x, y1, x2:x, y2, color, w:2 });
        else {
          lines.push({ k:'sp1-'+key, x1:x-3, y1, x2:x-3, y2, color, w:2 });
          lines.push({ k:'sp2-'+key, x1:x+3, y1, x2:x+3, y2, color, w:2 });
        }
        spouseMid[key] = { x, y:Math.round((y1+y2)/2) };
      } else {
        const lid = left(p.id) < left(sid) ? p.id : sid;
        const rid = lid === p.id ? sid : p.id;
        const y = Math.round((cy_(lid)+cy_(rid))/2);
        const x1 = right(lid), x2 = left(rid);
        if (isEx) lines.push({ k:'sp-'+key, x1, y1:y, x2, y2:y, color, w:2 });
        else {
          lines.push({ k:'sp1-'+key, x1, y1:y-3, x2, y2:y-3, color, w:2 });
          lines.push({ k:'sp2-'+key, x1, y1:y+3, x2, y2:y+3, color, w:2 });
        }
        spouseMid[key] = { x:Math.round((x1+x2)/2), y };
      }
    };
    if (p.spouse) drawSp(+p.spouse, false);
    (p.exSpouses||[]).forEach(eid => { if (eid) drawSp(+eid, true); });
  });

  // Parent-child lines
  const drawnKids = new Set();
  const donePairs = new Set();
  people.forEach(p => {
    if (!has(p.id)) return;
    const fid = +p.father, mid_ = +p.mother;
    if (!fid && !mid_) return;
    let pairKey, anchors;
    if (fid && mid_ && has(fid) && has(mid_)) { pairKey = Math.min(fid,mid_)+'-'+Math.max(fid,mid_); anchors = [fid,mid_]; }
    else if (fid && has(fid)) { pairKey = 's-'+fid; anchors = [fid]; }
    else if (mid_ && has(mid_)) { pairKey = 's-'+mid_; anchors = [mid_]; }
    else return;
    if (donePairs.has(pairKey)) return;
    donePairs.add(pairKey);
    const kids = people.filter(c => {
      if (!has(c.id) || drawnKids.has(c.id)) return false;
      const cf = +c.father, cm = +c.mother;
      if (anchors.length === 2) return anchors.includes(cf) && anchors.includes(cm);
      return cf === anchors[0] || cm === anchors[0];
    });
    if (!kids.length) return;
    kids.forEach(k => drawnKids.add(k.id));
    let startX, startY;
    const spKey = anchors.length===2 ? Math.min(...anchors)+'-'+Math.max(...anchors) : null;
    const color = '#4a433b';
    if (horiz) {
      if (spKey && spouseMid[spKey]) { startX = spouseMid[spKey].x + 4; startY = spouseMid[spKey].y; }
      else { startX = right(anchors[0]); startY = cy_(anchors[0]); }
      const parentRt = Math.max(...anchors.map(id=>right(id)));
      const minKidLt = Math.min(...kids.map(k=>left(k.id)));
      const jx = Math.round(parentRt + (minKidLt - parentRt)/2);
      lines.push({ k:`pd-${pairKey}`, x1:startX, y1:startY, x2:jx, y2:startY, color, w:1.2 });
      const kidYs = kids.map(k=>cy_(k.id)).sort((a,b)=>a-b);
      if (kids.length === 1) {
        const ky = cy_(kids[0].id), kx = left(kids[0].id);
        if (startY !== ky) lines.push({ k:`vv-${kids[0].id}`, x1:jx, y1:startY, x2:jx, y2:ky, color, w:1.2 });
        lines.push({ k:`hh-${kids[0].id}`, x1:jx, y1:ky, x2:kx, y2:ky, color, w:1.2 });
      } else {
        const ty = kidYs[0], by = kidYs[kidYs.length-1];
        if (startY < ty) lines.push({ k:`vvt-${pairKey}`, x1:jx, y1:startY, x2:jx, y2:ty, color, w:1.2 });
        else if (startY > by) lines.push({ k:`vvb-${pairKey}`, x1:jx, y1:startY, x2:jx, y2:by, color, w:1.2 });
        lines.push({ k:`spine-${pairKey}`, x1:jx, y1:ty, x2:jx, y2:by, color, w:1.2 });
        kids.forEach(k => {
          const ky = cy_(k.id), kx = left(k.id);
          lines.push({ k:`h-${k.id}`, x1:jx, y1:ky, x2:kx, y2:ky, color, w:1.2 });
        });
      }
    } else {
      if (spKey && spouseMid[spKey]) { startX = spouseMid[spKey].x; startY = spouseMid[spKey].y + 4; }
      else { startX = cx(anchors[0]); startY = bot(anchors[0]); }
      const parentBot = Math.max(...anchors.map(id=>bot(id)));
      const minKidTop = Math.min(...kids.map(k=>top_(k.id)));
      const jy = Math.round(parentBot + (minKidTop - parentBot)/2);
      lines.push({ k:`pd-${pairKey}`, x1:startX, y1:startY, x2:startX, y2:jy, color, w:1.2 });
      const kidXs = kids.map(k=>cx(k.id)).sort((a,b)=>a-b);
      if (kids.length === 1) {
        const kx = cx(kids[0].id), ky = top_(kids[0].id);
        if (startX !== kx) lines.push({ k:`hh-${kids[0].id}`, x1:startX, y1:jy, x2:kx, y2:jy, color, w:1.2 });
        lines.push({ k:`vv-${kids[0].id}`, x1:kx, y1:jy, x2:kx, y2:ky, color, w:1.2 });
      } else {
        const lx = kidXs[0], rx = kidXs[kidXs.length-1];
        if (startX < lx) lines.push({ k:`hhl-${pairKey}`, x1:startX, y1:jy, x2:lx, y2:jy, color, w:1.2 });
        else if (startX > rx) lines.push({ k:`hhr-${pairKey}`, x1:startX, y1:jy, x2:rx, y2:jy, color, w:1.2 });
        lines.push({ k:`spine-${pairKey}`, x1:lx, y1:jy, x2:rx, y2:jy, color, w:1.2 });
        kids.forEach(k => {
          const kx = cx(k.id), ky = top_(k.id);
          lines.push({ k:`v-${k.id}`, x1:kx, y1:jy, x2:kx, y2:ky, color, w:1.2 });
        });
      }
    }
  });

  return (
    <svg className="dlines" width="100%" height="100%" style={{position:'absolute', top:0, left:0, pointerEvents:'none'}}>
      {lines.map(l => (
        <line key={l.k} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth={l.w} strokeLinecap="square"/>
      ))}
    </svg>
  );
}

function DiagramCanvas({ data, people, positions, setPositions, tagsOn, selectedId, onSelectCard, layoutDir, paperW, paperH }) {
  const cardRefs = useRef({});
  const [sizes, setSizes] = useState({});
  const paperRef = useRef(null);

  // Measure cards after render
  useEffect(() => {
    const newSizes = {};
    let changed = false;
    Object.entries(cardRefs.current).forEach(([id, el]) => {
      if (!el) return;
      const h = el.offsetHeight;
      newSizes[id] = { w:CARD_W, h };
      if (!sizes[id] || sizes[id].h !== h) changed = true;
    });
    if (changed || Object.keys(newSizes).length !== Object.keys(sizes).length) {
      setSizes(newSizes);
    }
  });

  // Drag
  const dragCard = (e, pid) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const sx = e.clientX, sy = e.clientY;
    const start = { ...positions };
    const startP = start[pid] || { x:0, y:0 };
    let moved = false;
    const onMove = e2 => {
      const dx = e2.clientX - sx, dy = e2.clientY - sy;
      if (!moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      moved = true;
      const nx = Math.round((startP.x + dx)/SNAP)*SNAP;
      const ny = Math.round((startP.y + dy)/SNAP)*SNAP;
      setPositions(p => ({ ...p, [pid]: { x:nx, y:ny } }));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (!moved) onSelectCard(pid);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // Compute paper size
  let maxX = paperW || 820, maxY = paperH || 700;
  Object.values(positions).forEach(pos => {
    if (pos.x + CARD_W + 60 > maxX) maxX = pos.x + CARD_W + 60;
    if (pos.y + 160 > maxY) maxY = pos.y + 160;
  });

  const footerX = Math.max(maxX - 300, 400);
  const footerY = maxY - 44;

  return (
    <div ref={paperRef} className="diagram-paper" style={{width:maxX, height:maxY}}>
      <div className="paper-grain" aria-hidden/>
      <DiagramHeader data={data}/>
      <DiagramLines people={people} positions={positions} sizes={sizes} layoutDir={layoutDir}/>
      {people.map(p => {
        const pos = positions[p.id]; if (!pos) return null;
        return (
          <DiagramCard key={p.id}
            cardRef={el => cardRefs.current[p.id] = el}
            p={p} x={pos.x} y={pos.y}
            tagsOn={tagsOn}
            selected={selectedId === p.id}
            onMouseDown={e => dragCard(e, p.id)}
          />
        );
      })}
      <DiagramFooter x={footerX} y={footerY}/>
    </div>
  );
}

function Legend() {
  const items = [['被相続人'],['相続人'],['遺産分割'],['数次相続人'],['先死亡'],['相続後死亡']];
  return (
    <div className="legend">
      <div className="legend__label">凡例</div>
      {items.map(([role]) => (
        <div key={role} className="legend__item">
          <span className="legend__dot" style={{background: ROLE_COLORS[role].fg}}/>
          <span>{role}</span>
        </div>
      ))}
    </div>
  );
}

function CanvasBar({ zoom, setZoom }) {
  return (
    <div className="canvas-bar">
      <div className="canvas-bar__left"><Legend/></div>
      <div className="canvas-bar__right">
        <div className="canvas-bar__hint">
          <Icons.Move size={12}/> カードをドラッグして移動
        </div>
        <div className="zoom-ctl">
          <button className="t-btn t-btn--icon" onClick={()=>setZoom(Math.max(30, zoom-10))}><Icons.ZoomOut size={14}/></button>
          <span className="zoom-ctl__value">{zoom}%</span>
          <button className="t-btn t-btn--icon" onClick={()=>setZoom(Math.min(200, zoom+10))}><Icons.ZoomIn size={14}/></button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DiagramCanvas, DiagramCard, DiagramLines, DiagramHeader, DiagramFooter, Legend, CanvasBar });
