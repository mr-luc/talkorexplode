export function createBioLabAssets(THREE){
  const makeMat=(color,metalness=.45,roughness=.45,emissiveIntensity=0)=>new THREE.MeshStandardMaterial({color,metalness,roughness,emissive:color,emissiveIntensity});
  const makeGlass=(color=0xbdeaff,opacity=.42,transmission=.55)=>new THREE.MeshPhysicalMaterial({color,metalness:0,roughness:.06,transmission,transparent:true,opacity,thickness:.28,clearcoat:1,clearcoatRoughness:.08});
  const box=(w,h,d,color,m=.45,r=.45,e=0)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),makeMat(color,m,r,e));mesh.castShadow=mesh.receiveShadow=true;return mesh};
  const cyl=(radius,length,color,e=0,segments=32,m=.25,r=.45)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,segments),makeMat(color,m,r,e));mesh.castShadow=mesh.receiveShadow=true;return mesh};
  const label=(text,w=1.2,h=.35,color='#f6edd7',bg='rgba(0,0,0,.78)',fontSize=46)=>{const canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;const ctx=canvas.getContext('2d');const grad=ctx.createLinearGradient(0,0,0,384);grad.addColorStop(0,bg);grad.addColorStop(1,bg.replace('0.78','0.92'));ctx.fillStyle=grad;ctx.beginPath();if(ctx.roundRect){ctx.roundRect(18,18,732,348,24)}else{ctx.rect(18,18,732,348)}ctx.fill();ctx.strokeStyle='rgba(216,182,90,.8)';ctx.lineWidth=5;ctx.stroke();ctx.fillStyle=color;ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=8;ctx.font='900 '+fontSize+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';text.split('\n').forEach((line,i,arr)=>ctx.fillText(line,384,192+(i-(arr.length-1)/2)*fontSize*1.02));const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);mesh.renderOrder=20;return mesh};
  const screw=()=>{const s=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.04,18),makeMat(0xd8bf83,.96,.18));s.rotation.x=Math.PI/2;return s};
  const connector=(len=.18)=>{const g=new THREE.Group();const body=cyl(.12,len,0xc9b89f,0,32,.88,.22);body.rotation.x=Math.PI/2;g.add(body);const ring1=cyl(.14,.03,0x6c6255,0,24,.65,.28);ring1.rotation.x=Math.PI/2;ring1.position.z=-len/2+.03;g.add(ring1);const ring2=ring1.clone();ring2.position.z=len/2-.03;g.add(ring2);return g};
  const knob=(color=0x5b4a39)=>{const g=new THREE.Group();const base=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.12,28),makeMat(color,.68,.28));base.rotation.x=Math.PI/2;g.add(base);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.10,.10,.05,24),makeMat(0x201b18,.55,.45));cap.rotation.x=Math.PI/2;cap.position.y=.04;g.add(cap);const handle=box(.26,.08,.06,0xd8bf83,.9,.2);handle.position.y=.12;g.add(handle);return g};
  const panelButton=(w=.36,h=.2,d=.3,color=0x4d3d2d)=>{const b=box(w,h,d,color,.55,.35);const lip=box(w+.04,.03,d+.04,0xa18454,.86,.22);lip.position.y=h/2+.015;b.add(lip);return b};
  const metallicFrame=(w,h,d)=>{const f=box(w,h,d,0x8a775d,.9,.2);return f};

  function moduleBase(title,number){
    const g=new THREE.Group();
    const plate=box(2.8,.26,2.38,0x25201b,.7,.3);plate.position.y=.04;g.add(plate);
    const lip=metallicFrame(2.88,.06,2.46);lip.position.y=.18;g.add(lip);
    const panel=box(2.62,.08,2.20,0x131212,.35,.72);panel.position.y=.24;g.add(panel);
    const titlePlate=label(number+'  '+title,2.55,.46,'#f5d46d','rgba(40,24,8,.98)',54);titlePlate.position.set(0,.48,-.82);g.add(titlePlate);
    const edgeGlow=box(2.54,.01,2.12,0x22221f,.2,.95,.08);edgeGlow.position.y=.29;g.add(edgeGlow);
    for(const sx of[-1.24,1.24])for(const sz of[-1,1]){const sc=screw();sc.position.set(sx,.18,sz);g.add(sc)}
    return g;
  }

  function pipeCurve(points,color,glow=.18,r=.045){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mat=makeMat(color,.22,.36,glow);const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,64,r,14,false),mat);tube.castShadow=tube.receiveShadow=true;return tube}

  function wateringModule(){
    const g=moduleBase('BEWÄSSERUNG','1');
    const manifold=box(2.1,.14,.26,0x726350,.78,.24);manifold.position.set(0,.36,-.2);g.add(manifold);
    const plate=label('FLOW CONTROL',1.2,.16,'#fff2cc','rgba(0,0,0,.55)',26);plate.position.set(0,.62,-.2);g.add(plate);
    const colors=[0xd81b1b,0xfdd835,0x1e88e5,0x43a047];
    colors.forEach((c,i)=>{
      const x=-.9+i*.6;
      const pipe=cyl(.075,1.48,c,.18,32,.25,.32);pipe.rotation.x=Math.PI/2;pipe.position.set(x,.38,.22);pipe.userData={module:'watering',part:'pipe'};g.add(pipe);
      const c1=connector(.16);c1.position.set(x,.38,-.55);g.add(c1);
      const c2=connector(.16);c2.position.set(x,.38,.98);g.add(c2);
      const valve=knob(0xa84034);valve.position.set(x,.57,-.46);valve.userData={module:'watering',part:'valve'};g.add(valve);
      const flow=label(String(i+1),.18,.14,'#fff2cc','rgba(0,0,0,.55)',40);flow.position.set(x,.72,.7);g.add(flow);
    });
    const inlet=box(.46,.18,.46,0x2c2620,.55,.35);inlet.position.set(0,.24,.92);g.add(inlet);
    const inTag=label('MAIN',.42,.14,'#bff4ff','rgba(10,40,55,.85)',30);inTag.position.set(0,.41,.92);g.add(inTag);
    return g;
  }

  function greenhouseModule(){
    const g=moduleBase('GEWÄCHSHAUS','2');
    const glassMat=makeGlass();
    const house=new THREE.Group();
    const floor=box(1.55,.08,.8,0x4c3b28,.2,.6);house.add(floor);
    const back=new THREE.Mesh(new THREE.BoxGeometry(1.55,.72,.04),glassMat);back.castShadow=back.receiveShadow=true;back.position.set(0,.42,-.42);house.add(back);
    const left=new THREE.Mesh(new THREE.BoxGeometry(.04,.72,.8),glassMat);left.castShadow=left.receiveShadow=true;left.position.set(-.78,.42,0);house.add(left);
    const right=left.clone();right.position.x=.78;house.add(right);
    const roof1=new THREE.Mesh(new THREE.BoxGeometry(.9,.04,.85),glassMat);roof1.castShadow=roof1.receiveShadow=true;roof1.position.set(-.34,.83,0);roof1.rotation.z=.45;house.add(roof1);
    const roof2=roof1.clone();roof2.position.x=.34;roof2.rotation.z=-.45;house.add(roof2);
    [[0,.42,-.42,1.56,.05,.05],[0,.42,.40,1.56,.05,.05],[-.76,.42,0,.05,.72,.82],[.76,.42,0,.05,.72,.82],[0,.78,0,1.25,.05,.05]].forEach(v=>{const fr=box(v[3],v[4],v[5],0x8d7e63,.88,.18);fr.position.set(v[0],v[1],v[2]);house.add(fr)});
    for(let i=0;i<5;i++){const stem=cyl(.025,.38,0x3fa348,.06,12,.1,.58);stem.position.set(-.55+i*.28,.23,-.05+Math.random()*.22);house.add(stem);const leaf=new THREE.Mesh(new THREE.SphereGeometry(.08,12,12),makeMat(0x65c95d,.1,.55,.06));leaf.scale.set(1.3,.55,.8);leaf.position.set(stem.position.x,.45,stem.position.z);house.add(leaf)}
    const sensorBar=box(1.46,.06,.12,0x2d2d2d,.45,.5);sensorBar.position.set(0,.78,.32);house.add(sensorBar);
    [-.45,0,.45].forEach((x,i)=>{const led=new THREE.Mesh(new THREE.SphereGeometry(.04,10,10),makeMat([0x62ff70,0x5fc4ff,0xffda55][i],.2,.25,1.35));led.position.set(x,.83,.36);house.add(led)});
    house.position.set(-.34,.28,-.12);g.add(house);
    const data=label('TEMP 22.4°C\nFEUCHTE 68%\nLICHT 76%',1.0,1.1,'#9cff8c','rgba(8,35,8,.84)',40);data.position.set(.92,.62,.05);g.add(data);
    ['🌡️','💧','☀️'].forEach((s,i)=>{const b=panelButton(.42,.2,.36,0x4c2c22);b.position.set(-.55+i*.55,.22,.82);b.userData={module:'greenhouse',part:s};g.add(b);const icon=label(s,.34,.28,'#f2cf74','rgba(0,0,0,0)',86);icon.position.set(b.position.x,.44,b.position.z);g.add(icon)});
    return g;
  }

  function growthModule(){
    const g=moduleBase('WACHSTUM','3');
    const screenFrame=metallicFrame(2.0,.12,.95);screenFrame.position.set(0,.46,-.18);g.add(screenFrame);
    const screen=label('🌱  🍄  📏\n7    3    9',1.86,.78,'#c7ff9f','rgba(37,73,25,.84)',58);screen.position.set(0,.58,-.18);g.add(screen);
    ['Keim','Wurzel','Blatt','Licht'].forEach((v,i)=>{const b=panelButton(.53,.2,.34,0x4d3d2d);b.position.set(-.82+i*.55,.22,.72);b.userData={module:'growth',part:v};g.add(b);const t=label(v,.48,.22,'#f6edd7','rgba(0,0,0,0)',38);t.position.set(b.position.x,.44,b.position.z);g.add(t)});
    const leftDial=knob(0x536742);leftDial.position.set(-1.0,.48,.0);g.add(leftDial);
    const rightDial=knob(0x536742);rightDial.position.set(1.0,.48,.0);g.add(rightDial);
    return g;
  }

  function nutrientsModule(){
    const g=moduleBase('NÄHRSTOFFE','4');
    const rack=box(2.2,.16,.6,0x37312c,.75,.26);rack.position.set(0,.3,.08);g.add(rack);
    ['N','P','K','Mg'].forEach((n,i)=>{
      const x=-.78+i*.52;
      const tube=cyl(.14,.9,[0x42c6a2,0xd5d851,0xff982e,0x8a57d9][i],.12,28,.18,.18);tube.rotation.z=Math.PI/2;tube.position.set(x,.44,.08);g.add(tube);
      const cap1=cyl(.16,.08,0x1b1714,0,28,.45,.44);cap1.rotation.z=Math.PI/2;cap1.position.set(x-.48,.44,.08);g.add(cap1);
      const cap2=cap1.clone();cap2.position.x=x+.48;g.add(cap2);
      const tag=label(n,.34,.26,'#f5d46d','rgba(0,0,0,0)',68);tag.position.set(x,.74,.08);g.add(tag);
      const mix=knob(0x4d3d2d);mix.position.set(x,.24,.88);mix.scale.set(.7,.7,.7);g.add(mix);
    });
    const mixLabel=label('MIX',.5,.16,'#fff2cc','rgba(0,0,0,.55)',30);mixLabel.position.set(0,.45,.9);g.add(mixLabel);
    return g;
  }

  function tankModule(){
    const g=moduleBase('TANKSYSTEM','5');
    const glass=makeGlass(0x9be5ff,.52,.5);
    const tank=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,1.3,48),glass);tank.rotation.z=Math.PI/2;tank.position.set(0,.42,.05);tank.castShadow=tank.receiveShadow=true;g.add(tank);
    const water=cyl(.42,.76,0x1aa6d9,.25,48,.12,.18);water.rotation.z=Math.PI/2;water.position.set(-.1,.42,.05);g.add(water);
    const endCap1=cyl(.48,.06,0x7e6d58,0,32,.85,.2);endCap1.rotation.z=Math.PI/2;endCap1.position.set(-.67,.42,.05);g.add(endCap1);
    const endCap2=endCap1.clone();endCap2.position.x=.67;g.add(endCap2);
    const inPort=connector(.16);inPort.rotation.y=Math.PI/2;inPort.position.set(-.78,.42,.45);g.add(inPort);
    const outPort=connector(.16);outPort.rotation.y=Math.PI/2;outPort.position.set(.78,.42,.45);g.add(outPort);
    const topPort=connector(.12);topPort.position.set(0,.88,.05);g.add(topPort);
    for(let i=0;i<5;i++){const mark=box(.05,.03,.16,0xf6edd7,.1,.4);mark.position.set(.55,.25+i*.14,.48);g.add(mark)}
    const gaugeRing=new THREE.Mesh(new THREE.TorusGeometry(.22,.025,8,36),makeMat(0xd8bf83,.88,.18));gaugeRing.position.set(.96,.3,.72);gaugeRing.rotation.x=Math.PI/2;g.add(gaugeRing);
    const needle=box(.18,.02,.03,0xff6b5b,.4,.35);needle.position.set(1.0,.3,.72);needle.rotation.y=.6;g.add(needle);
    const tankLabel=label('TANK 72%',1.0,.28,'#bff4ff','rgba(10,40,55,.82)',42);tankLabel.position.set(0,.78,.72);g.add(tankLabel);
    const io=label('IN       OUT',1.1,.16,'#fff2cc','rgba(0,0,0,.55)',24);io.position.set(0,.18,.72);g.add(io);
    return g;
  }

  function animalModule(){
    const g=moduleBase('TIERE','6');
    ['🪲','🐌','🐟','🐦','🐇','🐸'].forEach((e,i)=>{const bx=-.78+(i%3)*.78,bz=-.18+Math.floor(i/3)*.62;const b=panelButton(.62,.22,.48,0x2b241c);b.position.set(bx,.35,bz);b.userData={module:'animal',part:e};g.add(b);const icon=label(e,.52,.4,'#f2cf74','rgba(0,0,0,0)',90);icon.position.set(bx,.58,bz);g.add(icon)});
    const strip=label('WIRBELLOS  /  WIRBELTIER',1.8,.18,'#fff2cc','rgba(0,0,0,.55)',28);strip.position.set(0,.24,.95);g.add(strip);
    return g;
  }

  return {box,cyl,label,moduleBase,pipeCurve,wateringModule,greenhouseModule,growthModule,nutrientsModule,tankModule,animalModule,makeMat};
}
