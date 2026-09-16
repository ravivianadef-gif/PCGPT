/* PCGPT value engine — local-first. No payment processing. */
(() => {
  const KEY='pcgpt-value-v3';
  const $=id=>document.getElementById(id);
  const old=localStorage.getItem('pcgpt-value-v2');
  let state; try { state=JSON.parse(localStorage.getItem(KEY)||old||'null'); } catch { state=null; }
  state ||= {goal:100,earned:0,opportunities:0,wins:0,leads:[],pipeline:[],last:null};
  state.leads ||= []; state.pipeline ||= []; state.goal=Number(state.goal)||100; state.earned=Number(state.earned)||0;
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const money=n=>`R$ ${Number(n||0).toFixed(2).replace('.',',')}`;
  const esc=s=>String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const notify=m=>typeof window.toast==='function'?window.toast(m):void 0;
  function panel(){
    if($('value-engine')) return;
    const wrap=document.createElement('section'); wrap.id='value-engine'; wrap.className='card';
    wrap.innerHTML=`<div class="card-head"><div><span class="label">VALOR</span><h2>Transforme atividade em oportunidade</h2></div><button class="add" id="ve-settings" title="Configurar meta">⚙</button></div><p class="muted">Registre o que aconteceu de verdade. Potencial e dinheiro recebido ficam separados.</p><div class="value-stats"><div><small>Meta</small><strong id="ve-goal">${money(state.goal)}</strong></div><div><small>Recebido</small><strong id="ve-earned">${money(state.earned)}</strong></div><div><small>Oportunidades</small><strong id="ve-opp">${state.opportunities}</strong></div><div><small>Vitórias</small><strong id="ve-wins">${state.wins}</strong></div></div><div class="value-progress"><span id="ve-progress"></span></div><div class="value-actions"><button class="btn primary" id="ve-opportunity">+ oportunidade</button><button class="btn" id="ve-lead">+ contato</button><button class="btn" id="ve-earned-btn">+ ganho real</button><button class="btn" id="ve-new-pipeline">+ registrar</button><button class="btn" id="ve-export">exportar</button></div><div id="ve-pipeline" class="value-leads"></div><div id="ve-leads" class="value-leads"></div>`;
    const anchor=[...document.querySelectorAll('.card')].find(x=>/Sinal do Sistema/i.test(x.textContent)); (anchor?.parentElement||document.querySelector('main')||document.body).appendChild(wrap);
    $('ve-opportunity').onclick=()=>{state.opportunities++;state.last=Date.now();save();render();notify('Oportunidade registrada.');};
    $('ve-lead').onclick=()=>{const name=prompt('Nome ou referência do contato?');if(name?.trim()){state.leads.push({name:name.trim(),time:Date.now()});state.opportunities++;state.last=Date.now();save();render();notify('Contato registrado.');}};
    $('ve-earned-btn').onclick=()=>{const raw=prompt('Quanto entrou de verdade? (R$)');const n=Number(String(raw||'').replace(',','.'));if(Number.isFinite(n)&&n>0){state.earned+=n;state.wins++;state.last=Date.now();save();render();notify(`${money(n)} registrado como ganho real.`);}};
    $('ve-settings').onclick=()=>{const raw=prompt('Qual é sua meta de dinheiro? (R$)',String(state.goal).replace('.',','));if(raw===null)return;const n=Number(String(raw).replace(',','.'));if(Number.isFinite(n)&&n>0){state.goal=n;save();render();notify(`Meta definida em ${money(n)}.`)}else notify('Meta inválida.');};
    $('ve-new-pipeline').onclick=()=>{const title=prompt('O que você quer acompanhar?');if(!title?.trim())return;const raw=prompt('Valor potencial (opcional, R$)','0');const value=Number(String(raw||0).replace(',','.'));state.pipeline.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),title:title.trim(),value:Number.isFinite(value)&&value>0?value:0,status:0,time:Date.now()});state.opportunities++;state.last=Date.now();save();render();notify('Item adicionado ao fluxo.');};
    $('ve-export').onclick=()=>{const payload={exportedAt:new Date().toISOString(),...state};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='pcgpt-valor.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);notify('Registro exportado.');};
  }
  function render(){panel();const g=$('ve-goal'),e=$('ve-earned'),o=$('ve-opp'),w=$('ve-wins'),l=$('ve-leads'),p=$('ve-progress'),pipe=$('ve-pipeline');if(g)g.textContent=money(state.goal);if(e)e.textContent=money(state.earned);if(o)o.textContent=state.opportunities;if(w)w.textContent=state.wins;if(p)p.style.width=`${Math.min(100,state.goal>0?(state.earned/state.goal)*100:0)}%`;
    if(pipe)pipe.innerHTML=state.pipeline.length?`<div class="label" style="margin:16px 0 8px">FLUXO</div>`+state.pipeline.slice(-8).reverse().map(x=>{const labels=['ideia','oportunidade','contato','resultado'];return `<div class="output" style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span><b>${esc(x.title)}</b>${x.value?` · ${money(x.value)}`:''}<small> · ${labels[x.status]}</small></span><span style="display:flex;gap:5px"><button class="btn" data-ve-next="${x.id}" title="avançar">→</button><button class="btn" data-ve-del="${x.id}" title="remover">×</button></span></div>`}).join(''):'<div class="output">Nenhum item no fluxo ainda.</div>';
    if(l)l.innerHTML=state.leads.length?`<div class="label" style="margin:12px 0 8px">CONTATOS RECENTES</div>`+state.leads.slice(-4).reverse().map(x=>`<div class="output">${esc(x.name)} <small>· ${new Date(x.time).toLocaleDateString('pt-BR')}</small></div>`).join(''):'';
    pipe?.querySelectorAll('[data-ve-next]').forEach(b=>b.onclick=()=>{const x=state.pipeline.find(v=>v.id===b.dataset.veNext);if(!x)return;if(x.status<3){x.status++;state.last=Date.now();save();render();notify('Fluxo avançado.')}else{state.wins++;state.last=Date.now();save();render();notify('Resultado marcado como concluído.')}});
    pipe?.querySelectorAll('[data-ve-del]').forEach(b=>b.onclick=()=>{state.pipeline=state.pipeline.filter(v=>v.id!==b.dataset.veDel);save();render();notify('Item removido.');});
  }
  window.PCGPTValue={state,save,render}; window.addEventListener('load',render); window.setTimeout(render,500);
})();
