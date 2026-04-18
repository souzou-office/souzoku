// v2-pro.jsx — Modernized Pro workspace components

const { useState: useStateV2 } = React;

// ---------- Top bar (light, minimal) ----------
function V2Top() {
  const [tagsOn, setTagsOn] = useStateV2(true);
  return (
    <header className="v2-top">
      <div className="v2-top__left">
        <div className="v2-brand">
          <div className="v2-brand__mark">相</div>
          <div className="v2-brand__text">
            <div className="v2-brand__name">souzou</div>
            <div className="v2-brand__sub">相続関係説明図</div>
          </div>
        </div>
        <div className="v2-crumb">
          <Icons.Home size={13} style={{color:'var(--m-ink-500)'}}/>
          <span className="v2-crumb__folder">案件2025-018</span>
          <Icons.ChevronRight size={12} style={{color:'var(--m-ink-400)'}}/>
          <span className="v2-crumb__doc">相続 太郎 様</span>
          <span className="v2-crumb__badge">AUTO-SAVED</span>
        </div>
      </div>
      <div className="v2-top__right">
        <div className="v2-search">
          <Icons.Search size={13}/>
          <span>検索・人物へジャンプ</span>
          <span className="v2-search__kbd">⌘K</span>
        </div>
        <div className="v2-top__sep"/>
        <button className="v2-btn v2-btn--icon" title="元に戻す"><Icons.Undo size={14}/></button>
        <button className="v2-btn v2-btn--icon" title="やり直し"><Icons.Redo size={14}/></button>
        <div className="v2-top__sep"/>
        <div className={`v2-switch ${tagsOn?'is-on':''}`} onClick={()=>setTagsOn(!tagsOn)}>
          <span>書類タグ</span>
          <div className="v2-switch__track"><div className="v2-switch__thumb"/></div>
        </div>
        <button className="v2-btn v2-btn--outline"><Icons.Send size={13}/> 共有</button>
        <button className="v2-btn v2-btn--primary"><Icons.Eye size={13}/> プレビュー</button>
        <div className="v2-avatar">YK</div>
      </div>
    </header>
  );
}

// ---------- Sidebar ----------
function V2Side({ data, selectedId, onSelect, expandedId, setExpandedId }) {
  return (
    <aside className="v2-side">
      <div className="v2-side__sec">
        <div className="v2-side__title">
          <span className="v2-side__title-text">被相続人</span>
          <button className="v2-btn v2-btn--icon" style={{width:24,height:24}}>
            <Icons.Settings size={12}/>
          </button>
        </div>
        <div className="v2-field">
          <div className="v2-field__label">最後の本籍</div>
          <input className="v2-input" defaultValue={data.honseki}/>
        </div>
        <div className="v2-field">
          <div className="v2-field__label">最後の住所</div>
          <input className="v2-input" defaultValue={data.lastAddr}/>
        </div>
        <div className="v2-field">
          <div className="v2-field__label">登記簿上の住所</div>
          <input className="v2-input" defaultValue={data.regAddr}/>
        </div>
      </div>

      <div className="v2-plist__head">
        <div className="v2-side__title-text">関係者</div>
        <div className="v2-side__title-count">{data.people.length}</div>
      </div>
      <div className="v2-plist">
        {data.people.map(p => (
          <V2PRow key={p.id} p={p}
            open={expandedId===p.id}
            sel={selectedId===p.id}
            onClick={()=>{onSelect(p.id); setExpandedId(expandedId===p.id?null:p.id);}}/>
        ))}
        <button className="v2-add-row">
          <Icons.Plus size={13}/> 人物を追加
        </button>
      </div>
    </aside>
  );
}

