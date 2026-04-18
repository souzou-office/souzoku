// pro-app.jsx — The redesigned main 司法書士 workspace
const { useState, useMemo } = React;

// ============================================================
//  Top bar (header) — clean, flat, ink-dark
// ============================================================
function TopBar({ onOpenWizard, onPreview, tagsOn, onToggleTags, layout, onToggleLayout, mode, setMode }) {
  return (
    <header className="top-bar">
      <div className="top-bar__left">
        <div className="brand">
          <div className="brand__mark" aria-hidden>
            <svg viewBox="0 0 32 32" width="22" height="22">
              <rect x="2" y="2" width="28" height="28" rx="3" fill="#8c2a2b"/>
              <text x="16" y="22" textAnchor="middle"
                fontFamily="Shippori Mincho, serif" fontWeight="600"
                fontSize="17" fill="#fdfaf1" letterSpacing="-.5">相</text>
            </svg>
          </div>
          <div className="brand__text">
            <div className="brand__title">相続関係説明図</div>
            <div className="brand__sub">作成ツール</div>
          </div>
        </div>
        <div className="top-bar__divider" />
        <div className="doc-switcher">
          <button className={`doc-tab ${mode==='pro'?'is-active':''}`} onClick={()=>setMode('pro')}>
            <Icons.Paper size={13}/> 相続 太郎 ・ 相続関係図
          </button>
          <button className="doc-tab doc-tab--add" title="新規作成">
            <Icons.Plus size={14}/>
          </button>
        </div>
      </div>

      <div className="top-bar__right">
        <div className="btn-group">
          <button className="t-btn t-btn--ghost" title="元に戻す (⌘Z)"><Icons.Undo size={15}/></button>
          <button className="t-btn t-btn--ghost" title="やり直す (⌘⇧Z)"><Icons.Redo size={15}/></button>
        </div>

        <div className="top-bar__divider" />

        <button className="t-btn t-btn--primary" onClick={onOpenWizard}>
          <Icons.Sparkle size={14}/> かんたん入力
        </button>

        <div className="btn-group">
          <button className="t-btn t-btn--ghost"><Icons.Save size={14}/> 保存</button>
          <button className="t-btn t-btn--ghost"><Icons.Upload size={14}/> 読込</button>
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

// ============================================================
//  Person sidebar — list + detail editing
// ============================================================
function PersonSidebar({ data, selectedId, onSelect, expandedId, setExpandedId }) {
  return (
    <aside className="side">
      <div className="side__head">
        <div className="side__title">被相続人の情報</div>
        <div className="side__form">
          <label className="lbl">最後の本籍</label>
          <input className="inp" defaultValue={data.honseki} />
          <label className="lbl">最後の住所</label>
          <input className="inp" defaultValue={data.lastAddr} />
          <label className="lbl">登記簿上の住所</label>
          <input className="inp" defaultValue={data.regAddr} />
        </div>
      </div>

      <div className="side__list-header">
        <div>
          <div className="side__title">関係者</div>
          <div className="side__count">{data.people.length}名 登録済み</div>
        </div>
        <button className="t-btn t-btn--icon" title="検索"><Icons.Search size={14}/></button>
      </div>

      <div className="side__list">
        {data.people.map(p => (
          <PersonRow key={p.id} p={p}
            expanded={expandedId === p.id}
            selected={selectedId === p.id}
            onClick={() => {
              onSelect(p.id);
              setExpandedId(expandedId === p.id ? null : p.id);
            }} />
        ))}
      </div>

      <div className="side__foot">
        <button className="btn-add-row">
          <Icons.Plus size={14}/> 人物を追加
        </button>
      </div>
    </aside>
  );
}

function PersonRow({ p, expanded, selected, onClick }) {
  const role = p.role || '';
  return (
    <div className={`pr ${expanded?'is-open':''} ${selected?'is-sel':''}`}>
      <div className={`pr__bar pr-c-${role}`} />
      <div className="pr__head" onClick={onClick}>
        <div className="pr__avatar">
          <Icons.User size={14}/>
        </div>
        <div className="pr__main">
          <div className="pr__top">
            <span className="pr__name">{p.name || '(未入力)'}</span>
            {role && <span className={`pill pill-${role}`}>{role}</span>}
          </div>
          <div className="pr__sub">
            {p.relation && <span>{p.relation}</span>}
            {p.birth && <>
              <span className="pr__dot">·</span>
              <span>{p.birth}</span>
            </>}
            {p.death && <>
              <span className="pr__dot">·</span>
              <span className="pr__death">{p.death} 死亡</span>
            </>}
          </div>
        </div>
        <Icons.Chevron size={14} style={{color:'var(--ink-500)',transition:'transform .2s',
          transform: expanded?'rotate(180deg)':''}}/>
      </div>

      {expanded && <PersonDetail p={p}/>}
    </div>
  );
}

function PersonDetail({ p }) {
  const [tab, setTab] = useState('basic');
  return (
    <div className="pr__body">
      <div className="sub-tabs">
        <button className={`sub-tab ${tab==='basic'?'is-on':''}`} onClick={()=>setTab('basic')}>基本情報</button>
        <button className={`sub-tab ${tab==='dates'?'is-on':''}`} onClick={()=>setTab('dates')}>日付・立場</button>
        <button className={`sub-tab ${tab==='docs'?'is-on':''}`} onClick={()=>setTab('docs')}>必要書類</button>
      </div>

      {tab === 'basic' && (
        <div className="pd">
          <div className="pd__row pd__row--2">
            <Field label="氏名" value={p.name} />
            {!p.isBSZ && <Field label="続柄" value={p.relation} kind="select"/>}
          </div>
          <div className="pd__row pd__row--2">
            <Field label="父" value="指定なし" kind="select" dim />
            <Field label="母" value="指定なし" kind="select" dim />
          </div>
          <Field label="配偶者" value={p.spouse ? '相続 太郎' : '指定なし'} kind="select" dim={!p.spouse}/>
          {!p.isBSZ && p.address && <Field label="住所" value={p.address} multi/>}
        </div>
      )}
      {tab === 'dates' && (
        <div className="pd">
          <div className="pd__date-group">
            <div className="lbl">生年月日</div>
            <div className="pd__date-row">
              <DateSelect value="昭和15年" wide/>
              <DateSelect value="3月"/>
              <DateSelect value="15日"/>
            </div>
          </div>
          <div className="pd__date-group">
            <div className="lbl">死亡年月日</div>
            <div className="pd__date-row">
              <DateSelect value={p.death ? '令和7年' : '—'} wide/>
              <DateSelect value={p.death ? '1月' : '—'}/>
              <DateSelect value={p.death ? '10日' : '—'}/>
            </div>
          </div>
          {!p.isBSZ && (
            <div className="pd__role">
              <div className="lbl">立場 <span className="lbl__note">自動判定: {p.role}</span></div>
              <select className="inp inp--select">
                <option>自動判定</option>
                <option>相続人</option>
                <option>遺産分割</option>
              </select>
            </div>
          )}
        </div>
      )}
      {tab === 'docs' && (
        <div className="pd pd--docs">
          <div className="pd__docs-head">取得・準備が必要な書類</div>
          <div className="pd__docs-list">
            {(p.docs || []).map(d => (
              <label className="doc-chk" key={d}>
                <input type="checkbox" defaultChecked/>
                <span className="doc-chk__box"><Icons.Check size={10}/></span>
                <span className="doc-chk__label">{DOC_LABELS[d] || d}</span>
              </label>
            ))}
            {(!p.docs || !p.docs.length) && (
              <div className="pd__empty">このロールでは不要</div>
            )}
          </div>
        </div>
      )}

      {!p.isBSZ && (
        <div className="pd__actions">
          <button className="t-btn t-btn--danger-ghost">
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

function Field({ label, value, kind='text', multi, dim }) {
  return (
    <div className={`field ${dim?'field--dim':''}`}>
      <div className="lbl">{label}</div>
      {multi ? (
        <div className="inp inp--multi">{value}</div>
      ) : kind === 'select' ? (
        <div className="inp inp--select-disp">
          <span>{value}</span>
          <Icons.Chevron size={12}/>
        </div>
      ) : (
        <input className="inp" defaultValue={value || ''}/>
      )}
    </div>
  );
}
function DateSelect({ value, wide }) {
  return (
    <div className={`date-sel ${wide?'date-sel--wide':''}`}>
      <span>{value}</span>
      <Icons.Chevron size={11}/>
    </div>
  );
}

Object.assign(window, { TopBar, PersonSidebar, PersonRow, PersonDetail, DOC_LABELS });
