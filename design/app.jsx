// app.jsx — The main assembled app, rendered on the design canvas

const { useState: useStateApp } = React;

// ============================================================
//  Full Pro workspace (inside a browser-like frame)
// ============================================================
function ProWorkspace() {
  const data = TEST_DATA_1;
  const layout = DIAGRAM_LAYOUT_1;
  const [mode, setMode] = useStateApp('pro');
  const [selectedId, setSelectedId] = useStateApp(1);
  const [expandedId, setExpandedId] = useStateApp(1);
  const [tagsOn, setTagsOn] = useStateApp(true);
  const [layoutDir, setLayoutDir] = useStateApp('vertical');
  const [zoom, setZoom] = useStateApp(80);

  return (
    <div className="app-shell" style={{ height: '100%' }}>
      <TopBar
        mode={mode} setMode={setMode}
        tagsOn={tagsOn} onToggleTags={() => setTagsOn(!tagsOn)}
        layout={layoutDir} onToggleLayout={() => setLayoutDir(layoutDir === 'vertical' ? 'horizontal' : 'vertical')}
      />
      <div className="app-body">
        <PersonSidebar
          data={data}
          selectedId={selectedId} onSelect={setSelectedId}
          expandedId={expandedId} setExpandedId={setExpandedId}
        />
        <div className="canvas-wrap">
          <div className="canvas-scroll">
            <div style={{ transform: `scale(${zoom/100})`, transformOrigin: 'top center' }}>
              <DiagramCanvas data={data} layout={layout} tagsOn={tagsOn} selectedId={selectedId}/>
            </div>
          </div>
          <CanvasBar zoom={zoom} setZoom={setZoom} layout={layoutDir}/>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  Root — lays screens out on a design canvas
// ============================================================
function App() {
  return (
    <DesignCanvas>
      <DCSection
        title="相続関係説明図ツール — リデザイン"
        subtitle="司法書士向けのプロ用ワークスペースと、ご依頼者向けのヒアリング画面を刷新しました。"
      >
        <DCArtboard label="① Pro ワークスペース — メイン画面 (1440 × 900)" width={1440} height={900}>
          <ProWorkspace/>
        </DCArtboard>

        <DCArtboard label="② 印刷プレビュー (A4縦)" width={720} height={900}>
          <PreviewScreen data={TEST_DATA_1} layout={DIAGRAM_LAYOUT_1}/>
        </DCArtboard>

        <DCArtboard label="③ 依頼者への送付モーダル" width={720} height={900} style={{background:'#3a342c', position:'relative'}}>
          <div style={{
            position:'absolute', inset:0,
            background: 'linear-gradient(180deg, #2a2620, #1a1612)',
          }}/>
          <div style={{position:'absolute', inset:0}}>
            <ShareModal/>
          </div>
        </DCArtboard>
      </DCSection>

      <DCSection
        title="ご依頼者向け ヒアリング画面"
        subtitle="落ち着いた和モダンのトーン。1画面1質問で、戸惑いなく入力できる導線にしました。"
      >
        <DCArtboard label="A. お子さんの有無 (yes / no)" width={1100} height={780}>
          <ClientChildrenScreen/>
        </DCArtboard>

        <DCArtboard label="B. 死亡年月日 — 和暦入力" width={1100} height={780}>
          <ClientDateScreen/>
        </DCArtboard>

        <DCArtboard label="C. お子さん詳細 — 氏名・続柄・生死" width={1100} height={780}>
          <ClientChildDetailScreen/>
        </DCArtboard>

        <DCArtboard label="D. 最終確認 — 送信" width={1100} height={780}>
          <ClientConfirmScreen/>
        </DCArtboard>
      </DCSection>

      <DCSection
        title="デザインシステム ─ 抜粋"
        subtitle="墨 (sumi) と臙脂 (enji) を基調に、役割カラーを彩度を抑えた伝統色で構成しました。"
      >
        <DCArtboard label="ロール カラーパレット" width={900} height={420} style={{background:'#fff'}}>
          <RolePalette/>
        </DCArtboard>

        <DCArtboard label="人物カード バリエーション" width={900} height={420} style={{background:'var(--paper)'}}>
          <CardShowcase/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

// ---- Design-system cards ----
function RolePalette() {
  const roles = [
    ['被相続人',     'bsz'],
    ['相続人',       'heir'],
    ['遺産分割',     'waiver'],
    ['数次相続人',   'suuji'],
    ['相続人兼数次相続人', 'both'],
    ['先死亡',       'pre'],
    ['相続後死亡',   'post'],
    ['無関係',       'none'],
  ];
  return (
    <div style={{padding: 32}}>
      <div style={{fontSize: 11, letterSpacing: '.2em', color: 'var(--ink-500)', fontWeight: 700, marginBottom: 4}}>
        TRADITIONAL JAPANESE PALETTE
      </div>
      <div style={{fontFamily:'var(--ff-doc)', fontSize: 20, color: 'var(--ink-900)', marginBottom: 24}}>
        伝統色で立場を識別する
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12}}>
        {roles.map(([name]) => {
          const c = ROLE_COLORS[name];
          return (
            <div key={name} style={{
              border: '1px solid var(--ink-200)', borderRadius: 6,
              padding: 12, background: '#fff', display:'flex', gap: 10, alignItems:'center',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 4,
                background: c.bg, border: `2px solid ${c.fg}`, flexShrink: 0,
              }}/>
              <div>
                <div style={{fontSize: 12.5, fontWeight: 600, color: 'var(--ink-900)'}}>{name}</div>
                <div style={{fontSize: 10, color: 'var(--ink-500)', fontFamily:'var(--ff-mono)', marginTop: 1}}>
                  {c.fg}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CardShowcase() {
  const samples = [
    {p:{id:1, name:'相続 太郎', isBSZ:true, role:'被相続人', relation:'', birth:'昭和15年3月15日', death:'令和7年1月10日'}, x:30, y:40},
    {p:{id:2, name:'相続 花子', isBSZ:false, role:'相続人', relation:'妻', birth:'昭和20年7月20日', address:'東京都新宿区西新宿二丁目8番1号'}, x:290, y:40},
    {p:{id:3, name:'相続 幸子', isBSZ:false, role:'遺産分割', relation:'長女', birth:'昭和47年12月1日', address:'千葉県千葉市中央区本千葉町1-1'}, x:550, y:40},
    {p:{id:4, name:'試作 義男', isBSZ:false, role:'先死亡', relation:'父', birth:'昭和10年1月15日', death:'平成22年9月3日'}, x:30, y:230},
    {p:{id:5, name:'試作 正人', isBSZ:false, role:'相続人兼数次相続人', relation:'兄', birth:'昭和35年3月5日', address:'名古屋市中区栄三丁目5番12号'}, x:290, y:230},
    {p:{id:6, name:'甲 二郎', isBSZ:false, role:'相続後死亡', relation:'弟', birth:'昭和40年2月2日', death:'令和6年8月1日'}, x:550, y:230},
  ];
  return (
    <div style={{position:'relative', width:'100%', height:'100%', padding: 0}}>
      {samples.map(s => (
        <DiagramCard key={s.p.id} p={s.p} x={s.x} y={s.y} tagsOn={true}/>
      ))}
    </div>
  );
}

window.App = App; // v2 now handles render
