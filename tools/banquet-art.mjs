/** 0.4 banquet silhouettes. Helpers share the same UV/material pipeline as 0.3. */
export function banquetContents(f,{cube,disc,ring,ellipsoid,garnish,noodles}){
  const a=[],put=(...p)=>a.push(cube(...p)),bowl=['pear_tremella','pickled_pork','lotus_soup','oden','wagyu','mung_soup'].includes(f.shape),y=bowl?4:1;
  const egg=(x,z,role=4)=>{disc(a,x,y+.4,z,.85,1.1,.36,role,'food',6);disc(a,x,y+.77,z,.35,.45,.08,10,'food',5);};
  switch(f.shape){
    case 'peacock':{
      // Five distinct edible tail sectors; the head and neck face the guest.
      for(let i=0;i<5;i++){
        const t=(-72+i*36)*Math.PI/180,x=Math.sin(t)*3.2,z=-Math.cos(t)*3.1;
        for(let j=0;j<2;j++)put(x*.6-.12,1.05,z*.55-.15,.24,.16,2.4,9,'food',[0,-t*180/Math.PI,0]);
        if(i===0)for(let j=0;j<4;j++)put(x-.6+j*.25,1.2+j*.1,z-1.05,1,.3,2,6,'food',[0,-45,0]);
        if(i===1){disc(a,x,1.1,z,1.2,1.3,.25,7,'food',7);disc(a,x,1.4,z,.7,.7,.3,4,'food',7);for(let j=0;j<3;j++)put(x-.6+j*.4,1.72,z-.5,.14,.12,1,9);}
        if(i===2)for(let j=0;j<4;j++)put(x-1+j*.45,1.15+j*.13,z-.9,.65,.26,1.9,j%2?7:10,'food',[0,12,0]);
        if(i===3)for(let j=0;j<4;j++){put(x-.9+(j%2)*.9,1.15,z-.9+Math.floor(j/2)*.9,.8,.7,.8,6);put(x-.65+(j%2)*.9,1.86,z-.65+Math.floor(j/2)*.9,.16,.025,.24,11);}
        if(i===4)for(let j=0;j<3;j++){const wx=x-.6+j*.55,wz=z-.5+(j%2)*.8;ellipsoid(a,wx,1.1,wz,.35,.32,.55,10,'food',2,3);put(wx-.04,1.72,wz-.4,.08,.05,.8,11);}
      }
      ellipsoid(a,0,1.2,1.7,1.25,.55,1.6,9,'food',3,5);
      put(-.24,1.9,2.4,.48,1.9,.48,9,'food',[12,0,0]);ellipsoid(a,0,3.4,2.7,.5,.4,.55,9,'food',2,4);
      put(-.18,3.65,3.15,.36,.16,.6,10);put(.4,3.95,2.75,.1,.1,.14,5);
      for(let j=0;j<3;j++)put(-.35+j*.3,4.1,2.6,.1,.5,.1,9,'food',[0,0,(j-1)*20]);
      break;
    }
    case 'yellow_beef':
      for(let i=0;i<12;i++)put(-3.4+(i%4)*1.8,1+Math.floor(i/4)*.25,-2.7+Math.floor(i/4)*2,1.8,.45,1.1,6,'food',[0,(i%3-1)*24,0]);
      for(let i=0;i<10;i++)put(-3.6+(i%5)*1.5,1.8,-2.6+Math.floor(i/5)*4,.45,.3,1.6,i%2?7:9,'food',[0,i*22,0]);garnish(a,2.1,1,9);break;
    case 'abalone':
      for(const[x,z]of[[-2.1,-1.6],[2.1,-1.4],[0,2]]){
        disc(a,x,1,z,1.8,1.5,.35,7,'food',8);ring(a,x,1.2,z,1.65,1.35,.4,.2,8,'food',10);ellipsoid(a,x,1.5,z,1.15,.5,.9,6,'food',3,5);
        for(let i=0;i<3;i++)put(x-.7+i*.5,2.51,z-.65,.06,.035,1.3,8,'food',[0,20,0]);put(x-.4,2.56,z-.2,.8,.12,.5,5,'food',[0,-22,0]);
      }garnish(a,1.2,3,5);break;
    case 'sanding_bao':
      for(const[x,z]of[[-2.1,-1.8],[2.1,-1.8]]){ellipsoid(a,x,1,z,1.7,1.1,1.7,6,'food',5,9);for(let j=0;j<7;j++){const t=j*Math.PI*2/7;put(x+Math.sin(t)*.65-.08,2.75,z+Math.cos(t)*.65-.4,.16,.4,.8,7,'food',[0,j*360/7,0]);}}
      disc(a,0,1,2.4,1.8,1.4,1.1,6,'food',8);put(-1.5,1.5,2.1,3,1,.35,4);
      for(let i=0;i<8;i++)put(-1.25+(i%4)*.7,1.6+Math.floor(i/4)*.42,2.49,.5,.35,.2,i%3===0?9:i%2?7:10);break;
    case 'fruit':
      for(let i=0;i<4;i++){put(-3.5+i*.9,1,-2.6,1,.35,3.3,9,'food',[0,-10,0]);put(-3.5+i*.9,1.36,-2.45,1,.5,3,6,'food',[0,-10,0]);put(-3.3+i*.9,1.88,-1.3,.12,.04,.18,5);}
      for(let i=0;i<3;i++){disc(a,1.7+i*.5,1+i*.18,-1.8,1.1,1.1,.17,7,'food',7);disc(a,1.7+i*.5,1.18+i*.18,-1.8,.8,.8,.05,4,'food',6);}
      for(let i=0;i<6;i++)ellipsoid(a,-1.9+(i%3)*1.7,1,1.9+Math.floor(i/3),.65,.45,.65,i%2?8:6,'food',2,4);break;
    case 'pear_tremella':
      disc(a,0,y,0,3.7,3.7,.3,6);ellipsoid(a,0,y+.3,0,1.65,1.1,1.65,7,'food',4,6);put(-.15,y+2.48,-.12,.3,.55,.25,11);
      for(let i=0;i<8;i++){const t=i*Math.PI/4;ring(a,Math.sin(t)*2.5,y+.35,Math.cos(t)*2.5,.55,.5,.3,.25,7,'food',6);}
      for(let i=0;i<4;i++)put(-2+i*1.3,y+.72,2,.35,.2,.35,10);break;
    case 'pickled_pork':
      disc(a,0,y,0,3.8,3.8,.25,7);for(let i=0;i<6;i++){put(-3+(i%3)*2.1,y+.3,-2.5+Math.floor(i/3)*3,1.9,.85,2.2,6);put(-3+(i%3)*2.1,y+.78,-2.51+Math.floor(i/3)*3,1.9,.25,2.24,8);}
      for(let i=0;i<13;i++)put(-3.4+(i%5)*1.4,y+1.3,-2.5+Math.floor(i/5)*2,.7,.15,1,7,'food',[0,i*21,0]);break;
    case 'lotus_soup':
      disc(a,0,y,0,3.8,3.8,.3,6);for(let i=0;i<6;i++){const t=i*Math.PI/3;ellipsoid(a,Math.sin(t)*2.4,y+.35,Math.cos(t)*2.4,.55,.25,.75,7,'food',2,4);}
      for(let i=0;i<8;i++){const t=i*2.4,r=.6+(i%3)*.6;disc(a,Math.sin(t)*r,y+.4,Math.cos(t)*r,.38,.38,.28,8,'food',5);put(Math.sin(t)*r-.07,y+.69,Math.cos(t)*r-.07,.14,.02,.14,10);}break;
    case 'takoyaki':
      for(let i=0;i<6;i++){const x=(i%3)*2.7-2.7,z=Math.floor(i/3)*3.1-1.6;ellipsoid(a,x,1,z,1.2,.9,1.2,6,'food',4,5);disc(a,x,2.65,z,.9,.9,.15,7,'food',6);for(let j=0;j<3;j++)put(x-.65+j*.5,2.83,z-.65,.09,.07,1.3,8);}
      garnish(a,2.95,6,10);break;
    case 'yakisoba':
      disc(a,0,1,0,3.9,3.5,.25,7);noodles(a,1.3,6,4);
      for(let i=0;i<7;i++)put(-3+(i%4)*1.8,2.1,-2+Math.floor(i/4)*3.4,1.5,.25,.7,i%2?7:8,'food',[0,i*22,0]);garnish(a,2.3,4,9);break;
    case 'squid':
      ellipsoid(a,0,1,-1.4,1.8,.65,2.7,6,'food',3,7);
      for(let i=0;i<6;i++)put(-1.65,2.32,-3.3+i*.72,3.3,.07,.14,7,'food',[0,-7,0]);
      for(const side of[-1,1])put(side*1.7-.5,1.2,-3.2,1.2,.25,2.3,7,'food',[0,side*32,0]);
      for(let i=0;i<8;i++){const x=(i-3.5)*.4;put(x,1.1,1,.26,.27,2.5,6,'food',[0,(i-3.5)*13,0]);put(x+(i-3.5)*.25,1.05,3,.24,.23,.9,7,'food',[0,(i-3.5)*22,0]);}
      disc(a,3.1,1,-2.7,.8,.8,.2,10,'food',8);break;
    case 'oden':
      disc(a,0,y,0,3.8,3.8,.25,6);disc(a,-1.8,y+.25,-1,1.15,1.15,.8,7,'food',8);egg(1.6,-1.6);
      put(-2.6,y+.3,1.2,1.5,.9,1.8,8,'food',[0,22,0]);ring(a,.3,y+.3,1.7,.6,.85,.8,.35,10,'food',8);
      for(let j=0;j<3;j++){put(.1+j*.8,y+.35,-2,.7,.7,1.2,7);put(.42+j*.8,y+.1,-3.1,.1,.1,4.8,2);}break;
    case 'dorayaki':
      for(const[x,z]of[[-2,-1.6],[2,-1.3],[0,2.1]]){disc(a,x,1,z,1.75,1.65,.45,6,'food',9);disc(a,x,1.46,z,1.65,1.55,.38,7,'food',9);ellipsoid(a,x,1.84,z,1.8,.3,1.7,6,'food',2,7);disc(a,x,2.45,z,1.2,1.1,.04,10,'food',7);}break;
    case 'wagyu':
      disc(a,0,y,0,3.7,3.7,.5,7);for(let i=0;i<6;i++){put(-3+i,y+.5,-2.4,.9,.4,4.8,6,'food',[0,-9,0]);for(let j=0;j<3;j++)put(-3+i,y+.92,-2+j*1.5,.85,.04,.12,7,'food',[0,-15,0]);}
      egg(-1.6,1.2);garnish(a,y+1.4,3,7);break;
    case 'gunkan':
      for(let i=0;i<4;i++){const x=(i%2)*4-2,z=Math.floor(i/2)*3.6-1.8;disc(a,x,1,z,1.25,1.5,1.25,6,'food',8);disc(a,x,2.26,z,1.02,1.24,.08,7,'food',7);for(let j=0;j<6;j++){const t=j*2.4,r=j%2?.6:.25;disc(a,x+Math.sin(t)*r,2.36,z+Math.cos(t)*r,.24,.24,.25,8,'food',4);}}break;
    case 'red_bean_cake':
      for(let i=0;i<4;i++){const x=(i%2)*3.6-3.1,z=Math.floor(i/2)*3.6-2.6;put(x,1,z,2.6,1.25,2.6,6);put(x,1.58,z,2.6,.16,2.6,7);for(let j=0;j<4;j++)put(x+.4+j*.5,2.26,z+.35,.12,.08,1.9,7);disc(a,x+1.3,2.36,z+1.3,.35,.35,.06,8,'food',6);}break;
    case 'mung_soup':
      disc(a,0,y,0,3.8,3.8,.3,6);for(let i=0;i<24;i++){const t=i*2.4,r=.5+i%5*.65;disc(a,Math.sin(t)*r,y+.32,Math.cos(t)*r,.22,.3,.15,i%3===0?7:6,'food',4);}break;
    case 'clear_spirit':case 'red_wine':case 'cola':
      disc(a,0,.4,0,2.62,2.62,5.7,6,'food',12);disc(a,0,6.11,0,2.62,2.62,.08,7,'food',12);
      ring(a,0,6.2,0,2.48,2.48,.08,.09,8,'food',16);
      if(f.shape==='cola')for(let i=0;i<12;i++){const t=i*2.4,r=.5+(i%3)*.6;disc(a,Math.sin(t)*r,6.3,Math.cos(t)*r,.1+i%2*.04,.1+i%2*.04,.06,8,'food',4);}break;
    default:return undefined;
  }
  return a;
}

