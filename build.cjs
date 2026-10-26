const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {integrateReferenceDocuments}=require('./render-docs.cjs');
const {inlineIcons,copyIcons}=require('./icon-files.cjs');
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
fs.copyFileSync(path.join(root,'LICENSE'),path.join(root,'licenses','DONGHYUNCHO-LICENSE.txt'));
let html=integrateReferenceDocuments(src('index.html'),root);
fs.writeFileSync(path.join(out,'index.html'),html.replace('src="app.js"',`src="${app}"`).replace('href="style.css"',`href="${css}"`).replace('href="fonts.css"',`href="${fontCSS}"`));
copyIcons(out);
fs.cpSync(path.join(root,'licenses'),path.join(out,'licenses'),{recursive:true});
if(fs.existsSync(path.join(root,'PROVENANCE.md')))fs.copyFileSync(path.join(root,'PROVENANCE.md'),path.join(out,'PROVENANCE.md'));
fs.copyFileSync(path.join(root,'CREDITS.md'),path.join(out,'CREDITS.md'));
const safe=s=>s.replace(/<\/script/gi,'<\\/script');
const embed='window.FLY_EMBED='+JSON.stringify({worker:['donghyun.js','brain.js','worker.js'].map(src).join('\n'),data:JSON.parse(fs.readFileSync(path.join(root,'data/connectome.json'),'utf8'))})+';';
const js=src('examples.js').replaceAll('export ','')+'\n'+src('app.js').replace(/^import .*\n/,'');
html=html.replace('<link rel="stylesheet" href="fonts.css">','<style>'+inlineFonts+'</style>').replace('<link rel="stylesheet" href="style.css">','<style>'+cssText+'</style>')
  .replace('<script type="module" src="app.js"></script>','<script>'+safe(embed+'\n'+js)+'</script>');
const version=require('./package.json').version.split('.').slice(0,2).join('.');
const single=path.join(root,`동현초-v${version}.html`);fs.writeFileSync(single,inlineIcons(html));
// GitHub Pages uses file icons; the offline edition embeds the same icons.
fs.writeFileSync(path.join(root,'index.html'),html);
const vm=require('vm'),ec=vm.createContext({});
vm.runInContext(src('examples.js').replaceAll('export ','')+';globalThis.EX=examples;',ec);
fs.mkdirSync(path.join(root,'examples'),{recursive:true});
// 내려받는 .dh 예제도 편집기와 같은 규칙으로 들여쓴다: 시작·끝 줄은 맨 앞, 명령은 2칸, 따로 줄에 있는 주석은 3칸
const dhIndent=t=>t.split('\n').map(l=>{const b=l.replace(/^[ \t]+/,'');if(!b)return '';if(b.startsWith('ㅋㅋ'))return '   '+b;const s=b.split('~')[0].replace(/ㅋㅋ.*$/,'').trim();return (s==='나는 동현이냐?'||s==='동현이구나'?'':'  ')+b;}).join('\n');
ec.EX.forEach((ex,i)=>fs.writeFileSync(path.join(root,'examples',String(i+1).padStart(2,'0')+'-'+ex.id+'.dh'),dhIndent(ex.code)+'\n'));
console.log('Single HTML:',single,fs.statSync(single).size);
console.log({out,brain,data,app,css});
