// v2-app.jsx — v2 root app

function V2App() {
  return (
    <DesignCanvas>
      <DCSection
        title="相続関係説明図 — モダン リデザイン v2"
        subtitle="よりモダンでクリーンに。明るい背景、繊細な罫線、Inter + 明朝の組み合わせ、控えめな indigo アクセント。"
      >
        <DCArtboard label="Pro ワークスペース v2 (1440 × 900)" width={1440} height={900}>
          <div className="v2" style={{height:'100%'}}>
            <V2Workspace/>
          </div>
        </DCArtboard>

        <DCArtboard label="ヒアリング — 選択" width={960} height={760} style={{background:'#f6f7f8'}}>
          <div className="v2" style={{height:'100%'}}>
            <V2ClientChildrenScreen/>
          </div>
        </DCArtboard>

        <DCArtboard label="ヒアリング — 日付" width={960} height={760} style={{background:'#f6f7f8'}}>
          <div className="v2" style={{height:'100%'}}>
            <V2ClientDateScreen/>
          </div>
        </DCArtboard>

        <DCArtboard label="ヒアリング — 最終確認" width={960} height={760} style={{background:'#f6f7f8'}}>
          <div className="v2" style={{height:'100%'}}>
            <V2ClientConfirmScreen/>
          </div>
        </DCArtboard>
      </DCSection>

      <DCSection title="v1 (元の和モダン版)" subtitle="比較用">
        <DCArtboard label="Pro v1" width={1440} height={900}>
          <ProWorkspace/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<V2App/>);
