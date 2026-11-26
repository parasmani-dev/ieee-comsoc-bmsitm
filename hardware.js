/* The same projected board is used for the signal explorer and its introduction. */
function renderRadio(canvas, mode = "tx", progress = 1, miniature = false) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = 580, h = 330;
  ctx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const point = (x, y, z = 0) => [290 + (x - y) * 1.22, 184 + (x + y) * .55 - z];
  function line(points, color, width = 1) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }
  function face(points, fill, stroke) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = .8; ctx.stroke(); }
  }
  function block(x, y, sx, sy, z, height, palette) {
    const a = point(x, y, z + height), b = point(x + sx, y, z + height);
    const c = point(x + sx, y + sy, z + height), d = point(x, y + sy, z + height);
    face([b, point(x + sx, y, z), point(x + sx, y + sy, z), c], palette[1]);
    face([d, c, point(x + sx, y + sy, z), point(x, y + sy, z)], palette[2]);
    face([a,b,c,d],palette[0],palette[3]);
  }
  function dot(x,y,r,color) {
    ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fillStyle=color;ctx.fill();
  }
  const board = [[-107,-78],[-101,-84],[99,-84],[108,-75],[108,72],[100,80],[-100,80],[-107,73]];
  const corners = z => board.map(([x,y]) => point(x,y,z));
  face(corners(-11),"#071b27");
  const top = corners(0), bottom = corners(-8);
  for (let k=0;k<board.length;k++) {
    const n=(k+1)%board.length;face([top[k],top[n],bottom[n],bottom[k]],"#104459","#518798");
  }
  const surface=ctx.createLinearGradient(140,90,444,279);
  surface.addColorStop(0,"#186676");surface.addColorStop(.6,"#125061");surface.addColorStop(1,"#153d50");
  face(top,surface,"#8bc0c4");
  function trace(coords, color, width=1) { line(coords.map(([x,y])=>point(x,y,1)),color,width); }
  // Fan out from the pin banks. Chamfered corners match PCB trace geometry.
  for(let i=0;i<16;i++) {
    const offset=-31+i*4;
    for(const sign of [-1,1]){
      const x=sign*(56+(i%6)*4), y=offset+(i<8?-11:11);
      trace([[sign*36,offset],[x,offset],[x+sign*11,y],[sign*100,y]], i%4===0?"#8fbfc0":"#478e99",i%4===0?1.2:.65);
      trace([[offset,sign*36],[offset,sign*(42+i%4*3)],[offset+(i<8?-10:10),sign*(52+i%4*3)],[offset+(i<8?-10:10),sign*73]],"#538f99",.7);
    }
  }
  for(const x of [-96,96]) for(const y of [-68,66]) {
    const [px,py]=point(x,y,1);ctx.beginPath();ctx.ellipse(px,py,6.5,3.3,0,0,Math.PI*2);ctx.fillStyle="#a3bfc0";ctx.fill();
    ctx.beginPath();ctx.ellipse(px,py,3.9,1.9,0,0,Math.PI*2);ctx.fillStyle="#082737";ctx.fill();
  }
  const metal=["#bdc8be","#647d80","#829191","#d0dfd9"];
  const ceramic=["#bba077","#715f52","#8d7966","#d4c3a3"];
  function passive(x,y) {
    block(x,y,9,4,1,2,ceramic);
    for(const f of [0,7]) block(x+f,y,2,4,1,2.2,metal);
  }
  for (const x of [-83,-68,59,74]) for(const y of [-48,-40,39,47]) passive(x,y);
  for(const x of [-30,-17,5,19,32]) passive(x,-65);
  block(-87,-15,16,23,1,4,["#223c47","#0c2832","#122d38","#7c989d"]);
  block(61,2,19,21,1,4,["#314750","#122b36","#1d3340","#92a4aa"]);
  for(let i=0;i<14;i++) {
    const n=-28+i*4.3;
    for(const side of [-1,1]){
      block(n,side*35-3,2.4,6.4,1,3,metal);
      block(side*35-3,n,6.4,2.4,1,3,metal);
    }
  }
  block(-34,-34,68,68,3,10,["#163341","#071d28","#0d2731","#89adb0"]);
  block(-29,-29,58,58,13,1,["#294351","#132c35","#1b3440","#65808b"]);
  ctx.save();const [cx,cy]=point(-21,-9,16);
  ctx.transform(1.22,.55,-.68,.72,cx,cy);
  ctx.fillStyle="#dce5e7";ctx.font="bold 11px monospace";ctx.fillText("RF",0,0);
  ctx.fillStyle="#b0c5ca";ctx.font="5px monospace";ctx.fillText("TRANSCEIVER",0,9);ctx.restore();
  const pin1=point(-25,24,15);dot(...pin1,1.7,"#bacece");
  // Pin headers and the RF connector sit along opposite edges.
  for(let i=0;i<9;i++) {
    const x=-84+i*5.4;block(x,67,4.5,8,0,4,["#23333c","#071d28","#192e35"]);
    block(x+1,69,1.7,3,4,5,metal);
  }
  const brass=["#dab477","#93774f","#ad8d60","#f0d49d"];
  block(85,-31,20,19,1,8,metal);block(99,-30,17,17,5,9,brass);
  block(111,-28,12,13,6,7,brass);
  for(let i=0;i<5;i++)line([point(111+i*2,-28,13),point(111+i*2,-15,13)],"#876b4e",.8);
  const signal=[[-100,11],[-62,11],[-49,-2],[-37,-2],[37,-5],[61,-5],[76,-20],[98,-20]];
  const tone = mode === "tx" ? "#77f5e9" : "#a8d4ff";
  trace(signal.slice(0,4),tone,2);trace(signal.slice(4),tone,2);
  let route=mode==="tx"?signal:[...signal].reverse();
  const phase=Math.min(6.999,progress*7), s=Math.floor(phase), f=phase-s;
  if(s!==3){const a=route[s],b=route[s+1];const pos=point(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,3);dot(...pos,3.2,"#fff");}
  if(miniature)return;
  function callout(anchor, points, label, align="left"){
    const first=point(...anchor);line([first,...points],"#79a7b4",.85);dot(...first,2.2,"#cef0ee");
    const [x,y]=points.at(-1);ctx.font="600 11px monospace";ctx.textAlign=align;ctx.fillStyle="#c6dde2";ctx.fillText(label,x,y-6);ctx.textAlign="left";
  }
  callout([0,-18,15],[[340,79],[374,79]],"RF IC");
  callout([-86,10,1],[[126,103],[37,103]],"BASEBAND I/O");
  callout([113,-21,10],[[486,178],[543,178]],"RF PORT","right");
  const [mx,my]=point(-58,67,5);line([[mx,my],[mx-26,my+27],[80,my+27]],"#547d89",.7);
}
function drawEditorialArt() {
  const cover=document.querySelector("#print"), paper=cover.getContext("2d");
  if(paper) {
    paper.clearRect(0,0,cover.width,cover.height);
    for(let i=0;i<42;i++){
      paper.beginPath();
      for(let j=0;j<=220;j++){
        const a=j/220*Math.PI*2, r=55+i*2.65+Math.sin(3*a+i*.047)*23+Math.cos(2*a-i*.062)*17;
        const x=260+Math.cos(a)*r*1.19, y=236+Math.sin(a)*r*.96+Math.cos(a)*38;
        if(j===0)paper.moveTo(x,y);else paper.lineTo(x,y);
      }
      paper.strokeStyle="#075266";paper.lineWidth=2;paper.stroke();
    }
  }
  const wave=document.querySelector("#audio"), ctx=wave.getContext("2d");
  if(ctx) for(let x=1;x<wave.width;x+=5){
    const envelope=Math.pow(Math.sin(x/650*Math.PI*3),2)*.66+.18;
    const amp=(Math.abs(Math.sin(x*.26)+Math.cos(x*.123))*.45+.13)*65*envelope;
    ctx.fillStyle=x%3?"#70ced0":"#a6e9e1";ctx.fillRect(x,75-amp,2.3,amp*2);
  }
}
const previewBoard=document.querySelector("#board");
let flight=0;
function showMode(mode, animate) {
  cancelAnimationFrame(flight);
  document.querySelectorAll("[data-mode]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.mode===mode)));
  document.querySelector("#signal-path").textContent=mode==="tx"?"Baseband → RF → Antenna":"Antenna → RF → Baseband";
  const start=performance.now();
  function draw(now) {
    const progress=animate?Math.min(1,(now-start)/750):1;
    renderRadio(previewBoard,mode,progress);
    if(progress<1)flight=requestAnimationFrame(draw);
  }
  draw(start);
}
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)");
document.querySelectorAll("[data-mode]").forEach(button=>button.addEventListener("click",()=>showMode(button.dataset.mode,!reducedMotion.matches)));
showMode("tx",false);drawEditorialArt();
if(!reducedMotion.matches && !location.hash) {
  const loader=document.querySelector("#loader");
  renderRadio(loader.querySelector("canvas"),"tx",1,true);
  loader.hidden=false;
  setTimeout(()=>{loader.hidden=true;},760);
}
