const PLAYER=/^#jugar-[A-Z]{4}$/.test(location.hash);
if(PLAYER) document.body.classList.add("player");
/* ===================== ESTADO ===================== */
const KEY="calabazaOS.v1";
const fresh=()=>({
  teams:["Los Vampiros","Las Brujas","Los Zombis","Los Fantasmas"],
  sound:true,
  g1:{game:0,round:[0,0,0],pair:[[0,1],[2,3],[0,2]],rev:[[],[],[]],strikes:[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
      award:[[null,null,null,null,null],[null,null,null,null,null],[null,null,null,null,null]],ctl:[null,null,null]},
  g2:{i:0,phase:"intro",ans:{},scores:[0,0,0,0],hits:[0,0,0,0],deadline:0,remain:TRIVIA_SECS,last:{}},
  g3:{i:0,votes:{},shown:false,scores:[0,0,0,0],log:{}},
  g4:{i:0,shown:false,hits:{},log:{}}
});
let S;
try{ S=Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||"{}")); }catch(e){ S=fresh(); }
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
const TC=i=>`var(--t${i})`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const $=(sel,root=document)=>root.querySelector(sel);

/* ===================== SONIDO ===================== */
let AC=null;
function tone(seq){
  if(!S.sound) return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    let t=AC.currentTime;
    seq.forEach(([f,d,type="square",v=.08])=>{
      const o=AC.createOscillator(),g=AC.createGain();
      o.type=type;o.frequency.value=f;g.gain.value=v;
      o.connect(g);g.connect(AC.destination);o.start(t);
      g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
      o.stop(t+d);t+=d*.9;
    });
  }catch(e){}
}
const SFX={
  ding:()=>tone([[880,.12],[1320,.22]]),
  buzz:()=>tone([[110,.5,"sawtooth",.12]]),
  tick:()=>tone([[1200,.04,"square",.03]]),
  win:()=>tone([[523,.12],[659,.12],[784,.12],[1046,.35]]),
  open:()=>tone([[300,.05],[600,.07]]),
  close:()=>tone([[600,.05],[300,.07]])
};

/* ===================== ARTE DIBUJADO ===================== */
const INK="#1E1416",RED="#C8102E",CREAM="#FBF3E4",GOLD="#D9A441",MOSS="#4E8B4A";
const ART={
 pumpkin:`<svg viewBox="0 0 120 120"><path d="M60 26c-4-10 2-16 9-18" fill="none" stroke="${MOSS}" stroke-width="5" stroke-linecap="round"/>
  <path d="M60 30c-30-6-48 14-48 40s20 38 48 38 48-12 48-38-18-46-48-40z" fill="#F07A2B" stroke="${INK}" stroke-width="4"/>
  <path d="M60 30c-10 10-12 62 0 78M60 30c10 10 12 62 0 78" fill="none" stroke="${INK}" stroke-width="3" opacity=".5"/>
  <path d="M36 58l10 8M46 58l-10 8M74 58l10 8M84 58l-10 8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M44 82q16 12 32 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="34" cy="76" r="5" fill="${RED}" opacity=".5"/><circle cx="86" cy="76" r="5" fill="${RED}" opacity=".5"/></svg>`,
 skull:`<svg viewBox="0 0 120 120"><path d="M60 14C32 14 18 34 20 58c1 14 10 22 16 26v14c0 6 6 8 10 8h28c4 0 10-2 10-8V84c6-4 15-12 16-26 2-24-12-44-40-44z" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>
  <ellipse cx="44" cy="58" rx="12" ry="14" fill="${INK}"/><ellipse cx="76" cy="58" rx="12" ry="14" fill="${INK}"/>
  <circle cx="48" cy="54" r="4" fill="${CREAM}"/><circle cx="80" cy="54" r="4" fill="${CREAM}"/>
  <path d="M56 76l4-7 4 7z" fill="${INK}"/><path d="M48 96v10M60 96v10M72 96v10" stroke="${INK}" stroke-width="3"/>
  <path d="M60 14v12M54 20h12" stroke="${RED}" stroke-width="4" stroke-linecap="round"/></svg>`,
 croc:`<svg viewBox="0 0 120 120"><path d="M14 70c0-16 14-26 34-26h44c10 0 16 6 16 14v8c0 6-4 10-10 10H30c-10 0-16-2-16-6z" fill="${MOSS}" stroke="${INK}" stroke-width="4"/>
  <path d="M30 76h68c6 0 10 4 10 10v2c0 6-4 8-10 8H40c-14 0-26-6-26-14" fill="#6FAE63" stroke="${INK}" stroke-width="4"/>
  <path d="M40 76l4 7 4-7 4 7 4-7 4 7 4-7 4 7 4-7 4 7 4-7" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
  <circle cx="44" cy="40" r="11" fill="${MOSS}" stroke="${INK}" stroke-width="4"/><circle cx="44" cy="41" r="6" fill="${CREAM}" stroke="${INK}" stroke-width="2"/><circle cx="45" cy="42" r="3" fill="${INK}"/>
  <path d="M60 22l6 10M72 18l-2 12M84 24l-6 8" stroke="${RED}" stroke-width="4" stroke-linecap="round"/></svg>`,
 eye:`<svg viewBox="0 0 120 120"><rect x="16" y="30" width="88" height="66" rx="8" fill="${INK}"/>
  ${[0,1,2,3,4,5,6].map(i=>`<rect x="${22+i*12}" y="35" width="6" height="7" rx="1" fill="${CREAM}"/><rect x="${22+i*12}" y="84" width="6" height="7" rx="1" fill="${CREAM}"/>`).join("")}
  <path d="M28 63q32-26 64 0q-32 26-64 0z" fill="${CREAM}" stroke="${CREAM}" stroke-width="2"/>
  <circle cx="60" cy="63" r="11" fill="${RED}"/><circle cx="60" cy="63" r="5" fill="${INK}"/><circle cx="63" cy="60" r="2" fill="${CREAM}"/>
  <path d="M12 24l14 8M108 24l-14 8" stroke="${RED}" stroke-width="4" stroke-linecap="round"/></svg>`
};
function drawRitual(){
  const svg=$("#ritual"); let o="";
  const C=500;
  o+=`<circle cx="${C}" cy="${C}" r="470" fill="none" stroke="${RED}" stroke-width="7" opacity=".55"/>`;
  o+=`<circle cx="${C}" cy="${C}" r="440" fill="none" stroke="${INK}" stroke-width="3" opacity=".35"/>`;
  o+=`<circle cx="${C}" cy="${C}" r="300" fill="none" stroke="${RED}" stroke-width="4" opacity=".45" stroke-dasharray="14 10"/>`;
  for(let i=0;i<32;i++){ const a=i/32*Math.PI*2, r=455, x=C+Math.cos(a)*r, y=C+Math.sin(a)*r, deg=a*180/Math.PI+90;
    const g=["M-6 -8 L6 8 M6 -8 L-6 8","M0 -10 V10 M-7 -3 H7","M-7 -9 L0 9 L7 -9","M-7 0 H7 M0 -9 V0"][i%4];
    o+=`<path d="${g}" transform="translate(${x} ${y}) rotate(${deg})" stroke="${INK}" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>`; }
  const pts=[0,1,2,3].map(i=>{ const a=-Math.PI/2+i*Math.PI/2; return [C+Math.cos(a)*440,C+Math.sin(a)*440]; });
  o+=`<path d="M${pts.map(p=>p.join(" ")).join(" L")} Z" fill="none" stroke="${RED}" stroke-width="3" opacity=".35"/>`;
  o+=`<path d="M${pts[0].join(" ")} L${pts[2].join(" ")} M${pts[1].join(" ")} L${pts[3].join(" ")}" stroke="${INK}" stroke-width="2" opacity=".18"/>`;
  pts.concat([0,1,2,3].map(i=>{ const a=-Math.PI/4+i*Math.PI/2; return [C+Math.cos(a)*470,C+Math.sin(a)*470]; })).forEach(([x,y],k)=>{
    const h=k<4?54:40;
    o+=`<g transform="translate(${x} ${y})"><rect x="-13" y="${-h/2}" width="26" height="${h}" rx="4" fill="${CREAM}" stroke="${INK}" stroke-width="3.5"/>
      <path d="M0 ${-h/2-30}c-11 12-11 22 0 26 11-4 11-14 0-26z" fill="${GOLD}" stroke="${INK}" stroke-width="3"/>
      <path d="M0 ${-h/2-14}c-4 4-4 8 0 10 4-2 4-6 0-10z" fill="${RED}"/></g>`; });
  o+=`<g opacity=".5"><path d="M380 500q120-90 240 0q-120 90-240 0z" fill="none" stroke="${INK}" stroke-width="5"/><circle cx="500" cy="500" r="34" fill="${RED}" opacity=".7"/><circle cx="500" cy="500" r="14" fill="${INK}"/></g>`;
  svg.innerHTML=o;
}
function drawBoot(){
  const svg=$("#bootArt");
  svg.innerHTML=`<circle class="draw" pathLength="1" cx="100" cy="100" r="88" fill="none" stroke="${RED}" stroke-width="5"/>
   <circle class="draw d2" pathLength="1" cx="100" cy="100" r="70" fill="none" stroke="${INK}" stroke-width="3"/>
   <path class="draw d3" pathLength="1" d="M100 12 L188 100 L100 188 L12 100 Z" fill="none" stroke="${RED}" stroke-width="3"/>
   <path class="draw d3" pathLength="1" d="M62 100q38-30 76 0q-38 30-76 0z" fill="none" stroke="${INK}" stroke-width="4"/>
   ${[[100,12],[188,100],[100,188],[12,100]].map(([x,y],i)=>`<path class="flame" style="animation-delay:${1.6+i*.2}s" d="M${x} ${y-24}c-8 9-8 16 0 19 8-3 8-10 0-19z" fill="${GOLD}" stroke="${INK}" stroke-width="2.5"/>`).join("")}
   <circle class="flame" style="animation-delay:2.4s" cx="100" cy="100" r="10" fill="${RED}"/>`;
  $("#logoArt").innerHTML=`<circle cx="20" cy="20" r="17" fill="none" stroke="${RED}" stroke-width="3"/><path d="M8 20q12-10 24 0q-12 10-24 0z" fill="${CREAM}" stroke="${INK}" stroke-width="2.5"/><circle cx="20" cy="20" r="4" fill="${RED}"/>`;
}

