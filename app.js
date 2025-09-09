// Joint Tracker Pro – richer fields & analytics (vanilla JS, localStorage)
// Data model: {id, ts, method, qty, amountG, potency, tag, note}
const STORAGE_KEY='jtpro_events_v1';
const SETTINGS_KEY='jtpro_settings_v1';
let deferredPrompt=null;

const $ = (id)=>document.getElementById(id);

window.addEventListener('beforeinstallprompt',(e)=>{
  e.preventDefault(); deferredPrompt=e; const btn=$('installBtn'); if(btn) btn.style.display='inline-block';
});

$('installBtn').addEventListener('click', async ()=>{
  if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; $('installBtn').style.display='none';
});

function load(){ try{const r=localStorage.getItem(STORAGE_KEY); return r?JSON.parse(r):[]}catch{return []} }
function save(x){ localStorage.setItem(STORAGE_KEY, JSON.stringify(x)); }
function loadSettings(){ try{const r=localStorage.getItem(SETTINGS_KEY); return r?JSON.parse(r):{} }catch{return {}} }
function saveSettings(s){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }
function nowISO(){ return new Date().toISOString(); }
function isSameDay(a,b){ a=new Date(a); b=new Date(b); return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function startOfWeek(d){ const x=new Date(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x; }
function parseDayKey(d){ const t=new Date(d); return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0'); }

function addEvent({qty,method,amountG,potency,tag,note}){
  const ev=load();
  ev.push({id:crypto.randomUUID(), ts:nowISO(), qty:Number(qty)||1, method, amountG:amountG?Number(amountG):null, potency:potency?Number(potency):null, tag:(tag||'').trim(), note:(note||'').trim()});
  save(ev); render();
}

function undoLast(){ const ev=load(); if(ev.length===0) return; ev.pop(); save(ev); render(); }
function resetAll(){ if(!confirm('Wirklich alle Einträge löschen?')) return; localStorage.removeItem(STORAGE_KEY); render(); }

function totalsForRange(days, metric='qty'){
  const cutoff = new Date(); cutoff.setHours(23,59,59,999); cutoff.setDate(cutoff.getDate()-days+1);
  let sum=0; for(const e of load()){ const t=new Date(e.ts); if(t>=cutoff){ sum += valueOf(e, metric); } } return sum;
}

function valueOf(e, metric){
  if(metric==='qty') return Number(e.qty||0);
  if(metric==='grams'){
    const g = e.amountG ? Number(e.amountG) : 0;
    return g * Number(e.qty||1);
  }
  if(metric==='thc'){ // mg THC = grams * potency% * 1000
    const g = e.amountG ? Number(e.amountG) : 0;
    const pc = e.potency ? Number(e.potency)/100 : 0;
    return g * pc * 1000 * Number(e.qty||1);
  }
  return 0;
}

function computeStats(){
  const events=load(); const today=new Date(); const weekStart=startOfWeek(new Date());
  const monthCut=new Date(); monthCut.setDate(monthCut.getDate()-29); monthCut.setHours(0,0,0,0);
  let todayQty=0, todayGrams=0, monthQty=0;
  for(const e of events){
    const t=new Date(e.ts);
    if(isSameDay(t,today)){ todayQty += valueOf(e,'qty'); todayGrams += valueOf(e,'grams'); }
    if(t>=monthCut){ monthQty += valueOf(e,'qty'); }
  }
  // avg per day over selected range default 30
  const days=30; const avg = totalsForRange(days,'qty')/days;
  return {todayQty, todayGrams, monthQty, avg};
}

function dailyBuckets(nDays, metric='qty'){
  const map=new Map(); const end=new Date(); end.setHours(0,0,0,0);
  for(let i=nDays-1;i>=0;i--){ const d=new Date(end); d.setDate(end.getDate()-i); map.set(parseDayKey(d),0); }
  for(const e of load()){ const k=parseDayKey(e.ts); if(map.has(k)) map.set(k, map.get(k) + valueOf(e, metric)); }
  return map;
}

function computeStreak(){
  // consecutive days ending today with 0 qty
  const map=dailyBuckets(365,'qty'); const keys=[...map.keys()].sort();
  let streak=0; for(let i=keys.length-1;i>=0;i--){ const v=map.get(keys[i]); if(v===0) streak++; else break; }
  return streak;
}

function renderStats(){
  const {todayQty,todayGrams,monthQty,avg} = computeStats();
  $('todayCount').textContent = todayQty.toFixed(0);
  $('todayGrams').textContent = todayGrams.toFixed(2);
  $('monthCount').textContent = monthQty.toFixed(0);
  $('avgPerDay').textContent = avg.toFixed(2);
  $('streakInfo').textContent = `Rauchfrei-Streak: ${computeStreak()}`;
  applyGoalHighlight(todayQty, todayGrams);
}

function applyGoalHighlight(todayQty, todayGrams){
  const s = loadSettings();
  let goalTxt = 'Ziel: —';
  let warn = false;
  if(s.dailyLimitQty){ goalTxt = `Ziel: ≤ ${s.dailyLimitQty} J/Tag`; if(todayQty > s.dailyLimitQty) warn = true; }
  if(s.dailyLimitGram){ goalTxt += s.dailyLimitQty? ' · ':''; goalTxt += `≤ ${s.dailyLimitGram} g/Tag`; if(todayGrams > s.dailyLimitGram) warn = true; }
  $('goalInfo').textContent = goalTxt;
  $('goalInfo').style.color = warn ? '#fca5a5' : '#a3e635';
}

function renderList(){
  const list=$('list'); const events=load().slice().reverse();
  list.innerHTML='';
  if(events.length===0){ const p=document.createElement('div'); p.style.color='#9ca3af'; p.textContent='Noch keine Einträge.'; list.appendChild(p); return; }
  for(const e of events.slice(0,120)){
    const row=document.createElement('div'); row.className='item';
    const left=document.createElement('div'); const date=new Date(e.ts);
    const gramsTxt = e.amountG ? ` · ${(e.amountG*e.qty).toFixed(2)} g` : '';
    const thcTxt = (e.amountG && e.potency) ? ` · ~${(e.amountG*e.qty*e.potency/100*1000).toFixed(0)} mg THC` : '';
    let subtitle = `${date.toLocaleString()}`;
    if(e.tag) subtitle += ` · #${e.tag}`;
    left.innerHTML = `<div><strong>${e.method}</strong> · ${e.qty}x${gramsTxt}${thcTxt}</div><small>${subtitle}</small>${e.note?`<div class="muted" style="font-size:12px">${e.note}</div>`:''}`;
    const right=document.createElement('div'); right.className='right';
    const del=document.createElement('button'); del.textContent='Löschen'; del.className='ghost';
    del.onclick=()=>{ const all=load(); const idx=all.findIndex(x=>x.id===e.id); if(idx>=0){ all.splice(idx,1); save(all); render(); }};
    right.appendChild(del);
    row.appendChild(left); row.appendChild(right);
    list.appendChild(row);
  }
}

function drawBarChart(days, metric){
  const canvas=$('chart'); const ctx=canvas.getContext('2d');
  const buckets=dailyBuckets(days, metric); const vals=[...buckets.values()];
  const W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0b142b'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#1f2a4a'; ctx.lineWidth=1;
  for(let i=0;i<5;i++){ const y=H*(i/4); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  const max=Math.max(1, ...vals); const pad=10; const gap=4; const barW=(W - pad*2 - gap*(vals.length-1))/vals.length;
  ctx.fillStyle='#22c55e';
  vals.forEach((v,i)=>{ const x=pad + i*(barW+gap); const h=(v/max)*(H-20); const y=H-h-10; ctx.fillRect(x,y,barW,h); });
  const avg=vals.reduce((a,b)=>a+b,0)/vals.length; const yAvg=H - (avg/Math.max(1,max))*(H-20) - 10;
  ctx.strokeStyle='#94a3b8'; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(0,yAvg); ctx.lineTo(W,yAvg); ctx.stroke(); ctx.setLineDash([]);
}

function methodDistribution(days=30){
  const cut=new Date(); cut.setDate(cut.getDate()-days+1); cut.setHours(0,0,0,0);
  const map=new Map();
  for(const e of load()){ const t=new Date(e.ts); if(t>=cut){ const k=e.method||'—'; map.set(k,(map.get(k)||0)+Number(e.qty||0)); } }
  return map;
}

function drawPie(){
  const canvas=$('pie'); const ctx=canvas.getContext('2d');
  const data=methodDistribution(30); const labels=[...data.keys()]; const vals=[...data.values()];
  const total = vals.reduce((a,b)=>a+b,0); const W=canvas.width, H=canvas.height; const cx=W/2, cy=H/2, r=Math.min(W,H)*0.38;
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#0b142b'; ctx.fillRect(0,0,W,H);
  const palette=['#22c55e','#60a5fa','#f59e0b','#ef4444','#a78bfa','#34d399','#fb7185'];
  let start=-Math.PI/2;
  vals.forEach((v,i)=>{
    const angle = (v/Math.max(1,total))*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,start,start+angle); ctx.closePath();
    ctx.fillStyle = palette[i % palette.length]; ctx.fill();
    start += angle;
  });
  // legend
  ctx.font='12px -apple-system, system-ui, sans-serif'; ctx.fillStyle='#cbd5e1';
  let y = 14;
  labels.forEach((lab,i)=>{
    const pct = total? ((vals[i]/total)*100).toFixed(0) : 0;
    ctx.fillStyle=palette[i % palette.length]; ctx.fillRect(W-120,y-10,10,10);
    ctx.fillStyle='#cbd5e1'; ctx.fillText(`${lab} ${pct}%`, W-104, y);
    y += 16;
  });
}

function topTagsList(){
  const box=$('topTags'); box.innerHTML='';
  const cut=new Date(); cut.setDate(cut.getDate()-29); cut.setHours(0,0,0,0);
  const map=new Map();
  for(const e of load()){ const t=new Date(e.ts); if(t>=cut && e.tag){ const k=e.tag.trim().toLowerCase(); map.set(k,(map.get(k)||0)+Number(e.qty||0)); } }
  const items=[...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12);
  if(items.length===0){ const p=document.createElement('div'); p.className='muted'; p.textContent='Keine Tags.'; box.appendChild(p); return; }
  for(const [tag,qty] of items){
    const row=document.createElement('div'); row.className='item';
    row.innerHTML=`<div>#${tag}</div><div class="muted">${qty}×</div>`;
    box.appendChild(row);
  }
}

function render(){
  // defaults from settings
  const s = loadSettings();
  if(s.defaultMethod) $('method').value=s.defaultMethod;
  if(s.defaultAmount) $('amountG').value=s.defaultAmount;
  if(s.defaultPotency) $('potency').value=s.defaultPotency;

  renderStats();
  renderList();
  drawBarChart(Number($('rangeSelect').value), $('metricSelect').value);
  drawPie();
  topTagsList();
}

function exportJSON(){
  const data = JSON.stringify(load(), null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download='joint-tracker-export.json'; a.click(); URL.revokeObjectURL(url);
}
function exportCSV(){
  const rows = [['timestamp_iso','method','qty','amount_g','thc_percent','tag','note','grams_total','thc_mg_total']];
  for(const e of load()){
    const grams=valueOf(e,'grams'); const thc=valueOf(e,'thc');
    rows.push([e.ts,e.method,e.qty,e.amountG??'',e.potency??'',e.tag??'',e.note??'',grams.toFixed(3),thc.toFixed(0)]);
  }
  const csv = rows.map(r=>r.map(v=>String(v).replaceAll('"','""')).map(v=>`"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download='joint-tracker-export.csv'; a.click(); URL.revokeObjectURL(url);
}

function importData(file){
  const reader=new FileReader();
  if(file.name.endsWith('.json')){
    reader.onload=()=>{ try{ const parsed=JSON.parse(reader.result); if(Array.isArray(parsed)){ localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); render(); } else alert('Ungültige JSON Datei.'); }catch{ alert('Konnte JSON nicht lesen.'); } };
    reader.readAsText(file);
  } else if(file.name.endsWith('.csv')){
    reader.onload=()=>{
      try{
        const text=reader.result; const lines=text.trim().split(/\r?\n/);
        const head=lines.shift().split(',').map(s=>s.replace(/^"|"$/g,''));
        const idx=(k)=>head.indexOf(k);
        const ev=[];
        for(const line of lines){
          const cols = line.match(/("([^"]|"")*"|[^,]+)/g).map(s=>s.replace(/^"|"$/g,'').replace(/""/g,'"'));
          const ts = cols[idx('timestamp_iso')] || new Date().toISOString();
          ev.push({
            id: crypto.randomUUID(),
            ts,
            method: cols[idx('method')]||'Joint',
            qty: Number(cols[idx('qty')]||1),
            amountG: cols[idx('amount_g')]?Number(cols[idx('amount_g')]):null,
            potency: cols[idx('thc_percent')]?Number(cols[idx('thc_percent')]):null,
            tag: cols[idx('tag')]||'',
            note: cols[idx('note')]||''
          });
        }
        save(ev); render();
      }catch{ alert('Konnte CSV nicht lesen.'); }
    };
    reader.readAsText(file);
  } else {
    alert('Bitte JSON oder CSV wählen.');
  }
}

// Settings UI
function toggleSettings(){ const c=$('settingsCard'); c.style.display = (c.style.display==='none'||!c.style.display)?'block':'none'; }
function loadSettingsIntoUI(){
  const s=loadSettings();
  $('sDefaultMethod').value = s.defaultMethod || 'Joint';
  $('sDefaultAmount').value = s.defaultAmount ?? '';
  $('sDefaultPotency').value = s.defaultPotency ?? '';
  $('sDailyLimitQty').value = s.dailyLimitQty ?? '';
  $('sDailyLimitGram').value = s.dailyLimitGram ?? '';
}

document.addEventListener('DOMContentLoaded', ()=>{
  // hook up
  $('logBtn').onclick=()=>{
    const qty=$('qty').value, method=$('method').value, amountG=$('amountG').value, potency=$('potency').value, tag=$('tag').value, note=$('note').value;
    addEvent({qty,method,amountG,potency,tag,note});
    $('qty').value=1; if(amountG) $('amountG').value=amountG; if(potency) $('potency').value=potency; $('tag').value=''; $('note').value='';
    // persist last used defaults
    const s=loadSettings(); s.defaultMethod=method; if(amountG) s.defaultAmount=amountG; if(potency) s.defaultPotency=potency; saveSettings(s);
  };
  $('undoBtn').onclick=undoLast;
  $('resetBtn').onclick=resetAll;
  $('rangeSelect').onchange=()=>drawBarChart(Number($('rangeSelect').value), $('metricSelect').value);
  $('metricSelect').onchange=()=>drawBarChart(Number($('rangeSelect').value), $('metricSelect').value);
  $('exportJsonBtn').onclick=exportJSON;
  $('exportCsvBtn').onclick=exportCSV;
  $('importBtn').onclick=()=>$('importFile').click();
  $('importFile').onchange=(e)=>{ const f=e.target.files[0]; if(!f) return; importData(f); e.target.value=''; };
  $('settingsBtn').onclick=()=>{ toggleSettings(); loadSettingsIntoUI(); };
  $('saveSettings').onclick=()=>{
    const s=loadSettings();
    s.defaultMethod=$('sDefaultMethod').value;
    s.defaultAmount= $('sDefaultAmount').value? Number($('sDefaultAmount').value): null;
    s.defaultPotency= $('sDefaultPotency').value? Number($('sDefaultPotency').value): null;
    s.dailyLimitQty= $('sDailyLimitQty').value? Number($('sDailyLimitQty').value): null;
    s.dailyLimitGram= $('sDailyLimitGram').value? Number($('sDailyLimitGram').value): null;
    saveSettings(s);
    toggleSettings();
    render();
  };
  render();
});
