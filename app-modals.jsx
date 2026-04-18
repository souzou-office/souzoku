// app-modals.jsx — Wizard / Preview / Share modals

// ============================================================
//  Simplified Wizard — core flow only (name/death/spouse/children/parents/confirm).
//  Advanced branches (ex-spouse names, adoptees, nephew flows) are captured
//  but without deep sub-steps.
// ============================================================

const CHILD_REL_M = ['長男','二男','三男','四男','五男'];
const CHILD_REL_F = ['長女','二女','三女','四女','五女'];

function wizInitData() {
  return {
    name:'', deathY:'', deathM:'', deathD:'',
    honseki:'', lastAddr:'', regAddr:'',
    spouse:null, children:[], exSpouse:null, exChildren:[], adoptees:[],
    parents:[], siblings:[], hasChildren:false, specialCircumstances:[],
  };
}

function Wizard({ isClient, onClose, onApply }) {
  const [step, setStep] = useState('name');
  const [data, setData] = useState(wizInitData);
  const [childIdx, setChildIdx] = useState(0);
  const [sibIdx, setSibIdx] = useState(0);
  const [history, setHistory] = useState([]);

  const push = () => setHistory(h => [...h, { step, data:JSON.parse(JSON.stringify(data)), childIdx, sibIdx }]);
  const back = () => {
    if (!history.length) return;
    const p = history[history.length-1];
    setHistory(h => h.slice(0,-1));
    setStep(p.step); setData(p.data); setChildIdx(p.childIdx); setSibIdx(p.sibIdx);
  };

  const progress = (() => {
    const map = { name:1, death:2, spouse:3, spouse_status:4, spouse_death:4,
      children:5, child_count:6, child_detail:7, child_before_after:7,
      special:8, parents:9, siblings:10, sib_count:11, confirm:12 };
    return ((map[step]||1)/12)*100;
  })();

  const Body = () => {
    switch(step) {
      case 'name': return (
        <>
          {isClient && <div className="client-banner">相続の手続きに必要な情報をおうかがいします。<br/>質問に順番にお答えください。</div>}
          <div className="q-title">亡くなった方のお名前を教えてください。</div>
          <div className="q-hint">戸籍に記載されているお名前をご記入ください。</div>
          <input className="v2-input-text" style={{marginBottom:12}} autoFocus
            value={data.name} onChange={e=>setData({...data,name:e.target.value})} placeholder="例：山田 太郎"/>
          <button className="q-btn primary" onClick={()=>{ push(); setStep('death'); }}>次へ →</button>
        </>
      );
      case 'death': return (
        <>
          <div className="q-title">{data.name}さんがお亡くなりになった日を教えてください。</div>
          <div className="q-hint">年月日をそれぞれ選択してください。</div>
          <div className="v2-date-row" style={{marginBottom:14, gap:6}}>
            <select className="v2-input-select" style={{flex:2.2}} value={data.deathY} onChange={e=>setData({...data,deathY:e.target.value})}>
              {YEAR_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="v2-input-select" style={{flex:1}} value={data.deathM} onChange={e=>setData({...data,deathM:e.target.value})}>
              {MONTH_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="v2-input-select" style={{flex:1}} value={data.deathD} onChange={e=>setData({...data,deathD:e.target.value})}>
              {DAY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button className="q-btn primary" onClick={()=>{ push(); setStep('spouse'); }}>次へ →</button>
        </>
      );
      case 'spouse': return (
        <>
          <div className="q-title">{data.name}さんに配偶者（夫または妻）はいらっしゃいましたか？</div>
          <div className="q-hint">離婚済みの場合は「いいえ」を選んでください。</div>
          <div className="q-btns">
            <button className="q-btn" onClick={()=>{ push(); setData({...data, spouse:{name:'', alive:true}}); setStep('spouse_status'); }}>はい</button>
            <button className="q-btn" onClick={()=>{ push(); setData({...data, spouse:null}); setStep('children'); }}>いいえ（未婚・離婚済み）</button>
          </div>
        </>
      );
      case 'spouse_status': return (
        <>
          <div className="q-title">配偶者の方について教えてください。</div>
          <label className="v2-field__label" style={{marginBottom:4}}>配偶者のお名前</label>
          <input className="v2-input-text" style={{marginBottom:14}}
            value={data.spouse?.name||''} onChange={e=>setData({...data, spouse:{...data.spouse, name:e.target.value}})} placeholder="例：山田 花子"/>
          <div className="q-title" style={{fontSize:14, marginBottom:8}}>現在ご存命ですか？</div>
          <div className="q-btns">
            <button className="q-btn" onClick={()=>{ push(); setData({...data, spouse:{...data.spouse, alive:true}}); setStep('children'); }}>存命です</button>
            <button className="q-btn" onClick={()=>{ push(); setData({...data, spouse:{...data.spouse, alive:false}}); setStep('spouse_death'); }}>亡くなっています</button>
          </div>
        </>
      );
      case 'spouse_death': return (
        <>
          <div className="q-title">配偶者の方がお亡くなりになった日を教えてください。</div>
          <div className="v2-date-row" style={{marginBottom:14, gap:6}}>
            <select className="v2-input-select" style={{flex:2.2}} value={data.spouse?.deathY||''} onChange={e=>setData({...data, spouse:{...data.spouse, deathY:e.target.value}})}>
              {YEAR_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="v2-input-select" style={{flex:1}} value={data.spouse?.deathM||''} onChange={e=>setData({...data, spouse:{...data.spouse, deathM:e.target.value}})}>
              {MONTH_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="v2-input-select" style={{flex:1}} value={data.spouse?.deathD||''} onChange={e=>setData({...data, spouse:{...data.spouse, deathD:e.target.value}})}>
              {DAY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button className="q-btn primary" onClick={()=>{ push(); setStep('children'); }}>次へ →</button>
        </>
      );
      case 'children': return (
        <>
          <div className="q-title">{data.name}さんにお子さんはいらっしゃいますか？</div>
          <div className="q-btns">
            <button className="q-btn" onClick={()=>{ push(); setData({...data, hasChildren:true}); setStep('child_count'); }}>はい</button>
            <button className="q-btn" onClick={()=>{ push(); setData({...data, hasChildren:false, children:[]}); setStep('parents'); }}>いいえ</button>
          </div>
        </>
      );
      case 'child_count': return (
        <>
          <div className="q-title">お子さんは何人いらっしゃいますか？</div>
          <div className="q-btns">
            {[1,2,3,4,5].map(n => (
              <button key={n} className="q-btn" onClick={()=>{
                push();
                const kids = Array.from({length:n},(_,i)=>({name:'', relation:'', alive:true}));
                setData({...data, children:kids});
                setChildIdx(0);
                setStep('child_detail');
              }}>{n}人</button>
            ))}
          </div>
        </>
      );
      case 'child_detail': {
        const ci = childIdx, total = data.children.length, c = data.children[ci] || {};
        return (
          <>
            <span className="q-tag">子 {ci+1}/{total}</span>
            <div className="q-title">{ci+1}番目のお子さんについて教えてください。</div>
            <label className="v2-field__label" style={{marginBottom:4}}>お名前</label>
            <input className="v2-input-text" style={{marginBottom:10}} value={c.name||''}
              onChange={e=>{const nc=[...data.children]; nc[ci]={...c, name:e.target.value}; setData({...data,children:nc});}} placeholder="例：山田 一郎"/>
            <label className="v2-field__label" style={{marginBottom:4}}>続柄</label>
            <select className="v2-input-select" style={{marginBottom:14}} value={c.relation||''}
              onChange={e=>{const nc=[...data.children]; nc[ci]={...c, relation:e.target.value}; setData({...data,children:nc});}}>
              <option value="">-- 選択 --</option>
              {ZOKUGARA.filter(z=>['長男','二男','三男','四男','五男','長女','二女','三女','四女','五女','子'].includes(z)||z==='').map(z=>(
                <option key={z} value={z}>{z || '-- 選択 --'}</option>
              ))}
            </select>
            <div className="q-title" style={{fontSize:14, marginBottom:8}}>ご存命ですか？</div>
            <div className="q-btns">
              <button className="q-btn" onClick={()=>{
                push();
                const nc=[...data.children]; nc[ci]={...c, alive:true}; setData({...data,children:nc});
                if (ci+1<total) { setChildIdx(ci+1); }
                else { setStep('parents'); }
              }}>存命</button>
              <button className="q-btn" onClick={()=>{
                push();
                const nc=[...data.children]; nc[ci]={...c, alive:false}; setData({...data,children:nc});
                if (ci+1<total) { setChildIdx(ci+1); }
                else { setStep('parents'); }
              }}>死亡</button>
            </div>
          </>
        );
      }
      case 'parents': return (
        <>
          <div className="q-title">被相続人のご両親はご存命ですか？</div>
          <div className="q-hint">子がいない場合、親が相続人になります。</div>
          <div className="q-multi">
            <button className="q-btn" onClick={()=>{ push(); setData({...data, parents:[{rel:'父', alive:true},{rel:'母', alive:true}]}); setStep('confirm'); }}>両親とも存命</button>
            <button className="q-btn" onClick={()=>{ push(); setData({...data, parents:[{rel:'父', alive:true},{rel:'母', alive:false}]}); setStep('confirm'); }}>父のみ存命</button>
            <button className="q-btn" onClick={()=>{ push(); setData({...data, parents:[{rel:'父', alive:false},{rel:'母', alive:true}]}); setStep('confirm'); }}>母のみ存命</button>
            <button className="q-btn" onClick={()=>{ push(); setData({...data, parents:[]}); setStep('confirm'); }}>両親とも死亡（または不明）</button>
          </div>
        </>
      );
      case 'confirm': {
        const sm = [];
        sm.push('被相続人：'+data.name+(data.deathY?'（'+wizDeathStr(data.deathY,data.deathM,data.deathD)+'死亡）':''));
        if (data.spouse) sm.push('配偶者：'+(data.spouse.name||'(未入力)')+'　'+(data.spouse.alive?'存命':'死亡'));
        else sm.push('配偶者：なし');
        if (data.children.length) {
          sm.push('子：'+data.children.length+'人');
          data.children.forEach((c,i) => sm.push('  └ '+(c.relation||'子'+(i+1))+'：'+(c.name||'(未入力)')+'　'+(c.alive?'存命':'死亡')));
        }
        if (data.parents.length) data.parents.forEach(p => sm.push(p.rel+'：'+(p.alive?'存命（相続人）':'先死亡')));
        return (
          <>
            <div className="q-title">{isClient?'入力ありがとうございます。内容をご確認ください。':'以下の内容で相続関係説明図を作成します。'}</div>
            <div className="q-summary">{sm.join('\n')}</div>
            {isClient ? <>
              <div className="q-title" style={{fontSize:13}}>よろしければ下のボタンを押して、担当者にデータを送ってください。</div>
              <button className="copy-btn" onClick={()=>{
                const code = btoa(encodeURIComponent(JSON.stringify(wizToData(data))));
                navigator.clipboard.writeText(code).catch(()=>{});
                alert('データをコピーしました。担当者にお送りください。');
              }}>データをコピーして送る</button>
            </> : (
              <div className="q-btns">
                <button className="q-btn primary" onClick={()=>onApply(data)}>図面を作成 →</button>
                <button className="q-btn" onClick={back}>修正する</button>
              </div>
            )}
          </>
        );
      }
      default: return <div>不明なステップ: {step}</div>;
    }
  };

  return (
    <div className="modal-back">
      <div className="modal-card">
        <div className="modal-hd">
          <h3>⚖ 相続関係ヒアリングシート</h3>
          {!isClient && <button onClick={onClose}>✕</button>}
        </div>
        <div className="progress"><div className="progress-bar" style={{width:progress+'%'}}/></div>
        <div className="modal-bd"><Body/></div>
        <div className="modal-ft">
          {history.length > 0 ? <button className="q-btn" onClick={back}>← 戻る</button> : <span/>}
        </div>
      </div>
    </div>
  );
}

function wizDeathStr(y,m,d) {
  if (!y) return '';
  const pv = parseYearVal(y); if (!pv.y) return '';
  const era = pv.era ? pv.era : warekiYear(pv.y).replace('年','');
  return era + '年' + (m?m+'月':'') + (d?d+'日':'');
}

// Convert wizard data → app data (people array)
function wizToData(w) {
  const people = [];
  let uid = 1;
  const bszId = uid++;
  people.push({
    id:bszId, name:w.name, relation:'', role:'被相続人', isBSZ:true,
    birthY:'', birthM:'', birthD:'',
    deathY:w.deathY||'', deathM:w.deathM||'', deathD:w.deathD||'',
    father:'', mother:'', spouse:'', exSpouses:[], address:'',
  });
  let spouseId = '';
  if (w.spouse) {
    spouseId = uid++;
    people.push({
      id:spouseId, name:w.spouse.name||'', relation:'', role:'', isBSZ:false,
      birthY:'', birthM:'', birthD:'',
      deathY:w.spouse.deathY||'', deathM:w.spouse.deathM||'', deathD:w.spouse.deathD||'',
      father:'', mother:'', spouse:String(bszId), exSpouses:[], address:'',
    });
    people[0].spouse = String(spouseId);
  }
  (w.children||[]).forEach(c => {
    const cid = uid++;
    people.push({
      id:cid, name:c.name||'', relation:c.relation||'', role:'', isBSZ:false,
      birthY:'', birthM:'', birthD:'',
      deathY:c.alive?'':'', deathM:'', deathD:'',
      father:String(bszId), mother:spouseId?String(spouseId):'', spouse:'', exSpouses:[], address:'',
    });
  });
  (w.parents||[]).forEach(p => {
    const pid = uid++;
    const isFather = p.rel === '父';
    people.push({
      id:pid, name:'', relation:p.rel, role:'', isBSZ:false,
      birthY:'', birthM:'', birthD:'',
      deathY:p.alive?'':'明治30', deathM:'', deathD:'',
      father:'', mother:'', spouse:'', exSpouses:[], address:'',
    });
    if (isFather) people[0].father = String(pid); else people[0].mother = String(pid);
  });
  return { honseki:'', lastAddr:'', regAddr:'', people, uid };
}

// ============================================================
//  Preview modal (A4 print preview with pan + zoom)
// ============================================================
function PreviewModal({ children, onClose, onPrint }) {
  const [scale, setScale] = useState(50);
  const [off, setOff] = useState({x:0, y:0});
  const dragRef = useRef(null);

  useEffect(() => {
    const onWheel = e => {
      e.preventDefault();
      setScale(s => Math.max(5, Math.min(200, s + (e.deltaY>0?-3:3))));
    };
    window.addEventListener('wheel', onWheel, { passive:false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  const onMouseDown = e => {
    if (e.target.closest('.pv-ctrl')) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const so = { ...off };
    const onMove = e2 => setOff({ x:so.x+(e2.clientX-sx), y:so.y+(e2.clientY-sy) });
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div className="pv-overlay" onMouseDown={onMouseDown}>
      <div className="pv-a4">
        <div style={{transform:`translate(${off.x}px,${off.y}px) scale(${scale/100})`, transformOrigin:'0 0', position:'absolute', top:0, left:0}}>
          {children}
        </div>
      </div>
      <div className="pv-ctrl">
        <button onClick={onClose}>戻る</button>
        <span className="pv-val">{scale}%</span>
        <span style={{color:'rgba(255,255,255,.6)', fontSize:11}}>スクロールで拡大縮小 / ドラッグで移動</span>
        <button className="primary" onClick={onPrint}>印刷</button>
      </div>
    </div>
  );
}

// ============================================================
//  Share modal (sends hearing sheet to client)
// ============================================================
function ShareModal({ onClose }) {
  const url = location.href.split('?')[0] + '?client';
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };
  return (
    <div className="modal-back">
      <div className="modal-card" style={{width:440}}>
        <div className="modal-hd"><h3>ヒアリングシート送付</h3><button onClick={onClose}>✕</button></div>
        <div className="modal-bd">
          <p style={{margin:'0 0 14px', fontSize:13, color:'var(--ink-600)'}}>お客様にこのURLをお送りすると、相続関係のヒアリング入力画面が開きます。</p>
          <div style={{display:'flex', gap:6, marginBottom:10}}>
            <input readOnly value={url} className="v2-input-text" style={{flex:1, fontFamily:"'JetBrains Mono',monospace",fontSize:11}}/>
            <button className={`copy-btn ${copied?'done':''}`} style={{width:110}} onClick={copy}>{copied?'✓ コピー済':'コピー'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  Import from client (when professional loads a client-submitted code)
// ============================================================
function ImportModal({ onClose, onImport }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const run = () => {
    try {
      const data = JSON.parse(decodeURIComponent(atob(code.trim())));
      onImport(data);
    } catch (e) { setErr('コードが正しくありません'); }
  };
  return (
    <div className="modal-back">
      <div className="modal-card" style={{width:520}}>
        <div className="modal-hd"><h3>ヒアリング結果を読み込み</h3><button onClick={onClose}>✕</button></div>
        <div className="modal-bd">
          <p style={{margin:'0 0 12px', fontSize:13, color:'var(--ink-600)'}}>お客様から受け取ったコードを貼り付けてください。</p>
          <textarea className="code-area" value={code} onChange={e=>setCode(e.target.value)} placeholder="ここにコードを貼り付け..."/>
          {err && <div style={{color:'var(--danger)', fontSize:12, marginBottom:10}}>{err}</div>}
          <button className="copy-btn" onClick={run}>読み込む</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Wizard, PreviewModal, ShareModal, ImportModal, wizToData, wizDeathStr, wizInitData });