/* ===================== ESCRITORIO ===================== */
const APPS=[
  {id:"g1",num:"I",name:"100 Monstruos Dijeron",art:"pumpkin",title:"100 Monstruos Dijeron",w:.94,h:.9},
  {id:"g2",num:"II",name:"Trivia del Terror",art:"skull",title:"Trivia del Terror Mexicano",w:.94,h:.9},
  {id:"g3",num:"III",name:"Florida o Tamaulipas",art:"croc",title:"Florida o Tamaulipas",w:.94,h:.9},
  {id:"g4",num:"IV",name:"Adivina la Película",art:"eye",title:"Adivina la Película",w:.94,h:.9}
];
const iconsEl=$("#icons");
APPS.forEach(app=>{
  const b=document.createElement("button");
  b.className="card";b.setAttribute("aria-label","Abrir "+app.title);
  b.innerHTML=`<span class="frame"><span class="num">${app.num}</span><span class="art" aria-hidden="true">${ART[app.art]}</span><span class="name">${esc(app.name)}</span></span>`;
  b.addEventListener("click",()=>openApp(app.id));
  iconsEl.appendChild(b);
});

drawRitual(); drawBoot();

function tickClock(){ const d=new Date(); $("#clock").textContent=d.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"}); }
tickClock(); setInterval(tickClock,15000);

$("#mFull").onclick=()=>{ try{ document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen(); }catch(e){} };
const sndBtn=$("#mSound");
const paintSnd=()=>sndBtn.textContent="Sonido: "+(S.sound?"sí":"no");
paintSnd(); sndBtn.onclick=()=>{S.sound=!S.sound;save();paintSnd();};
$("#mTeams").onclick=()=>openApp("teams");

/* ===================== VENTANAS ===================== */
let zTop=100; const WINS={};
function openApp(id){
  if(WINS[id]){ focusWin(WINS[id]); return; }
  const app=APPS.find(a=>a.id===id)||(id==="net"?{id:"net",title:"Conectar celulares",w:.8,h:.82}:{id:"teams",title:"Equipos",w:.5,h:.62});
  const w=document.createElement("section");
  w.className="win opening";w.setAttribute("role","dialog");w.setAttribute("aria-label",app.title);
  const vw=innerWidth,vh=innerHeight-54;
  const W=Math.max(340,Math.round(vw*app.w)),H=Math.max(300,Math.round(vh*app.h));
  w.style.width=W+"px";w.style.height=H+"px";
  w.style.left=Math.max(6,Math.round((vw-W)/2))+"px";w.style.top=Math.max(58,Math.round(54+(vh-H)/2))+"px";
  w.innerHTML=`<div class="tb"><button class="x" aria-label="Cerrar"></button><span class="ttl">${esc(app.title)}</span><button class="z" aria-label="Maximizar"></button></div><div class="wbody"></div><div class="wfoot"></div>`;
  document.body.appendChild(w);WINS[id]=w;focusWin(w);SFX.open();
  w.addEventListener("pointerdown",()=>focusWin(w));
  $(".x",w).onclick=()=>{ if(id==="g2") stopTimer(); if(id!=="teams"&&id!=="net") NET.idle(); w.remove();delete WINS[id];SFX.close(); };
  $(".z",w).onclick=()=>{ const full=w.dataset.full==="1";
    if(full){ Object.assign(w.style,JSON.parse(w.dataset.prev)); w.dataset.full="0"; }
    else{ w.dataset.prev=JSON.stringify({left:w.style.left,top:w.style.top,width:w.style.width,height:w.style.height});
      Object.assign(w.style,{left:"0px",top:"54px",width:innerWidth+"px",height:(innerHeight-54)+"px"}); w.dataset.full="1"; } };
  drag(w,$(".tb",w));
  setTimeout(()=>w.classList.remove("opening"),300);
  render(id);
}
function focusWin(w){ document.querySelectorAll(".win").forEach(x=>x.classList.add("inactive")); w.classList.remove("inactive"); w.style.zIndex=++zTop; }
function drag(w,h){
  let sx,sy,ox,oy,on=false;
  h.addEventListener("pointerdown",e=>{ if(e.target.closest("button")) return; on=true;sx=e.clientX;sy=e.clientY;ox=w.offsetLeft;oy=w.offsetTop;h.setPointerCapture(e.pointerId); });
  h.addEventListener("pointermove",e=>{ if(!on) return; w.style.left=(ox+e.clientX-sx)+"px"; w.style.top=Math.max(54,oy+e.clientY-sy)+"px"; });
  h.addEventListener("pointerup",()=>on=false);
}
function render(id){
  const w=WINS[id]; if(!w) return;
  const body=$(".wbody",w),foot=$(".wfoot",w);
  ({g1:R1,g2:R2,g3:R3,g4:R4,teams:RT,net:RN})[id](body,foot);
}
function rerenderAll(){ Object.keys(WINS).forEach(render); }
const tname=i=>S.teams[i]||("Equipo "+(i+1));
function score4(scores){
  return `<div class="score4">${[0,1,2,3].map(i=>`<div class="s" style="background:${TC(i)}"><b>${esc(tname(i))}</b><span>${scores[i]}</span></div>`).join("")}</div>`;
}
function confirmReset(label,fn){ if(confirm("¿Reiniciar "+label+"? Se borra el marcador de esta dinámica.")){ fn(); save(); } }

/* ===================== EQUIPOS ===================== */
function RT(body,foot){
  body.innerHTML=`<div class="dlg"><h2 class="big">Nombres de los equipos</h2>
   ${[0,1,2,3].map(i=>`<label><span class="sw" style="background:${TC(i)};width:24px;height:24px"></span><input type="text" data-i="${i}" value="${esc(tname(i))}" maxlength="24" aria-label="Equipo ${i+1}"></label>`).join("")}
   <p class="kicker">Los nombres se usan en las cuatro dinámicas.</p></div>`;
  body.querySelectorAll("input").forEach(inp=>inp.addEventListener("input",()=>{ S.teams[+inp.dataset.i]=inp.value; save(); NET.pushTeams(); }));
  foot.innerHTML=`<span class="grow"></span><button class="btn go" id="tOk">Guardar nombres</button>`;
  $("#tOk",foot).onclick=()=>{ NET.pushTeams(); rerenderAll(); const w=WINS.teams; w.remove(); delete WINS.teams; SFX.close(); };
}

/* ===================== 1 · 100 MONSTRUOS ===================== */
/* cuadro de victoria al centro con murciélagos de celebración; se cierra con clic o solo a los 7 s */
function victory(o){
  document.querySelector(".vic")?.remove();
  const d=document.createElement("div"); d.className="vic"; d.setAttribute("role","alertdialog"); d.setAttribute("aria-label",o.title);
  const bat=`<svg viewBox="0 0 100 50" aria-hidden="true"><g class="wing"><path d="M50 22c-6-10-16-16-30-14 4 4 4 8 2 12-6-4-14-4-20 0 10 2 16 8 18 16 6-6 14-8 22-6 4 0 6-4 8-8z" fill="${INK}"/><path d="M50 22c6-10 16-16 30-14-4 4-4 8-2 12 6-4 14-4 20 0-10 2-16 8-18 16-6-6-14-8-22-6-4 0-6-4-8-8z" fill="${INK}"/></g><ellipse cx="50" cy="26" rx="7" ry="10" fill="${INK}"/><path d="M45 17l-2-7 5 4M55 17l2-7-5 4" fill="${INK}"/><circle cx="47" cy="24" r="1.6" fill="${RED}"/><circle cx="53" cy="24" r="1.6" fill="${RED}"/></svg>`;
  const bats=Array.from({length:16},(_,i)=>{ const a=i/16*Math.PI*2+Math.random()*.4, R=55+Math.random()*25;
    return `<span class="bat" style="--dx:${Math.round(Math.cos(a)*R)}vw;--dy:${Math.round(Math.sin(a)*R*.8)}vh;--rot:${Math.round(Math.random()*60-30)}deg;--d:${(Math.random()*.5).toFixed(2)}s;--t:${(1.8+Math.random()*1.2).toFixed(2)}s;--s:${(.7+Math.random()*.8).toFixed(2)}">${bat}</span>`; }).join("");
  d.innerHTML=`${bats}<div class="box" style="border-top:20px solid ${o.color||TC(o.team)}"><span class="k">${esc(o.kicker)}</span><h2>${esc(o.title)}</h2><b class="num">${esc(o.big)}</b><span class="sub">${esc(o.sub)}</span><span class="tap">Toca para continuar</span></div>`;
  document.body.appendChild(d); SFX.win();
  const close=()=>{ d.classList.add("out"); setTimeout(()=>d.remove(),300); };
  d.addEventListener("click",close); setTimeout(()=>{ if(d.isConnected) close(); },7000);
}
function bigX(){
  const d=document.createElement("div");d.className="bigx";
  d.innerHTML=`<svg viewBox="0 0 200 200"><path d="M40 34c40 36 84 92 124 136" stroke="${INK}" stroke-width="38" stroke-linecap="round" fill="none"/><path d="M164 30c-40 44-88 90-126 140" stroke="${INK}" stroke-width="38" stroke-linecap="round" fill="none"/><path d="M40 34c40 36 84 92 124 136" stroke="${RED}" stroke-width="26" stroke-linecap="round" fill="none"/><path d="M164 30c-40 44-88 90-126 140" stroke="${RED}" stroke-width="26" stroke-linecap="round" fill="none"/></svg>`;
  document.body.appendChild(d); setTimeout(()=>d.remove(),800);
}
/* Control y puntos automáticos (7-nov-2026):
   - g.rc["G-r"] = lado (0|1) que ganó el control de la ronda; se elige tocando la tarjeta del equipo.
   - Sin control no se abre ninguna respuesta. Cada respuesta abierta suma a la bolsa del equipo con control.
   - Al 3er strike el control pasa al rival para robar: si abre una respuesta (g.st["G-r"] = esa respuesta) se lleva toda la bolsa;
     un strike más = robo fallido y la bolsa se queda con quien tenía el control.
   - Ronda cerrada (5 adivinadas, robo resuelto o "Revelar las que faltan"): lo que se abra se ve pero no suma (rev[k] = "c"). */
let m1warn=false;
function m1info(G,i){
  const g=S.g1; g.rc ||= {}; g.st ||= {};
  const K=G+"-"+i, rv=g.rev[G][i]||[], s=g.strikes[G][i]||0, c=g.rc[K], st=g.st[K];
  const guessed=rv.filter(x=>x===true).length;
  const closed=st!==undefined||s>=4||rv.some(x=>x==="c")||guessed===5;
  const pot=MONSTRUOS[G].rounds[i].a.reduce((x,[,p],k)=>x+(rv[k]===true?p:0),0);
  const win=c===undefined?null:st!==undefined?1-c:c;
  const cur=c===undefined?null:(!closed&&s>=3)?1-c:c;
  return {s,c,st,closed,pot,win,cur};
}
/* resultado del partido G: puntos por lado, si ya terminó, empate y lado ganador (con desempate) */
function m1result(G){
  const g=S.g1; g.tie ||= [null,null,null];
  const R=MONSTRUOS[G].rounds.map((_,i)=>m1info(G,i));
  const sc=[0,1].map(side=>R.reduce((t,x,i)=>t+(x.win===side?x.pot*MULT[i]:0),0));
  const allDone=R.every(x=>x.closed), tied=allDone&&sc[0]===sc[1];
  const mw=!allDone?null:!tied?(sc[0]>sc[1]?0:1):(g.tie[G]??null);
  return {sc,allDone,tied,mw,team:mw===null?null:g.pair[G][mw]};
}
/* la Gran Final se abre cuando las dos semifinales tienen ganador, y la juegan esos dos equipos */
const m1finalReady=()=>m1result(0).team!==null&&m1result(1).team!==null;
function R1(body,foot){
  const g=S.g1;
  if(g.game===2&&!m1finalReady()) g.game=0;
  if(g.game===2) g.pair[2]=[m1result(0).team,m1result(1).team];
  const G=g.game, gm=MONSTRUOS[G], r=g.round[G], rd=gm.rounds[r], m=MULT[r];
  const rev=(g.rev[G][r] ||= [false,false,false,false,false]);
  const pair=g.pair[G];
  g.rc ||= {}; g.st ||= {}; g.tie ||= [null,null,null]; g.tb ||= {};
  const K=i=>G+"-"+i;
  const info=i=>m1info(G,i);
  const I=info(r);
  const {sc,tied,mw}=m1result(G);
  const tb=(g.tb[G] ||= [false,false,false,false,false]);
  const ready=m1finalReady();
  const warn=m1warn; m1warn=false;
  const steal=!I.closed&&I.c!==undefined&&I.s>=3;
  const teamSel=(s)=>`<select data-s="${s}" ${G===2?"disabled title=\"En la Gran Final juegan los ganadores de las semifinales\"":""} aria-label="Equipo ${s?"derecha":"izquierda"}">${[0,1,2,3].map(i=>`<option value="${i}" ${pair[s]===i?"selected":""}>${esc(tname(i))}</option>`).join("")}</select>`;
  const note=s=>I.cur===s?(steal?"Intenta robar":"Tiene el control"):(I.c===undefined&&!I.closed?"Toca aquí para darle el control":"&nbsp;");
  const card=s=>`<div class="m-team ${s?"right":""} ${I.cur===s?"ctl":""} ${I.c===undefined||(!I.closed&&!steal)?"clickable":""}" data-side="${s}" style="box-shadow:inset ${s?"-":""}10px 0 0 ${TC(pair[s])}">${teamSel(s)}<span class="pts">${sc[s]}</span><span class="kicker">${note(s)}</span></div>`;
  body.innerHTML=`
   <div class="m-top">
     ${card(0)}
     <div class="m-mid"><span class="kicker">${esc(gm.name)}</span><div class="rounds">${gm.rounds.map((_,i)=>`<button data-r="${i}" class="${i===r?"on":""} ${info(i).closed?"done":""}">R${i+1} x${MULT[i]}</button>`).join("")}</div><span class="mult">x${m}</span></div>
     ${card(1)}
   </div>
   <p class="q" style="max-width:none;font-size:clamp(28px,3vw,46px);margin:12px 0">${esc(rd.q)}</p>
   <div class="board">${rd.a.map(([t,p],k)=>`<button class="slot ${rev[k]?"":"hid"} ${rev[k]==="c"?"cl":""}" data-k="${k}" aria-label="Respuesta ${k+1}${rev[k]?": "+esc(t):", oculta"}"><span class="n">${k+1}</span><span class="a">${esc(t)}</span><span class="p">${p}</span></button>`).join("")}</div>
   <div class="m-ctrl">
     <span class="pot">Bolsa: ${I.pot} × ${m} = ${I.pot*m}${I.win!==null?" · "+esc(tname(pair[I.win])):""}</span>
     <div class="strikes" aria-label="Strikes">${[0,1,2].map(i=>`<i class="${i<I.s?"on":""}">X</i>`).join("")}</div>
   </div>
   ${warn?`<div class="banner" style="background:var(--tint0)">Primero toca la tarjeta del equipo que tiene el control.</div>`:""}
   ${!I.closed&&I.c===undefined?`<div class="banner">Toca la tarjeta del equipo que ganó el cara a cara para darle el control.</div>`:""}
   ${steal?`<div class="banner" style="background:var(--tint0)">¡Tercer strike! El control pasa a ${esc(tname(pair[1-I.c]))}: una sola oportunidad para robar. Si atina, abre esa respuesta y se lleva toda la bolsa. Si falla, toca "Falló el robo" y la bolsa es de ${esc(tname(pair[I.c]))}.</div>`:""}
   ${tied&&(mw===null||mw===undefined)?`<div class="banner">¡Empate! Pregunta de desempate: cara a cara entre capitanes, gana quien dé la respuesta más alta.</div>
     <p class="q" style="max-width:none;font-size:clamp(24px,2.4vw,36px);margin:12px 0">${esc(DESEMPATE.q)}</p>
     <div class="board">${DESEMPATE.a.map(([t,p],k)=>`<button class="slot ${tb[k]?"":"hid"}" data-tb="${k}" aria-label="Desempate ${k+1}${tb[k]?": "+esc(t):", oculta"}"><span class="n">${k+1}</span><span class="a">${esc(t)}</span><span class="p">${p}</span></button>`).join("")}</div>
     <div class="m-ctrl"><span class="grow"></span><button class="btn go" data-tw="0">Gana el desempate: ${esc(tname(pair[0]))}</button><button class="btn go" data-tw="1">Gana el desempate: ${esc(tname(pair[1]))}</button></div>`:""}`;
  foot.innerHTML=`
   <div class="rounds">${MONSTRUOS.map((x,i)=>`<button data-g="${i}" class="${i===G?"on":""}" ${i===2&&!ready?"disabled title=\"Se abre cuando las dos semifinales tengan ganador\"":""}>${i===2&&!ready?"🔒 ":""}${esc(x.name)}</button>`).join("")}</div>
   <span class="grow"></span>
   <button class="btn" id="mX" ${I.closed?"disabled":""}>Strike ✕</button>
   <button class="btn" id="mXu" ${I.s?"":"disabled"}>Quitar strike</button>
   ${steal?`<button class="btn go" id="mFail">Falló el robo</button>`:""}
   <button class="btn" id="mAll" title="Muestra las que nadie dijo; no suman puntos" ${rev.every(Boolean)?"disabled":""}>Revelar las que faltan</button>
   <button class="btn" id="mNext" ${r<4?"":"disabled"}>Siguiente ronda</button>
   ${mw!==null&&mw!==undefined?`<button class="btn" id="mWin">🏆 Ver ganador</button>`:""}
   <button class="btn ghost" id="mReset">Reiniciar</button>`;
  const rr=()=>{save();R1(body,foot);};
  body.querySelectorAll(".m-team[data-side]").forEach(el=>el.onclick=e=>{
    if(e.target.closest("select")) return;
    const x=info(r); if(x.closed&&x.c!==undefined) return; if(!x.closed&&x.c!==undefined&&x.s>=3) return;
    g.rc[K(r)]=+el.dataset.side; SFX.tick(); rr(); });
  body.querySelectorAll(".slot[data-k]").forEach(b=>b.onclick=()=>{
    const k=+b.dataset.k, x=info(r);
    if(x.closed){ if(rev[k]===true){ rev[k]=false; if(g.st[K(r)]===k) delete g.st[K(r)]; } else rev[k]=rev[k]?false:"c"; }
    else if(x.c===undefined){ m1warn=true; SFX.buzz(); rr(); return; }
    else if(rev[k]===true) rev[k]=false;
    else { rev[k]=true; if(x.s>=3){ g.st[K(r)]=k; SFX.win(); } }
    if(rev[k]) SFX.ding(); rr(); if(rev[k]) body.querySelector(`.slot[data-k="${k}"]`)?.classList.add("rev"); });
  body.querySelectorAll(".slot[data-tb]").forEach(b=>b.onclick=()=>{ const k=+b.dataset.tb; tb[k]=!tb[k]; if(tb[k]) SFX.ding(); rr(); });
  body.querySelectorAll("[data-tw]").forEach(b=>b.onclick=()=>{ g.tie[G]=+b.dataset.tw; SFX.win(); rr(); });
  /* el mismo equipo no puede estar en los dos lados: si eliges al rival, se intercambian */
  body.querySelectorAll("select").forEach(s=>s.onchange=()=>{ const side=+s.dataset.s, v=+s.value; if(pair[1-side]===v) pair[1-side]=pair[side]; pair[side]=v; rr(); });
  body.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{ g.round[G]=+b.dataset.r; rr(); });
  foot.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{ g.game=+b.dataset.g; rr(); });
  $("#mX",foot).onclick=()=>{ if(info(r).c===undefined){ m1warn=true; SFX.buzz(); rr(); return; } g.strikes[G][r]=Math.min(4,I.s+1); SFX.buzz(); bigX(); rr(); };
  $("#mXu",foot).onclick=()=>{ const s=Math.max(0,I.s-1); g.strikes[G][r]=s; const st=g.st[K(r)]; if(s<3&&st!==undefined){ rev[st]=false; delete g.st[K(r)]; } rr(); };
  /* "Falló el robo" = el strike extra: la bolsa se queda con quien tenía el control */
  const fl=$("#mFail",foot); if(fl) fl.onclick=()=>{ g.strikes[G][r]=4; SFX.buzz(); bigX(); rr(); };
  $("#mAll",foot).onclick=()=>{ rev.forEach((v,k)=>{ if(!v) rev[k]="c"; }); SFX.ding(); rr(); };
  $("#mNext",foot).onclick=()=>{ g.round[G]=Math.min(4,r+1); rr(); };
  $("#mReset",foot).onclick=()=>confirmReset(gm.name,()=>{ g.rev[G]=[];g.strikes[G]=[0,0,0,0,0];g.round[G]=0;g.tie[G]=null;g.tb[G]=null;
    Object.keys(g.rc).concat(Object.keys(g.st)).forEach(k=>{ if(k.startsWith(G+"-")){ delete g.rc[k]; delete g.st[k]; } });
    Object.keys(g.cel||{}).forEach(k=>{ if(k.startsWith(G+"-")||k==="m"+G) delete g.cel[k]; }); R1(body,foot); });
  /* celebración: una vez por ronda cerrada con puntos y una vez por partido decidido */
  g.cel ||= {};
  const roundCel={team:pair[I.win],kicker:`${gm.name} · Ronda ${r+1} · x${m}`,title:`¡Ronda para ${tname(pair[I.win])}!`,big:`+${I.pot*m}`,sub:I.st!==undefined?"¡Se robaron la bolsa!":I.s>=4?"¡Falló el robo! La bolsa se queda en casa":"puntos"};
  const matchCel=()=>({team:pair[mw],kicker:gm.name,title:`¡Victoria para ${tname(pair[mw])}!`,big:`${sc[mw]} puntos`,sub:(tied?"Ganó el juego en el desempate · ":"Ganó el juego · ")+(G===2?"¡Campeón del torneo!":"Pasa a la Gran Final")});
  const decided=mw!==null&&mw!==undefined;
  let show=null;
  if(I.closed&&I.win!==null&&I.pot>0){ if(!g.cel[K(r)]){ g.cel[K(r)]=1; show=roundCel; } } else delete g.cel[K(r)];
  if(decided){ if(!g.cel["m"+G]){ g.cel["m"+G]=1; show=matchCel(); } } else delete g.cel["m"+G];
  const wb=$("#mWin",foot); if(wb) wb.onclick=()=>victory(matchCel());
  if(show){ save(); victory(show); }
}

