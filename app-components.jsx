// app-components.jsx — v2 (Modern SaaS) TopBar + Sidebar

function TopBar({ onOpenWizard, onPreview, onSave, onLoad, tagsOn, onToggleTags, layout, onToggleLayout, onUndo, onRedo, onShare, bszName }) {
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
          <span className="v2-crumb__folder">作業中</span>
          <Icons.ChevronRight size={12} style={{color:'var(--m-ink-400)'}}/>
          <span className="v2-crumb__doc">{bszName || '（被相続人 未入力）'} 様</span>
        </div>
      </div>
      <div className="v2-top__right">
        <button className="v2-btn v2-btn--icon" title="元に戻す (Ctrl+Z)" onClick={onUndo}><Icons.Undo size={14}/></button>
        <button className="v2-btn v2-btn--icon" title="やり直す (Ctrl+Y)" onClick={onRedo}><Icons.Redo size={14}/></button>
        <div className="v2-top__sep"/>
        <button className="v2-btn" onClick={onOpenWizard}><Icons.Wand size={13}/> かんたん入力</button>
        <button className="v2-btn" onClick={onSave}><Icons.Save size={13}/> 保存</button>
        <button className="v2-btn" onClick={onLoad}><Icons.Upload size={13}/> 読込</button>
        <div className="v2-top__sep"/>
        <div className={`v2-switch ${tagsOn?'is-on':''}`} onClick={onToggleTags}>
          <span>書類タグ</span>
          <div className="v2-switch__track"><div className="v2-switch__thumb"/></div>
        </div>
        <button className="v2-btn v2-btn--outline" onClick={onShare}><Icons.Send size={13}/> 共有</button>
        <button className="v2-btn v2-btn--primary" onClick={onPreview}><Icons.Eye size={13}/> プレビュー</button>
      </div>
    </header>
  );
}

function PersonSidebar({ data, setData, people, selectedId, onSelect, expandedId, setExpandedId, onAddPerson, onDeletePerson }) {
  const onHeadInput = (k, v) => setData(d => ({ ...d, [k]:v }));
  return (
    <aside className="v2-side">
      <div className="v2-side__sec">
        <div className="v2-side__title">
          <span className="v2-side__title-text">被相続人</span>
        </div>
        <div className="v2-field">
          <div className="v2-field__label">最後の本籍</div>
          <input className="v2-input" value={data.honseki||''} onChange={e=>onHeadInput('honseki',e.target.value)} placeholder="東京都..."/>
        </div>
        <div className="v2-field">
          <div className="v2-field__label">最後の住所</div>
          <input className="v2-input" value={data.lastAddr||''} onChange={e=>onHeadInput('lastAddr',e.target.value)} placeholder="東京都..."/>
        </div>
        <div className="v2-field">
          <div className="v2-field__label">登記簿上の住所</div>
          <input className="v2-input" value={data.regAddr||''} onChange={e=>onHeadInput('regAddr',e.target.value)} placeholder="登記簿上の住所..."/>
        </div>
      </div>
      <div className="v2-plist__head">
        <span className="v2-side__title-text">関係者</span>
        <div className="v2-side__title-count">{people.length}</div>
      </div>
      <div className="v2-plist">
        {people.map(p => (
          <PersonRow key={p.id} p={p} allPeople={people}
            open={expandedId===p.id}
            sel={selectedId===p.id}
            onClick={() => { onSelect(p.id); setExpandedId(expandedId===p.id?null:p.id); }}
            setData={setData}
            onDelete={() => onDeletePerson(p.id)}
          />
        ))}
        <button className="v2-add-row" onClick={onAddPerson}>
          <Icons.Plus size={13}/> 人物を追加
        </button>
      </div>
    </aside>
  );
}

function PersonRow({ p, allPeople, open, sel, onClick, setData, onDelete }) {
  const role = p.role || '無関係';
  const initial = (p.name || '？').slice(-1).charAt(0) || '？';
  const birthStr = dateToStr(p,'birth');
  const deathStr = dateToStr(p,'death');
  return (
    <div className={`v2-prow v2-prow-${role} ${open?'is-open':''} ${sel?'is-sel':''}`}>
      <div className="v2-prow__head" onClick={onClick}>
        <div className={`v2-prow__avatar v2-av-${role}`}>{initial}</div>
        <div className="v2-prow__main">
          <div className="v2-prow__row1">
            <span className="v2-prow__name">{p.name || '(未入力)'}</span>
            {role && <span className={`v2-pill v2-pill-${role}`}>
              <span className="v2-pill__dot" style={{background:'currentColor'}}/>
              {role}
            </span>}
          </div>
          <div className="v2-prow__row2">
            <span>{p.relation || (p.isBSZ?'本人':'—')}</span>
            {deathStr && <>
              <span style={{color:'var(--m-ink-300)'}}>•</span>
              <span style={{color:'var(--mr-post)'}}>死亡 {deathStr}</span>
            </>}
            {!deathStr && birthStr && <>
              <span style={{color:'var(--m-ink-300)'}}>•</span>
              <span>{birthStr}</span>
            </>}
          </div>
        </div>
        <Icons.Chevron size={14} style={{color:'var(--m-ink-400)', transform: open?'rotate(180deg)':'', transition:'transform .2s'}}/>
      </div>
      {open && <PersonDetail p={p} allPeople={allPeople} setData={setData} onDelete={onDelete}/>}
    </div>
  );
}

