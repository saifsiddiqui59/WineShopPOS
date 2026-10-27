
// Dependency-free, GPU-rendered 3D mesh scene: not SVG billboards.
const BRANDS = [
  ["SULA","wine",[.12,.21,.17],[.83,.64,.42]],
  ["FRATELLI","wine",[.16,.11,.16],[.77,.57,.34]],
  ["JACOB'S CREEK","wine",[.15,.20,.12],[.82,.65,.49]],
  ["ROSE","wine",[.52,.28,.29],[.80,.65,.53]],
  ["RESERVE","wine",[.18,.09,.13],[.81,.68,.43]],
  ["KINGFISHER","beer",[.37,.24,.09],[.88,.72,.31]],
  ["HEINEKEN","beer",[.06,.28,.13],[.78,.81,.65]],
  ["CORONA","beer",[.51,.39,.16],[.84,.70,.50]],
  ["BIRA 91","can",[.50,.21,.14],[.80,.67,.48]],
  ["BUDWEISER","can",[.46,.09,.11],[.89,.74,.54]],
];

const VERT=`#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec2 aUv;
uniform mat4 uVP;
uniform mat4 uModel;
out vec3 vNormal;
out vec3 vWorld;
out vec2 vUv;
void main() {
  vec4 world=uModel*vec4(aPos,1.);
  vWorld=world.xyz;
  vNormal=mat3(uModel)*aNormal;
  vUv=aUv;
  gl_Position=uVP*world;
}`;

const FRAG=`#version 300 es
precision highp float;
in vec3 vNormal;
in vec3 vWorld;
in vec2 vUv;
uniform vec3 uBody;
uniform vec3 uFoil;
uniform sampler2D uLabel;
uniform int uCan;
out vec4 fragColor;
void main() {
  vec3 N=normalize(vNormal);
  vec3 V=normalize(vec3(0.,0.,8.)-vWorld);
  vec3 L=normalize(vec3(-.45,.73,.68));
  vec3 L2=normalize(vec3(.64,-.12,.57));
  float lit=max(dot(N,L),0.);
  float fill=max(dot(N,L2),0.);
  float edge=pow(1.-max(dot(N,V),0.),2.2);
  float shine=pow(max(dot(reflect(-L,N),V),0.),56.);
  float shine2=pow(max(dot(reflect(-L2,N),V),0.),112.);
  vec3 glass=uBody*(.29+.72*lit+.25*fill) + edge*vec3(.43,.36,.26)
    + shine*vec3(1.,.84,.6)*1.15 + shine2*vec3(.8,.92,1.)*.7;
  float cap=smoothstep(.83,.86,vUv.y);
  glass=mix(glass,uFoil*(.38+.75*lit)+shine*vec3(1.,.92,.77),cap);
  float front=smoothstep(.04,.10,vUv.x)*(1.-smoothstep(.41,.49,vUv.x));
  float vertical=smoothstep(.33,.36,vUv.y)*(1.-smoothstep(.64,.67,vUv.y));
  vec2 tUv=vec2((vUv.x-.045)/.45,(vUv.y-.33)/.34);
  vec3 label=texture(uLabel,clamp(tUv,0.,1.)).rgb;
  glass=mix(glass,label*(.76+.26*lit)+shine*.08,front*vertical*.97);
  if(uCan==1) glass+=vec3(.15,.12,.08)*shine;
  fragColor=vec4(pow(max(glass,vec3(.015)),vec3(.92)),1.);
}`;