/* ===================== 2 · TRIVIA ===================== */
let TIMER=null;
function stopTimer(){ clearInterval(TIMER); TIMER=null; }
function R2(body,foot){
  const g=S.g2;
  stopTimer();
  if(g.phase!=="question" && g.phase!=="reveal") NET.idle();
  if(g.phase==="intro"){
    body.innerHTML=`<div class="center" style="padding-top:6vh"><p class="kicker">25 preguntas · 30 segundos cada una · más puntos entre más rápido</p>
      <h2 class="big" style="font-size:clamp(56px,7vw,110px)">Trivia del Terror Mexicano</h2>
      <p class="q" style="margin:18px auto">Voten desde su celular: la respuesta del equipo es la opción más votada.</p></div>${score4(g.scores)}`;
    foot.innerHTML=`<span class="grow"></span><button class="btn ghost" id="tvReset">Reiniciar</button><button class="btn go" id="tvGo">${g.i>0?"Continuar en la pregunta "+(g.i+1):"Empezar"}</button>`;
    $("#tvGo",foot).onclick=()=>startQ(body,foot);
    $("#tvReset",foot).onclick=()=>confirmReset("la Trivia",()=>{ S.g2=fresh().g2; R2(body,foot); });
    return;
  }
  if(g.phase==="podium") return podium(body,foot,g.scores,"Trivia del Terror Mexicano",()=>{ g.phase="board"; save(); R2(body,foot); },{hits:g.hits,tie:"Empate en puntos y en respuestas correctas: desempaten los capitanes."});
  const [q,opts,ok]=TRIVIA[g.i];
  const letters=["A","B","C"];
  const revealing=g.phase==="reveal";
  if(g.phase==="board"){
    body.innerHTML=leaderboard(g.scores,`Marcador después de la pregunta ${g.i+1}`,g.hits);
    foot.innerHTML=`<span class="grow"></span>${g.i<TRIVIA.length-1?`<button class="btn go" id="tvNext">Siguiente pregunta</button>`:`<button class="btn go" id="tvPod">Ver podio</button>`}`;
    const n=$("#tvNext",foot); if(n) n.onclick=()=>{ g.i++; startQ(body,foot); };
    const p=$("#tvPod",foot); if(p) p.onclick=()=>{ g.phase="podium"; podCel=true; save(); R2(body,foot); };
    return;
  }
  body.innerHTML=`
    <div class="tv-head"><span class="pill on">Pregunta ${g.i+1} de ${TRIVIA.length}</span>
      <div class="timer" role="timer" aria-label="Tiempo restante"><i id="tvBar" style="width:${(g.remain/TRIVIA_SECS)*100}%"></i><b id="tvSec">${Math.ceil(g.remain)} s</b></div></div>
    <p class="q" style="max-width:none">${esc(q)}</p>
    <div class="opts">${opts.map((o,k)=>`<div class="opt ${letters[k]} ${revealing?(k===ok?"ok":"dim"):""}"><span class="l">${letters[k]}</span><span>${esc(o)}</span></div>`).join("")}</div>
    <div class="answers ${revealing?"":"hide"}">${[0,1,2,3].map(t=>{
      const a=g.ans[t];
      const res=revealing?(a&&a.c===ok?`✓ +${g.last[t]||0}`:"✗ 0"):(a?"Respondió":"Sin respuesta")+NET.vi(t);
      return `<div class="ans ${a?"got":""}" style="box-shadow:inset 0 8px 0 ${TC(t)}"><span class="teamchip" style="border:0;padding:6px 0 0">${esc(tname(t))}</span>
        <div class="row">${letters.map((L,k)=>`<button data-t="${t}" data-k="${k}" class="${a&&a.c===k?"on":""}" ${revealing?"disabled":""}>${L}</button>`).join("")}</div>
        <span class="res">${res}</span></div>`; }).join("")}</div>`;
  foot.innerHTML=`<span class="kicker">Las respuestas llegan de los celulares. Si alguno falla, márcala aquí.</span><span class="grow"></span>
    ${revealing?`<button class="btn go" id="tvBoard">Ver marcador</button>`:`<button class="btn go" id="tvRev">Revelar respuesta</button>`}`;
  body.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{
    const t=+b.dataset.t,k=+b.dataset.k; g.ans[t]={c:k,remain:g.remain}; save(); SFX.tick();
    body.querySelectorAll(`[data-t="${t}"]`).forEach(x=>x.classList.toggle("on",+x.dataset.k===k));
    b.closest(".ans").querySelector(".res").textContent="Respondió"; b.closest(".ans").classList.add("got");
  });
  const rv=$("#tvRev",foot); if(rv) rv.onclick=()=>reveal(body,foot);
  const bd=$("#tvBoard",foot); if(bd) bd.onclick=()=>{ g.phase="board"; save(); R2(body,foot); };
  if(g.phase==="question"){
    NET.open("g2-"+g.i,{kind:"abc",prompt:q,opts});
    g.deadline=Date.now()+g.remain*1000;
    TIMER=setInterval(()=>{
      g.remain=Math.max(0,(g.deadline-Date.now())/1000);
      const bar=$("#tvBar",body),sec=$("#tvSec",body);
      if(bar){ bar.style.width=(g.remain/TRIVIA_SECS*100)+"%"; bar.classList.toggle("low",g.remain<=5); }
      if(sec){ const s=Math.ceil(g.remain); if(sec.textContent!==s+" s"){ sec.textContent=s+" s"; if(s<=5&&s>0) SFX.tick(); } }
      if(g.remain<=0){ stopTimer(); SFX.buzz(); NET.lock(); }
    },100);
  }
}
function startQ(body,foot){ const g=S.g2; g.phase="question"; g.ans={}; g.last={}; g.remain=TRIVIA_SECS; save(); R2(body,foot); }
function reveal(body,foot){
  const g=S.g2, ok=TRIVIA[g.i][2];
  stopTimer();
  [0,1,2,3].forEach(t=>{ const a=g.ans[t]; if(a&&a.c===ok){ const pts=Math.round(500+500*(a.remain/TRIVIA_SECS)); g.last[t]=pts; g.scores[t]+=pts; g.hits[t]++; } else g.last[t]=0; });
  g.phase="reveal"; SFX.win(); save(); NET.reveal(ok); R2(body,foot);
}
/* orden: más puntos; si empatan, más aciertos (sólo la trivia los manda) */
const rank=(scores,hits)=>[0,1,2,3].sort((a,b)=>scores[b]-scores[a]||(hits?hits[b]-hits[a]:0));
function leaderboard(scores,title,hits){
  const order=rank(scores,hits); const max=Math.max(1,...scores);
  return `<h2 class="big center">${esc(title)}</h2><div class="lb" style="margin-top:22px">${order.map((t,i)=>`<div class="r"><span class="pos">${i+1}</span>
    <div class="bar" style="background:${TC(t)};width:${Math.max(22,scores[t]/max*100)}%">${esc(tname(t))}</div><span class="v">${scores[t]}</span></div>`).join("")}</div>`;
}
let podCel=false;
function podium(body,foot,scores,title,back,o={}){
  const order=rank(scores,o.hits), [a,b]=order;
  const tiePts=scores[a]===scores[b], tieAll=tiePts&&(!o.hits||o.hits[a]===o.hits[b]);
  const spots=[[order[1],2,"62%"],[order[0],1,"100%"],[order[2],3,"40%"]];
  const champ=tieAll?`¡Empate en primer lugar! ${esc(o.tie||"")}`:`Campeón: ${esc(tname(a))}${tiePts?" (gana por más respuestas correctas)":""}`;
  body.innerHTML=`<h2 class="big center">${esc(title)}: el podio</h2>
    <p class="center q" style="margin:10px auto 0;max-width:none">${champ}</p>
    <div class="podium">${spots.map(([t,pos,h])=>`<div class="col"><span class="who">${esc(tname(t))}</span><span class="pts">${scores[t]}</span>
      <div class="blk" style="height:${pos===1?260:pos===2?180:120}px;background:${TC(t)}">${pos}</div></div>`).join("")}</div>`;
  foot.innerHTML=`<button class="btn" id="pBack">Ver marcador completo</button><span class="grow"></span>`;
  $("#pBack",foot).onclick=back;
  if(podCel){ podCel=false;
    victory(tieAll?{color:"var(--gold)",kicker:title,title:"¡Empate en primer lugar!",big:`${scores[a]} puntos`,sub:o.tie||""}
      :{team:a,kicker:title,title:`¡Victoria para ${tname(a)}!`,big:`${scores[a]} puntos`,sub:tiePts?"Ganó por más respuestas correctas":"¡Campeón de la dinámica!"}); }
}

