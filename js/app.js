const FIRM_DEFAULT={name:'J B Langley Associates Ltd',address:'Unit 3B, Link 606 Business Park\nStaithgate Lane, Bradford\nWest Yorkshire, BD6 1YA',tel:'01274 973041',email:'info@jblangley.co.uk',web:'jblangley.co.uk',reg:'2471970'};
const CATS=[
 {id:'SITE',ph:'A',name:'Site & existing building'},
 {id:'GRD',ph:'A',name:'Ground conditions'},
 {id:'EXC',ph:'A',name:'Excavations, foundations & drainage'},
 {id:'DEM',ph:'A',name:'Demolition & structural alterations'},
 {id:'STR',ph:'A',name:'Structure, lifting & erection'},
 {id:'LFT',ph:'A',name:'Loft conversions & roofs'},
 {id:'WAH',ph:'A',name:'Working at height'},
 {id:'HLT',ph:'A',name:'Health hazards & materials'},
 {id:'NBR',ph:'A',name:'Neighbours, public & occupied premises'},
 {id:'USE',ph:'B',name:'Maintenance, cleaning & future use'}
];
const PHASES={A:'During Construction',B:'During Maintenance / Cleaning'};
const TYPES=[{k:'e',n:'Extension'},{k:'n',n:'New build house'},{k:'l',n:'Loft conversion'},{k:'b',n:'Basement'},{k:'a',n:'Internal alterations'}];
const LIB=RAW.map(r=>({id:r[0],cat:r[1],tags:r[2],hazard:r[3],risk:r[4],design:r[5],info:r[6],ini:r[7],rev:r[8]}));
const LIBMAP=Object.fromEntries(LIB.map(r=>[r.id,r]));
const RATE={H:'High',M:'Medium',L:'Low'};

const today=()=>new Date().toISOString().slice(0,10);
const blankProject=()=>({addr1:'',addr2:'',addr3:'',client:'',job:'',rev:'D01',docNo:'',engineer:'TEC',checkedBy:'BJJ',date:today(),desc:'',pd:'',pc:'',notes:'',notPD:true});
function normProject(pr){pr=Object.assign(blankProject(),pr||{});
  if(pr.name&&!pr.addr1&&!pr.addr2&&!pr.addr3){const parts=String(pr.name).split(/\s*,\s*/);pr.addr1=parts.shift()||'';pr.addr2=parts.shift()||'';pr.addr3=parts.join(', ')}
  delete pr.name;return pr}
const projLines=p=>[p.addr1,p.addr2,p.addr3].map(x=>String(x||'').trim()).filter(Boolean);
const projText=p=>projLines(p).join(', ');
function pick(r){return {hazard:r.hazard,risk:r.risk,design:r.design,info:r.info,ini:r.ini,rev:r.rev}}
const isSug=(r,types)=>!!r.tags&&types.some(t=>r.tags.includes(t));
function exampleState(){
  const s={project:Object.assign(blankProject(),{addr1:'Single storey rear extension',addr2:'24 Orchard Road',addr3:'Example Town, AB1 2CD',client:'Mr & Mrs Example',job:'157XXX',docNo:'157XXX-JBL-XXX-ZZZ-RA-SE-901',desc:'Single storey rear extension with a new steel beam forming an opening in the existing rear wall. Trench fill foundations on clay, close to an existing tree.',pd:'Example Architects Ltd',pc:'To be appointed'}),types:['e'],sel:{},custom:[],example:true};
  LIB.filter(r=>isSug(r,['e'])).forEach(r=>s.sel[r.id]=pick(r));return s;
}

let firm={...FIRM_DEFAULT},S;
try{const f=JSON.parse(localStorage.getItem('jbl.dra.firm')||'null');if(f)firm=Object.assign(firm,f)}catch(e){}
try{S=JSON.parse(localStorage.getItem('jbl.dra.project')||'null')}catch(e){}
if(!S||!S.project)S=exampleState();
S.custom=S.custom||[];S.sel=S.sel||{};S.types=S.types||[];S.project=normProject(S.project);

let saveT;
function persist(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem('jbl.dra.project',JSON.stringify(S))}catch(e){}},300)}
function persistFirm(){try{localStorage.setItem('jbl.dra.firm',JSON.stringify(firm))}catch(e){}}

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dash=v=>(v&&String(v).trim())||'-';
const allRisks=()=>[...LIB,...S.custom];
const getR=id=>LIBMAP[id]||S.custom.find(c=>c.id===id);
function msg(t,kind){const m=$('msg');m.textContent=t;m.className='msg'+(kind?' '+kind:'')}
function fmtDate(d){if(!d)return '';const x=new Date(d+'T12:00:00');return isNaN(x)?d:x.toLocaleDateString('en-GB')}

