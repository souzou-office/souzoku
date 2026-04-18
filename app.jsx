// app.jsx — 相続関係説明図 (React edition)
// Design-faithful React rewrite of the souzoku app.
// Loaded after design/components/icons.jsx which exposes window.Icons.

const { useState, useEffect, useRef, useMemo, useCallback, Fragment } = React;

// ============================================================
//  Constants
// ============================================================
const ROLE_LIST = ['','相続人','遺産分割','先死亡','相続後死亡','数次相続人','相続人兼数次相続人','無関係'];
const ZOKUGARA = ['','妻','夫','長男','二男','三男','四男','五男','長女','二女','三女','四女','五女','父','母','養父','養母','兄','姉','弟','妹','孫','甥','姪'];
const ROLE_DOCS = {
  '被相続人': ['生亡','住所'],
  '相続人': ['現戸','住所','印証','遺分'],
  '遺産分割': ['現戸','印証','遺分'],
  '先死亡': ['生亡'],
  '相続後死亡': ['生亡'],
  '数次相続人': ['現戸','住所','印証','遺分'],
  '相続人兼数次相続人': ['現戸','住所','印証','遺分'],
  '無関係': [],
};
const ROLE_COLORS = {
  '被相続人':     { fg:'#8c2a2b', bg:'#f5e8e4' },
  '相続人':       { fg:'#3d6e4f', bg:'#e4ede3' },
  '遺産分割':     { fg:'#a86b1f', bg:'#f4ead6' },
  '先死亡':       { fg:'#786d5f', bg:'#ede8dd' },
  '相続後死亡':   { fg:'#583f6b', bg:'#ebe3f0' },
  '数次相続人':   { fg:'#2f5977', bg:'#dde7ef' },
  '相続人兼数次相続人': { fg:'#2a6860', bg:'#dfece8' },
  '無関係':       { fg:'#8c8478', bg:'#eae4d8' },
};
const CARD_W = 220;
const HGAP = 50;
const VGAP = 160;
const SNAP = 20;

// Dual-era years (when the emperor changed mid-year)
const DUAL_ERA_YEARS = [
  {y:2019,suffix:'H',label:'平成31年'},
  {y:1989,suffix:'S',label:'昭和64年'},
  {y:1926,suffix:'T',label:'大正15年'},
];

// ============================================================
//  Date / era helpers
// ============================================================
function warekiYear(y) {
  if (y >= 2019) return '令和' + (y-2018===1?'元':y-2018) + '年';
  if (y >= 1989) return '平成' + (y-1988===1?'元':y-1988) + '年';
  if (y >= 1926) return '昭和' + (y-1925===1?'元':y-1925) + '年';
  if (y >= 1912) return '大正' + (y-1911===1?'元':y-1911) + '年';
  return '明治' + (y-1867) + '年';
}
function parseYearVal(v) {
  if (!v) return { y:0, era:'' };
  const s = String(v);
  const d = DUAL_ERA_YEARS.find(d => s === d.y + d.suffix);
  if (d) return { y:d.y, era:d.label.replace('年','') };
  return { y:+s, era:'' };
}
function makeYearOpts() {
  const opts = [{value:'',label:'--'}];
  for (let y=2026; y>=1868; y--) {
    opts.push({ value:String(y), label:warekiYear(y)+' ('+y+')' });
    const d = DUAL_ERA_YEARS.find(d=>d.y===y);
    if (d) opts.push({ value:y+d.suffix, label:d.label+' ('+y+')' });
  }
  return opts;
}
const YEAR_OPTS = makeYearOpts();
const MONTH_OPTS = [{value:'',label:'--'}].concat(Array.from({length:12},(_,i)=>({value:String(i+1),label:(i+1)+'月'})));
const DAY_OPTS = [{value:'',label:'--'}].concat(Array.from({length:31},(_,i)=>({value:String(i+1),label:(i+1)+'日'})));

function dateToStr(p, pref) {
  const y = p[pref+'Y'], m = p[pref+'M'], d = p[pref+'D'];
  if (!y) return '';
  const pv = parseYearVal(y);
  if (!pv.y) return '';
  const era = pv.era ? pv.era : warekiYear(pv.y).replace('年','');
  return era + '年' + (m?m+'月':'') + (d?d+'日':'');
}
function dateToNum(p, pref) {
  const y = p[pref+'Y'];
  if (!y) return 0;
  const pv = parseYearVal(y);
  return pv.y*10000 + (+p[pref+'M']||0)*100 + (+p[pref+'D']||0);
}

// ============================================================
//  Auto role detection (ported from original)
// ============================================================
function autoRoles(people) {
  const hisou = people.find(p => p.isBSZ);
  if (!hisou) return people;
  const dNum = dateToNum(hisou,'death');
  const withRoles = people.map(p => {
    if (p.isBSZ) return { ...p, role:'被相続人', _autoRole:'被相続人' };
    const pD = dateToNum(p,'death');
    let auto;
    if (pD === 0) auto = '相続人';
    else if (dNum && pD < dNum) auto = '先死亡';
    else if (dNum && pD >= dNum) auto = '相続後死亡';
    else auto = '相続人';
    return { ...p, _autoRole:auto, role: p.roleOverride || auto };
  });
  const bszId = String(hisou.id);
  const suujiIds = new Set(withRoles.filter(p=>p.role==='相続後死亡').map(p=>String(p.id)));
  return withRoles.map(p => {
    if (p.role !== '相続人' || p.roleOverride) return p;
    const isChildOfSuuji = (p.father && suujiIds.has(String(p.father))) || (p.mother && suujiIds.has(String(p.mother)));
    const isSpouseOfSuuji = p.spouse && suujiIds.has(String(p.spouse));
    if (!isChildOfSuuji && !isSpouseOfSuuji) return p;
    const isHeirOfBSZ = String(p.father)===bszId || String(p.mother)===bszId || String(p.spouse)===bszId;
    return { ...p, role: isHeirOfBSZ ? '相続人兼数次相続人' : '数次相続人' };
  });
}

function allSpouses(p) {
  const a = [];
  if (p.spouse) a.push(String(p.spouse));
  (p.exSpouses||[]).forEach(id => { if (id) a.push(String(id)); });
  return a;
}

// Expose to next script block(s)
Object.assign(window, {
  ROLE_LIST, ZOKUGARA, ROLE_DOCS, ROLE_COLORS,
  CARD_W, HGAP, VGAP, SNAP, DUAL_ERA_YEARS,
  YEAR_OPTS, MONTH_OPTS, DAY_OPTS,
  warekiYear, parseYearVal, dateToStr, dateToNum,
  autoRoles, allSpouses,
});