function V2PRow({ p, open, sel, onClick }) {
  const initial = (p.name || '？').split(' ').slice(-1)[0].charAt(0);
  return (
    <div className={`v2-prow v2-prow-${p.role} ${open?'is-open':''} ${sel?'is-sel':''}`}>
      <div className="v2-prow__head" onClick={onClick}>
        <div className={`v2-prow__avatar v2-av-${p.role}`}>
          {initial}
        </div>
        <div className="v2-prow__main">
          <div className="v2-prow__row1">
            <span className="v2-prow__name">{p.name}</span>
            <span className={`v2-pill v2-pill-${p.role}`}>
              <span className="v2-pill__dot" style={{background:'currentColor'}}/>
              {p.role}
            </span>
          </div>
          <div className="v2-prow__row2">
            <span>{p.relation || '本人'}</span>
            {p.death && <>
              <span style={{color:'var(--m-ink-300)'}}>•</span>
              <span style={{color:'var(--mr-post)'}}>死亡 {p.death.replace(/年|月/g,'.').replace('日','')}</span>
            </>}
            {!p.death && p.birth && <>
              <span style={{color:'var(--m-ink-300)'}}>•</span>
              <span>{p.birth}</span>
            </>}
          </div>
        </div>
        <Icons.Chevron size={14} style={{color:'var(--m-ink-400)',
          transform: open?'rotate(180deg)':''}}/>
      </div>
      {open && <V2PDetail p={p}/>}
    </div>
  );
}

