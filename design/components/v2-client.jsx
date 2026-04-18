// v2-client.jsx — Modern client wizard with conversational, airy feel

const { useState: useStateV2C } = React;

function V2ClientFrame({ children, step=4 }) {
  const total = 8;
  return (
    <div className="v2c-frame">
      <header className="v2c-top">
        <div className="v2c-top__brand">
          <div className="v2c-top__mark">相</div>
          <div>
            <div className="v2c-top__title">ヒアリングシート</div>
            <div className="v2c-top__firm">司法書士法人 そうぞう</div>
          </div>
        </div>
        <div className="v2c-top__progress">
          <span className="v2c-top__progress-text">{step} / {total}</span>
          <div className="v2c-top__progress-bar">
            <div className="v2c-top__progress-fill" style={{width: `${(step/total)*100}%`}}/>
          </div>
        </div>
        <button className="v2c-top__save"><Icons.Save size={13}/> 一時保存</button>
      </header>
      <main className="v2c-main">{children}</main>
    </div>
  );
}

function V2ClientChildrenScreen() {
  return (
    <V2ClientFrame step={4}>
      <div className="v2c-q">
        <div className="v2c-q__kicker">お子さんについて</div>
        <h1 className="v2c-q__title">
          相続 太郎さんに<br/>
          <span className="v2c-q__accent">お子さん</span>はいらっしゃいますか？
        </h1>
        <p className="v2c-q__hint">
          現在のご家族、以前のご家族、養子の方、すべて含めてお答えください。
        </p>

        <div className="v2c-big-choices">
          <button className="v2c-big-choice is-on">
            <div className="v2c-big-choice__icon v2c-big-choice__icon--green"><Icons.Check size={22} stroke={2}/></div>
            <div>
              <div className="v2c-big-choice__title">はい</div>
              <div className="v2c-big-choice__sub">お子さんがいらっしゃる</div>
            </div>
          </button>
          <button className="v2c-big-choice">
            <div className="v2c-big-choice__icon"><Icons.X size={22} stroke={2}/></div>
            <div>
              <div className="v2c-big-choice__title">いいえ</div>
              <div className="v2c-big-choice__sub">いらっしゃらない</div>
            </div>
          </button>
        </div>

        <div className="v2c-actions">
          <button className="v2c-link-btn"><Icons.ChevronLeft size={14}/> 戻る</button>
          <button className="v2c-next-btn">次へ <Icons.ArrowRight size={14}/></button>
        </div>

        <div className="v2c-help-row">
          <Icons.HelpCircle size={13}/>
          ご不明な場合は担当者が後ほどお伺いします
        </div>
      </div>
    </V2ClientFrame>
  );
}

function V2ClientDateScreen() {
  return (
    <V2ClientFrame step={2}>
      <div className="v2c-q">
        <div className="v2c-q__kicker">被相続人について</div>
        <h1 className="v2c-q__title">
          <span className="v2c-q__accent">亡くなった日</span>を<br/>
          教えてください
        </h1>
        <p className="v2c-q__hint">和暦・西暦どちらでも入力できます。</p>

        <div className="v2c-date-card">
          <div className="v2c-date-row">
            <div className="v2c-date-field v2c-date-field--year">
              <div className="v2c-date-label">年</div>
              <div className="v2c-date-val">
                <span>令和 7</span>
                <Icons.Chevron size={13}/>
              </div>
            </div>
            <div className="v2c-date-field">
              <div className="v2c-date-label">月</div>
              <div className="v2c-date-val"><span>1</span><Icons.Chevron size={13}/></div>
            </div>
            <div className="v2c-date-field">
              <div className="v2c-date-label">日</div>
              <div className="v2c-date-val"><span>10</span><Icons.Chevron size={13}/></div>
            </div>
          </div>
          <div className="v2c-date-toggle">
            <button className="v2c-date-toggle__btn is-on">和暦</button>
            <button className="v2c-date-toggle__btn">西暦</button>
          </div>
        </div>

        <div className="v2c-actions">
          <button className="v2c-link-btn"><Icons.ChevronLeft size={14}/> 戻る</button>
          <button className="v2c-next-btn">次へ <Icons.ArrowRight size={14}/></button>
        </div>
      </div>
    </V2ClientFrame>
  );
}

function V2ClientConfirmScreen() {
  const rows = [
    {k:'被相続人', v:'相続 太郎', sub:'令和7年1月10日 死亡', role:'被相続人'},
    {k:'配偶者', v:'相続 花子', sub:'存命', role:'相続人'},
    {k:'長男', v:'相続 一郎', sub:'存命', role:'相続人'},
    {k:'長女', v:'相続 幸子', sub:'存命', role:'遺産分割'},
  ];
  return (
    <V2ClientFrame step={8}>
      <div className="v2c-q">
        <div className="v2c-q__kicker">最終確認</div>
        <h1 className="v2c-q__title">
          ご入力<span className="v2c-q__accent">ありがとうございました</span>
        </h1>
        <p className="v2c-q__hint">
          下記の内容で担当者にお送りします。
        </p>

        <div className="v2c-summary">
          {rows.map((r,i) => (
            <div key={i} className="v2c-summary__row">
              <div className="v2c-summary__k">{r.k}</div>
              <div className="v2c-summary__vwrap">
                <div className="v2c-summary__v">{r.v}</div>
                <div className="v2c-summary__sub">{r.sub}</div>
              </div>
              <span className={`v2-pill v2-pill-${r.role}`}>
                <span className="v2-pill__dot" style={{background:'currentColor'}}/>
                {r.role}
              </span>
            </div>
          ))}
        </div>

        <button className="v2c-send-btn">
          <Icons.Send size={15}/> この内容で送信する
        </button>
        <button className="v2c-link-btn v2c-link-btn--center">修正が必要な場合はこちら</button>
      </div>
    </V2ClientFrame>
  );
}

Object.assign(window, { V2ClientFrame, V2ClientChildrenScreen, V2ClientDateScreen, V2ClientConfirmScreen });
