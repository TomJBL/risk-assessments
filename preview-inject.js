(()=>{window.curIssue=p=>({rev:String(p.rev||'').trim(),date:p.date||'',desc:p.revNote||'',by:p.engineer||'',chk:p.checkedBy||'',app:p.approvedBy||''});
window.issueRows=function(p){const c=curIssue(p);return [...p.history.filter(h=>h.rev!==c.rev),c]}
window.recordIssue=function(p){const c=curIssue(p);const i=p.history.findIndex(h=>h.rev===c.rev);if(i>=0)p.history[i]=c;else p.history.push(c)}
// ---------- PDF (portrait A4, in the house style of the structural calculation pack, v3 layout) ----------
// Positions, sizes and colours are measured from "JBL Structural Calculations - New Layout v3" (mm).
// Cover: logo and teal title band, client / project / contact sidebar, issue details, status, revision
// history, contents and the black-and-white projects banner. Inside pages: teal top bar, logo, title and
// reference, a strip of project details, and an address footer. Body: Part i / Part ii headings and
// numbered sections, with tables ruled horizontally in the calc pack style.
window.PT=.3528;window.HAIR=.18;window.RULE_W=.35;window.RULE_HD=.53;
window.docRef=function(p){const no=(p.docNo||'').trim();if(no)return `${no}${p.rev&&!no.endsWith(p.rev)?'-'+p.rev:''}`;return [p.job,p.rev].filter(Boolean).join(' · ')||'-'}
window.fitText=function(doc,t,w,fs,min){let f=fs;doc.setFontSize(f);while(doc.getTextWidth(t)>w&&f>(min||6)){f-=.25;doc.setFontSize(f)}return doc.splitTextToSize(t,w)[0]}
window.capLabel=(doc,t,x,y,fs,cs)=>{doc.setFont('helvetica','bold');doc.setFontSize(fs);doc.setTextColor(...TEAL_DK);const s=t.toUpperCase();doc.text(s,x,y,{charSpace:cs});return doc.getTextWidth(s)+s.length*cs};
window.drawHeader=function(doc,page,total){
  const p=S.project;
  doc.setFillColor(...TEAL);doc.rect(0,0,PW,PX(10),'F');
  try{doc.addImage(BRAND.logo,'PNG',PM,PX(32),PX(52),PX(45))}catch(e){}
  doc.setTextColor(...INK);doc.setFont('helvetica','bold');
  doc.text(fitText(doc,`Designer's Risk Assessment  ·  ${dash(p.job)}`,120,8.5),PR,16.7,{align:'right'});
  doc.setFont('helvetica','normal');doc.setTextColor(...MUTED);
  doc.text(fitText(doc,`${docRef(p)}  ·  ${dash(projLines(p)[0])}`,120,8.5),PR,20.2,{align:'right'});
  doc.setDrawColor(...TEAL);doc.setLineWidth(RULE_W);doc.line(PM,22.5,PR,22.5);
  // details strip, columns as the calc pack (client, prepared by, checked, rev, date, page)
  const cols=[['Client',dash(p.client),72.3],['Prepared by',dash(p.engineer),98.8],['Checked',dash(p.checkedBy),125.2],['Rev',dash(p.rev),144.5],['Date',p.date?fmtDate(p.date):'-',171],['Page',`${page} of ${total}`,PR]];
  let x=PM;
  cols.forEach(([k,v,nx],i)=>{const lw=capLabel(doc,k,x,26.8,6.5,.3)+1.8;
    const last=i===cols.length-1;doc.setFont('helvetica',last?'normal':'bold');doc.setTextColor(...(last?INK:TEAL_DK));
    doc.text(fitText(doc,v,nx-x-lw-1.5,7.5,5.5),x+lw,26.8);x=nx});
  doc.setDrawColor(...RULE);doc.setLineWidth(HAIR);doc.line(PM,28.3,PR,28.3);
  drawFooter(doc);
}
window.drawFooter=function(doc){
  const addr=String(firm.address||'').split('\n').map(s=>s.trim()).filter(Boolean).join(', ');
  doc.setDrawColor(...RULE);doc.setLineWidth(HAIR);doc.line(PM,285.1,PR,285.1);
  doc.setFontSize(7);doc.setTextColor(...MUTED);doc.setFont('helvetica','bold');doc.text(firm.name,PM,290.1);
  const w=doc.getTextWidth(firm.name+'  ');doc.setFont('helvetica','normal');
  doc.text(fitText(doc,'·  '+addr,112,7),PM+w,290.1);
  doc.text(`${firm.tel}  ·  ${String(firm.web||'').replace(/^https?:\/\//,'')}`,PR,290.1,{align:'right'});
}
window.drawCover=function(doc,toc){
  const p=S.project,BX=PM+PX(686)-PX(26);
  // title band
  try{doc.addImage(BRAND.coverHeader,'PNG',PM,PX(74),PX(686),PX(120))}catch(e){}
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');
  doc.text(fitText(doc,"Designer's Risk Assessment",126,25,18),BX,33.9,{align:'right'});
  doc.setFontSize(10);doc.text(fitText(doc,docRef(p),126,10,7),BX,38.8,{align:'right'});
  doc.setFontSize(9);doc.text('Issued',BX,43.3,{align:'right'});
  const SW=44.4,MX=67.8,MW=PR-MX;
  const head=(t,x,y,w)=>{doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(...INK);doc.text(t,x,y);
    doc.setDrawColor(...TEAL);doc.setLineWidth(RULE_W);doc.line(x,y+1.6,x+w,y+1.6)};
  // sidebar: client, project, contact
  let y=63.6;head('Client',PM,y,SW);y+=7.5;doc.setFontSize(9);doc.setTextColor(...INK);
  doc.setFont('helvetica','bold');doc.splitTextToSize(dash(p.client),SW).slice(0,3).forEach(l=>{doc.text(l,PM,y);y+=4.5});
  y+=6.6;head('Project',PM,y,SW);y+=7.6;doc.setFontSize(9);
  (projLines(p).length?projLines(p):['-']).forEach((l,k)=>{doc.setFont('helvetica',k?'normal':'bold');doc.splitTextToSize(l,SW).slice(0,2).forEach(t=>{doc.text(t,PM,y);y+=4.5})});
  y+=6.7;head('Contact',PM,y,SW);y+=8.8;doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...INK);
  [[BRAND.icPhone,firm.tel],[BRAND.icMail,firm.email],[BRAND.icWeb,String(firm.web||'').replace(/^https?:\/\//,'')]].forEach(([ic,t])=>{
    try{doc.addImage(ic,'PNG',PM,y-3.4,4.2,4.2)}catch(e){}doc.text(fitText(doc,t,SW-7,9),PM+6.9,y);y+=7.15});
  // issue details
  head('Issue details',MX,63.6,MW);
  const gap=2.5,tw=(MW-2*gap)/3,ty=68.6,th=15.1;
  [['Job no.',dash(p.job)],['Revision',dash(p.rev)],['Issue date',p.date?fmtDate(p.date):'']].forEach(([k,v],i)=>{
    const x=MX+i*(tw+gap);if(i===0){doc.setFillColor(...TINT);doc.rect(x,ty,tw,th,'F')}
    doc.setDrawColor(...TEAL);doc.setLineWidth(RULE_W);doc.rect(x,ty,tw,th);
    capLabel(doc,k,x+3.3,ty+6,7,.45);
    doc.setFont('helvetica','bold');doc.setTextColor(...INK);doc.text(fitText(doc,v,tw-6.6,13,8),x+3.3,ty+12.1)});
  // status
  doc.setFontSize(8.5);doc.setTextColor(...MUTED);doc.setFont('helvetica','normal');doc.text('Status:',MX,89.6);
  doc.setFont('helvetica','bold');doc.text(fitText(doc,String(p.status||'').trim()||'-',MW-11,8.5,6.5),MX+11,89.6);
  // prepared by / checked by
  [['Prepared by',p.engineer,MX],['Checked by',p.checkedBy,130.4]].forEach(([k,v,x])=>{capLabel(doc,k,x,96.1,7,.45);
    doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...INK);doc.text(fitText(doc,dash(v),60,9,7),x,100.3)});
  doc.setDrawColor(...RULE);doc.setLineWidth(HAIR);doc.line(MX,102.5,PR,102.5);
  // revision history
  head('Revision history',MX,111.3,MW);
  const RX=[68.8,79.4,101.5,154.5,168.6,182.7];
  ['Rev','Date','Description','By',"Chk'd","App'd"].forEach((t,i)=>capLabel(doc,t,RX[i],117.8,7.5,.4));
  doc.setDrawColor(...TEAL);doc.setLineWidth(RULE_HD);doc.line(MX,119.4,PR,119.4);
  let ry=119.4;doc.setFont('helvetica','normal');doc.setFontSize(9);
  const rows=issueRows(p).slice(-6);while(rows.length<3)rows.push(null);
  rows.forEach(r=>{
    const desc=r?doc.splitTextToSize(String(r.desc||'').trim()||'-',51).slice(0,3):[];const n=Math.max(1,desc.length);
    const h=r?n*3.9+2.1:5.9;
    if(r){doc.setTextColor(...INK);const b=ry+(h-(n-1)*3.9)/2+1.8;
      [r.rev,r.date?fmtDate(r.date):'-',null,r.by,r.chk,r.app].forEach((v,i)=>{if(i===2)return;doc.text(fitText(doc,dash(v),(RX[i+1]||PR)-RX[i]-1.5,9,6.5),RX[i],ry+h/2+1.75)});
      doc.text(desc,RX[2],b,{lineHeightFactor:3.9/(9*PT)})}
    ry+=h;doc.setDrawColor(...RULE);doc.setLineWidth(HAIR);doc.line(MX,ry,PR,ry)});
  // contents
  let cy=ry+8.8;head('Inside this document',MX,cy,MW);cy+=5.9;
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...INK);
  toc.forEach(e=>{if(e.part){doc.text(e.t,MX,cy)}else{doc.text(e.n,MX+3.1,cy);doc.text(e.t,MX+9.3,cy)}cy+=4.85});
  // banner + address
  try{doc.addImage(BRAND.banner,'PNG',PX(30),PX(886),PX(734),PX(118))}catch(e){}
  const al=[...String(firm.address||'').split('\n').map(s=>s.trim()).filter(Boolean),`Registered in England: Number ${firm.reg}`];
  let ay=286.5-al.length*3.07;doc.setFontSize(7.5);doc.setTextColor(...MUTED);
  doc.setFont('helvetica','bold');doc.text(firm.name,PR,ay,{align:'right'});doc.setFont('helvetica','normal');
  al.forEach(l=>{ay+=3.07;doc.text(l,PR,ay,{align:'right'})});
}
window.buildPdf=function(){
  const {jsPDF}=window.jspdf;const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const M=PM,p=S.project,firmName=firm.name,TOP=45.4,BOT=279,LH=4.2;
  const toc=[];doc.addPage();let y=TOP;   // page 1 is the cover, drawn last once the contents are known
  const newPage=()=>{doc.addPage();y=TOP};
  const para=(t,opt={})=>{const fs=opt.size||9,ind=opt.indent||0,lh=opt.lh||LH;
    doc.setFont('helvetica',opt.style||'normal');doc.setFontSize(fs);doc.setTextColor(...(opt.color||INK));
    const lines=doc.splitTextToSize(t,PR-M-ind);if(y+(lines.length-1)*lh>BOT)newPage();
    doc.text(lines,M+ind,y,{lineHeightFactor:lh/(fs*PT)});y+=lines.length*lh+(opt.after??1.8)};
  const item=(num,t)=>{doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...INK);
    const lines=doc.splitTextToSize(t,PR-M-7);if(y+(lines.length-1)*LH>BOT)newPage();
    doc.text(num,M,y);doc.text(lines,M+7,y,{lineHeightFactor:LH/(9*PT)});y+=lines.length*LH+1.8};
  const part=(t)=>{if(y>TOP)newPage();toc.push({t,part:true});
    doc.setFont('helvetica','bold');doc.setFontSize(17);doc.setTextColor(...TEAL_DK);doc.text(t,M,y+1.2);
    doc.setDrawColor(...TEAL);doc.setLineWidth(.8);doc.line(M,y+3.7,PR,y+3.7);y+=19.7};
  const section=(t)=>{if(y>TOP+20)y+=10.3;if(y+16>BOT)newPage();
    const n=String(toc.filter(e=>!e.part).length+1).padStart(2,'0');toc.push({n,t});
    doc.setFont('helvetica','bold');doc.setFontSize(14);doc.setTextColor(...TEAL_DK);doc.text(n,M,y);
    doc.setTextColor(...INK);doc.text(t,M+9.7,y);doc.setDrawColor(...TEAL);doc.setLineWidth(RULE_W);doc.line(M,y+1.5,PR,y+1.5);y+=8.9};
  const sub=(t)=>{y+=3.4;if(y+10>BOT)newPage();doc.setFont('helvetica','bold');doc.setFontSize(10.5);doc.setTextColor(...INK);doc.text(t,M,y);y+=5.4};
  const ruleRows=(d,headRule)=>{if(d.section==='head'&&headRule){doc.setDrawColor(...TEAL);doc.setLineWidth(RULE_HD);doc.line(d.cell.x,d.cell.y+d.cell.height,d.cell.x+d.cell.width,d.cell.y+d.cell.height)}
    if(d.section==='body'){doc.setDrawColor(...RULE);doc.setLineWidth(HAIR);doc.line(d.cell.x,d.cell.y+d.cell.height,d.cell.x+d.cell.width,d.cell.y+d.cell.height)}};

  part('Part i – General information');
  section('Health & safety – CDM 2015 Regulation 9');
  para('The aim of this section is to enable collation of Designer Risk Assessments from the Designers in the same format so that the Design Risk Management Register can be prepared and managed throughout the project by the Principal Designer.');
  para('All Designers are required to provide Design Risk Information with their designs in compliance with CDM Regulation 9(2)-9(4) which requires application of the General Principles of Prevention and consideration of The Workplace (Health, Safety and Welfare) Regulations 1992 (Regulation 9):');
  const it={style:'italic',size:8.5,lh:3.9,indent:4,after:1.2,color:MUTED};
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
  sub('Notes');notes.forEach((n,i)=>item(`${i+1}.`,n));
  if(p.desc||p.pd||p.pc||p.notes){
    section('Scope of works');
    if(p.desc){sub('Description of the works');para(p.desc)}
    if(p.pd||p.pc){sub('Project team');
      doc.autoTable({startY:y-3.2,margin:{left:M,right:PW-PR,top:TOP-4,bottom:PH-BOT+2},theme:'plain',
        styles:{font:'helvetica',fontSize:9,cellPadding:{top:1.6,bottom:1.6,left:1.1,right:1.1},textColor:INK,valign:'middle'},
        columnStyles:{0:{cellWidth:54,fontStyle:'bold'}},body:[['Principal Designer',dash(p.pd)],['Principal / main contractor',dash(p.pc)]],
        didDrawCell:d=>ruleRows(d,false)});
      y=doc.lastAutoTable.finalY+LH+1.8}
    if(p.notes){sub('Project notes');para(p.notes)}
  }
  part('Part ii – Risk register');
  section('Risk register');
  const rows=[];
  const rc=v=>({content:v,styles:{fillColor:RC[v],textColor:255,fontStyle:'bold',halign:'center',valign:'middle',fontSize:9}});
  CATS.forEach(c=>{
    const items=allRisks().filter(r=>r.cat===c.id&&S.sel[r.id]);if(!items.length)return;
    rows.push([{content:c.name,colSpan:7,styles:{fontStyle:'bold',fontSize:8.2,fillColor:TINT,textColor:TEAL_DK,halign:'left',cellPadding:{top:1.8,bottom:1.8,left:1.6,right:1.6}}}]);
    items.forEach(r=>{const s=S.sel[r.id];
      rows.push([{content:r.id,styles:{halign:'center',valign:'middle',fontSize:7,fontStyle:'bold'}},s.hazard,s.risk,rc(s.ini),s.design||'N/A',s.info,rc(s.rev)])});
  });
  doc.autoTable({startY:y-3.2,margin:{left:M,right:PW-PR,top:TOP-4,bottom:PH-BOT+2},theme:'plain',
    styles:{font:'helvetica',fontSize:7.8,cellPadding:{top:1.6,bottom:1.6,left:1.1,right:1.1},textColor:INK,valign:'middle',overflow:'linebreak'},
    headStyles:{textColor:TEAL_DK,fontStyle:'bold',halign:'center',valign:'bottom',fontSize:6.8},
    head:[['REF','ACTIVITY / HAZARD','RISK(S)','INITIAL RISK RATING','DESIGN MITIGATION MEASURES AND CONTROLS (ELIMINATE, REDUCE, INFORMATION, AND CONTROL)','INFORMATION','REVISED RISK RATING']],
    columnStyles:{0:{cellWidth:15},1:{cellWidth:28},2:{cellWidth:28},3:{cellWidth:13},4:{cellWidth:39.5},5:{cellWidth:44.9},6:{cellWidth:13}},
    didDrawCell:d=>ruleRows(d,true),body:rows,rowPageBreak:'avoid'});
  y=doc.lastAutoTable.finalY+7;if(y>BOT-8)newPage();
  doc.setFont('helvetica','italic');doc.setFontSize(8);doc.setTextColor(...MUTED);
  doc.text(doc.splitTextToSize('This assessment is to be read in conjunction with the J B Langley Associates Ltd structural calculations and drawings and all relevant Architects\' drawings. Any risks identified during construction that are not covered here are to be reported to the Engineer before the work concerned proceeds.'.replace('J B Langley Associates Ltd',firmName),PR-M),M,y,{lineHeightFactor:3.6/(8*PT)});
  const n=doc.getNumberOfPages();
  for(let i=2;i<=n;i++){doc.setPage(i);drawHeader(doc,i,n)}
  doc.setPage(1);drawCover(doc,toc);
  return doc;
}

})();Object.assign(S.project,{status:'For information – to be read with the structural calculations',approvedBy:'BJJ',history:[{rev:'D01',date:'2026-11-02',desc:'First issue for construction information',by:'TEC',chk:'BJJ',app:'BJJ'}],rev:'D02',revNote:'Revised following Building Control comments'});window.__injected=1;