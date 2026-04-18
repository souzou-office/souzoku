// app-components.jsx — TopBar + PersonSidebar

function TopBar({ onOpenWizard, onPreview, onSave, onLoad, tagsOn, onToggleTags, layout, onToggleLayout, onUndo, onRedo, bszName }) {
  return (
    <header className="top-bar">
      <div className="top-bar__left">
        <div className="brand">
          <div className="brand__mark" aria-hidden>
            <svg viewBox="0 0 32 32" width="22" height="22">
              <rect x="2" y="2" width="28" height="28" rx="3" fill="#8c2a2b"/>
              <text x="16" y="22" textAnchor="middle" fontFamily="Shippori Mincho, serif" fontWeight="600" fontSize="17" fill="#fdfaf1" letterSpacing="-.5">相</text>
            </svg>
          </div>
          <div className="brand__text">
            <div className="brand__title">相続関係説明図</div>
            <div className="brand__sub">作成ツール</div>
          </div>
        </div>
        <div className="top-bar__divider" />
        <div className="doc-switcher">
          <button className="doc-tab is-active">
            <Icons.Paper size={13}/> {bszName || '(未入力)'} ・ 相続関係図
          </button>
        </div>
      </div>
      <div className="top-bar__right">
        <div className="btn-group">
          <button className="t-btn t-btn--ghost" title="元に戻す (Ctrl+Z)" onClick={onUndo}><Icons.Undo size={15}/></button>
          <button className="t-btn t-btn--ghost" title="やり直す (Ctrl+Y)" onClick={onRedo}><Icons.Redo size={15}/></button>
        </div>
        <div className="top-bar__divider" />
        <button className="t-btn t-btn--primary" onClick={onOpenWizard}>
          <Icons.Sparkle size={14}/> かんたん入力
        </button>
        <div className="btn-group">
          <button className="t-btn t-btn--ghost" onClick={onSave}><Icons.Save size={14}/> 保存</button>
          <button className="t-btn t-btn--ghost" onClick={onLoad}><Icons.Upload size={14}/> 読込</button>
        </div>
        <div className="top-bar__divider" />
        <button className={`t-btn t-btn--toggle ${tagsOn?'is-on':''}`} onClick={onToggleTags}>
          <Icons.Tag size={14}/> 書類タグ
          <span className="t-btn__state">{tagsOn?'ON':'OFF'}</span>
        </button>
        <button className="t-btn t-btn--ghost" onClick={onToggleLayout}>
          {layout==='vertical' ? <Icons.Layout size={14}/> : <Icons.LayoutH size={14}/>}
          配置: {layout==='vertical'?'縦':'横'}
        </button>
        <div className="top-bar__divider" />
        <button className="t-btn t-btn--outline" onClick={onPreview}>
          <Icons.Eye size={14}/> プレビュー・印刷
        </button>
      </div>
    </header>
  );
}

function PersonSidebar({ data, setData, people, selectedId, onSelect, expandedId, setExpandedId, onAddPerson, onDeletePerson }) {
  const onHeadInput = (k, v) => setData(d => ({ ...d, [k]:v }));
  return (
    <aside className="side">
      <div className="side__head">
        <div className="side__title">被相続人の情報</div>
        <div className="side__form">
          <label className="lbl">最後の本籍</label>
          <input className="inp" value={data.honseki||''} onChange={e=>onHeadInput('honseki',e.target.value)} placeholder="東京都..."/>
          <label className="lbl">最後の住所</label>
          <input className="inp" value={data.lastAddr||''} onChange={e=>onHeadInput('lastAddr',e.target.value)} placeholder="東京都..."/>
          <label className="lbl">登記簿上の住所</label>
          <input className="inp" value={data.regAddr||''} onChange={e=>onHeadInput('regAddr',e.target.value)} placeholder="登記簿上の住所..."/>
        </div>
      </div>
      <div className="side__list-header">
        <div>
          <div className="side__title">関係者</div>
          <div className="side__count">{people.length}名 登録済み</div>
        </div>
      </div>
      <div className="side__list">
        {people.map(p => (
          <PersonRow key={p.id} p={p} allPeople={people}
            expanded={expandedId===p.id}
            selected={selectedId===p.id}
            onClick={() => { onSelect(p.id); setExpandedId(expandedId===p.id?null:p.id); }}
            setData={setData}
            onDelete={() => onDeletePerson(p.id)}
          />
        ))}
      </div>
      <div className="side__foot">
        <button className="btn-add-row" onClick={onAddPerson}>
          <Icons.Plus size={14}/> 人物を追加
        </button>
      </div>
    </aside>
  );
}

