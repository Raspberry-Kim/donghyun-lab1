/* Adapted numerical model: Shiu & Spiller, MIT. See licenses/SHIU-MIT.txt.
   This is a reduced-connectome educational model, not a whole animal emulation. */
(function(root) {
  const random = seed => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s,1664525)+1013904223)>>>0)/4294967296); };
  class Brain {
    constructor(d, seed=1) {
      this.d=d; this.n=d.n; this.t=0; this.rng=random(seed);
      this.v=new Float64Array(d.n).fill(-52); this.g=new Float64Array(d.n);
      this.ref=new Int32Array(d.n); this.block=new Uint8Array(d.n);
      this.buf=Array.from({length:19},()=>new Float64Array(d.n));
      this.w=Float32Array.from(d.cnt,c=>c*.275);
      this.total=new Uint32Array(d.n);
      this.eg=Math.exp(-.1/5); this.em=Math.exp(-.1/20); this.kg=5/(5-20)*(this.eg-this.em);
      const G=d.groups,R=d.read;
      this.groups={1:[...G.sugar_L,...G.sugar_R],2:[...G.bitter_L,...G.bitter_R],3:G.LPLC2_L,4:G.LPLC2_R,
        5:[...R.MN9_L,...R.MN9_R],6:R.DNa02_L,7:R.DNa02_R,8:[...R.GF_L,...R.GF_R],
        9:Object.values(d.silence_candidates).filter(x=>x[1]==='CB0192').map(x=>x[0]),
        10:G.dopamine_verified||[]};
    }
    advance(ms, drives={}) {
      const {n,v,g,ref,buf,d,w}=this, counts=new Uint32Array(n), noRef=new Uint8Array(n), inputs=[];
      for(const [group,rate] of Object.entries(drives)) if(rate>0) for(const i of this.groups[group]) {inputs.push([i,rate*.0001]);noRef[i]=1;}
      for(let end=this.t+Math.round(ms*10);this.t<end;this.t++){
        const t=this.t,b=buf[t%19],tb=buf[(t+18)%19];
        for(let i=0;i<n;i++){if(ref[i]<=t){v[i]=-52+(v[i]+52)*this.em+g[i]*this.kg;g[i]*=this.eg;}g[i]+=b[i];b[i]=0;}
        for(const [i,p] of inputs) if(this.rng()<p) v[i]+=68.75;
        for(let i=0;i<n;i++) if(v[i]>-45&&ref[i]<=t){
          counts[i]++;this.total[i]++;v[i]=-52;g[i]=0;if(!noRef[i])ref[i]=t+23;
          if(!this.block[i])for(let k=d.indptr[i];k<d.indptr[i+1];k++)tb[d.post[k]]+=w[k];
        }
      }
      return counts;
    }
  }
  root.FlyBrain={Brain,random};
  if(typeof module==='object')module.exports=root.FlyBrain;
})(globalThis);