function PersonDetail({ p, allPeople, setData, onDelete }) {
  const [tab, setTab] = useState('basic');
  const upd = (field, value) => {
    setData(d => {
      let ppl = d.people.map(x => x.id===p.id ? { ...x, [field]:value } : x);
      if (field === 'spouse') {
        ppl = ppl.map(x => {
          if (x.id===p.id) return x;
          if (value && String(x.id)===String(value)) return { ...x, spouse:String(p.id) };
          if (String(x.spouse)===String(p.id) && String(x.id)!==String(value)) return { ...x, spouse:'' };
          return x;
        });
      }
      return { ...d, people:ppl };
    });
  };
  const others = allPeople.filter(x => x.id !== p.id);
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
            <input className="v2-input-text" value={p.name||''} onChange={e=>upd('name',e.target.value)} placeholder="例：山田 太郎"/>
          </div>
          <div className="v2-pd__grid2">
            {!p.isBSZ && (
              <div className="v2-field">
                <div className="v2-field__label">続柄</div>
                <select className="v2-input-select" value={p.relation||''} onChange={e=>upd('relation',e.target.value)}>
                  {ZOKUGARA.map(z => <option key={z} value={z}>{z||'-- 選択 --'}</option>)}
                </select>
              </div>
            )}
            <div className="v2-field">
              <div className="v2-field__label">配偶者</div>
              <select className="v2-input-select" value={p.spouse||''} onChange={e=>upd('spouse',e.target.value)}>
                <option value="">指定なし</option>
                {others.map(x => <option key={x.id} value={x.id}>{x.name||'(未入力)'}</option>)}
              </select>
            </div>
          </div>
          <div className="v2-pd__grid2">
            <div className="v2-field">
              <div className="v2-field__label">父</div>
              <select className="v2-input-select" value={p.father||''} onChange={e=>upd('father',e.target.value)}>
                <option value="">指定なし</option>
                {others.map(x => <option key={x.id} value={x.id}>{x.name||'(未入力)'}</option>)}
              </select>
            </div>
            <div className="v2-field">
              <div className="v2-field__label">母</div>
              <select className="v2-input-select" value={p.mother||''} onChange={e=>upd('mother',e.target.value)}>
                <option value="">指定なし</option>
                {others.map(x => <option key={x.id} value={x.id}>{x.name||'(未入力)'}</option>)}
              </select>
            </div>
          </div>
          {!p.isBSZ && (
            <div className="v2-field">
              <div className="v2-field__label">住所</div>
              <textarea className="v2-input-area" value={p.address||''} onChange={e=>upd('address',e.target.value)} rows="2" placeholder="東京都新宿区..."/>
            </div>
          )}
        </div>
      )}
      {tab==='dates' && (
        <div className="v2-pd">
          <div className="v2-field">
            <div className="v2-field__label">生年月日</div>
            <div className="v2-date-row">
              <select className="v2-input-select v2-date-y" value={p.birthY||''} onChange={e=>upd('birthY',e.target.value)}>
                {YEAR_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="v2-input-select" value={p.birthM||''} onChange={e=>upd('birthM',e.target.value)}>
                {MONTH_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="v2-input-select" value={p.birthD||''} onChange={e=>upd('birthD',e.target.value)}>
                {DAY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="v2-field">
            <div className="v2-field__label">死亡年月日</div>
            <div className="v2-date-row">
              <select className="v2-input-select v2-date-y" value={p.deathY||''} onChange={e=>upd('deathY',e.target.value)}>
                {YEAR_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="v2-input-select" value={p.deathM||''} onChange={e=>upd('deathM',e.target.value)}>
                {MONTH_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="v2-input-select" value={p.deathD||''} onChange={e=>upd('deathD',e.target.value)}>
                {DAY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          {!p.isBSZ && (
            <div className="v2-field">
              <div className="v2-field__label">立場 <span style={{color:'var(--m-ink-500)', fontWeight:400, fontSize:10}}>自動判定: {p._autoRole||p.role||''}</span></div>
              <select className="v2-input-select" value={p.roleOverride||''} onChange={e=>upd('roleOverride',e.target.value)}>
                {ROLE_LIST.map(r => <option key={r} value={r}>{r || '自動判定'}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
      {tab==='docs' && (
        <div className="v2-docgrid">
          {(ROLE_DOCS[p.role]||[]).map(d => (
            <label className="v2-docchk" key={d}>
              <input type="checkbox" defaultChecked readOnly/>
              <span className="v2-docchk__box"><Icons.Check size={9}/></span>
              <span>{DOC_LABELS[d]||d}</span>
            </label>
          ))}
          {(!ROLE_DOCS[p.role] || !ROLE_DOCS[p.role].length) && (
            <div style={{gridColumn:'1/-1', textAlign:'center', color:'var(--m-ink-500)', fontSize:12, padding:'12px 0'}}>このロールでは不要</div>
          )}
        </div>
      )}
      {!p.isBSZ && (
        <div style={{padding:'12px 0 4px', borderTop:'1px solid var(--m-border)', marginTop:12, display:'flex', justifyContent:'flex-end'}}>
          <button className="v2-btn" style={{color:'#dc2626'}} onClick={onDelete}>
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