function makeShader(gl,type,source) {
  const o=gl.createShader(type);
  gl.shaderSource(o,source);gl.compileShader(o);
  if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(o));
  return o;
}
function makeProgram(gl) {
  const p=gl.createProgram(),a=makeShader(gl,gl.VERTEX_SHADER,VERT),b=makeShader(gl,gl.FRAGMENT_SHADER,FRAG);
  gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);
  gl.deleteShader(a);gl.deleteShader(b);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(p));
  return p;
}
const SHAPES={
  wine:[[-1.1,0],[-1.08,.32],[-.99,.37],[-.68,.37],[.21,.35],[.40,.29],[.60,.17],[.70,.14],[.97,.14],[1.05,.166],[1.08,.16],[1.10,0]],
  beer:[[-1.09,0],[-1.07,.27],[-1.00,.32],[-.72,.33],[.29,.32],[.45,.27],[.61,.14],[.97,.14],[1.04,.17],[1.09,0]],
  can:[[-.98,0],[-.96,.31],[-.91,.35],[-.81,.353],[.83,.353],[.92,.35],[.97,.30],[.98,0]],
};
function makeMesh(gl,profile){
  const segments=32,vertices=[],indices=[];
  for(let j=0;j<profile.length;j++){
    const [y,r]=profile[j],p=profile[Math.max(0,j-1)],n=profile[Math.min(profile.length-1,j+1)];
    const slope=(n[1]-p[1])/Math.max(.001,n[0]-p[0]),mag=Math.hypot(1,slope);
    for(let i=0;i<=segments;i++){
      const a=i*Math.PI*2/segments,c=Math.cos(a),s=Math.sin(a);
      vertices.push(r*c,y,r*s,c/mag,-slope/mag,s/mag,i/segments,(y+1.12)/2.24);
      if(j<profile.length-1&&i<segments){
        const t=j*(segments+1)+i,b=t+segments+1;
        indices.push(t,b,t+1,t+1,b,b+1);
      }
    }
  }
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const vertex=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vertex);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  for(const [attr,len,off] of [[0,3,0],[1,3,12],[2,2,24]]){
    gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,len,gl.FLOAT,false,32,off);
  }
  const index=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return {vao,vertex,index,count:indices.length};
}
function labelTexture(gl,brand) {
  const canvas=document.createElement("canvas");canvas.width=384;canvas.height=192;
  const c=canvas.getContext("2d"),g=c.createLinearGradient(0,0,384,0);
  g.addColorStop(0,"#9a784e");g.addColorStop(.17,"#f1dcb6");
  g.addColorStop(.52,"#fff7e5");g.addColorStop(.85,"#d5b988");g.addColorStop(1,"#866440");
  c.fillStyle=g;c.fillRect(0,0,384,192);
  c.strokeStyle="#926c43";c.lineWidth=6;c.strokeRect(8,8,368,176);
  c.strokeStyle="#d2aa69";c.lineWidth=2;c.strokeRect(18,17,348,158);
  c.textAlign="center";c.fillStyle="#664626";
  c.font="bold 18px Georgia,serif";c.fillText("SELECTED COLLECTION",192,49);
  c.fillStyle="#241716";
  c.font=brand[0].length>11?"bold 27px Georgia,serif":"bold 39px Georgia,serif";
  c.fillText(brand[0],192,111,340);
  c.font="19px Georgia,serif";c.fillText(brand[1]==="wine"?"FINE WINE":"PREMIUM BEER",192,148);
  const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
  return tex;
}
function perspective(aspect) {
  const m=new Float32Array(16),v=new Float32Array(16),out=new Float32Array(16);
  const f=1/Math.tan(.5*58*Math.PI/180),n=.1,far=70;
  m[0]=f/aspect;m[5]=f;m[10]=(far+n)/(n-far);m[11]=-1;m[14]=2*far*n/(n-far);
  v[0]=v[5]=v[10]=v[15]=1;v[14]=-8;
  for(let col=0;col<4;col++)for(let row=0;row<4;row++)
    for(let k=0;k<4;k++)out[col*4+row]+=m[k*4+row]*v[col*4+k];
  return out;
}
function model(x,y,z,s,ry,rz) {
  const cy=Math.cos(ry),sy=Math.sin(ry),cz=Math.cos(rz),sz=Math.sin(rz);
  return new Float32Array([
    cz*cy*s,sz*cy*s,-sy*s,0,
    -sz*s,cz*s,0,0,
    cz*sy*s,sz*sy*s,cy*s,0,
    x,y,z,1
  ]);
}
export function mountBottleVortex(canvas) {
  let gl;
  try{gl=canvas.getContext("webgl2",{alpha:true,depth:true,antialias:true,powerPreference:"low-power"});}
  catch{gl=null;}
  if(!gl){canvas.dataset.rendererStatus="unsupported";return()=>{};}
  let p,meshes,labels,un;
  try{
    p=makeProgram(gl);gl.useProgram(p);
    meshes=Object.fromEntries(Object.entries(SHAPES).map(([k,v])=>[k,makeMesh(gl,v)]));
    labels=BRANDS.map(b=>labelTexture(gl,b));
    un=Object.fromEntries(["uVP","uModel","uBody","uFoil","uLabel","uCan"].map(k=>[k,gl.getUniformLocation(p,k)]));
    gl.uniform1i(un.uLabel,0);
    gl.enable(gl.DEPTH_TEST);
    canvas.dataset.rendererStatus="ready";
  }catch(e){canvas.dataset.rendererStatus="failed";console.warn("3D bottles fallback:",e.message);return()=>{};}
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const products=Array.from({length:32},(_,i)=>({
    index:i,brandIndex:(i*7+Math.floor(i/10))%BRANDS.length,
    phase:i*2.399963+Math.sin(i*1.7)*.21,
    radius:2.5+(i%5)*.38,layer:i%4
  }));
  let frame=0,last=0,disposed=false,id=0,start=performance.now();
  function resize(){
    const r=canvas.getBoundingClientRect();
    const small=r.width<700,dpr=Math.min(window.devicePixelRatio||1,small?1.1:1.35);
    const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));
    if(w!==canvas.width||h!==canvas.height){canvas.width=w;canvas.height=h;}
    gl.viewport(0,0,w,h);gl.useProgram(p);
    gl.uniformMatrix4fv(un.uVP,false,perspective(w/h));
    return small?18:32;
  }
  let count=resize();
  canvas.dataset.bottleCount=String(count);
  canvas.dataset.brandCount=String(BRANDS.length);
  function draw(t){
    if(disposed||gl.isContextLost())return;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const scene=[];
    for(let i=0;i<count;i++){
      const ob=products[i],a=ob.phase+t*.38+(i%3)*.13;
      const x=Math.cos(a)*ob.radius*1.29;
      const y=Math.sin(a*.93+.28)*ob.radius*.69;
      const z=Math.sin(a)*3.2-1.6+(ob.layer-1.5)*.39;
      const brand=BRANDS[ob.brandIndex],scale=(brand[1]==="can"?.76:.88)*(i%6===0?1.19:.91)*(1+(z+4)*.025);
      scene.push({ob,brand,x,y,z,scale,ry:-a*.7+.25*Math.sin(t*.7+i),rz:.12*Math.sin(t*.9+ob.phase)});
    }
    scene.sort((a,b)=>a.z-b.z);
    for(const o of scene){
      const type=o.brand[1],m=meshes[type];
      gl.bindVertexArray(m.vao);
      gl.uniformMatrix4fv(un.uModel,false,model(o.x,o.y,o.z,o.scale,o.ry,o.rz));
      gl.uniform3fv(un.uBody,o.brand[2]);gl.uniform3fv(un.uFoil,o.brand[3]);
      gl.uniform1i(un.uCan,type==="can"?1:0);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,labels[o.ob.brandIndex]);
      gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0);
    }
    gl.bindVertexArray(null);canvas.dataset.renderedFrames=String(++frame);
  }
  const onResize=()=>{if(!disposed){count=resize();canvas.dataset.bottleCount=String(count);draw(reduced.matches?3:(performance.now()-start)/1000);}};
  const onVisibility=()=>{if(!document.hidden&&reduced.matches)draw(3);};
  const onMotion=()=>{draw(3);};
  function tick(time){
    if(disposed)return;
    if(!document.hidden&&!reduced.matches&&time-last>=24){last=time;draw((time-start)/1000);}
    id=requestAnimationFrame(tick);
  }
  window.addEventListener("resize",onResize,{passive:true});
  document.addEventListener("visibilitychange",onVisibility);
  reduced.addEventListener?.("change",onMotion);
  draw(reduced.matches?3:0);id=requestAnimationFrame(tick);
  return ()=>{
    disposed=true;cancelAnimationFrame(id);
    window.removeEventListener("resize",onResize);
    document.removeEventListener("visibilitychange",onVisibility);
    reduced.removeEventListener?.("change",onMotion);
    labels.forEach(t=>gl.deleteTexture(t));
    Object.values(meshes).forEach(m=>{gl.deleteBuffer(m.vertex);gl.deleteBuffer(m.index);gl.deleteVertexArray(m.vao);});
    gl.deleteProgram(p);
  };
}