export function bottleCubes(prop,{cube,disc,ring}){
  const a=[],m='ware',wine=prop.style==='wine',premium=prop.style==='premium',r=wine?1.7:premium?2.35:2.1,h=wine?7.1:premium?6.8:6;
  disc(a,0,.1,0,r,r,.4,0,m,12);ring(a,0,.5,0,r-.12,r-.12,h-.5,.3,0,m,16);
  // Solid body behind the front label, sloped shoulder, narrow neck and sealed cap.
  disc(a,0,.6,0,r-.27,r-.27,h-.6,0,m,10);
  for(let j=0;j<3;j++)disc(a,0,h+j*.4,0,r-(j+1)*(r-.85)/3,r-(j+1)*(r-.85)/3,.42,0,m,10);
  disc(a,0,h+1.2,0,.8,.8,wine?2.7:1.2,0,m,8);
  ring(a,0,h+1.1,0,.84,.84,.22,.14,premium?3:1,m,12);
  disc(a,0,h+(wine?3.8:2.3),0,.88,.88,.6,premium||wine?3:1,m,10);
  if(premium){ring(a,0,1,0,r,r,.15,.13,3,m,16);ring(a,0,h-.4,0,r,r,.15,.13,3,m,16);}
  a.push(cube(-r*.62,2.1,r-.03,r*1.24,2.8,.08,4,m));
  a.push(cube(-.48,2.8,r+.06,.96,1.1,.06,premium?3:1,m));
  for(let j=0;j<3;j++)a.push(cube(-.65,2.3+j*.28,r+.06,1.3,.07,.06,1,m));
  // Small abstract seal, never a real brand label.
  a.push(cube(-.22,h+.1,r*.65,.44,.85,.08,1,m));
  return a;
}
