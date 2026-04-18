// app-main.jsx — root App component + mount

function initialData() {
  return {
    honseki:'', lastAddr:'', regAddr:'',
    people: [{
      id:1, name:'', relation:'', role:'被相続人', roleOverride:'', isBSZ:true,
      birthY:'', birthM:'', birthD:'', deathY:'', deathM:'', deathD:'',
      father:'', mother:'', spouse:'', exSpouses:[], address:'',
    }],
    uid: 2,
  };
}

function App() {
  const isClientMode = new URLSearchParams(location.search).has('client');
  const [data, setData] = useState(initialData);
  const [selectedId, setSelectedId] = useState(null);
  const [expandedId, setExpandedId] = useState(1);
  const [tagsOn, setTagsOn] = useState(true);
  const [layoutDir, setLayoutDir] = useState('vertical');
  const [zoom, setZoom] = useState(80);
  const [positions, setPositions] = useState({});
  const [wizardOpen, setWizardOpen] = useState(isClientMode);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Undo / redo
  const history = useRef({ past:[], future:[] });
  const pushHistory = useCallback(() => {
    history.current.past.push(JSON.stringify({ data, positions }));
    if (history.current.past.length > 50) history.current.past.shift();
    history.current.future = [];
  }, [data, positions]);

  const onUndo = () => {
    const h = history.current;
    if (!h.past.length) return;
    h.future.push(JSON.stringify({ data, positions }));
    const s = JSON.parse(h.past.pop());
    setData(s.data); setPositions(s.positions);
  };
  const onRedo = () => {
    const h = history.current;
    if (!h.future.length) return;
    h.past.push(JSON.stringify({ data, positions }));
    const s = JSON.parse(h.future.pop());
    setData(s.data); setPositions(s.positions);
  };

  // Track data changes for undo (debounced)
  const prevSnap = useRef('');
  useEffect(() => {
    const snap = JSON.stringify({ data, positions });
    if (prevSnap.current && prevSnap.current !== snap) {
      const prev = prevSnap.current;
      history.current.past.push(prev);
      if (history.current.past.length > 50) history.current.past.shift();
      history.current.future = [];
    }
    prevSnap.current = snap;
  }, [data, positions]);

  // Auto-compute roles
  const peopleWithRoles = useMemo(() => autoRoles(data.people), [data.people]);

  // Auto layout when positions missing
  const layout = useMemo(() => calcLayout(peopleWithRoles, layoutDir), [peopleWithRoles, layoutDir]);

  useEffect(() => {
    setPositions(prev => {
      const next = { ...prev };
      let changed = false;
      // add missing positions from layout
      layout.forEach(L => {
        if (!next[L.p.id]) { next[L.p.id] = { x:L.x, y:L.y }; changed = true; }
      });
      // remove stale positions
      const ids = new Set(peopleWithRoles.map(p => p.id));
      Object.keys(next).forEach(id => { if (!ids.has(+id)) { delete next[id]; changed = true; } });
      return changed ? next : prev;
    });
  }, [layout, peopleWithRoles]);

  // Handlers
  const onAddPerson = () => {
    setData(d => ({
      ...d, uid:d.uid+1,
      people:[...d.people, {
        id:d.uid, name:'', relation:'', role:'', roleOverride:'', isBSZ:false,
        birthY:'', birthM:'', birthD:'', deathY:'', deathM:'', deathD:'',
        father:'', mother:'', spouse:'', exSpouses:[], address:'',
      }],
    }));
    setExpandedId(data.uid);
  };
  const onDeletePerson = pid => {
    if (!confirm('この人物を削除しますか？')) return;
    setData(d => {
      const rm = d.people.find(p => p.id === pid);
      if (!rm) return d;
      const ppl = d.people
        .filter(p => p.id !== pid)
        .map(p => ({
          ...p,
          father: String(p.father)===String(pid) ? '' : p.father,
          mother: String(p.mother)===String(pid) ? '' : p.mother,
          spouse: String(p.spouse)===String(pid) ? '' : p.spouse,
          exSpouses: (p.exSpouses||[]).filter(id => String(id)!==String(pid)),
        }));
      return { ...d, people:ppl };
    });
    setPositions(p => { const np={...p}; delete np[pid]; return np; });
  };

  // Save / load JSON
  const onSave = () => {
    const out = { ...data, positions, layoutDir, tagsOn };
    const blob = new Blob([JSON.stringify(out, null, 2)], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '相続関係図.json';
    a.click();
  };
  const onLoad = () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json';
    inp.onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = ev => {
        try {
          const d = JSON.parse(ev.target.result);
          setData({
            honseki: d.honseki||'', lastAddr: d.lastAddr||'', regAddr: d.regAddr||'',
            people: (d.people||[]).map(p => ({...p, exSpouses:p.exSpouses||[]})),
            uid: d.uid || (d.people?.length||0)+1,
          });
          setPositions(d.positions || d.cardPositions || {});
          if (d.layoutDir) setLayoutDir(d.layoutDir);
          if (d.tagsOn !== undefined) setTagsOn(d.tagsOn);
        } catch (err) { alert('読込失敗: '+err.message); }
      };
      r.readAsText(f);
    };
    inp.click();
  };

  // Wizard → apply
  const applyWizard = w => {
    const d = wizToData(w);
    setData(d);
    setPositions({});
    setWizardOpen(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const h = e => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); onUndo(); }
      else if (e.ctrlKey && e.key === 'y') { e.preventDefault(); onRedo(); }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    if (isClientMode) document.body.classList.add('client-mode');
    else document.body.classList.remove('client-mode');
  }, [isClientMode]);

  const bsz = peopleWithRoles.find(p => p.isBSZ);

  return (
    <div className="app-shell" style={{height:'100%', display:'flex', flexDirection:'column'}}>
      <TopBar
        bszName={bsz?.name}
        onOpenWizard={()=>setWizardOpen(true)}
        onPreview={()=>setPreviewOpen(true)}
        onSave={onSave} onLoad={onLoad}
        tagsOn={tagsOn} onToggleTags={()=>setTagsOn(!tagsOn)}
        layout={layoutDir} onToggleLayout={()=>{setLayoutDir(layoutDir==='vertical'?'horizontal':'vertical'); setPositions({});}}
        onUndo={onUndo} onRedo={onRedo}
      />
      <div className="app-body" style={{flex:1, display:'flex', overflow:'hidden'}}>
        <PersonSidebar
          data={data} setData={setData} people={peopleWithRoles}
          selectedId={selectedId} onSelect={setSelectedId}
          expandedId={expandedId} setExpandedId={setExpandedId}
          onAddPerson={onAddPerson} onDeletePerson={onDeletePerson}
        />
        <div className="canvas-wrap">
          <div className="canvas-scroll">
            <div style={{transform:`scale(${zoom/100})`, transformOrigin:'top center'}}>
              <DiagramCanvas
                data={data} people={peopleWithRoles}
                positions={positions} setPositions={setPositions}
                tagsOn={tagsOn} selectedId={selectedId}
                onSelectCard={pid => { setSelectedId(pid); setExpandedId(pid); }}
                layoutDir={layoutDir}
              />
            </div>
          </div>
          <CanvasBar zoom={zoom} setZoom={setZoom}/>
        </div>
      </div>
      <button className="share-fab" onClick={()=>setShareOpen(true)}>📤 ヒアリングシート送付</button>

      {wizardOpen && <Wizard isClient={isClientMode} onClose={()=>setWizardOpen(false)} onApply={applyWizard}/>}
      {previewOpen && (
        <PreviewModal onClose={()=>setPreviewOpen(false)} onPrint={()=>window.print()}>
          <DiagramCanvas
            data={data} people={peopleWithRoles}
            positions={positions} setPositions={setPositions}
            tagsOn={tagsOn} selectedId={null}
            onSelectCard={()=>{}} layoutDir={layoutDir}
          />
        </PreviewModal>
      )}
      {shareOpen && <ShareModal onClose={()=>setShareOpen(false)}/>}
      {importOpen && <ImportModal onClose={()=>setImportOpen(false)} onImport={d => { setData(d); setImportOpen(false); }}/>}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