// ---------- header + forms ----------
$('lhLogo').src=LOGO;
function renderAddr(){
  $('lhAddr').innerHTML=`<b>${esc(firm.name)}</b>${esc(firm.address).replace(/\n/g,'<br>')}<br>T: ${esc(firm.tel)}<br>E: ${esc(firm.email)}<br>W: ${esc(firm.web)}`;
}
function fillForm(){
  document.querySelectorAll('[data-p]').forEach(el=>el.value=S.project[el.dataset.p]||'');
  document.querySelectorAll('[data-f]').forEach(el=>el.value=firm[el.dataset.f]||'');
  $('p_notpd').checked=S.project.notPD!==false;
  renderAddr();renderTypes();$('exBanner').hidden=!S.example;updateTB();
}
function notEx(){if(S.example){S.example=false;$('exBanner').hidden=true}}
document.querySelectorAll('[data-p]').forEach(el=>el.addEventListener('input',()=>{S.project[el.dataset.p]=el.value;notEx();updateTB();persist()}));
document.querySelectorAll('[data-f]').forEach(el=>el.addEventListener('input',()=>{firm[el.dataset.f]=el.value;renderAddr();persistFirm()}));
$('p_notpd').addEventListener('change',e=>{S.project.notPD=e.target.checked;persist()});
$('firmReset').addEventListener('click',()=>{firm={...FIRM_DEFAULT};persistFirm();fillForm();msg('Company details restored from the template.','ok')});
function updateTB(){
  const p=S.project,n=Object.keys(S.sel).length;
  $('tbProj').textContent=dash(projText(p));$('tbClient').textContent=dash(p.client);$('tbJob').textContent=dash(p.job);
  $('tbEng').textContent=dash(p.engineer);$('tbRev').textContent=dash(p.rev);$('tbCount').textContent=n;
  $('barCount').textContent=n+(n===1?' risk':' risks');
}
function sugInfo(){const all=LIB.filter(r=>isSug(r,S.types)),todo=all.filter(r=>!S.sel[r.id]).length;
  $('sugInfo').textContent=!S.types.length?'':`${all.length} risks suggested for ${TYPES.filter(t=>S.types.includes(t.k)).map(t=>t.n.toLowerCase()).join(' + ')}. ${todo?todo+' not yet ticked.':'All ticked.'}`;
  $('suggest').disabled=!todo;$('suggest').textContent=todo?`Tick ${todo} suggested risks`:'Tick suggested risks'}
function renderTypes(){$('types').innerHTML=TYPES.map(t=>`<button class="chip" data-t="${t.k}" aria-pressed="${S.types.includes(t.k)}">${t.n}</button>`).join('');sugInfo()}
$('types').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(!b)return;const k=b.dataset.t;
  S.types=S.types.includes(k)?S.types.filter(x=>x!==k):[...S.types,k];
  // keep the ticked list in step with the works types: untick library risks no longer suggested
  const drop=LIB.filter(r=>S.sel[r.id]&&!isSug(r,S.types));
  drop.forEach(r=>{delete S.sel[r.id];open.delete(r.id)});
  const todo=LIB.filter(r=>isSug(r,S.types)&&!S.sel[r.id]).length;
  notEx();renderTypes();renderReg();updateTB();persist();
  const parts=[];if(drop.length)parts.push(`Unticked ${drop.length} risk${drop.length===1?'':'s'} not suggested for this type of works.`);
  if(todo)parts.push(`${todo} suggested risk${todo===1?' is':'s are'} not ticked yet.`);
  msg(parts.join(' ')||'Type of works updated.',drop.length||todo?'ok':'')});
$('suggest').addEventListener('click',()=>{
  if(!S.types.length){msg('Pick a type of works first.','err');return}
  let n=0;LIB.forEach(r=>{if(isSug(r,S.types)&&!S.sel[r.id]){S.sel[r.id]=pick(r);n++}});
  notEx();renderReg();updateTB();sugInfo();persist();
  msg(n?`Added ${n} risks. Review each one and untick any that don't apply.`:'All suggested risks are already ticked.','ok');
});

// ---------- register ----------
const open=new Set();
const inView=(r,v)=>v==='unsel'?!S.sel[r.id]:v==='sel'?!!S.sel[r.id]:v==='sug'?(isSug(r,S.types)||!!S.sel[r.id]):true;
const matches=(r,q)=>!q||[r.id,r.hazard,r.risk,r.design,r.info].join(' ').toLowerCase().includes(q);
function renderSummary(){const all=allRisks(),on=all.filter(r=>S.sel[r.id]).length;
  $('summary').innerHTML=`<span><span class="sw on"></span><b>${on}</b> ticked</span><span><span class="sw"></span><b>${all.length-on}</b> not ticked</span><span>of ${all.length} risks in the library</span>`}
