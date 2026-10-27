/** 0.4.2: independent plated silhouettes; all cubes use the private food slot. */
export function fineDiningContents(f,{cube,disc,ring,ellipsoid,garnish}){
  const a=[],put=(...p)=>a.push(cube(...p));
  // Elliptical cross-section facing +X, exposing the filling at a real cut end.
  const cut=(x,y,z,ry,rz,thickness,role,steps=9)=>{
    const pieces=[];disc(pieces,0,0,0,ry,rz,thickness,role,'food',steps);
    for(const c of pieces)a.push({...c,origin:[x+c.origin[1],y+c.origin[0],z+c.origin[2]],size:[c.size[1],c.size[0],c.size[2]]});
  };
  switch(f.shape){
    case 'wellington':{
      const body=[];ellipsoid(body,-.7,1,0,2.8,1.25,1.85,6,'food',5,8);
      for(const c of body){const width=Math.min(c.origin[0]+c.size[0],1.4)-c.origin[0];if(width>0)a.push({...c,size:[width,c.size[1],c.size[2]]});}
      cut(1.42,2.25,0,1.2,1.8,.12,6);cut(1.56,2.25,0,1.02,1.55,.04,8);cut(1.61,2.25,0,.8,1.26,.04,7);
      // One detached slice, with pastry, mushroom duxelles and rosy beef visible.
      cut(2.15,2.1,.4,1.1,1.65,.65,6);cut(2.81,2.1,.4,.94,1.44,.04,8);cut(2.86,2.1,.4,.74,1.15,.04,7);
      for(let i=0;i<4;i++)for(const side of[-1,1])put(-2.3+i*.85,3.25,-.7,.9,.12,1.4,10,'food',[0,side*35,0]);
      disc(a,-.4,1,-2.65,2.7,.5,.07,8,'food',9);garnish(a,1.1,7,5);break;
    }
    case 'lamb_rack':
      for(let i=0;i<3;i++){
        const x=-2.5+i*2.35;ellipsoid(a,x,1,.15,1.2,.7,1.65,6,'food',4,6);
        put(x-.6,2.38,-.8,1.3,.16,1.7,8,'food',[0,-12,0]);
        for(const[y0,z0,y1,z1]of[[2.1,-.6,3.6,-1.05],[3.6,-1.05,4.6,-1.6]]){
          const length=Math.hypot(y1-y0,z1-z0)+.08,cy=(y0+y1)/2,cz=(z0+z1)/2;
          put(x-.17,cy-length/2,cz-.17,.34,length,.34,4,'food',[Math.atan2(z1-z0,y1-y0)*180/Math.PI,0,0]);
        }
        put(x-.32,4.5,-1.85,.65,.35,.45,4,'food',[0,0,0]);
        for(let j=0;j<5;j++)put(x-.9+j*.37,2.58,Math.sin(j*2)*.5,.18,.13,.32,j%2?8:9,'food',[0,j*27,0]);
      }
      for(let i=0;i<3;i++)ellipsoid(a,-1.9+i*1.9,1,2.9,.6,.3,.65,10,'food',2,4);
      garnish(a,1.15,3,5);break;
    case 'risotto':
      disc(a,0,4,0,3.8,3.8,.4,6);ellipsoid(a,0,4.35,0,3.1,.35,3.1,6,'food',3,7);
      for(let i=0;i<20;i++){const t=i*2.4,r=.6+(i%5)*.55;put(Math.sin(t)*r,5.07,Math.cos(t)*r,.18,.12,.42,i%3===0?8:6,'food',[0,i*17,0]);}
      for(const[x,z]of[[-2,-1.2],[1.7,-1],[.2,1.9]]){put(x-.15,4.7,z-.2,.3,.5,.4,8);ellipsoid(a,x,5.1,z,.9,.3,.85,7,'food',2,5);put(x-.45,5.7,z-.07,.9,.035,.14,4);}
      for(let i=0;i<3;i++)put(-1+i*.85,5.3,.1,.6,.1,1.6,8,'food',[0,i*35,-8]);garnish(a,5.55,4,5);break;
    case 'thermidor':
      // Two split halves: red shell outside and pale gratinated filling inside.
      for(const side of[-1,1]){
        const x=side*1.6;ellipsoid(a,x,1,0,1.05,.55,3,6,'food',3,6);ellipsoid(a,x,1.7,0,.8,.24,2.55,7,'food',2,6);
        for(let j=0;j<5;j++){put(x-.75,2.2,-2+j,.8,.055,.35,8,'food',[0,j*13,0]);put(x+.2,2.21,-1.8+j,.25,.04,.16,11);}
        for(let j=0;j<3;j++)put(x-.95,1.2,-1.9+j*1.6,1.9,.16,.16,6,'food',[0,-4,0]);
        ellipsoid(a,side*3.2,1,-2.5,.65,.35,.85,6,'food',2,4);put(side*2.1-.15,1.25,-2.9,.3,.3,1,6,'food',[0,side*40,0]);
        put(x-.6,1.2,2.6,1.2,.18,1,6,'food',[0,side*20,0]);
      }garnish(a,2.3,3,7);break;
    case 'caviar_blini':
      for(const[x,z]of[[-2.3,-1.5],[2.3,-1.5],[0,2.2]]){
        disc(a,x,1,z,1.55,1.45,.45,6,'food',9);disc(a,x,1.46,z,1.2,1.1,.25,7,'food',8);
        for(let j=0;j<9;j++){const t=j*2.4,r=.2+(j%3)*.29;disc(a,x+Math.sin(t)*r,1.73+(j%2)*.07,z+Math.cos(t)*r,.19,.19,.21,8,'food',4);}
        put(x-.3,2.08,z-.6,.12,.1,1.2,9,'food',[0,25,0]);
      }break;
    case 'brulee':
      disc(a,0,4,0,3.7,3.7,.8,6,'food',12);disc(a,0,4.82,0,3.65,3.65,.12,7,'food',12);
      for(let i=0;i<14;i++){const t=i*2.4,r=.4+(i%4)*.75;put(Math.sin(t)*r-.2,4.95,Math.cos(t)*r-.2,.4+(i%2)*.3,.025,.45,8,'food',[0,i*18,0]);}
      for(let i=0;i<3;i++)put(-1.4+i*.7,4.99,-1.6,.045,.025,3.2,10,'food',[0,18+i*21,0]);
      ring(a,0,4.98,0,3.4,3.4,.025,.07,10,'food',16);break;
    case 'truffle_foie':
      disc(a,0,1,0,4.1,2.8,.07,8,'food',12);
      for(const[x,z]of[[-1.8,-.8],[1.6,1]]){
        put(x-1.3,1.1,z-1.2,2.6,.3,2.4,10,'food',[0,-12,0]);ellipsoid(a,x,1.42,z,1.5,.45,1.25,6,'food',3,7);
        for(let j=0;j<3;j++)put(x-1+j*.6,2.34,z-.75,.09,.045,1.5,7,'food',[0,24,0]);
        for(let j=0;j<2;j++)disc(a,x-.5+j*.75,2.42,z-.2+j*.4,.48,.45,.06,8,'food',7);
      }
      ellipsoid(a,-2.9,1,2,.45,.35,.7,7,'food',2,4);garnish(a,1.2,9,5);break;
    default:return undefined;
  }
  return a;
}
