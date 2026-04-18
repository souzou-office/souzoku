// preview.jsx — A4 preview + share modal

function PreviewScreen({ data, layout }) {
  return (
    <div className="pv-scene">
      <div className="pv-scene__chrome">
        <button className="t-btn t-btn--outline"><Icons.ArrowLeft size={14}/> 編集に戻る</button>
        <div className="pv-scene__center">
          <span className="pv-scene__title">印刷プレビュー — A4 縦</span>
          <span className="pv-scene__hint">ホイール: 拡大縮小 / ドラッグ: 移動</span>
        </div>
        <div className="pv-scene__zoom">
          <button className="t-btn t-btn--icon"><Icons.ZoomOut size={14}/></button>
          <span className="zoom-val">55%</span>
          <button className="t-btn t-btn--icon"><Icons.ZoomIn size={14}/></button>
          <div className="v-div"/>
          <button className="t-btn t-btn--primary"><Icons.Print size={14}/> 印刷する</button>
        </div>
      </div>
      <div className="pv-scene__stage">
        <div className="pv-a4">
          <div className="pv-a4__corner pv-a4__corner--tl"/>
          <div className="pv-a4__corner pv-a4__corner--tr"/>
          <div className="pv-a4__corner pv-a4__corner--bl"/>
          <div className="pv-a4__corner pv-a4__corner--br"/>
          <div style={{
            transform:'scale(.55)', transformOrigin:'0 0',
            width: 820, height: 700, position:'relative',
          }}>
            <DiagramCanvas data={data} layout={layout} tagsOn/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------
//  Share-to-client modal
// ----------------------------------------------------------
function ShareModal() {
  return (
    <div className="modal-overlay">
      <div className="modal modal--share">
        <div className="modal__head">
          <div className="modal__kicker"><Icons.Link size={13}/> ヒアリングシート送付</div>
          <div className="modal__title">お客様に入力用リンクを送る</div>
          <button className="modal__close"><Icons.X size={14}/></button>
        </div>
        <div className="modal__body">
          <p className="modal__desc">
            下のURLをコピーして、お客様にお送りください。お客様はスマートフォンからでも入力できます。
          </p>
          <div className="modal__url-row">
            <div className="modal__url">
              <Icons.Link size={13}/>
              <span>https://souzoku.app/?c=ABC123XYZ</span>
            </div>
            <button className="c-btn c-btn--primary">
              <Icons.Copy size={13}/> コピー
            </button>
          </div>
          <div className="modal__hint">
            <Icons.Info size={13}/>
            リンクは <strong>30日間</strong> 有効です。お客様が入力を完了すると、担当者にメールで通知されます。
          </div>

          <div className="modal__alt">
            <div className="modal__alt-label">または、お客様から受け取った入力コードを貼り付けて読み込む</div>
            <div className="modal__alt-row">
              <div className="modal__code-input">コードを貼り付け...</div>
              <button className="c-btn c-btn--outline">読み込む</button>
            </div>
          </div>
        </div>
        <div className="modal__foot">
          <button className="c-btn c-btn--ghost">キャンセル</button>
          <button className="c-btn c-btn--primary">リンクを再生成する</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PreviewScreen, ShareModal });
