// client-wizard.jsx — The redesigned client hearing flow
// Tone: calm, respectful, trustworthy — 和モダン
// Uses generous whitespace, large type, a single focused question per screen,
// soft paper backgrounds, and a vertical progress spine.

const { useState: useStateW } = React;

const WIZ_STEPS = [
  { key: 'intro',    group: 'はじめに', label: 'はじめに' },
  { key: 'name',     group: '被相続人', label: 'お名前' },
  { key: 'death',    group: '被相続人', label: '死亡日' },
  { key: 'spouse',   group: '配偶者',   label: 'ご結婚' },
  { key: 'children', group: 'お子さん', label: 'お子さんの有無' },
  { key: 'child_detail', group: 'お子さん', label: 'お子さんの詳細' },
  { key: 'special',  group: 'その他',   label: '特別な事情' },
  { key: 'confirm',  group: '最後',     label: 'ご確認' },
];

// ----------------------------------------------------------
//  Host frame — soft paper background, calm header
// ----------------------------------------------------------
function ClientFrame({ children, currentStep = 4 }) {
  return (
    <div className="c-frame">
      <header className="c-frame__header">
        <div className="c-frame__brand">
          <div className="c-frame__logo">
            <svg viewBox="0 0 28 28" width="22" height="22">
              <rect x="1" y="1" width="26" height="26" rx="3" fill="#1a2332"/>
              <text x="14" y="19" textAnchor="middle"
                fontFamily="Shippori Mincho, serif" fontWeight="600"
                fontSize="15" fill="#fdfaf1">相</text>
            </svg>
          </div>
          <div>
            <div className="c-frame__title">相続関係ヒアリングシート</div>
            <div className="c-frame__firm">司法書士法人 そうぞう</div>
          </div>
        </div>
        <div className="c-frame__progress-mini">
          {WIZ_STEPS.filter(s=>s.key!=='intro'&&s.key!=='confirm').map((s,i)=>(
            <div key={s.key} className={`c-dot ${i < currentStep-1?'is-done':i === currentStep-1?'is-on':''}`}/>
          ))}
        </div>
      </header>
      <div className="c-frame__body">
        <aside className="c-frame__aside">
          <ClientSidebar currentStep={currentStep}/>
        </aside>
        <main className="c-frame__main">
          {children}
        </main>
      </div>
      <footer className="c-frame__footer">
        <span>安心して入力いただけます。情報は担当者に直接送られます。</span>
        <span className="c-frame__help"><Icons.HelpCircle size={12}/> お困りの場合は 03-1234-5678 までお電話ください</span>
      </footer>
    </div>
  );
}