function renderReg(){renderSummary();
  const q=$('q').value.trim().toLowerCase(),view=$('view').value;let lastPh='',out='';
  CATS.forEach(c=>{
    const items=allRisks().filter(r=>r.cat===c.id);
    const shown=items.filter(r=>inView(r,view)&&matches(r,q));
    if(!shown.length)return;
    if(c.ph!==lastPh){out+=`<div class="phase"><b>${c.ph}</b>${PHASES[c.ph]}</div>`;lastPh=c.ph}
    const nsel=items.filter(r=>S.sel[r.id]).length,allOn=shown.every(r=>S.sel[r.id]);
    out+=`<section class="cat"><header><h3>${esc(c.name)}</h3><span class="count">${nsel} of ${items.length} ticked</span>
      <button class="linkbtn" data-act="catall" data-cat="${c.id}" data-on="${allOn?0:1}">${allOn?'Untick shown':'Tick shown'}</button></header>
      <ul>${shown.map(rowHTML).join('')}</ul></section>`;
  });
  $('reg').innerHTML=out||`<div class="card"><p class="hint">${$('view').value==='sug'&&!S.types.length?'Pick a type of works to see suggested risks.':'No risks match. Clear the search or change “Show” to All risks.'}</p></div>`;
}
function rowHTML(r){
  const s=S.sel[r.id],o=open.has(r.id),v=s||r;
  const tag=r.custom?'<span class="tag own">Project</span>':(isSug(r,S.types)?'<span class="tag">Suggested</span>':'');
  let body='';
  if(o&&s){
    body=`<div class="rbody">
      <div class="field"><label for="hz_${r.id}">Activity / hazard</label><input id="hz_${r.id}" data-ed="hazard" value="${esc(s.hazard)}"></div>
      <div class="field"><label for="rk_${r.id}">Risk(s)</label><textarea id="rk_${r.id}" data-ed="risk" rows="2">${esc(s.risk)}</textarea></div>
      <div class="field"><label for="ds_${r.id}">Design mitigation measures and controls (eliminate, reduce, information, control)</label><textarea id="ds_${r.id}" data-ed="design" rows="2">${esc(s.design)}</textarea></div>
      <div class="field"><label for="in_${r.id}">Information</label><textarea id="in_${r.id}" data-ed="info" rows="3">${esc(s.info)}</textarea></div>
      <div class="rates">${seg('Initial risk rating','ini',s.ini)}${seg('Revised risk rating','rev',s.rev)}</div>
      <div class="btns">${r.custom?'<button class="linkbtn" data-act="delcustom">Delete this project-specific risk</button>':'<button class="linkbtn" data-act="reset">Reset to library wording</button>'}</div>
    </div>`;
  } else if(o){
    body=`<div class="rbody"><p><b>Design mitigation measures and controls</b>${esc(r.design)}</p><p><b>Information</b>${esc(r.info)}</p><p class="hint">Tick to include this risk and edit the wording for this project.</p></div>`;
  }
  return `<li class="risk${s?' sel':''}" data-id="${r.id}">
    <span class="chk"><input type="checkbox" aria-label="Include ${esc(v.hazard)}" ${s?'checked':''} data-act="sel"></span>
    <button class="rhead" data-act="toggle" aria-expanded="${o}">
      <span class="ref">${r.id}</span>
      <span class="hz">${esc(v.hazard)}${tag}<span class="rk">${esc(v.risk)}</span></span>
      <span class="rates-mini" title="Initial and revised risk rating"><span class="rb ${v.ini}">${v.ini}</span><span class="arrow">→</span><span class="rb ${v.rev}">${v.rev}</span></span>
    </button>${body}</li>`;
}
function seg(t,k,val){return `<div class="seg"><span class="t">${t}</span><div class="opts" role="group" aria-label="${t}">${['H','M','L'].map(x=>`<button class="${x}" data-rate="${k}" data-v="${x}" aria-pressed="${val===x}" title="${RATE[x]}">${x}</button>`).join('')}</div></div>`}
$('reg').addEventListener('click',e=>{
  const rb=e.target.closest('[data-rate]');
  if(rb){const id=rb.closest('.risk').dataset.id;S.sel[id][rb.dataset.rate]=rb.dataset.v;touch();return}
  const a=e.target.closest('[data-act]');if(!a)return;const act=a.dataset.act;
  if(act==='catall'){const c=a.dataset.cat,on=a.dataset.on==='1',q=$('q').value.trim().toLowerCase(),view=$('view').value;
    allRisks().filter(r=>r.cat===c&&inView(r,view)&&matches(r,q)).forEach(r=>{if(on){if(!S.sel[r.id])S.sel[r.id]=pick(r)}else delete S.sel[r.id]});touch();return}
  const li=a.closest('.risk');if(!li)return;const id=li.dataset.id,r=getR(id);
  if(act==='sel'){if(a.checked)S.sel[id]=pick(r);else delete S.sel[id];touch();return}
  if(act==='toggle'){open.has(id)?open.delete(id):open.add(id);renderReg();return}
  if(act==='reset'){S.sel[id]=pick(r);touch();return}
  if(act==='delcustom'){S.custom=S.custom.filter(c=>c.id!==id);delete S.sel[id];open.delete(id);touch()}
});
$('reg').addEventListener('input',e=>{const el=e.target;if(!el.dataset.ed)return;const id=el.closest('.risk').dataset.id;S.sel[id][el.dataset.ed]=el.value;notEx();persist()});
$('reg').addEventListener('focusout',e=>{if(e.target.dataset&&e.target.dataset.ed&&(e.target.dataset.ed==='hazard'||e.target.dataset.ed==='risk')){const li=e.target.closest('.risk');const id=li.dataset.id;const s=S.sel[id];const hz=li.querySelector('.hz');if(hz&&s){hz.firstChild.textContent=s.hazard;hz.querySelector('.rk').textContent=s.risk}}});
function touch(){notEx();renderReg();updateTB();sugInfo();persist()}
$('q').addEventListener('input',renderReg);$('view').addEventListener('change',renderReg);
$('compact').addEventListener('change',e=>{$('reg').classList.toggle('compact',e.target.checked);try{localStorage.setItem('jbl.dra.compact',e.target.checked?'1':'')}catch(x){}});
try{if(localStorage.getItem('jbl.dra.compact')){$('compact').checked=true;$('reg').classList.add('compact')}}catch(x){}
$('showSug').addEventListener('click',()=>{if(!S.types.length){msg('Pick a type of works first.','err');return}$('view').value='sug';renderReg();$('reg').scrollIntoView({behavior:'smooth',block:'start'})});

