
(() => {
const $=s=>document.querySelector(s);
const state={rows:[],filtered:[]};
const cfg=window.APP_CONFIG||{};
const fmtMoney=v=>{const n=Number(v); if(v===null||v===undefined||v==='')return '-'; if(!Number.isFinite(n))return String(v); return n.toLocaleString('ko-KR')+'원'};
const fmtPct=v=>{if(v===null||v===undefined||v==='')return '-'; const n=Number(v); return Number.isFinite(n)?(n*100).toFixed(1)+'%':'-'};
const clean=s=>String(s??'').trim();

function normalizeSeed(r){return {
  key:clean(r['고유키'])||`${clean(r['물건종류'])}|${clean(r['사건번호'])}`,
  type:clean(r['물건종류']), caseNo:clean(r['사건번호']), date:clean(r['대표 추천일']), court:clean(r['법원·지원']),
  address:clean(r['상세주소']), building:clean(r['단지·건물명']), appraisal:r['감정가']??null, fails:r['최종 유찰횟수']??null,
  bid:r['최종 낙찰가']??null, rate:r['낙찰가율']??null, bidders:r['입찰자수']??null,
  status:clean(r['결과상태'])||clean(r['조회상태'])||'미조회',
  memo:clean(r['원본 지역·가격 메모']), source:clean(r['자료출처']), checked:clean(r['데이터 확인일']),
  lookup:clean(r['조회상태']), error:clean(r['오류·확인메모'])
}}

function normalizeDb(r){return {
  key:clean(r.unique_key)||`${clean(r.property_type)}|${clean(r.case_no)}`,
  type:clean(r.property_type), caseNo:clean(r.case_no), date:clean(r.recommendation_date), court:clean(r.court),
  address:clean(r.address), building:clean(r.building_name), appraisal:r.appraisal??null, fails:r.failed_count??null,
  bid:r.winning_bid??null, rate:r.winning_rate??null, bidders:r.bidder_count??null,
  status:clean(r.status)||clean(r.check_state)||'미조회',
  memo:clean(r.original_memo), source:clean(r.source_url), checked:clean(r.checked_at),
  lookup:clean(r.check_state), error:clean(r.check_memo)
}}

async function loadData(){
  const sync=$('#syncState');
  if(cfg.SUPABASE_URL && cfg.SUPABASE_PUBLISHABLE_KEY){
    try{
      sync.textContent='Supabase 연결 중...';
      const url=cfg.SUPABASE_URL.replace(/\/$/,'') + '/rest/v1/recommendations?select=*&order=recommendation_date.desc';
      const res=await fetch(url,{
        headers:{
          'apikey':cfg.SUPABASE_PUBLISHABLE_KEY,
          'Authorization':'Bearer '+cfg.SUPABASE_PUBLISHABLE_KEY,
          'Accept':'application/json'
        }
      });
      if(!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
      const data=await res.json();
      state.rows=data.map(normalizeDb);
      sync.textContent=`Supabase 연결 · ${state.rows.length.toLocaleString('ko-KR')}건`;
      return;
    }catch(err){
      console.error(err);
      sync.textContent='Supabase 연결 실패 · 내장 데이터 사용';
    }
  }
  state.rows=(window.SEED_DATA||[]).map(normalizeSeed);
}

function statusClass(s){return 'status-'+clean(s).replace(/\s+/g,'')}
function kpis(){
  const total=state.rows.length, apt=state.rows.filter(r=>r.type==='아파트').length,
  villa=state.rows.filter(r=>r.type==='빌라').length, multi=state.rows.filter(r=>r.type==='다가구').length,
  sold=state.rows.filter(r=>r.status.includes('낙찰')).length;
  $('#kpis').innerHTML=[['전체 추천',total],['아파트',apt],['빌라',villa],['다가구',multi],['낙찰완료',sold]]
    .map(([a,b])=>`<div class="kpi"><span>${a}</span><strong>${b.toLocaleString('ko-KR')}</strong></div>`).join('');
}
function apply(){
  const q=clean($('#searchInput').value).toLowerCase(), type=$('#typeFilter').value, st=$('#statusFilter').value, sort=$('#sortFilter').value;
  let rows=state.rows.filter(r=>(!type||r.type===type)&&(!st||r.status.includes(st))&&(!q||[r.caseNo,r.address,r.building,r.memo,r.court].join(' ').toLowerCase().includes(q)));
  const num=v=>Number(v)||-Infinity;
  rows.sort((a,b)=> sort==='bidder-desc'?num(b.bidders)-num(a.bidders):sort==='rate-desc'?num(b.rate)-num(a.rate):sort==='appraisal-desc'?num(b.appraisal)-num(a.appraisal):String(b.date).localeCompare(String(a.date)));
  state.filtered=rows; render(); kpis();
}
function render(){
  $('#resultCount').textContent=`${state.filtered.length.toLocaleString('ko-KR')}건`;
  const body=$('#tbody');
  if(!state.filtered.length){body.innerHTML='<tr><td colspan="10" class="empty">조건에 맞는 물건이 없습니다.</td></tr>';return}
  body.innerHTML=state.filtered.map(r=>`<tr class="data-row" data-key="${encodeURIComponent(r.key)}">
    <td>${r.date||'-'}</td><td><span class="badge type-${r.type}">${r.type||'-'}</span></td><td class="case">${r.caseNo}</td>
    <td class="addr">${r.address||r.memo||'-'}${r.building?`<span class="building">${r.building}</span>`:''}</td>
    <td class="num">${fmtMoney(r.appraisal)}</td><td class="num">${r.fails??'-'}</td><td class="num">${fmtMoney(r.bid)}</td>
    <td class="num">${fmtPct(r.rate)}</td><td class="num">${r.bidders??'-'}</td>
    <td><span class="badge ${statusClass(r.status)}">${r.status||'미조회'}</span></td></tr>`).join('');
  body.querySelectorAll('.data-row').forEach(tr=>tr.addEventListener('click',()=>showDetail(decodeURIComponent(tr.dataset.key))));
}
function showDetail(key){
  const r=state.rows.find(x=>x.key===key); if(!r)return;
  const d=$('#detailContent');
  d.innerHTML=`<div class="dialog-head"><div><p class="eyebrow">PROPERTY DETAIL</p><h2>${r.caseNo}</h2></div><button class="icon-btn" id="detailClose">×</button></div>
  <div class="detail-grid">
  ${[['유형',r.type],['추천일',r.date],['법원·지원',r.court||'-'],['상태',r.status],['상세주소',r.address||'-','wide'],['단지·건물명',r.building||'-'],['감정가',fmtMoney(r.appraisal)],['최종 유찰횟수',r.fails??'-'],['최종 낙찰가',fmtMoney(r.bid)],['낙찰가율',fmtPct(r.rate)],['입찰자수',r.bidders??'-'],['원본 메모',r.memo||'-','wide'],['확인메모',r.error||'-','wide']].map(x=>`<div class="detail-item ${x[2]||''}"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('')}
  </div><div class="detail-actions">${r.source?`<a class="btn ghost" href="${r.source}" target="_blank" rel="noopener">출처 열기</a>`:''}<button class="btn primary" id="detailDone">닫기</button></div>`;
  $('#detailDialog').showModal();
  $('#detailClose').onclick=$('#detailDone').onclick=()=>$('#detailDialog').close();
}
function addRow(){
  alert('온라인 DB 신규 등록은 다음 단계에서 안전한 입력 API를 연결한 뒤 활성화할게.');
}
function exportCsv(){
  const cols=['추천일','물건유형','사건번호','법원·지원','상세주소','단지·건물명','감정가','최종유찰횟수','최종낙찰가','낙찰가율','입찰자수','상태','출처'];
  const rows=state.filtered.map(r=>[r.date,r.type,r.caseNo,r.court,r.address,r.building,r.appraisal??'',r.fails??'',r.bid??'',r.rate??'',r.bidders??'',r.status,r.source]);
  const esc=v=>'"'+String(v??'').replaceAll('"','""')+'"';
  download('\ufeff'+[cols,...rows].map(a=>a.map(esc).join(',')).join('\n'),'학원추천물건_DB.csv','text/csv;charset=utf-8');
}
function exportExcel(){
  const rows=state.filtered;
  let html='<table><tr>'+['추천일','유형','사건번호','법원','주소','단지','감정가','유찰','낙찰가','낙찰가율','입찰자','상태'].map(x=>`<th>${x}</th>`).join('')+'</tr>'+
    rows.map(r=>`<tr><td>${r.date}</td><td>${r.type}</td><td>${r.caseNo}</td><td>${r.court}</td><td>${r.address}</td><td>${r.building}</td><td>${r.appraisal??''}</td><td>${r.fails??''}</td><td>${r.bid??''}</td><td>${r.rate??''}</td><td>${r.bidders??''}</td><td>${r.status}</td></tr>`).join('')+'</table>';
  download('\ufeff<html><head><meta charset="UTF-8"></head><body>'+html+'</body></html>','학원추천물건_DB.xls','application/vnd.ms-excel');
}
function download(content,name,type){const b=new Blob([content],{type});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),500)}
function bind(){
  ['searchInput','typeFilter','statusFilter','sortFilter'].forEach(id=>$('#'+id).addEventListener(id==='searchInput'?'input':'change',apply));
  $('#addBtn').onclick=()=>$('#addDialog').showModal();
  $('#saveBtn').addEventListener('click',e=>{e.preventDefault();addRow()});
  $('#exportCsvBtn').onclick=exportCsv; $('#exportExcelBtn').onclick=exportExcel; $('#exportPdfBtn').onclick=()=>window.print();
  $('#resetBtn').onclick=()=>{$('#searchInput').value='';$('#typeFilter').value='';$('#statusFilter').value='';$('#sortFilter').value='date-desc';apply()};
}
async function init(){
  $('#recDate').value=new Date().toISOString().slice(0,10);
  bind();
  await loadData();
  apply();
}
init();
})();