function ClientSidebar({ currentStep }) {
  const groups = [];
  WIZ_STEPS.forEach((s, i) => {
    if (!groups.length || groups[groups.length-1].group !== s.group) {
      groups.push({ group: s.group, items: [] });
    }
    groups[groups.length-1].items.push({ ...s, idx: i });
  });

  return (
    <div className="c-side">
      <div className="c-side__title">入力の流れ</div>
      {groups.map(g => (
        <div key={g.group} className="c-side__group">
          <div className="c-side__group-label">{g.group}</div>
          {g.items.map(it => (
            <div key={it.key} className={`c-side__item ${it.idx === currentStep?'is-on':''} ${it.idx<currentStep?'is-done':''}`}>
              <div className="c-side__bullet">
                {it.idx < currentStep ? <Icons.Check size={11}/> : <div className="c-side__bullet-dot"/>}
              </div>
              <span>{it.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ----------------------------------------------------------
//  Question card — generous spacing, single focused Q
// ----------------------------------------------------------
function ClientQuestionCard({ step, stepNum, totalSteps, title, hint, children, footer, note }) {
  return (
    <div className="c-qcard">
      <div className="c-qcard__meta">
        <span className="c-qcard__step">質問 {stepNum} / {totalSteps}</span>
        {note && <span className="c-qcard__note"><Icons.Info size={11}/> {note}</span>}
      </div>
      <h1 className="c-qcard__title">{title}</h1>
      {hint && <p className="c-qcard__hint">{hint}</p>}
      <div className="c-qcard__body">
        {children}
      </div>
      {footer && <div className="c-qcard__footer">{footer}</div>}
    </div>
  );
}

// Yes/No chunky cards with icon
function BigChoice({ icon, title, sub, selected, onClick }) {
  return (
    <button className={`c-choice ${selected?'is-on':''}`} onClick={onClick}>
      <div className="c-choice__icon">{icon}</div>
      <div className="c-choice__content">
        <div className="c-choice__title">{title}</div>
        {sub && <div className="c-choice__sub">{sub}</div>}
      </div>
      <Icons.ChevronRight size={16} style={{color:'var(--ink-400)'}}/>
    </button>
  );
}

// Classy back / next action row
function WizActions({ onBack, onNext, nextLabel='次へ', nextDisabled }) {
  return (
    <div className="c-actions">
      <button className="c-btn c-btn--ghost" onClick={onBack}>
        <Icons.ArrowLeft size={14}/> 前の質問に戻る
      </button>
      <button className="c-btn c-btn--primary" onClick={onNext} disabled={nextDisabled}>
        {nextLabel} <Icons.ArrowRight size={14}/>
      </button>
    </div>
  );
}

// ----------------------------------------------------------
//  Sample wizard screens (static mock of key moments)
// ----------------------------------------------------------

// Screen A: The children-detail question (showing depth of hearing)
function ClientChildrenScreen() {
  return (
    <ClientFrame currentStep={4}>
      <ClientQuestionCard
        stepNum={5} totalSteps={8}
        note="ご不明な場合は空欄でも進めます"
        title={<>相続 太郎さんに <em>お子さん</em> はいらっしゃいますか？</>}
        hint="現在の配偶者・元配偶者問わず、お子さん全員についてお教えください。養子の方がいらっしゃれば、後ほど伺います。"
        footer={<WizActions/>}
      >
        <div className="c-choice-group">
          <BigChoice
            selected
            icon={<Icons.Users size={20}/>}
            title="はい"
            sub="お子さんがいらっしゃる場合はこちら"
          />
          <BigChoice
            icon={<Icons.X size={20}/>}
            title="いいえ"
            sub="お子さんがいない場合はこちら"
          />
        </div>
      </ClientQuestionCard>
    </ClientFrame>
  );
}

// Screen B: Date input (for 死亡日) — wareki-aware
function ClientDateScreen() {
  return (
    <ClientFrame currentStep={2}>
      <ClientQuestionCard
        stepNum={3} totalSteps={8}
        title={<>相続 太郎さんがお亡くなりに<br/>なった <em>日付</em> を教えてください</>}
        hint="和暦・西暦どちらでも結構です。不明な場合は分かる範囲でご記入ください。"
        footer={<WizActions/>}
      >
        <div className="c-date-field">
          <label className="c-field-label">死亡年月日</label>
          <div className="c-date-row">
            <div className="c-date-sel c-date-sel--y">
              <span>令和 7 年</span><Icons.Chevron size={12}/>
            </div>
            <div className="c-date-sel">
              <span>1 月</span><Icons.Chevron size={12}/>
            </div>
            <div className="c-date-sel">
              <span>10 日</span><Icons.Chevron size={12}/>
            </div>
          </div>
          <div className="c-date-hint">
            <Icons.Calendar size={12}/>
            西暦で入力: <button className="c-date-alt">2025 / 01 / 10</button>
          </div>
        </div>
      </ClientQuestionCard>
    </ClientFrame>
  );
}

// Screen C: Child detail (name + relation + alive)
function ClientChildDetailScreen() {
  return (
    <ClientFrame currentStep={5}>
      <ClientQuestionCard
        stepNum={6} totalSteps={8}
        note="お子さん 2人中 1人目"
        title="1番目のお子さんについて 教えてください"
        hint="お名前と続柄、ご存命かどうかを教えていただきます。"
        footer={<WizActions/>}
      >
        <div className="c-form">
          <div className="c-form__row">
            <div className="c-field">
              <label className="c-field-label">お名前</label>
              <input className="c-input" defaultValue="相続 一郎" placeholder="例: 山田 太郎"/>
            </div>
            <div className="c-field c-field--narrow">
              <label className="c-field-label">続柄</label>
              <div className="c-sel">
                <span>長男</span><Icons.Chevron size={12}/>
              </div>
            </div>
          </div>
          <div className="c-field">
            <label className="c-field-label">ご存命ですか？</label>
            <div className="c-seg">
              <button className="c-seg__btn is-on">
                <Icons.Check size={13}/> 存命
              </button>
              <button className="c-seg__btn">亡くなっている</button>
              <button className="c-seg__btn">相続放棄</button>
            </div>
          </div>
        </div>
      </ClientQuestionCard>
    </ClientFrame>
  );
}

// Screen D: Confirmation / send
function ClientConfirmScreen() {
  const summary = [
    { label: '被相続人', v: '相続 太郎（令和7年1月10日 死亡）' },
    { label: '配偶者', v: '相続 花子（存命）' },
    { label: '長男', v: '相続 一郎（存命）' },
    { label: '長女', v: '相続 幸子（存命）' },
  ];
  return (
    <ClientFrame currentStep={7}>
      <ClientQuestionCard
        stepNum={8} totalSteps={8}
        title="ご入力ありがとうございました"
        hint="内容をご確認のうえ、下のボタンを押して担当者へお送りください。後から修正も可能です。"
      >
        <div className="c-summary">
          {summary.map((s,i) => (
            <div key={i} className="c-summary__row">
              <div className="c-summary__label">{s.label}</div>
              <div className="c-summary__v">{s.v}</div>
            </div>
          ))}
        </div>

        <div className="c-send">
          <button className="c-btn c-btn--primary c-btn--big">
            <Icons.Send size={14}/> この内容で担当者に送信する
          </button>
          <button className="c-btn c-btn--ghost">
            <Icons.ArrowLeft size={13}/> 修正する
          </button>
        </div>

        <div className="c-reassure">
          <Icons.HelpCircle size={14}/>
          <div>
            <strong>送信後に担当者からご連絡いたします。</strong>
            ご不明な点や入力できなかった項目は、担当者が直接お伺いしますのでご安心ください。
          </div>
        </div>
      </ClientQuestionCard>
    </ClientFrame>
  );
}

Object.assign(window, {
  ClientFrame, ClientSidebar, ClientQuestionCard, BigChoice, WizActions,
  ClientChildrenScreen, ClientDateScreen, ClientChildDetailScreen, ClientConfirmScreen,
});