/* ===================== 3 · FLORIDA O TAMAULIPAS ===================== */
function R3(body,foot){
  const g=S.g3;
  if(g.i>=NOTICIAS.length){
    NET.idle();
    if(g.end) return podium(body,foot,g.scores,"Florida o Tamaulipas",()=>{ g.end=false; save(); R3(body,foot); },{tie:"Piedra, papel o tijera entre capitanes."});
    body.innerHTML=leaderboard(g.scores,"Resultado final");
    foot.innerHTML=`<button class="btn" id="fBack">Volver a la noticia 10</button><span class="grow"></span><button class="btn ghost" id="fReset">Reiniciar</button><button class="btn go" id="fPod">Ver podio</button>`;
    $("#fBack",foot).onclick=()=>{ g.i=NOTICIAS.length-1; save(); R3(body,foot); };
    $("#fPod",foot).onclick=()=>{ g.end=true; podCel=true; save(); R3(body,foot); };
    $("#fReset",foot).onclick=()=>confirmReset("Florida o Tamaulipas",()=>{ S.g3=fresh().g3; R3(body,foot); });
    return;
  }
  const [txt,ans,place,src]=NOTICIAS[g.i];
  if(!g.log[g.i]) NET.open("g3-"+g.i,{kind:"ft",prompt:"Noticia "+(g.i+1)+" de "+NOTICIAS.length+": ¿Florida o Tamaulipas?"});
  const v=(g.votes[g.i] ||= {}); const shown=!!(g.log[g.i]);
  body.innerHTML=`
   <div class="tv-head" style="margin-bottom:18px"><span class="pill on">Noticia ${g.i+1} de ${NOTICIAS.length}</span><span class="kicker">¿Pasó en Florida o en Tamaulipas?</span></div>
   <article class="news"><p class="txt" style="margin:0">${esc(txt)}</p>
     ${shown?`<span class="stamp ${ans}">${ans==="F"?"FLORIDA":"TAMAULIPAS"}${place?" · "+esc(place):""}</span>`:""}</article>
   ${shown?`<p class="src">Fuente: ${esc(src)}</p>`:`<div style="height:44px"></div>`}
   <div class="answers vote ${shown?"":"hide"}">${[0,1,2,3].map(t=>`<div class="ans ${v[t]?"got":""}" style="box-shadow:inset 0 8px 0 ${TC(t)}"><span class="teamchip" style="border:0;padding:6px 0 0">${esc(tname(t))}</span>
      <div class="row">${["F","T"].map(c=>`<button data-t="${t}" data-c="${c}" class="${v[t]===c?"on":""}" ${shown?"disabled":""}>${c==="F"?"Florida":"Tamaulipas"}</button>`).join("")}</div>
      <span class="res">${shown?(v[t]===ans?"✓ +1":"✗ 0"):(v[t]?"Votó":"Sin voto")+NET.vi(t)}</span></div>`).join("")}</div>
   ${score4(g.scores)}`;
  foot.innerHTML=`<button class="btn" id="fPrev" ${g.i?"":"disabled"}>Anterior</button><span class="grow"></span>
    <button class="btn ghost" id="fReset">Reiniciar</button>
    ${shown?`<button class="btn go" id="fNext">${g.i<NOTICIAS.length-1?"Siguiente noticia":"Ver resultados"}</button>`:`<button class="btn go" id="fRev">Revelar</button>`}`;
  body.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{ v[+b.dataset.t]=b.dataset.c; SFX.tick(); save(); R3(body,foot); });
  const rv=$("#fRev",foot); if(rv) rv.onclick=()=>{ g.log[g.i]=true; [0,1,2,3].forEach(t=>{ if(v[t]===ans) g.scores[t]++; }); SFX.ding(); save(); NET.reveal(ans); R3(body,foot); };
  const nx=$("#fNext",foot); if(nx) nx.onclick=()=>{ g.i++; save(); R3(body,foot); };
  $("#fPrev",foot).onclick=()=>{ g.i=Math.max(0,g.i-1); save(); R3(body,foot); };
  $("#fReset",foot).onclick=()=>confirmReset("Florida o Tamaulipas",()=>{ S.g3=fresh().g3; NET.idle(); R3(body,foot); });
}

