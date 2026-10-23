const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const {renderMarkdown,renderReferenceDocuments,integrateReferenceDocuments,escapeHTML}=require('../render-docs.cjs');
let total=0;
const test=(label,fn)=>{fn();total++;console.log('PASS',label);};
const provenance=fs.readFileSync(path.join(root,'PROVENANCE.md'),'utf8');
const credits=fs.readFileSync(path.join(root,'CREDITS.md'),'utf8');
const rendered=renderReferenceDocuments(root);
test('Unnecessary release sentence removed',()=>assert(!provenance.includes('기존 동현랭 플레이그라운드와 공개 주소')));
test('Real bold and headings, not Markdown delimiters',()=>{
  const p=renderMarkdown(provenance);
  assert(p.includes('<strong>조건별 반복의 평균 발화율이 0보다 큰 뉴런</strong>'));
  assert(p.startsWith('<h2>'));assert(!p.includes('**'));
  const c=renderMarkdown(credits);
  assert(!c.includes('**'));assert(c.includes('<strong>Creative Commons Attribution-NonCommercial 4.0 International</strong>'));
});
test('All document blocks preserved by the renderer',()=>{
  const {lexer}=require('../vendor/marked.cjs');
  for(const doc of [provenance,credits]){
    const blocks=lexer(doc).filter(t=>t.type!=='space');
    const whole=renderMarkdown(doc);
    for(const block of blocks)assert(whole.includes(renderMarkdown(block.raw).trim()),'missing block '+block.type);
  }
});
test('Provenance tables and code rendered',()=>{const p=renderMarkdown(provenance);assert.equal((p.match(/<table>/g)||[]).length,3);assert(p.includes('<code>'));assert(p.includes('class="table-wrap"'));});
test('Links preserved, bare URLs clickable',()=>{
  const c=renderMarkdown(credits);assert(c.includes('href="https://doi.org/10.1038/s41586-024-07558-y"'));
  assert(c.includes('target="_blank" rel="noopener noreferrer"'));
});
test('Plain text license files preserved verbatim after HTML escaping',()=>{
  for(const file of fs.readdirSync(path.join(root,'licenses')).filter(f=>f!=='MARKED-MIT.txt'))
    assert(rendered.includes(escapeHTML(fs.readFileSync(path.join(root,'licenses',file),'utf8'))),file);
});
test('Marked license Markdown rendered without omitted blocks',()=>{
  const l=fs.readFileSync(path.join(root,'licenses','MARKED-MIT.txt'),'utf8');
  assert(rendered.includes(renderMarkdown(l,2)));assert(rendered.includes('id="license-marked"'));
});
test('Raw HTML and unsafe URLs do not execute',()=>{
  const h=renderMarkdown('<script>alert(1)</script>\n\n[bad](javascript:alert%281%29)\n\n[good](https://example.org/)\n');
  assert(!h.includes('<script>'));assert(!h.includes('href="javascript:'));assert(h.includes('href="https://example.org/"'));
});
test('Internal document and license links point to panels',()=>{
  const h=renderMarkdown('[p](PROVENANCE.md) [c](CREDITS.md) [l](licenses/SHIU-MIT.txt)');
  assert(h.includes('href="#offline-provenance"'));assert(h.includes('href="#offline-credits"'));assert(h.includes('href="#license-shiu"'));
});
test('Panels integrated into source slot only once',()=>{
  const html=integrateReferenceDocuments(fs.readFileSync(path.join(root,'src/index.html'),'utf8'),root);
  for(const id of ['offline-provenance','offline-credits','offline-licenses'])assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
  assert(!html.includes('<!-- REFERENCE_DOCUMENTS -->'));
  assert(!html.includes('href="PROVENANCE.md"'));assert(!html.includes('href="CREDITS.md"'));
  assert(!html.includes('</footer><details'));
});
console.log('DOCUMENT TOTAL',total);