// ---------- project-specific risk ----------
$('addBtn').addEventListener('click',()=>{const f=$('addForm');if(!f.hidden){f.hidden=true;return}
  f.innerHTML=`<div class="addform"><h3 style="font-size:15px;color:var(--brand-ink)">Project-specific risk</h3>
    <div class="row2"><div class="field"><label for="c_cat">Section</label><select id="c_cat">${CATS.map(c=>`<option value="${c.id}">${c.ph} · ${esc(c.name)}</option>`).join('')}</select></div>
    <div class="field"><label for="c_hz">Activity / hazard</label><input id="c_hz" placeholder="e.g. Steel frame over garage"></div></div>
    <div class="field"><label for="c_rk">Risk(s)</label><textarea id="c_rk" rows="2"></textarea></div>
    <div class="field"><label for="c_ds">Design mitigation measures and controls</label><textarea id="c_ds" rows="2"></textarea></div>
    <div class="field"><label for="c_in">Information</label><textarea id="c_in" rows="2"></textarea></div>
    <div class="btns"><button class="btn primary" id="c_add">Add and tick</button><button class="btn" id="c_cancel">Cancel</button><span id="c_err" style="color:var(--H);font-size:13px"></span></div></div>`;
  f.hidden=false;$('c_hz').focus();
  $('c_cancel').onclick=()=>{f.hidden=true};
  $('c_add').onclick=()=>{const hz=$('c_hz').value.trim();if(!hz){$('c_err').textContent='Enter the activity or hazard.';return}
    const cat=$('c_cat').value;let n=1;while(getR(`${cat}-P${String(n).padStart(2,'0')}`))n++;
    const r={id:`${cat}-P${String(n).padStart(2,'0')}`,cat,tags:'',custom:true,hazard:hz,risk:$('c_rk').value.trim(),design:$('c_ds').value.trim()||'N/A',info:$('c_in').value.trim(),ini:'H',rev:'M'};
    S.custom.push(r);S.sel[r.id]=pick(r);open.add(r.id);f.hidden=true;touch();
    requestAnimationFrame(()=>document.querySelector(`[data-id="${r.id}"]`)?.scrollIntoView({block:'center',behavior:'smooth'}));
    msg(`Added ${r.id}. Set its ratings below.`,'ok')};
});

// ---------- files ----------
function offer(filename,data){
  try{
    const blob=data instanceof Blob?data:new Blob([data],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),4000);
    msg(`Saved ${filename} to your Downloads folder.`,'ok');
  }catch(e){msg('Couldn\'t save the file. Check your browser\'s download settings.','err')}
}
const clean=s=>String(s||'').replace(/[\\/:*?"<>|]+/g,'').replace(/\s+/g,' ').trim();
function baseName(){const p=S.project;
  if(p.docNo)return `${clean(p.docNo)}${p.rev?'-'+clean(p.rev):''} - Designers Risk Assessment`;
  return `${clean(p.job)||'Project'} - Designers Risk Assessment${p.rev?' '+clean(p.rev):''}`}
$('saveJson').addEventListener('click',()=>offer(baseName()+'.json',JSON.stringify({app:'jbl-dra',v:2,...S},null,1)));
$('openJson').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=()=>{try{const d=JSON.parse(rd.result);if(!d.project||!d.sel)throw 0;
      const lv=(l,s)=>{const r=l*s;return r>=6?'H':r>=3?'M':'L'};
      Object.values(d.sel).forEach(s=>{if(!s.ini&&s.li){s.ini=lv(s.li,s.si);s.rev=lv(s.lr,s.sr)}if(s.info==null&&s.residual!=null)s.info=s.residual});
      (d.custom||[]).forEach(c=>{if(!c.ini&&c.li){c.ini=lv(c.li,c.si);c.rev=lv(c.lr,c.sr)}if(c.info==null)c.info=c.residual||''});
      S={project:normProject(d.project),types:d.types||[],sel:d.sel,custom:d.custom||[],example:false};
      Object.keys(S.sel).forEach(id=>{if(!getR(id))delete S.sel[id]});
      open.clear();fillForm();renderReg();persist();msg(`Opened ${f.name}`,'ok')}
    catch(err){msg('That file isn\'t a risk assessment project file.','err')}
    e.target.value=''};rd.readAsText(f)});