/* ===================== 4 · ADIVINA LA PELÍCULA ===================== */
const IDB={db:null,
  open(){ return new Promise(res=>{ try{ const r=indexedDB.open("calabazaOS",1); r.onupgradeneeded=()=>r.result.createObjectStore("img"); r.onsuccess=()=>{this.db=r.result;res(this.db);}; r.onerror=()=>res(null);}catch(e){res(null);} }); },
  async get(k){ const d=this.db||await this.open(); if(!d) return MEM[k]; return new Promise(res=>{ try{ const t=d.transaction("img").objectStore("img").get(k); t.onsuccess=()=>res(t.result||MEM[k]); t.onerror=()=>res(MEM[k]); }catch(e){res(MEM[k]);} }); },
  async set(k,v){ MEM[k]=v; const d=this.db||await this.open(); if(!d) return; try{ d.transaction("img","readwrite").objectStore("img").put(v,k); }catch(e){} },
  async del(k){ delete MEM[k]; const d=this.db||await this.open(); if(!d) return; try{ d.transaction("img","readwrite").objectStore("img").delete(k); }catch(e){} }
};
const MEM={}; const HAS=new Set();
function readFile(f){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); }); }
(async()=>{ for(let i=0;i<PELIS.length;i++){ if(await IDB.get("p"+i)) HAS.add(i); } if(WINS.g4) render("g4"); })();

