// app-layout.jsx — auto layout calculation (ported from original)

function calcLayout(people, layoutDir) {
  if (!people.length) return [];
  const byId = {}; people.forEach(p => byId[p.id] = p);
  const root = people.find(p => p.isBSZ) || people[0];
  const lvMap = {};
  const visited = new Set();

  function assignLevel(p, lv) {
    if (!p || visited.has(p.id)) return;
    visited.add(p.id);
    lvMap[p.id] = lv;
    allSpouses(p).forEach(sid => {
      if (byId[sid] && !visited.has(+sid)) {
        visited.add(+sid);
        lvMap[+sid] = lv;
      }
    });
  }
  function goUp(p, lv) {
    [p.father, p.mother].forEach(pid => {
      if (!pid || !byId[pid] || visited.has(+pid)) return;
      assignLevel(byId[pid], lv-1);
      goUp(byId[pid], lv-1);
    });
  }
  function goDown(parentId, lv) {
    people.forEach(p => {
      if (visited.has(p.id)) return;
      if (String(p.father)===String(parentId) || String(p.mother)===String(parentId)) {
        assignLevel(p, lv);
        goDown(p.id, lv+1);
      }
    });
  }

  goUp(root, 0);
  assignLevel(root, 0);
  goDown(root.id, 1);
  allSpouses(root).forEach(sid => { if (byId[sid]) goDown(+sid, 1); });

  let changed = true;
  while (changed) {
    changed = false;
    people.forEach(p => {
      if (visited.has(p.id)) return;
      const fLv = p.father && lvMap[+p.father] !== undefined ? lvMap[+p.father] : null;
      const mLv = p.mother && lvMap[+p.mother] !== undefined ? lvMap[+p.mother] : null;
      const parentLv = fLv !== null ? fLv : (mLv !== null ? mLv : null);
      if (parentLv !== null) {
        assignLevel(p, parentLv+1);
        goDown(p.id, parentLv+2);
        changed = true;
      }
    });
  }
  const maxLv = Math.max(0, ...Object.values(lvMap));
  people.forEach(p => { if (!visited.has(p.id)) { visited.add(p.id); lvMap[p.id] = maxLv+1; } });

  const levels = {};
  people.forEach(p => {
    const lv = lvMap[p.id];
    if (!levels[lv]) levels[lv] = [];
    levels[lv].push(p);
  });

  const sorted = Object.keys(levels).map(Number).sort((a,b)=>a-b);
  const minLv = sorted[0] || 0;
  const result = [];
  const OX = 40, OY = 160; // offset from paper top-left
  const horiz = layoutDir === 'horizontal';

  sorted.forEach(lv => {
    levels[lv].forEach((p,i) => {
      if (horiz) result.push({ p, x:OX+(lv-minLv)*(CARD_W+HGAP), y:OY+i*VGAP });
      else       result.push({ p, x:OX+i*(CARD_W+HGAP), y:OY+(lv-minLv)*VGAP });
    });
  });

  function enforceSpouseAdjacency(lv) {
    const row = result.filter(r => lvMap[r.p.id]===lv);
    if (horiz) row.sort((a,b)=>a.y-b.y); else row.sort((a,b)=>a.x-b.x);
    const done = new Set();
    row.forEach(r => {
      if (done.has(r.p.id)) return;
      const exIds = (r.p.exSpouses||[]).filter(id => id && byId[id] && lvMap[+id]===lv).map(id=>+id);
      const curId = r.p.spouse && byId[r.p.spouse] && lvMap[+r.p.spouse]===lv ? +r.p.spouse : null;
      if (!exIds.length && !curId) return;
      done.add(r.p.id);
      if (horiz) {
        let pos = r.y;
        exIds.forEach(eid => {
          if (done.has(eid)) return; done.add(eid);
          const sp = result.find(s=>s.p.id===eid);
          if (sp) { sp.y = pos - VGAP; sp.x = r.x; pos = sp.y; }
        });
        if (curId && !done.has(curId)) {
          done.add(curId);
          const sp = result.find(s=>s.p.id===curId);
          if (sp) { sp.y = r.y + VGAP; sp.x = r.x; }
        }
      } else {
        let posLeft = r.x;
        exIds.forEach(eid => {
          if (done.has(eid)) return; done.add(eid);
          const sp = result.find(s=>s.p.id===eid);
          if (sp) { sp.x = posLeft - (CARD_W+HGAP); posLeft = sp.x; sp.y = r.y; }
        });
        if (curId && !done.has(curId)) {
          done.add(curId);
          const sp = result.find(s=>s.p.id===curId);
          if (sp) { sp.x = r.x + CARD_W + HGAP; sp.y = r.y; }
        }
      }
    });
  }

  function resolveOverlaps(lv) {
    if (horiz) {
      const row = result.filter(r=>lvMap[r.p.id]===lv).sort((a,b)=>a.y-b.y);
      for (let i=1;i<row.length;i++) {
        const mn = row[i-1].y + VGAP;
        if (row[i].y < mn) {
          const shift = mn - row[i].y;
          for (let j=i;j<row.length;j++) row[j].y += shift;
        }
      }
    } else {
      const row = result.filter(r=>lvMap[r.p.id]===lv).sort((a,b)=>a.x-b.x);
      for (let i=1;i<row.length;i++) {
        const mn = row[i-1].x + CARD_W + HGAP;
        if (row[i].x < mn) {
          const shift = mn - row[i].x;
          for (let j=i;j<row.length;j++) row[j].x += shift;
        }
      }
    }
  }

  sorted.forEach(lv => enforceSpouseAdjacency(lv));

  // Center kids under parent pair
  sorted.forEach(lv => {
    if (!levels[lv-1]) return;
    const used = new Set();
    const donePairs = new Set();
    levels[lv-1].forEach(parent => {
      const spouseIds = allSpouses(parent);
      const pairs = [...spouseIds.map(sid=>({sid:+sid})),{sid:null}];
      pairs.forEach(({sid}) => {
        const pairId = sid ? Math.min(parent.id,sid)+'-'+Math.max(parent.id,sid) : 'solo-'+parent.id;
        if (donePairs.has(pairId)) return;
        donePairs.add(pairId);
        const kids = (levels[lv]||[]).filter(c => {
          if (used.has(c.id)) return false;
          const cf=+c.father, cm=+c.mother;
          if (sid) return (cf===parent.id&&cm===sid)||(cm===parent.id&&cf===sid)||(cf===parent.id&&!cm)||(cm===parent.id&&!cf);
          return (cf===parent.id||cm===parent.id) && !spouseIds.includes(String(cf)) && !spouseIds.includes(String(cm));
        });
        if (!kids.length) return;
        kids.forEach(c=>used.add(c.id));
        const pPos = result.find(r=>r.p.id===parent.id); if (!pPos) return;
        const spPos = sid ? result.find(r=>r.p.id===sid) : null;
        if (horiz) {
          const pcy = spPos ? (pPos.y+spPos.y)/2 : pPos.y;
          const th = kids.length*VGAP;
          const sy = pcy - th/2 + VGAP/2;
          kids.forEach((k,ci) => {
            const kp = result.find(r=>r.p.id===k.id);
            if (kp) kp.y = sy + ci*VGAP;
          });
        } else {
          const pcx = spPos ? (pPos.x + CARD_W + spPos.x)/2 : pPos.x + CARD_W/2;
          const tw = kids.length*CARD_W + (kids.length-1)*HGAP;
          const sx = pcx - tw/2;
          kids.forEach((k,ci) => {
            const kp = result.find(r=>r.p.id===k.id);
            if (kp) kp.x = sx + ci*(CARD_W+HGAP);
          });
        }
      });
    });
  });

  sorted.forEach(lv => enforceSpouseAdjacency(lv));
  sorted.forEach(lv => resolveOverlaps(lv));
  sorted.forEach(lv => enforceSpouseAdjacency(lv));
  sorted.forEach(lv => resolveOverlaps(lv));

  // Normalize origin
  let mnX = Infinity, mnY = Infinity;
  result.forEach(r => { if (r.x<mnX) mnX=r.x; if (r.y<mnY) mnY=r.y; });
  if (mnX < OX) result.forEach(r => r.x += OX-mnX);
  if (mnY < OY) result.forEach(r => r.y += OY-mnY);
  result.forEach(r => { r.x = Math.round(r.x); r.y = Math.round(r.y); });
  return result;
}

Object.assign(window, { calcLayout });
