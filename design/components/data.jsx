// data.jsx — shared mock data for the design

const TEST_DATA_1 = {
  honseki: '東京都千代田区丸の内一丁目1番地',
  lastAddr: '東京都新宿区西新宿二丁目8番1号',
  regAddr: '東京都千代田区丸の内一丁目1番地',
  people: [
    { id: 1, name: '相続 太郎', relation: '', role: '被相続人', isBSZ: true,
      birth: '昭和15年3月15日', death: '令和7年1月10日',
      father: null, mother: null, spouse: 2,
      docs: ['生亡', '住所'] },
    { id: 2, name: '相続 花子', relation: '妻', role: '相続人', isBSZ: false,
      birth: '昭和20年7月20日', death: '',
      father: null, mother: null, spouse: 1,
      address: '東京都新宿区西新宿二丁目8番1号',
      docs: ['現戸', '住所', '印証', '遺分'] },
    { id: 3, name: '相続 一郎', relation: '長男', role: '相続人', isBSZ: false,
      birth: '昭和43年4月10日', death: '',
      father: 1, mother: 2, spouse: null,
      address: '神奈川県横浜市中区山下町14-1',
      docs: ['現戸', '住所', '印証', '遺分'] },
    { id: 4, name: '相続 幸子', relation: '長女', role: '遺産分割', isBSZ: false,
      birth: '昭和47年12月1日', death: '',
      father: 1, mother: 2, spouse: null,
      address: '千葉県千葉市中央区本千葉町1-1',
      docs: ['現戸', '印証', '遺分'] },
  ],
};

// Card positions for the diagram (pre-laid out, paper coords)
// Paper is 820 wide. Vertical layout: BSZ center-top, spouse right, kids below.
const DIAGRAM_LAYOUT_1 = {
  1: { x: 280, y: 100 },   // 被相続人 太郎 (center)
  2: { x: 550, y: 100 },   // 妻 花子 (right of 太郎)
  3: { x: 180, y: 320 },   // 長男 一郎
  4: { x: 460, y: 320 },   // 長女 幸子
};

// Test data #3 for "sibling" variation
const TEST_DATA_3 = {
  honseki: '愛知県名古屋市中区栄三丁目5番地',
  lastAddr: '愛知県名古屋市中区栄三丁目5番12号',
  regAddr: '愛知県名古屋市中区栄三丁目5番地',
  people: [
    { id: 1, name: '試作 裕子', relation: '', role: '被相続人', isBSZ: true,
      birth: '昭和40年10月8日', death: '令和7年5月20日',
      father: 2, mother: 3, spouse: null, docs: ['生亡', '住所'] },
    { id: 2, name: '試作 義男', relation: '父', role: '先死亡', isBSZ: false,
      birth: '昭和10年1月15日', death: '平成22年9月3日',
      father: null, mother: null, spouse: 3, docs: ['生亡'] },
    { id: 3, name: '試作 節子', relation: '母', role: '先死亡', isBSZ: false,
      birth: '昭和13年8月22日', death: '令和2年4月11日',
      father: null, mother: null, spouse: 2, docs: ['生亡'] },
    { id: 4, name: '試作 正人', relation: '兄', role: '相続人', isBSZ: false,
      birth: '昭和35年3月5日', death: '',
      father: 2, mother: 3, spouse: null, docs: ['現戸', '住所', '印証', '遺分'] },
    { id: 5, name: '試作 和也', relation: '弟', role: '相続人', isBSZ: false,
      birth: '昭和43年12月25日', death: '',
      father: 2, mother: 3, spouse: null, docs: ['現戸', '住所', '印証', '遺分'] },
  ],
};

const DIAGRAM_LAYOUT_3 = {
  2: { x: 240, y: 80 },    // 父 義男
  3: { x: 500, y: 80 },    // 母 節子
  1: { x: 370, y: 300 },   // 被相続人 裕子
  4: { x: 140, y: 500 },   // 兄 正人
  5: { x: 600, y: 500 },   // 弟 和也
};

// Role colors mapping for JS
const ROLE_COLORS = {
  '被相続人':     { fg: '#8c2a2b', bg: '#f5e8e4', border: '#c89a9b' },
  '相続人':       { fg: '#3d6e4f', bg: '#e4ede3', border: '#9bb6a3' },
  '遺産分割':     { fg: '#a86b1f', bg: '#f4ead6', border: '#d9b97a' },
  '先死亡':       { fg: '#786d5f', bg: '#ede8dd', border: '#b9b0a1' },
  '相続後死亡':   { fg: '#583f6b', bg: '#ebe3f0', border: '#b09bbd' },
  '数次相続人':   { fg: '#2f5977', bg: '#dde7ef', border: '#8faabf' },
  '相続人兼数次相続人': { fg: '#2a6860', bg: '#dfece8', border: '#8db7af' },
  '無関係':       { fg: '#8c8478', bg: '#eae4d8', border: '#bfb7a7' },
};

const ROLE_DOCS = {
  '被相続人': ['生亡', '住所'],
  '相続人': ['現戸', '住所', '印証', '遺分'],
  '遺産分割': ['現戸', '印証', '遺分'],
  '先死亡': ['生亡'],
  '相続後死亡': ['生亡'],
  '数次相続人': ['現戸', '住所', '印証', '遺分'],
  '相続人兼数次相続人': ['現戸', '住所', '印証', '遺分'],
  '無関係': [],
};

Object.assign(window, {
  TEST_DATA_1, DIAGRAM_LAYOUT_1,
  TEST_DATA_3, DIAGRAM_LAYOUT_3,
  ROLE_COLORS, ROLE_DOCS,
});