async function R4(body,foot){
  const g=S.g4;
  if(g.i>=PELIS.length){
    const sc=[0,1,2,3].map(t=>Object.values(g.hits).filter(h=>h&&h[t]).length);
    NET.idle();
    if(g.end) return podium(body,foot,sc,"Adivina la Película",()=>{ g.end=false; save(); R4(body,foot); },{tie:"Piedra, papel o tijera entre capitanes."});
    body.innerHTML=leaderboard(sc,"Resultado final");
    foot.innerHTML=`<button class="btn" id="pBackS">Volver a la escena 15</button><span class="grow"></span><button class="btn ghost" id="pReset">Reiniciar marcador</button><button class="btn go" id="pPod">Ver podio</button>`;
    $("#pBackS",foot).onclick=()=>{ g.i=PELIS.length-1; save(); R4(body,foot); };
    $("#pPod",foot).onclick=()=>{ g.end=true; podCel=true; save(); R4(body,foot); };
    $("#pReset",foot).onclick=()=>confirmReset("Adivina la Película",()=>{ S.g4=fresh().g4; R4(body,foot); });
    return;
  }
  const [title,year]=PELIS[g.i]; const shown=!!g.log[g.i]; const h=(g.hits[g.i] ||= {});
  const sc=[0,1,2,3].map(t=>Object.values(g.hits).filter(x=>x&&x[t]).length);
  const op=movieOpts(g.i), okIdx=op.indexOf(g.i), titles=op.map(k=>PELIS[k][0]);
  const A=((g.ans ||= {})[g.i] ||= {});
  const letters=["A","B","C"];
  if(!shown) NET.open("g4-"+g.i,{kind:"abc",prompt:"Escena "+(g.i+1)+": ¿de qué película es?",opts:titles});
  const img=await IDB.get("p"+g.i);
  if(S.g4.i!==g.i) return;
  /* conserva la misma <img> al redibujar la misma escena (cada voto redibuja): evita el parpadeo en el proyector */
  const keepImg=img&&body.dataset.scene===String(g.i)?$("#scene img",body):null;
  body.dataset.scene=g.i;
  body.innerHTML=`
   <div class="tv-head" style="margin-bottom:12px"><span class="pill on">Escena ${g.i+1} de ${PELIS.length}</span>
     <div class="strip" aria-label="Escenas">${PELIS.map((_,k)=>`<button data-j="${k}" class="${k===g.i?"on":""} ${HAS.has(k)?"has":""}" aria-label="Escena ${k+1}">${k+1}</button>`).join("")}</div></div>
   <div class="scene" id="scene" style="height:min(40vh,480px)">${img?`<img src="${img}" alt="Escena ${g.i+1}">`:`<div class="empty"><p class="q" style="margin:0;font-size:34px">Sin imagen para la escena ${g.i+1}</p>
      <span class="kicker">Carga la imagen de esta escena, o las 15 de una vez desde la barra de abajo (en orden por nombre de archivo).</span>
      <label class="btn go">Cargar imagen<input type="file" accept="image/*" id="one" hidden></label></div>`}</div>
   <div class="opts small" style="margin-top:14px">${titles.map((o,k)=>`<div class="opt ${letters[k]} ${shown?(k===okIdx?"ok":"dim"):""}"><span class="l">${letters[k]}</span><span>${esc(o)}</span></div>`).join("")}</div>
   ${shown?`<span class="reveal">${esc(title)} (${year})</span>`:""}
   <div class="answers ${shown?"":"hide"}">${[0,1,2,3].map(t=>`<div class="ans ${A[t]!==undefined?"got":""}" style="box-shadow:inset 0 8px 0 ${TC(t)}"><span class="teamchip" style="padding-top:4px">${esc(tname(t))}</span>
      <div class="row">${letters.map((L,k)=>`<button data-t="${t}" data-k="${k}" class="${A[t]===k?"on":""}" ${shown?"disabled":""}>${L}</button>`).join("")}</div>
      <span class="res">${shown?(h[t]?"✓ +1":"✗ 0"):(A[t]!==undefined?"Respondió":"Sin respuesta")+NET.vi(t)}</span></div>`).join("")}</div>
   ${score4(sc)}`;
  if(keepImg&&keepImg.getAttribute("src")===img) $("#scene img",body)?.replaceWith(keepImg);
  foot.innerHTML=`<button class="btn" id="pPrev" ${g.i?"":"disabled"}>Anterior</button>
    <label class="btn">Cargar las 15 imágenes<input type="file" accept="image/*" multiple id="many" hidden></label>
    ${img?`<label class="btn">Cambiar imagen<input type="file" accept="image/*" id="one2" hidden></label>`:""}
    <span class="grow"></span>
    <button class="btn ghost" id="pReset2">Reiniciar</button>
    ${shown?`<button class="btn go" id="pNext">${g.i<PELIS.length-1?"Siguiente escena":"Ver resultados"}</button>`:`<button class="btn go" id="pRev">Revelar película</button>`}`;
  const loadOne=async e=>{ const f=e.target.files[0]; if(!f) return; await IDB.set("p"+g.i,await readFile(f)); HAS.add(g.i); R4(body,foot); };
  [$("#one",body),$("#one2",foot)].forEach(x=>x&&(x.onchange=loadOne));
  $("#many",foot).onchange=async e=>{
    const fs=[...e.target.files].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
    for(let k=0;k<Math.min(fs.length,PELIS.length);k++){ await IDB.set("p"+k,await readFile(fs[k])); HAS.add(k); }
    R4(body,foot);
  };
  body.querySelectorAll("[data-j]").forEach(b=>b.onclick=()=>{ g.i=+b.dataset.j; save(); R4(body,foot); });
  body.querySelectorAll(".ans [data-t]").forEach(b=>b.onclick=()=>{ const t=+b.dataset.t,k=+b.dataset.k; A[t]=k; SFX.tick(); save();
    b.closest(".row").querySelectorAll("button").forEach(x=>x.classList.toggle("on",+x.dataset.k===k)); b.closest(".ans").querySelector(".res").textContent="Respondió"; b.closest(".ans").classList.add("got"); });
  const rv=$("#pRev",foot); if(rv) rv.onclick=()=>{ g.log[g.i]=true; [0,1,2,3].forEach(t=>{ h[t]=A[t]===okIdx; }); SFX.win(); save(); NET.reveal(okIdx); R4(body,foot); };
  const nx=$("#pNext",foot); if(nx) nx.onclick=()=>{ g.i++; save(); R4(body,foot); };
  $("#pPrev",foot).onclick=()=>{ g.i=Math.max(0,g.i-1); save(); R4(body,foot); };
  $("#pReset2",foot).onclick=()=>confirmReset("Adivina la Película",()=>{ S.g4=fresh().g4; NET.idle(); R4(body,foot); });
}
function movieOpts(i){
  const g=S.g4; g.opts ||= {};
  if(!g.opts[i]){
    let seed=(i+7)*7919; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
    const others=PELIS.map((_,k)=>k).filter(k=>k!==i), d=[];
    while(d.length<2){ const k=others[Math.floor(rnd()*others.length)]; if(!d.includes(k)) d.push(k); }
    d.splice(Math.floor(rnd()*3),0,i); g.opts[i]=d; save();
  }
  return g.opts[i];
}

