/** 0.4.1 plated restaurant dishes, using the shared 128px UV pipeline. */
export function restaurantContents(f,{cube,disc,ring,ellipsoid,garnish}){
  const a=[],put=(...p)=>a.push(cube(...p)),y=['superior_vegetables','lobster_bisque'].includes(f.shape)?4:1;
  switch(f.shape){
    case 'grouper':
      // A whole fish above a soy-sauce pool, with visible ginger and scallions.
      disc(a,0,1,0,4.5,2.8,.12,8,'food',10);
      ellipsoid(a,-.1,1.15,0,2.75,.78,1.3,6,'food',4,8);
      ellipsoid(a,-3,1.25,0,1,.65,1,6,'food',3,5);
      for(const side of[-1,1]){put(2.5,1.35,side*.35-.25,1.55,.22,1.1,6,'food',[0,side*25,0]);put(-1.5,1.3,side*1.1,1.5,.15,.8,7,'food',[0,side*23,0]);}
      put(-3.7,2.15,.65,.22,.12,.16,5);put(-3.69,2.18,.64,.08,.02,.06,4);
      for(let i=0;i<6;i++)put(-1.9+i*.65,2.64,-.4,.13,.3,.8,6,'food',[0,0,-18]);
      for(let i=0;i<9;i++)put(-1.7+(i%5)*.7,2.85+Math.floor(i/5)*.05,-.75+Math.floor(i/5)*.8,.1,.09,1.25,10,'food',[0,-35+i*11,0]);
      for(let i=0;i<10;i++)put(-2.3+i*.48,3.06,Math.sin(i*1.7)*.7,.22,.14,.35,9,'food',[0,i*31,0]);break;
    case 'tiger_prawns':
      for(let i=0;i<5;i++){
        const x=-3.2+(i%3)*2.8,z=-1.6+Math.floor(i/3)*3.1;
        for(let j=0;j<4;j++){const t=(-65+j*36)*Math.PI/180;ellipsoid(a,x+Math.sin(t)*.65,1.12,z+Math.cos(t)*1.1,.42,.34,.46,j%2?7:6,'food',2,3);}
        ellipsoid(a,x-.85,1,z+.25,.55,.4,.8,6,'food',2,4);put(x-1.2,1.8,z+.4,.12,.1,.12,5);
        for(const side of[-1,1])put(x+.35,1.2,z+.75,.8,.15,.45,6,'food',[0,side*25,0]);
        put(x-1.2,1.35,z+.9,.08,.07,.85,8,'food',[0,-25,0]);
      }garnish(a,1.1,3,5);break;
    case 'cucumber':
      for(let i=0;i<10;i++){
        const x=-3.5+(i%4)*2,z=-2.8+Math.floor(i/4)*2.1,t=(i%3-1)*18;
        put(x,1+(i%2)*.12,z,1.6,.65,1.5,6,'food',[0,t,0]);put(x+.12,1.68+(i%2)*.12,z+.1,1.35,.08,1.3,7,'food',[0,t,0]);
        put(x+.5,1.78+(i%2)*.12,z+.6,.35,.07,.2,4,'food',[0,t,0]);
      }
      for(let i=0;i<7;i++)put(-2.8+i*.9,1.95,Math.sin(i*2)*2,.25,.12,.3,i%2?10:8);break;
    case 'superior_vegetables':
      disc(a,0,y,0,3.8,3.8,.25,8);
      for(let i=0;i<6;i++){
        const t=i*Math.PI/3,x=Math.sin(t)*2.2,z=Math.cos(t)*2.2;
        put(x-.28,y+.28,z-.8,.56,.35,1.9,4,'food',[0,-i*60,0]);
        ellipsoid(a,x,y+.6,z,.8,.28,1.3,6,'food',2,5);
        put(x-.07,y+1.15,z-.7,.14,.06,1.3,7,'food',[0,-i*60,0]);
      }
      for(let i=0;i<5;i++)put(-1.2+i*.6,y+.4,-.6+(i%2)*1.1,.45,.32,.45,i%2?10:8);break;
    case 'tiramisu':
      // Alternating coffee sponge and mascarpone, a cocoa top and plated dust.
      for(let i=0;i<5;i++)put(-2.7,1+i*.48,-2.25,5.4,.49,4.5,i%2?6:7);
      put(-2.7,3.45,-2.25,5.4,.12,4.5,8);
      for(let i=0;i<4;i++)put(-2.1+i*1.15,3.58,-1.6,.75,.09,3.2,7,'food',[0,0,0]);
      for(let i=0;i<10;i++)put(-3.6+(i%5)*1.7,1.03,-3+Math.floor(i/5)*6,.18,.04,.18,8);
      garnish(a,1.1,3,3);break;
    case 'daifuku':
      for(const[x,z]of[[-2,-1.5],[2,-1.5]]){ellipsoid(a,x,1,z,1.6,1.05,1.6,6,'food',5,8);disc(a,x,3.12,z,.65,.65,.035,4,'food',6);}
      // A forward half reveals red-bean filling and a strawberry center.
      {const half=[];ellipsoid(half,0,1,2,1.8,.95,1.45,6,'food',4,8);for(const c of half){const depth=Math.min(c.origin[2]+c.size[2],2.05)-c.origin[2];if(depth>0)a.push({...c,size:[c.size[0],c.size[1],depth]});}}
      for(let i=0;i<4;i++){const w=i===0||i===3?1.8:2.7;put(-w/2,1.25+i*.32,2.07,w,.33,.05,8);}
      for(let i=0;i<4;i++){const w=1-i*.2;put(-w/2,1.35+i*.25,2.14,w,.26,.04,7);}
      for(let i=0;i<5;i++)put(-.35+i*.16,1.6+(i%2)*.25,2.2,.06,.08,.025,10);break;
    case 'mille_feuille':
      for(let i=0;i<3;i++){
        const yy=1+i*1.05;for(let j=0;j<3;j++)put(-3,yy+j*.11,-1.8,6,.09,3.6,j%2?8:6);
        if(i<2){put(-2.8,yy+.36,-1.65,5.6,.68,3.3,7);for(let j=0;j<7;j++)put(-2.6+j*.75,yy+.4,1.62,.35,.5,.12,4);}
      }
      put(-2.8,3.45,-1.6,5.6,.1,3.2,4);
      for(let i=0;i<5;i++)put(-2.2+i,3.57,-1.5,.08,.035,3,8,'food',[0,-12,0]);break;
    case 'lobster_bisque':
      disc(a,0,y,0,3.8,3.8,.35,6);ring(a,0,y+.37,0,1.4,1.15,.06,.12,8,'food',16);
      for(let i=0;i<4;i++){put(-1.8+i*.9,y+.4,-1.9,.8,.5,1.65,7,'food',[0,-12,0]);put(-1.8+i*.9,y+.92,-1.9,.1,.06,1.65,6,'food',[0,-12,0]);}
      put(1.8,y+.3,.7,.8,.4,1.8,6,'food',[0,25,0]);garnish(a,y+.6,7,6);break;
    case 'cordon_bleu':
      for(let i=0;i<4;i++){
        const x=-3+i*1.95,yy=1+i*.08;
        // Radial rings in the cut face, not a solid yellow block.
        disc(a,x,yy,0,.85,1.7,1.2,6,'food',8);disc(a,x,yy+1.21,0,.67,1.4,.035,7,'food',8);
        disc(a,x,yy+1.25,0,.45,1.05,.035,8,'food',7);disc(a,x,yy+1.29,0,.22,.7,.035,10,'food',6);
      }
      disc(a,0,1,-2.65,2.5,.55,.08,7,'food',9);garnish(a,1.15,5,6);break;
    case 'sole':
      disc(a,.6,1,0,3.8,1.9,.12,7,'food',10);
      ellipsoid(a,-.7,1.12,0,3.5,.4,1.5,6,'food',3,10);
      for(let i=0;i<8;i++)put(-3.1+i*.75,1.96,-.85,.08,.04,1.7,8,'food',[0,-18,0]);
      disc(a,2.4,1.3,-2.3,.9,.9,.18,10,'food',8);disc(a,2.4,1.49,-2.3,.65,.65,.05,4,'food',7);
      for(let i=0;i<3;i++)put(-1.8+i*.7,1,2,.3,.32,2.3,9,'food',[0,-20,0]);garnish(a,1.2,4,5);break;
    default:return undefined;
  }
  return a;
}