let armed=0,armedU=0;
$('untickAll').addEventListener('click',()=>{const b=$('untickAll'),n=Object.keys(S.sel).length;
  if(!n){msg('Nothing is ticked.');return}
  if(Date.now()-armedU<4000){armedU=0;b.textContent='Untick all';S.sel={};open.clear();touch();msg(`Unticked all ${n} risks.`,'ok');return}
  armedU=Date.now();b.textContent=`Click again to untick ${n}`;setTimeout(()=>{if(Date.now()-armedU>=3900)b.textContent='Untick all'},4000)});
function newProject(){S={project:blankProject(),types:[],sel:{},custom:[],example:false};open.clear();$('q').value='';fillForm();renderReg();persist();msg('New project started. Fill in the project details and pick the type of works.','ok')}
$('newProj').addEventListener('click',()=>{const b=$('newProj');
  if(Date.now()-armed<4000){armed=0;b.textContent='New project';newProject();return}
  armed=Date.now();b.textContent='Click again to clear';setTimeout(()=>{if(Date.now()-armed>=3900)b.textContent='New project'},4000)});
$('exClear').addEventListener('click',newProject);

// ---------- PDF (portrait A4, in the house style of the structural calculation pack) ----------
// Cover: logo and teal title band, client / project / contact sidebar, issue details, contents and the
// black-and-white projects banner. Inside pages: teal top bar, logo, document title and reference, a strip
// of project details (client, prepared by, checked, rev, date, page x of y) and an address footer.
const TEAL=[91,155,171],TEAL_DK=[59,118,134],TINT=[238,245,247],RULE=[201,215,219],INK=[43,52,56],MUTED=[92,108,114],TXT=MUTED;
const RC={H:[196,82,74],M:[222,150,72],L:[88,160,108]};   // muted red / amber / green
const PX=v=>v*0.26458;                 // the calc pack is laid out in CSS px on A4 (794 px wide)
const PW=210,PH=297,PM=PX(54),PR=PW-PX(54);
function docRef(p){const no=(p.docNo||'').trim();if(no)return `${no}${p.rev&&!no.endsWith(p.rev)?'-'+p.rev:''}`;return [p.job,p.rev].filter(Boolean).join(' · ')||'-'}
function fitText(doc,t,w,fs,min){let f=fs;doc.setFontSize(f);while(doc.getTextWidth(t)>w&&f>(min||6)){f-=.25;doc.setFontSize(f)}return doc.splitTextToSize(t,w)[0]}
function drawHeader(doc,page,total){
  const p=S.project;
  doc.setFillColor(...TEAL);doc.rect(0,0,PW,PX(10),'F');
  try{doc.addImage(BRAND.logo,'PNG',PM,PX(32),PX(52),PX(45))}catch(e){}
  doc.setTextColor(...INK);doc.setFont('helvetica','bold');
  doc.text(fitText(doc,`Designer's Risk Assessment  ·  ${dash(p.job)}`,120,8.5),PR,PX(57),{align:'right'});
  doc.setFont('helvetica','normal');doc.setTextColor(...MUTED);
  doc.text(fitText(doc,`${docRef(p)}  ·  ${dash(projLines(p)[0])}`,120,8.5),PR,PX(70),{align:'right'});
  doc.setDrawColor(...TEAL);doc.setLineWidth(.35);doc.line(PM,PX(80),PR,PX(80));
  // details strip
  const cols=[['Client',dash(p.client)],['Prepared by',dash(p.engineer)],['Checked',dash(p.checkedBy)],['Rev',dash(p.rev)],['Date',p.date?fmtDate(p.date):'-'],['Page',`${page} of ${total}`]];
  const ws=[0,26.5,26.5,19.4,26.5,24.7];ws[0]=(PR-PM)-ws.slice(1).reduce((a,b)=>a+b,0);
  let x=PM;const yb=PX(96);
  cols.forEach(([k,v],i)=>{doc.setFont('helvetica','bold');doc.setFontSize(5.8);doc.setTextColor(...TEAL_DK);
    const lab=k.toUpperCase();doc.text(lab,x,yb,{charSpace:.25});const lw=doc.getTextWidth(lab)+lab.length*.25+1.6;
    doc.setFont('helvetica','normal');doc.setTextColor(...INK);doc.text(fitText(doc,v,ws[i]-lw-1.5,7.5,5.5),x+lw,yb);x+=ws[i]});
  doc.setDrawColor(...RULE);doc.setLineWidth(.2);doc.line(PM,PX(102),PR,PX(102));
  drawFooter(doc);
}
function drawFooter(doc){
  const addr=String(firm.address||'').split('\n').map(s=>s.trim()).filter(Boolean).join(', ');
  doc.setDrawColor(...RULE);doc.setLineWidth(.2);doc.line(PM,PH-PX(42),PR,PH-PX(42));
  doc.setFontSize(6.6);doc.setTextColor(...MUTED);doc.setFont('helvetica','bold');doc.text(firm.name,PM,PH-PX(30));
  const w=doc.getTextWidth(firm.name+'  ');doc.setFont('helvetica','normal');
  doc.text(fitText(doc,'·  '+addr,110,6.6),PM+w,PH-PX(30));
  doc.text(`${firm.tel}  ·  ${String(firm.web||'').replace(/^https?:\/\//,'')}`,PR,PH-PX(30),{align:'right'});
}
function drawCover(doc,toc){
  const p=S.project;
  try{doc.addImage(BRAND.coverHeader,'PNG',PM,PX(74),PX(686),PX(120))}catch(e){}
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');
  doc.setFontSize(21);doc.text("Designer's Risk Assessment",PR-PX(26),PX(74)+12.6,{align:'right'});
  doc.setFontSize(9.5);doc.text(fitText(doc,docRef(p),140,9.5),PR-PX(26),PX(74)+19.2,{align:'right'});
  doc.setFontSize(8.5);doc.text(`Issued  ${p.date?fmtDate(p.date):'-'}`,PR-PX(26),PX(74)+24.4,{align:'right'});
  const top=PX(74+120+60),SW=PX(168),MX=PM+SW+PX(34),MW=PR-MX;
  const head=(t,x,y,w)=>{doc.setFont('helvetica','bold');doc.setFontSize(10.5);doc.setTextColor(...INK);doc.text(t,x,y);
    doc.setDrawColor(...TEAL);doc.setLineWidth(.35);doc.line(x,y+2.2,x+w,y+2.2);return y+7};
  // sidebar
  let y=head('Client',PM,top,SW);doc.setFontSize(8.3);doc.setTextColor(...INK);
  doc.setFont('helvetica','bold');doc.splitTextToSize(dash(p.client),SW).slice(0,3).forEach(l=>{doc.text(l,PM,y);y+=4});
  y=head('Project',PM,y+5,SW);doc.setFont('helvetica','normal');
  (projLines(p).length?projLines(p):['-']).forEach((l,k)=>{doc.setFont('helvetica',k?'normal':'bold');doc.splitTextToSize(l,SW).slice(0,2).forEach(t=>{doc.text(t,PM,y);y+=4})});
  y=head('Contact',PM,y+5,SW);doc.setFont('helvetica','normal');
  [[BRAND.icPhone,firm.tel],[BRAND.icMail,firm.email],[BRAND.icWeb,String(firm.web||'').replace(/^https?:\/\//,'')]].forEach(([ic,t])=>{
    try{doc.addImage(ic,'PNG',PM,y-3.2,4.2,4.2)}catch(e){}doc.text(fitText(doc,t,SW-7,8.3),PM+7,y);y+=6.2});
  // main column: issue details
  y=head('Issue details',MX,top,MW);
  const tw=(MW-2*PX(10))/3,th=15.5;
  [['Job no.',dash(p.job),13],['Revision',dash(p.rev),13],['Issue date',p.date?fmtDate(p.date):'-',11]].forEach(([k,v,fs],i)=>{
    const x=MX+i*(tw+PX(10));if(i===0){doc.setFillColor(...TINT);doc.rect(x,y,tw,th,'F')}
    doc.setDrawColor(...TEAL);doc.setLineWidth(.3);doc.rect(x,y,tw,th);
    doc.setFont('helvetica','bold');doc.setFontSize(5.8);doc.setTextColor(...TEAL_DK);doc.text(k.toUpperCase(),x+PX(12),y+5,{charSpace:.3});
    doc.setFontSize(fs);doc.setTextColor(...INK);doc.text(fitText(doc,v,tw-PX(24),fs,7),x+PX(12),y+11.6)});
  y+=th+7;
  const half=(MW-PX(10))/2;
  [['Prepared by',p.engineer],['Checked by',p.checkedBy]].forEach(([k,v],i)=>{const x=MX+i*(half+PX(10));
    doc.setFont('helvetica','bold');doc.setFontSize(5.8);doc.setTextColor(...TEAL_DK);doc.text(k.toUpperCase(),x,y,{charSpace:.3});
    doc.setFontSize(8.3);doc.setTextColor(...INK);doc.text(dash(v),x,y+4.6);
    doc.setDrawColor(...RULE);doc.setLineWidth(.2);doc.line(x,y+7,x+half,y+7)});
  y+=17;
  // contents
  y=head('Inside this document',MX,y,MW);
  toc.forEach((e,k)=>{doc.setFont('helvetica','bold');doc.setFontSize(8.3);doc.setTextColor(...TEAL_DK);doc.text(String(k+1).padStart(2,'0'),MX,y);
    doc.setFont('helvetica','normal');doc.setTextColor(...INK);doc.text(e.t,MX+8,y);doc.text(String(e.page),PR,y,{align:'right'});
    doc.setDrawColor(...RULE);doc.setLineWidth(.15);doc.line(MX+8,y+1.8,PR,y+1.8);y+=6.4});
  // banner + address
  try{doc.addImage(BRAND.banner,'PNG',PX(30),PX(886),PX(734),PX(118))}catch(e){}
  doc.setFontSize(6.6);doc.setTextColor(...MUTED);let ay=PH-PX(52)-12;
  doc.setFont('helvetica','bold');doc.text(firm.name,PR,ay,{align:'right'});doc.setFont('helvetica','normal');
  String(firm.address||'').split('\n').filter(Boolean).forEach(l=>{ay+=3;doc.text(l.trim(),PR,ay,{align:'right'})});
  ay+=3;doc.text(`Registered in England: Number ${firm.reg}`,PR,ay,{align:'right'});
}
function buildPdf(){
  const {jsPDF}=window.jspdf;const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const M=PM,W=PW,p=S.project,firmName=firm.name,TOP=PX(150),BOT=PH-PX(58);
  const toc=[];doc.addPage();let y=TOP;   // page 1 is the cover, drawn last once page numbers are known
  const pg=()=>doc.getCurrentPageInfo().pageNumber;
  const para=(t,opt={})=>{doc.setFont('helvetica',opt.style||'normal');doc.setFontSize(opt.size||8.6);doc.setTextColor(...(opt.color||INK));
    const ind=opt.indent||0,lines=doc.splitTextToSize(t,PR-M-ind);
    if(y+lines.length*3.9>BOT){doc.addPage();y=TOP}
    doc.text(lines,M+ind,y,{lineHeightFactor:1.3});y+=lines.length*(opt.size||8.6)*.3528*1.3+(opt.after??2.6)};
  const section=(t,first,fresh)=>{if(fresh&&y>TOP){doc.addPage();y=TOP}else if(!first)y+=6;if(y+14>BOT){doc.addPage();y=TOP}
    toc.push({t,page:pg()});const n=String(toc.length).padStart(2,'0');
    doc.setFont('helvetica','bold');doc.setFontSize(12.5);doc.setTextColor(...TEAL_DK);doc.text(n,M,y);
    doc.setTextColor(...INK);doc.text(t,M+9,y);doc.setDrawColor(...TEAL);doc.setLineWidth(.3);doc.line(M,y+2.4,PR,y+2.4);y+=9};

  section('Health & safety – CDM 2015 Regulation 9',true);
  para('The aim of this section is to enable collation of Designer Risk Assessments from the Designers in the same format so that the Design Risk Management Register can be prepared and managed throughout the project by the Principal Designer.');
  para('All Designers are required to provide Design Risk Information with their designs in compliance with CDM Regulation 9(2)-9(4) which requires application of the General Principles of Prevention and consideration of The Workplace (Health, Safety and Welfare) Regulations 1992 (Regulation 9):');
  const it={style:'italic',indent:4,after:1.2,color:MUTED};
  para('(2)  When preparing or modifying a design the designer must take into account the general principles of prevention and any pre-construction information to eliminate, so far as is reasonably practicable, foreseeable risks to the health or safety of any person:',it);
  para('(a)  carrying out or liable to be affected by construction work',{...it,indent:8,after:.4});
  para('(b)  maintaining or cleaning a structure or',{...it,indent:8,after:.4});
  para('(c)  using a structure designed as a workplace',{...it,indent:8,after:2});
  para('(3)  If it is not possible to eliminate these risks, the designer must, so far as is reasonably practicable:',it);
  para('(a)  take steps to reduce or, if that is not possible, control the risks through the subsequent design process',{...it,indent:8,after:.4});
  para('(b)  provide information about those risks to the principal designer and',{...it,indent:8,after:.4});
  para('(c)  ensure appropriate information is included in the health and safety file',{...it,indent:8,after:2});
  para('(4)  A designer must take all reasonable steps to provide, with the design, sufficient information about the design, construction or maintenance of the structure, to adequately assist the client, other designers and contractors to comply with their duties under these Regulations.',{...it,after:2.6});
  para('Further guidance is available within L153 Managing health and safety in construction, pages 26-30 (paragraphs 72-93).');
  para('The general principles of prevention are set out in full in Appendix 1 of L153, but in summary they are to: (a) avoid risks where possible; (b) evaluate those risks that cannot be avoided; and (c) put in place proportionate measures that control them at source.');
  const notes=[];
  if(p.notPD!==false)notes.push(`All parties are assumed to be aware of their responsibilities under the Construction (Design and Management) Regulations 2015. ${firmName} have not been instructed, nor will be acting, as the Principal Designer.`);
  notes.push('For domestic clients, the client duties under CDM 2015 pass to the contractor, or to the principal contractor where there is more than one contractor, unless there is a written agreement for the Principal Designer to carry them out.');
  notes.push('Temporary works are the sole responsibility of the Contractor, and the Contractor should consult a suitably qualified temporary works Engineer if required.');
  notes.push('Risk ratings: H = High, M = Medium, L = Low. The initial rating is before design mitigation; the revised rating is the residual risk after the design measures and information given.');
  notes.forEach(n=>para(n));
  if(p.desc||p.pd||p.pc||p.notes){
    section('Scope of works');
    if(p.desc)para(p.desc);
    if(p.pd||p.pc)para(`Principal Designer: ${dash(p.pd)}.   Principal / main contractor: ${dash(p.pc)}.`);
    if(p.notes)para(p.notes);
  }
  section('Risk register',false,true);
  const rows=[];
  const rc=v=>({content:v,styles:{fillColor:RC[v],textColor:255,fontStyle:'bold',halign:'center',valign:'middle',fontSize:9}});
  CATS.forEach(c=>{
    const items=allRisks().filter(r=>r.cat===c.id&&S.sel[r.id]);if(!items.length)return;
    rows.push([{content:c.name,colSpan:7,styles:{fontStyle:'bold',fontSize:8.2,fillColor:TINT,textColor:TEAL_DK,halign:'left',cellPadding:{top:1.8,bottom:1.8,left:2,right:2}}}]);
    items.forEach(r=>{const s=S.sel[r.id];
      rows.push([{content:r.id,styles:{halign:'center',valign:'middle',fontSize:7,fontStyle:'bold'}},s.hazard,s.risk,rc(s.ini),s.design||'N/A',s.info,rc(s.rev)])});
  });
  doc.autoTable({startY:y,margin:{left:M,right:PW-PR,top:TOP-4,bottom:PH-BOT+2},theme:'grid',
    styles:{font:'helvetica',fontSize:7.6,cellPadding:1.4,lineColor:RULE,lineWidth:.2,textColor:INK,valign:'middle',overflow:'linebreak'},
    headStyles:{fillColor:[255,255,255],textColor:TEAL_DK,fontStyle:'bold',halign:'center',valign:'middle',fontSize:6.8,lineColor:RULE},
    head:[['REF','ACTIVITY / HAZARD','RISK(S)','INITIAL RISK RATING','DESIGN MITIGATION MEASURES AND CONTROLS (ELIMINATE, REDUCE, INFORMATION, AND CONTROL)','INFORMATION','REVISED RISK RATING']],
    columnStyles:{0:{cellWidth:15},1:{cellWidth:28},2:{cellWidth:28},3:{cellWidth:13},4:{cellWidth:38.5},5:{cellWidth:43.2},6:{cellWidth:13}},
    didDrawCell:d=>{if(d.section==='head'){doc.setDrawColor(...TEAL);doc.setLineWidth(.45);doc.line(d.cell.x,d.cell.y+d.cell.height,d.cell.x+d.cell.width,d.cell.y+d.cell.height)}},
    body:rows,rowPageBreak:'avoid'});
  y=doc.lastAutoTable.finalY+8;if(y>BOT-8){doc.addPage();y=TOP}
  doc.setFont('helvetica','italic');doc.setFontSize(7.6);doc.setTextColor(...MUTED);
  doc.text(doc.splitTextToSize('This assessment is to be read in conjunction with the J B Langley Associates Ltd structural calculations and drawings and all relevant Architects\' drawings. Any risks identified during construction that are not covered here are to be reported to the Engineer before the work concerned proceeds.'.replace('J B Langley Associates Ltd',firmName),PR-M),M,y);
  const n=doc.getNumberOfPages();
  for(let i=2;i<=n;i++){doc.setPage(i);drawHeader(doc,i,n)}
  doc.setPage(1);drawCover(doc,toc);
  return doc;
}
$('pdfBtn').addEventListener('click',()=>{
  if(!Object.keys(S.sel).length){msg('Tick at least one risk before creating the PDF.','err');return}
  if(!projLines(S.project).length&&!S.project.job){msg('Add the project address or job number first.','err');$('p_a1').focus();return}
  if(!window.jspdf){msg('The PDF library didn\'t load. Check your connection and reload the page.','err');return}
  msg('Creating PDF…');
  let blob;try{blob=buildPdf().output('blob')}catch(e){console.error(e);msg('Something went wrong building the PDF.','err');return}
  offer(baseName()+'.pdf',blob);
});

fillForm();renderReg();