/* ===================== CONEXIÓN EN VIVO (Firebase) ===================== */
const FIREBASE_CONFIG={
  apiKey:"AIzaSyDnmCeGek6Bg52DwiO5jPXMhq58Yecl9k4",
  authDomain:"calabaza-os.firebaseapp.com",
  databaseURL:"https://calabaza-os-default-rtdb.firebaseio.com",
  projectId:"calabaza-os",
  storageBucket:"calabaza-os.firebasestorage.app",
  messagingSenderId:"878886923884",
  appId:"1:878886923884:web:115bb517cff6bfa24ab249"
};
const NET={db:null,ok:false,code:null,seq:0,key:null,open_:false,players:{},arr:{},answersRef:null,
  init(){
    try{ if(!window.firebase) return; firebase.initializeApp(FIREBASE_CONFIG); this.db=firebase.database(); }catch(e){ return; }
    this.db.ref(".info/connected").on("value",v=>{ this.ok=!!v.val(); paintNet(); });
  },
  host(){
    if(!this.db) return;
    try{ this.code=localStorage.getItem("calabazaRoom"); }catch(e){}
    if(!this.code){ const L="ABCDEFGHJKLMNPQRSTUVWXYZ"; this.code=[0,0,0,0].map(()=>L[Math.floor(Math.random()*L.length)]).join(""); try{ localStorage.setItem("calabazaRoom",this.code);}catch(e){} }
    this.room=this.db.ref("rooms/"+this.code);
    this.pushTeams();
    /* si se recargó la página a media votación, retoma esa misma votación en vez de mandar a todos a "Esperando" */
    let saved=null; try{ saved=JSON.parse(localStorage.getItem("calabazaVote")||"null"); }catch(e){}
    this.room.child("state").once("value").then(v=>{
      const st=v.val();
      if(saved&&st&&st.mode==="q"&&st.seq===saved.seq&&(st.reveal===undefined||st.reveal===null)&&!this.key){
        this.key=saved.key; this.seq=saved.seq; this.open_=true; this.arr={}; this.listen();
      } else if(!this.key) this.idle();
    }).catch(()=>{ if(!this.key) this.idle(); });
    this.room.child("players").on("value",v=>{
      const all=v.val()||{}; this.players={};
      Object.entries(all).forEach(([pid,pl])=>{ if(pl&&pl.name) this.players[pid]=pl; else this.room.child("players/"+pid).remove(); });
      this.assign(); paintNet(); this.apply();
    });
  },
  /* asigna equipo al que tenga menos integrantes; empate = al azar */
  assign(){
    const counts=[0,0,0,0];
    Object.values(this.players).forEach(pl=>{ if(pl.team!==undefined&&pl.team!==null) counts[pl.team]++; });
    Object.entries(this.players).filter(([,pl])=>pl.team===undefined||pl.team===null).sort((x,y)=>(x[1].at||0)-(y[1].at||0)).forEach(([pid,pl])=>{
      const min=Math.min(...counts), opts=[0,1,2,3].filter(t=>counts[t]===min), t=opts[Math.floor(Math.random()*opts.length)];
      counts[t]++; pl.team=t; this.room.child("players/"+pid+"/team").set(t);
    });
  },
  shuffle(){
    const ids=Object.keys(this.players); for(let i=ids.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [ids[i],ids[j]]=[ids[j],ids[i]]; }
    const order=[0,1,2,3].sort(()=>Math.random()-.5), upd={};
    ids.forEach((pid,i)=>{ upd[pid+"/team"]=order[i%4]; });
    if(ids.length) this.room.child("players").update(upd);
  },
  kick(pid){ if(this.room) this.room.child("players/"+pid).remove(); },
  resetPlayers(){ if(this.room) this.room.child("players").remove(); },
  members(t){ return Object.entries(this.players).filter(([,pl])=>pl.team===t); },
  pushTeams(){ if(this.room) this.room.child("teams").set(S.teams.map((n,i)=>n||("Equipo "+(i+1)))); },
  set(state){ if(!this.room) return; this.room.child("state").set(Object.assign({at:firebase.database.ServerValue.TIMESTAMP},state)); },
  open(key,payload){
    if(!this.room) return;
    if(this.key===key && this.open_) return;
    this.key=key; this.open_=true; this.seq=Date.now(); this.arr={};
    try{ localStorage.setItem("calabazaVote",JSON.stringify({key,seq:this.seq})); }catch(e){}
    this.listen();
    this.set(Object.assign({mode:"q",seq:this.seq,open:true},payload));
  },
  listen(){
    if(this.answersRef) this.answersRef.off();
    this.answersRef=this.room.child("answers/"+this.seq);
    const seq=this.seq;
    this.answersRef.on("value",snap=>this.onVotes(seq,snap.val()||{}));
  },
  lock(){ if(!this.room||!this.open_) return; this.room.child("state/open").set(false); },
  reveal(answer){ if(!this.room) return; this.open_=false; this.room.child("state").update({open:false,reveal:answer}); },
  idle(){ if(!this.room) return; this.key=null; this.open_=false; this.arr={}; if(this.answersRef){ this.answersRef.off(); this.answersRef=null; } this.set({mode:"idle"}); },
  onVotes(seq,all){
    if(seq!==this.seq||!this.open_) return;
    const game=this.key.split("-")[0];
    const lockedG2=game==="g2"&&(S.g2.phase!=="question"||S.g2.remain<=0);
    Object.entries(all).forEach(([pid,v])=>{
      if(!v) return; const prev=this.arr[pid];
      if(prev&&prev.c===v.c) return;
      if(lockedG2) return;
      /* "remain" mayor = votó antes: en la trivia es el tiempo restante; en las otras, la hora de llegada en negativo */
      this.arr[pid]={c:v.c,remain:game==="g2"?S.g2.remain:-Date.now()};
    });
    this.apply();
  },
  /* respuesta del equipo = opción más votada; empate = la que se votó más rápido */
  apply(){
    if(!this.key||!this.open_) return;
    const [game,idx]=this.key.split("-"); const i=+idx; let changed=false;
    [0,1,2,3].forEach(t=>{
      const votes=this.members(t).map(([pid])=>this.arr[pid]).filter(Boolean); if(!votes.length) return;
      const tally={}; votes.forEach(v=>{ const k=String(v.c); (tally[k] ||= {n:0,r:0}); tally[k].n++; tally[k].r+=v.remain; });
      const best=Object.entries(tally).sort((x,y)=>y[1].n-x[1].n||(y[1].r/y[1].n)-(x[1].r/x[1].n))[0];
      const c=game==="g3"?best[0]:+best[0], remain=best[1].r/best[1].n;
      if(game==="g2"){ const cur=S.g2.ans[t]; if(!cur||cur.c!==c){ S.g2.ans[t]={c,remain}; changed=true; } }
      if(game==="g3"){ const v=(S.g3.votes[i] ||= {}); if(v[t]!==c){ v[t]=c; changed=true; } }
      if(game==="g4"){ const A=((S.g4.ans ||= {})[i] ||= {}); if(A[t]!==c){ A[t]=c; changed=true; } }
    });
    save();
    if(WINS[game]){
      if(changed) render(game);
      else WINS[game].querySelectorAll(".ans").forEach((el,t)=>{ const r=el.querySelector(".res"); if(r&&!r.textContent.startsWith("✓")&&!r.textContent.startsWith("✗")) r.textContent=r.textContent.split(" · ")[0]+this.vi(t); });
    }
  },
  vi(t){
    if(!this.db) return "";
    const m=this.members(t); if(!m.length) return "";
    const n=m.filter(([pid])=>this.arr[pid]).length;
    return ` · ${n}/${m.length} votos`;
  },
  joinUrl(){ return location.origin+location.pathname+"#jugar-"+this.code; }
};
function paintNet(){
  const d=$("#netDot"); if(d) d.classList.toggle("on",NET.ok);
  if(WINS.net) render("net");
}
function RN(body,foot){
  if(!NET.db){
    body.innerHTML=`<h2 class="big">Los celulares no se pueden conectar desde aquí</h2>
      <p class="q" style="font-size:26px;max-width:40ch">Esta página no tiene acceso a la base de datos en tiempo real. Ábrela desde culto-calabaza.netlify.app para usar el QR.</p>
      <p class="kicker">Mientras tanto, los botones de cada equipo dentro de los juegos funcionan igual.</p>`;
    foot.innerHTML="";
    return;
  }
  let qr="";
  try{ const q=qrcode(0,"M"); q.addData(NET.joinUrl()); q.make(); qr=q.createSvgTag({cellSize:6,margin:2,scalable:true}); }catch(e){ qr="<p>No se pudo generar el QR.</p>"; }
  const total=Object.keys(NET.players).length;
  body.innerHTML=`<div class="net">
     <div class="qrbox">${qr}</div>
     <div><span class="netpill ${NET.ok?"on":"off"}">${NET.ok?"Conectado":"Sin conexión"}</span>
       <h2 class="big" style="margin-top:12px">Escanea, escribe tu nombre y únete</h2>
       <div class="netlist">${[0,1,2,3].map(t=>{ const m=NET.members(t);
         return `<div style="box-shadow:inset 10px 0 0 ${TC(t)};padding-left:22px">${esc(tname(t))} · ${m.length}
           <div class="members">${m.map(([pid,pl])=>`<button data-pid="${esc(pid)}" class="${pl.online===false?"off":""}" aria-label="Quitar a ${esc(pl.name)}" title="Quitar del equipo">${esc(pl.name)} <span aria-hidden="true">✕</span></button>`).join("")||`<span class="kicker">esperando…</span>`}</div></div>`; }).join("")}</div>
       </div></div>`;
  body.querySelectorAll("[data-pid]").forEach(b=>b.onclick=()=>{ const pl=NET.players[b.dataset.pid]; if(pl&&confirm(`¿Quitar a ${pl.name} del equipo? Podrá volver a unirse escaneando el QR.`)) NET.kick(b.dataset.pid); });
  foot.innerHTML=`<button class="btn" id="nMix" ${total?"":"disabled"}>Rebarajar equipos</button><button class="btn" id="nReset" ${total?"":"disabled"}>Reiniciar equipos</button><span class="grow"></span><button class="btn go" id="nOk">Listo</button>`;
  $("#nOk",foot).onclick=()=>{ WINS.net.remove(); delete WINS.net; SFX.close(); };
  $("#nMix",foot).onclick=()=>{ if(confirm("¿Rebarajar a todos en equipos nuevos al azar?")) NET.shuffle(); };
  $("#nReset",foot).onclick=()=>{ if(confirm("¿Reiniciar equipos? Se borra a todos los jugadores y tendrán que volver a escanear el QR.")) NET.resetPlayers(); };
}

/* ===================== NOMBRES SUGERIDOS ===================== */
const SPOOKY={
  m:["Vampiro","Zombi","Fantasma","Esqueleto","Hombre Lobo","Murciélago","Chupacabras","Nahual","Duende","Espantapájaros","Diablito","Monje Encapuchado","Cuervo","Muñeco Poseído","Alux"],
  f:["Bruja","Momia","Calaverita","Llorona","Araña","Catrina","Calabaza","Lechuza","Sirena del Pantano","Monja Siniestra","Muñeca Embrujada","Planchada","Gárgola","Banshee","Vela Maldita"],
  a:[["Dormilón","Dormilona"],["Chismoso","Chismosa"],["Despeinado","Despeinada"],["Bailarín","Bailarina"],["Glotón","Glotona"],["Friolento","Friolenta"],["Coqueto","Coqueta"],
     ["Distraído","Distraída"],["Miedoso","Miedosa"],["Sonámbulo","Sonámbula"],["Gruñón","Gruñona"],["Enamoradizo","Enamoradiza"],["Tierno","Tierna"],["Pachanguero","Pachanguera"],
     ["Antojadizo","Antojadiza"],["Dramático","Dramática"],["Desvelado","Desvelada"],["Cosquilludo","Cosquilluda"],["Elegante","Elegante"],["Cantante","Cantante"],["Sin Wifi","Sin Wifi"],["de Medianoche","de Medianoche"]]
};
function spookyName(){
  const g=Math.random()<.5?"m":"f", n=SPOOKY[g][Math.floor(Math.random()*SPOOKY[g].length)], a=SPOOKY.a[Math.floor(Math.random()*SPOOKY.a.length)];
  const full=n+" "+a[g==="m"?0:1];
  return full.length<=28?full:spookyName();
}