function V2PDetail({ p }) {
  const [tab, setTab] = useStateV2('basic');
  return (
    <div className="v2-prow__body">
      <div className="v2-tabs">
        <button className={`v2-tab ${tab==='basic'?'is-on':''}`} onClick={()=>setTab('basic')}>基本</button>
        <button className={`v2-tab ${tab==='dates'?'is-on':''}`} onClick={()=>setTab('dates')}>日付</button>
        <button className={`v2-tab ${tab==='docs'?'is-on':''}`} onClick={()=>setTab('docs')}>必要書類</button>
      </div>
      {tab==='basic' && (
        <div className="v2-pd">
          <div className="v2-field">
            <div className="v2-field__label">氏名</div>
            <input className="v2-input" defaultValue={p.name}/>
          </div>
          <div className="v2-pd__grid2">
            <div className="v2-field">
              <div className="v2-field__label">続柄</div>
              <div className="v2-select"><span>{p.relation||'—'}</span><Icons.Chevron size={11}/></div>
            </div>
            <div className="v2-field">
              <div className="v2-field__label">配偶者</div>
              <div className="v2-select v2-select--dim"><span>{p.spouse?'相続 太郎':'指定なし'}</span><Icons.Chevron size={11}/></div>
            </div>
          </div>
          {p.address && (
            <div className="v2-field">
              <div className="v2-field__label">現住所</div>
              <input className="v2-input" defaultValue={p.address}/>
            </div>
          )}
        </div>
      )}
      {tab==='docs' && (
        <div className="v2-docgrid">
          {(p.docs||[]).map(d => (
            <label className="v2-docchk" key={d}>
              <input type="checkbox" defaultChecked/>
              <span className="v2-docchk__box"><Icons.Check size={9}/></span>
              <span>{DOC_LABELS[d]||d}</span>
            </label>
          ))}
        </div>
      )}
      {tab==='dates' && (
        <div className="v2-pd">
          <div className="v2-field">
            <div className="v2-field__label">生年月日</div>
            <div className="v2-pd__grid2" style={{gap:6}}>
              <div className="v2-select"><span>{p.birth?.split('年')[0] || '—'}年</span><Icons.Chevron size={11}/></div>
              <div className="v2-pd__grid2" style={{gap:6}}>
                <div className="v2-select"><span>3月</span><Icons.Chevron size={11}/></div>
                <div className="v2-select"><span>15日</span><Icons.Chevron size={11}/></div>
              </div>
            </div>
          </div>
          {p.death && (
            <div className="v2-field">
              <div className="v2-field__label">死亡年月日</div>
              <div className="v2-select" style={{color:'var(--mr-post)'}}>
                <span>{p.death}</span><Icons.Chevron size={11}/>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Canvas & cards ----------
function V2DiagramCanvas({ data, layout, tagsOn, selectedId }) {
  return (
    <div style={{width: 860, height: 840, position:'relative'}}>
      <V2DHeader data={data}/>
      <V2DLines data={data} layout={layout}/>
      {data.people.map(p => {
        const pos = layout[p.id];
        if (!pos) return null;
        return <V2DCard key={p.id} p={p} x={pos.x} y={pos.y} tagsOn={tagsOn}
          selected={selectedId===p.id}/>;
      })}
    </div>
  );
}

function V2DHeader({ data }) {
  const bsz = data.people.find(p => p.isBSZ);
  return (
    <div className="v2-dheader">
      <h1 className="v2-dheader__title">相続関係説明図</h1>
      <div className="v2-dheader__subject">
        <span className="v2-dheader__subject-label">被相続人</span>
        <span className="v2-dheader__subject-name">{bsz?.name}</span>
      </div>
      <dl className="v2-dheader__meta">
        <dt>最後の本籍</dt><dd>{data.honseki}</dd>
        <dt>最後の住所</dt><dd>{data.lastAddr}</dd>
        <dt>登記簿上住所</dt><dd>{data.regAddr}</dd>
      </dl>
    </div>
  );
}

function V2DCard({ p, x, y, tagsOn, selected }) {
  const docs = ROLE_DOCS[p.role] || [];
  return (
    <div className={`v2-dcard v2-dcard-${p.role} ${selected?'is-sel':''} ${p.isBSZ?'is-bsz':''}`}
      style={{ left: x, top: y, width: 230 }}>
      <div className="v2-dcard__head">
        <div className="v2-dcard__role-row">
          <span className={`v2-pill v2-pill-${p.role}`}>
            <span className="v2-pill__dot" style={{background:'currentColor'}}/>
            {p.role}
          </span>
        </div>
        {p.relation && <span className="v2-dcard__kicker">{p.relation}</span>}
      </div>
      <div className="v2-dcard__body">
        <div className="v2-dcard__name">{p.name}</div>
        <dl className="v2-dcard__meta">
          {p.birth && <><dt>出生</dt><dd>{p.birth}</dd></>}
          {p.death && <><dt>死亡</dt><dd>{p.death}</dd></>}
          {!p.isBSZ && p.address && <><dt>住所</dt><dd className="v2-dcard__addr">{p.address}</dd></>}
        </dl>
      </div>
      {tagsOn && docs.length > 0 && (
        <div className="v2-dcard__docs">
          {docs.map(d => <span key={d} className="v2-dcard__tag">{d}</span>)}
        </div>
      )}
    </div>
  );
}

function V2DLines({ data, layout }) {
  // Reuse same auto-routing but draw lighter
  const CARD_W = 230, CARD_H = 140;
  const byId = {}; data.people.forEach(p => byId[p.id] = p);
  const pos = id => layout[id];
  const cx = id => pos(id).x + CARD_W/2;
  const cy = id => pos(id).y + CARD_H/2;
  const right = id => pos(id).x + CARD_W;
  const top = id => pos(id).y;
  const bot = id => pos(id).y + CARD_H;
  const left = id => pos(id).x;

  const lines = [];
  const drawnSp = new Set();

  data.people.forEach(p => {
    if (p.spouse && byId[p.spouse]) {
      const key = [p.id, p.spouse].sort().join('-');
      if (drawnSp.has(key)) return;
      drawnSp.add(key);
      const a = p.id, b = p.spouse;
      const aLeft = left(a) < left(b) ? a : b;
      const aRight = aLeft === a ? b : a;
      const y = cy(aLeft);
      lines.push({x1: right(aLeft), y1: y-2, x2: left(aRight), y2: y-2, key:`s1-${key}`, stroke:'var(--m-ink-400)'});
      lines.push({x1: right(aLeft), y1: y+2, x2: left(aRight), y2: y+2, key:`s2-${key}`, stroke:'var(--m-ink-400)'});
    }
  });

  const pairs = {};
  data.people.forEach(c => {
    if (!c.father && !c.mother) return;
    const key = [c.father,c.mother].filter(Boolean).sort().join('-');
    if (!pairs[key]) pairs[key] = { parents:[c.father,c.mother].filter(Boolean), kids:[]};
    pairs[key].kids.push(c);
  });

  Object.values(pairs).forEach(({parents, kids}) => {
    if (!parents.length || !kids.length) return;
    const ps = parents.map(id => ({id, x:left(id), r:right(id)}));
    const midX = parents.length===2
      ? (Math.max(...ps.map(p=>p.x)) + Math.min(...ps.map(p=>p.r)))/2
      : cx(parents[0]);
    const parentY = parents.length===2 ? cy(parents[0]) : bot(parents[0]);
    const minKidTop = Math.min(...kids.map(k=>top(k.id)));
    const jy = Math.round((Math.max(...parents.map(id=>bot(id))) + minKidTop)/2);

    lines.push({x1:midX,y1:parentY,x2:midX,y2:jy,key:`pd-${midX}`,stroke:'var(--m-ink-300)'});

    if (kids.length===1) {
      const k = kids[0];
      lines.push({x1:midX,y1:jy,x2:cx(k.id),y2:jy,key:`h-${k.id}`,stroke:'var(--m-ink-300)'});
      lines.push({x1:cx(k.id),y1:jy,x2:cx(k.id),y2:top(k.id),key:`d-${k.id}`,stroke:'var(--m-ink-300)'});
    } else {
      const kxs = kids.map(k=>cx(k.id));
      const lx = Math.min(...kxs), rx = Math.max(...kxs);
      lines.push({x1:lx,y1:jy,x2:rx,y2:jy,key:`hr-${lx}`,stroke:'var(--m-ink-300)'});
      kids.forEach(k=>lines.push({x1:cx(k.id),y1:jy,x2:cx(k.id),y2:top(k.id),key:`d-${k.id}`,stroke:'var(--m-ink-300)'}));
    }
  });

  return (
    <svg className="v2-dlines" width="100%" height="100%">
      {lines.map(l => (
        <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="#c9cdd3" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
    </svg>
  );
}

function V2Workspace() {
  const data = TEST_DATA_1;
  const layoutData = {
    1: { x: 300, y: 340 },
    2: { x: 580, y: 340 },
    3: { x: 180, y: 560 },
    4: { x: 480, y: 560 },
  };
  const [selectedId, setSelectedId] = useStateV2(1);
  const [expandedId, setExpandedId] = useStateV2(1);
  const [tagsOn] = useStateV2(true);
  const [zoom, setZoom] = useStateV2(75);

  return (
    <div className="v2-shell">
      <V2Top/>
      <div className="v2-body">
        <V2Side data={data}
          selectedId={selectedId} onSelect={setSelectedId}
          expandedId={expandedId} setExpandedId={setExpandedId}/>

        <div className="v2-canvas">
          <div className="v2-canvas__top">
            <div className="v2-canvas__top-left">
              <span className="v2-canvas__title">相続関係図</span>
              <span className="v2-canvas__meta">A4 縦 · {data.people.length}名</span>
            </div>
            <div className="v2-canvas__top-right">
              <button className="v2-btn"><Icons.Layout size={13}/> 配置</button>
              <button className="v2-btn"><Icons.Wand size={13}/> 自動整列</button>
            </div>
          </div>

          <div className="v2-canvas__scroll">
            <div style={{transform:`scale(${zoom/100})`, transformOrigin:'top center'}}>
              <V2DiagramCanvas data={data} layout={layoutData}
                tagsOn={tagsOn} selectedId={selectedId}/>
            </div>
          </div>

          <div className="v2-canvas__bottom">
            <div className="v2-legend">
              <span className="v2-legend__label">凡例</span>
              {['被相続人','相続人','遺産分割','数次相続人','先死亡'].map(r => (
                <div key={r} className="v2-legend__item">
                  <span className="v2-legend__dot" style={{
                    background:`var(--mr-${{被相続人:'bsz',相続人:'heir',遺産分割:'waiver',数次相続人:'suuji',先死亡:'pre'}[r]})`
                  }}/>
                  <span>{r}</span>
                </div>
              ))}
            </div>
            <div className="v2-zoom">
              <button className="v2-zoom__btn" onClick={()=>setZoom(Math.max(30,zoom-10))}>
                <Icons.ZoomOut size={13}/>
              </button>
              <span className="v2-zoom__val">{zoom}%</span>
              <button className="v2-zoom__btn" onClick={()=>setZoom(Math.min(150,zoom+10))}>
                <Icons.ZoomIn size={13}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { V2Top, V2Side, V2DiagramCanvas, V2DCard, V2Workspace });
