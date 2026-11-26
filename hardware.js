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
drawEditorialArt();