/* ===================== MODO JUGADOR ===================== */
function startPlayer(){
  const code=location.hash.slice(7);
  const root=document.createElement("div"); root.id="player"; document.body.appendChild(root);
  const KP="calabazaPid-"+code;
  let pid=null; try{ pid=localStorage.getItem(KP); }catch(e){}
  let teams=["Equipo 1","Equipo 2","Equipo 3","Equipo 4"], me=null, state={mode:"idle"}, my={}, ok=false;
  const tcol=t=>["var(--tint0)","var(--tint1)","var(--tint2)","var(--tint3)"][t];
  const candle=`<svg viewBox="0 0 60 100" aria-hidden="true"><rect x="18" y="40" width="24" height="52" rx="4" fill="#FBF3E4" stroke="#1E1416" stroke-width="3.5"/><g class="flame"><path d="M30 6c-11 13-11 24 0 28 11-4 11-15 0-28z" fill="#D9A441" stroke="#1E1416" stroke-width="3"/><path d="M30 20c-4 5-4 9 0 11 4-2 4-6 0-11z" fill="#C8102E"/></g></svg>`;
  if(!NET.db){ root.innerHTML=`<h1>El Culto de la Calabaza</h1><p class="sub">No se pudo conectar. Revisa tu internet y vuelve a escanear el QR.</p>`; return; }
  const room=NET.db.ref("rooms/"+code);
  let meRef=null;
  function forget(){
    if(meRef){ meRef.off(); try{ meRef.onDisconnect().cancel(); }catch(e){} }
    meRef=null; me=null; pid=null; try{ localStorage.removeItem(KP);}catch(e){}
  }
  function watchMe(){
    if(!pid) return;
    meRef=room.child("players/"+pid);
    meRef.on("value",v=>{
      const val=v.val();
      if(!val||!val.name){ if(val) meRef.remove(); forget(); paint(); return; }
      me=val;
      if(ok&&me.online!==true){ meRef.update({online:true}); meRef.onDisconnect().update({online:false}); }
      paint();
    });
  }
  room.child("teams").on("value",v=>{ if(v.val()) teams=v.val(); paint(); });
  room.child("state").on("value",v=>{ const n=v.val()||{mode:"idle"}; if(n.seq!==state.seq) my={}; state=n; paint(); });
  NET.db.ref(".info/connected").on("value",v=>{ ok=!!v.val(); if(ok&&me&&me.name&&meRef){ meRef.update({online:true}); meRef.onDisconnect().update({online:false}); } paint(); });
  watchMe();
  let joining=false;
  function join(name){
    name=name.trim().slice(0,30); if(!name||joining) return;
    joining=true; paint();
    room.child("players").once("value").then(v=>{
      const counts=[0,0,0,0];
      Object.values(v.val()||{}).forEach(pl=>{ if(pl&&pl.name&&pl.team!==undefined&&pl.team!==null) counts[pl.team]++; });
      const min=Math.min(...counts), opts=[0,1,2,3].filter(t=>counts[t]===min), team=opts[Math.floor(Math.random()*opts.length)];
      pid="p"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
      try{ localStorage.setItem(KP,pid);}catch(e){}
      return room.child("players/"+pid).set({name,team,online:true,at:firebase.database.ServerValue.TIMESTAMP});
    }).then(()=>new Promise(r=>setTimeout(r,1200)))
    /* si otros se unieron al mismo tiempo y este equipo quedó con 2 o más de diferencia, el último en llegar se cambia solo (todavía no ve su equipo) */
    .then(()=>room.child("players").once("value")).then(v=>{
      const all=v.val()||{}, mine=all[pid]; if(!mine) return;
      const counts=[0,0,0,0]; Object.values(all).forEach(pl=>{ if(pl&&pl.name&&pl.team!==undefined&&pl.team!==null) counts[pl.team]++; });
      const min=Math.min(...counts); if(counts[mine.team]-min<2) return;
      const newest=Object.entries(all).filter(([,pl])=>pl&&pl.name&&pl.team===mine.team).sort((x,y)=>(y[1].at||0)-(x[1].at||0)||(y[0]>x[0]?1:-1))[0][0];
      if(newest!==pid) return;
      const opts=[0,1,2,3].filter(t=>counts[t]===min);
      return room.child("players/"+pid+"/team").set(opts[Math.floor(Math.random()*opts.length)]);
    }).then(()=>{ joining=false; watchMe(); }).catch(()=>{ joining=false; paint(); });
  }
  function leave(){ if(pid) room.child("players/"+pid).remove(); }
  function answer(c){
    if(!state.open||!pid) return;
    my[state.seq]=c; room.child("answers/"+state.seq+"/"+pid).set({c});
    try{ navigator.vibrate&&navigator.vibrate(30);}catch(e){}
    paint();
  }
  function paint(){
    if(joining){
      root.innerHTML=`<div class="wait">${candle}<h1>Uniéndote al ritual…</h1></div>`;
      return;
    }
    if(!pid){
      const prevName=$("#nm",root)?$("#nm",root).value:null;
      root.innerHTML=`<h1>El Culto de la Calabaza</h1><p class="sub">Elige tu nombre para el ritual. Puedes usar el que te sugerimos o escribir el tuyo. El equipo te toca al azar.</p>
        <input class="name" id="nm" type="text" maxlength="30" placeholder="¿Cómo te llamas?" autocomplete="nickname" aria-label="Tu nombre">
        <button class="tbtn" id="dice" style="background:var(--paper);justify-content:center;gap:10px">🎲 Sugerir otro nombre</button>
        <button class="tbtn" id="go" style="background:var(--blood);color:var(--paper);justify-content:center">Unirme</button>
        <p class="note">Sala ${esc(code)} · ${ok?"conectado":"conectando…"}</p>`;
      const nm=$("#nm",root), go=()=>join(nm.value);
      nm.value=prevName!==null?prevName:spookyName();
      nm.addEventListener("focus",()=>nm.select());
      $("#dice",root).onclick=()=>{ nm.value=spookyName(); try{ navigator.vibrate&&navigator.vibrate(15);}catch(e){} };
      $("#go",root).onclick=go; nm.addEventListener("keydown",e=>{ if(e.key==="Enter") go(); });
      return;
    }
    if(!me||me.team===undefined||me.team===null){
      root.innerHTML=`<div class="wait">${candle}<h1>Uniéndote al ritual…</h1></div>`;
      return;
    }
    const team=me.team;
    const head=`<span class="me" style="background:${tcol(team)}">${esc(me.name)} · ${esc(teams[team]||"")}</span>`;
    const mine=my[state.seq];
    if(state.mode!=="q"){
      root.innerHTML=`${head}<div class="wait">${candle}<h1>Esperando al anfitrión…</h1><p class="sub">Eres parte de <b>${esc(teams[team]||"")}</b>. Mira la pantalla grande; aquí aparecerán tus opciones.</p></div>
        <p class="note">${ok?"Conectado":"Reconectando…"}</p><button class="link" id="lv">Salir de la sala</button>`;
    } else {
      const revealed=state.reveal!==undefined&&state.reveal!==null;
      const items=state.kind==="ft"?[["F","Florida"],["T","Tamaulipas"]]:(state.opts||[]).map((o,k)=>[k,o]);
      const L=["A","B","C"];
      root.innerHTML=`${head}<p class="prompt">${esc(state.prompt||"")}</p>
        ${items.map(([c,label])=>{ const cls=state.kind==="ft"?c:L[c]; const picked=mine===c;
          const fade=revealed?(c!==state.reveal):(mine!==undefined&&!picked);
          return `<button class="choice ${cls} ${picked?"pick":""} ${fade?"fade":""}" data-c="${c}" ${state.open?"":"disabled"}>${state.kind==="ft"?"":`<span class="l">${L[c]}</span>`}<span>${esc(label)}</span></button>`; }).join("")}
        ${revealed?(mine===undefined?`<p class="result no">Sin respuesta</p>`:mine===state.reveal?`<p class="result ok">¡Correcto!</p>`:`<p class="result no">Fallaste…</p>`)
          :state.open?`<p class="note">${mine===undefined?"Toca una opción. Tu equipo responde con la opción más votada.":"Voto enviado. Puedes cambiarlo mientras siga abierto."}</p>`:`<p class="note">Tiempo terminado. Mira la pantalla.</p>`}`;
      root.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{ const c=state.kind==="ft"?b.dataset.c:+b.dataset.c; answer(c); });
    }
    const lv=$("#lv",root); if(lv) lv.onclick=()=>{ if(confirm("¿Salir de la sala? Tendrás que volver a escribir tu nombre.")) leave(); };
  }
  paint();
}
NET.init();
if(PLAYER) startPlayer(); else NET.host();
$("#mNet").onclick=()=>openApp("net");
paintNet();

/* ===================== ARRANQUE ===================== */
(function boot(){
  const el=$("#boot"),msg=$("#bootMsg");
  const done=()=>{ el.classList.add("gone"); setTimeout(()=>el.remove(),400); };
  let seen=false; try{ seen=sessionStorage.getItem("calabazaBoot")==="1"; sessionStorage.setItem("calabazaBoot","1"); }catch(e){}
  if(PLAYER||seen||matchMedia("(prefers-reduced-motion:reduce)").matches){ el.remove(); return; }
  const lines=["La congregación se reúne…","Encendiendo las velas…","Trazando el círculo…","Que comience el ritual."];
  let n=0;
  const iv=setInterval(()=>{ n++; if(n<lines.length) msg.textContent=lines[n]; else { clearInterval(iv); setTimeout(done,500); } },800);
  el.addEventListener("click",()=>{ clearInterval(iv); done(); });
})();