function PersonRow({ p, allPeople, expanded, selected, onClick, setData, onDelete }) {
  const role = p.role || '';
  const birthStr = dateToStr(p,'birth');
  const deathStr = dateToStr(p,'death');
  return (
    <div className={`pr ${expanded?'is-open':''} ${selected?'is-sel':''}`}>
      <div className={`pr__bar pr-c-${role}`} />
      <div className="pr__head" onClick={onClick}>
        <div className="pr__main">
          <div className="pr__top">
            <span className="pr__name">{p.name || '(未入力)'}</span>
            {role && <span className={`pill pill-${role}`}>{role}</span>}
          </div>
          <div className="pr__sub">
            {p.relation && <span>{p.relation}</span>}
            {birthStr && (<><span className="pr__dot">·</span><span>{birthStr}</span></>)}
            {deathStr && (<><span className="pr__dot">·</span><span className="pr__death">{deathStr} 死亡</span></>)}
          </div>
        </div>
        <Icons.Chevron size={14} style={{color:'var(--ink-500)',transition:'transform .2s',transform: expanded?'rotate(180deg)':''}}/>
      </div>
      {expanded && <PersonDetail p={p} allPeople={allPeople} setData={setData} onDelete={onDelete}/>}
    </div>
  );
}

function PersonDetail({ p, allPeople, setData, onDelete }) {
  const [tab, setTab] = useState('basic');
  const upd = (field, value) => {
    setData(d => {
      const ppl = d.people.map(x => x.id===p.id ? { ...x, [field]:value } : x);
      // if updating spouse, also update the pair
      if (field === 'spouse') {
        return { ...d, people: ppl.map(x => {
          if (x.id===p.id) return x;
          if (value && String(x.id)===String(value)) return { ...x, spouse:String(p.id) };
          if (String(x.spouse)===String(p.id) && String(x.id)!==String(value)) return { ...x, spouse:'' };
          return x;
        })};
      }
      return { ...d, people: ppl };
    });
  };
  const others = allPeople.filter(x => x.id !== p.id);
  return (
    <div className="pr__body">
      <div className="sub-tabs">
        <button className={`sub-tab ${tab==='basic'?'is-on':''}`} onClick={()=>setTab('basic')}>基本情報</button>
        <button className={`sub-tab ${tab==='dates'?'is-on':''}`} onClick={()=>setTab('dates')}>日付・立場</button>
        <button className={`sub-tab ${tab==='docs'?'is-on':''}`} onClick={()=>setTab('docs')}>必要書類</button>
      </div>
      {tab==='basic' && (
        <div className="pd">
          <div className="pd__row pd__row--2">
            <div className="field">
              <div className="lbl">氏名</div>
              <input className="inp-text" value={p.name||''} onChange={e=>upd('name',e.target.value)} placeholder="例：山田 太郎"/>
            </div>
            {!p.isBSZ && (
              <div className="field">
                <div className="lbl">続柄</div>
                <select className="inp-select" value={p.relation||''} onChange={e=>upd('relation',e.target.value)}>
                  {ZOKUGARA.map(z => <option key={z} value={z}>{z||'-- 選択 --'}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="pd__row pd__row--2">
            <div className="field">
              <div className="lbl">父</div>
              <select className="inp-select" value={p.father||''} onChange={e=>upd('father',e.target.value)}>
                <option value="">-- なし --</option>
                {others.map(x => <option key={x.id} value={x.id}>{x.name||'(未入力)'}</option>)}
              </select>
            </div>
            <div className="field">
              <div className="lbl">母</div>
              <select className="inp-select" value={p.mother||''} onChange={e=>upd('mother',e.target.value)}>
                <option value="">-- なし --</option>
                {others.map(x => <option key={x.id} value={x.id}>{x.name||'(未入力)'}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <div className="lbl">配偶者</div>
            <select className="inp-select" value={p.spouse||''} onChange={e=>upd('spouse',e.target.value)}>
              <option value="">-- なし --</option>
              {others.map(x => <option key={x.id} value={x.id}>{x.name||'(未入力)'}</option>)}
            </select>
          </div>
          {!p.isBSZ && (
            <div className="field">
              <div className="lbl">住所</div>
              <textarea className="inp-area" value={p.address||''} onChange={e=>upd('address',e.target.value)} rows="2" placeholder="東京都新宿区..."/>
            </div>
          )}
        </div>
      )}
      {tab==='dates' && (
        <div className="pd">
          <div className="pd__date-group">
            <div className="lbl">生年月日</div>
            <div className="pd__date-row">
              <select className="inp-select date-sel date-sel--wide" value={p.birthY||''} onChange={e=>upd('birthY',e.target.value)}>
                {YEAR_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="inp-select date-sel" value={p.birthM||''} onChange={e=>upd('birthM',e.target.value)}>
                {MONTH_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="inp-select date-sel" value={p.birthD||''} onChange={e=>upd('birthD',e.target.value)}>
                {DAY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="pd__date-group">
            <div className="lbl">死亡年月日</div>
            <div className="pd__date-row">
              <select className="inp-select date-sel date-sel--wide" value={p.deathY||''} onChange={e=>upd('deathY',e.target.value)}>
                {YEAR_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="inp-select date-sel" value={p.deathM||''} onChange={e=>upd('deathM',e.target.value)}>
                {MONTH_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="inp-select date-sel" value={p.deathD||''} onChange={e=>upd('deathD',e.target.value)}>
                {DAY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          {!p.isBSZ && (
            <div className="pd__role">
              <div className="lbl">立場 <span className="lbl__note">自動判定: {p._autoRole||p.role||''}</span></div>
              <select className="inp-select" value={p.roleOverride||''} onChange={e=>upd('roleOverride',e.target.value)}>
                {ROLE_LIST.map(r => <option key={r} value={r}>{r || '自動判定'}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
      {tab==='docs' && (
        <div className="pd pd--docs">
          <div className="pd__docs-head">取得・準備が必要な書類</div>
          <div className="pd__docs-list">
            {(ROLE_DOCS[p.role]||[]).map(d => (
              <label className="doc-chk" key={d}>
                <input type="checkbox" defaultChecked readOnly/>
                <span className="doc-chk__box"><Icons.Check size={10}/></span>
                <span className="doc-chk__label">{DOC_LABELS[d] || d}</span>
              </label>
            ))}
            {(!ROLE_DOCS[p.role] || !ROLE_DOCS[p.role].length) && (
              <div className="pd__empty">このロールでは不要</div>
            )}
          </div>
        </div>
      )}
      {!p.isBSZ && (
        <div className="pd__actions">
          <button className="t-btn t-btn--danger-ghost" onClick={onDelete}>
            <Icons.Trash size={12}/> この人物を削除
          </button>
        </div>
      )}
    </div>
  );
}

const DOC_LABELS = {
  '生亡': '出生から死亡までの戸籍',
  '住所': '住民票の除票 / 住民票',
  '現戸': '現在の戸籍謄本',
  '印証': '印鑑登録証明書',
  '遺分': '遺産分割協議書への実印',
};

Object.assign(window, { TopBar, PersonSidebar, PersonRow, PersonDetail, DOC_LABELS });
