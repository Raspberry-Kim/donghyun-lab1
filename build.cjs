const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=__dirname,out=path.join(root,'dist');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,12);
const put=(base,content)=>{const ext=path.extname(base),n=path.basename(base,ext)+'.'+hash(content)+ext;fs.writeFileSync(path.join(out,n),content);return n;};
const src=n=>fs.readFileSync(path.join(root,'src',n),'utf8');
const brain=put('worker.bundle.js',['donghyun.js','brain.js','worker.js'].map(src).join('\n'));
const data=put('connectome.json',fs.readFileSync(path.join(root,'data/connectome.json')));
const examples=put('examples.js',src('examples.js'));
const app=put('app.js',src('app.js').replace("'./examples.js'",`'./${examples}'`).replace("'./worker.bundle.js'",`'./${brain}'`).replace("'./connectome.json'",`'./${data}'`));
const cssText=src('style.css')+'\n'+src('brand.css'),css=put('style.css',cssText);
let fonts='',inlineFonts='';
for(const [file,family,weight]of [['BlackHanSans','Black Han Sans','400'],['NanumGothicCoding','Nanum Gothic Coding','400'],['PretendardVariable','Pretendard','100 900']]){
  const b=fs.readFileSync(path.join(root,'fonts',file+'.woff2')),n=put(file+'.woff2',b);
  const face=url=>`@font-face{font-family:'${family}';font-weight:${weight};font-display:swap;src:url('${url}') format('woff2');}\n`;
  fonts+=face(n);inlineFonts+=face('data:font/woff2;base64,'+b.toString('base64'));
}
const fontCSS=put('fonts.css',fonts);
let html=src('index.html');
fs.writeFileSync(path.join(out,'index.html'),html.replace('src="app.js"',`src="${app}"`).replace('href="style.css"',`href="${css}"`).replace('href="fonts.css"',`href="${fontCSS}"`));
fs.copyFileSync(path.join(root,'LICENSE'),path.join(root,'licenses','DONGHYUNCHO-LICENSE.txt'));
fs.cpSync(path.join(root,'licenses'),path.join(out,'licenses'),{recursive:true});
if(fs.existsSync(path.join(root,'PROVENANCE.md')))fs.copyFileSync(path.join(root,'PROVENANCE.md'),path.join(out,'PROVENANCE.md'));
fs.copyFileSync(path.join(root,'CREDITS.md'),path.join(out,'CREDITS.md'));
const safe=s=>s.replace(/<\/script/gi,'<\\/script');
const embed='window.FLY_EMBED='+JSON.stringify({worker:['donghyun.js','brain.js','worker.js'].map(src).join('\n'),data:JSON.parse(fs.readFileSync(path.join(root,'data/connectome.json'),'utf8'))})+';';
const js=src('examples.js').replaceAll('export ','')+'\n'+src('app.js').replace(/^import .*\n/,'');
html=html.replace('<link rel="stylesheet" href="fonts.css">','<style>'+inlineFonts+'</style>').replace('<link rel="stylesheet" href="style.css">','<style>'+cssText+'</style>')
  .replace('<script type="module" src="app.js"></script>','<script>'+safe(embed+'\n'+js)+'</script>');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const licenses=fs.readdirSync(path.join(root,'licenses')).map(f=>`<details><summary>${esc(f)}</summary><pre style="white-space:pre-wrap">${esc(fs.readFileSync(path.join(root,'licenses',f),'utf8'))}</pre></details>`).join('');
const provenance=fs.existsSync(path.join(root,'PROVENANCE.md'))?fs.readFileSync(path.join(root,'PROVENANCE.md'),'utf8'):'';
const credits=fs.readFileSync(path.join(root,'CREDITS.md'),'utf8');
html=html.replaceAll('href="licenses/SHIU-MIT.txt" target="_blank"','href="#offline-licenses"').replaceAll('href="licenses/DONGHYUN-MIT.txt" target="_blank"','href="#offline-licenses"').replaceAll('href="PROVENANCE.md" target="_blank"','href="#offline-provenance"').replaceAll('href="CREDITS.md" target="_blank"','href="#offline-credits"')
  .replace('</footer>','</footer><details id="offline-licenses" style="padding:24px"><summary>내장 글꼴·원 코드 라이선스</summary>'+licenses+'</details><details id="offline-provenance" style="padding:24px"><summary>데이터 계보</summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere">'+esc(provenance)+'</pre></details><details id="offline-credits" style="padding:24px"><summary>전체 출처·가공·이용 안내</summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere">'+esc(credits)+'</pre></details>');
const single=path.join(root,'동현초-v0.3.html');fs.writeFileSync(single,html);
// GitHub Pages entry point is also the complete offline edition.
fs.writeFileSync(path.join(root,'index.html'),html);
const vm=require('vm'),ec=vm.createContext({});
vm.runInContext(src('examples.js').replaceAll('export ','')+';globalThis.EX=examples;',ec);
fs.mkdirSync(path.join(root,'examples'),{recursive:true});
ec.EX.forEach((ex,i)=>fs.writeFileSync(path.join(root,'examples',String(i+1).padStart(2,'0')+'-'+ex.id+'.dh'),ex.code+'\n'));
console.log('Single HTML:',single,fs.statSync(single).size);
console.log({out,brain,data,app,css});
