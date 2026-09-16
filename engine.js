/* PCGPT value engine — local-first, no payment processing. */
(() => {
  const KEY='pcgpt-value-v2';
  const $=id=>document.getElementById(id);
  let state; try { state=JSON.parse(localStorage.getItem(KEY)||'null'); } catch { state=null; }
  state ||= {goal:100,earned:0,opportunities:0,wins:0,leads:[],last:null};
  state.leads ||= [];
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const money=n=>`R$ ${Number(n||0).toFixed(2).replace('.',',')}`;
  const esc=s=>String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  function panel(){
    if($('value-engine')) return;
    const wrap=document.createElement('section'); wrap.id='value-engine'; wrap.className='card';
    wrap.innerHTML=`<div class="card-head"><div><span class="label">VALOR</span><h2>Transforme atividade em oportunidade</h2></div><button class="add" id="ve-settings" title="Configurar meta">⚙</button></div><p class="muted">Registre o que aconteceu de verdade. Potencial e dinheiro recebido ficam separados.</p><div class="value-stats"><div><small>Meta</small><strong id="ve-goal">${money(state.goal)}</strong></div><div><small>Recebido</small><strong id="ve-earned">${money(state.earned)}</strong></div><div><small>Oportunidades</small><strong id="ve-opp">${state.opportunities}</strong></div><div><small>Vitórias</small><strong id="ve-wins">${state.wins}</strong></div></div><div class="value-progress"><span id="ve-progress"></span></div><div class="value-actions"><button class="btn primary" id="ve-opportunity">+ oportunidade</button><button class="btn" id="ve-lead">+ contato</button><button class="btn" id="ve-earned-btn">+ ganho real</button><button class="btn" id="ve-export">exportar</button></div><div id="ve-leads" class="value-leads"></div>`;
    const anchor=[...document.querySelectorAll('.card')].find(x=>/Sinal do Sistema/i.test(x.textContent)); (anchor?.parentElement||document.querySelector('main')||document.body).appendChild(wrap);
    $('ve-opportunity').onclick=()=>{state.opportunities++;state.last=Date.now();save();render();toast('Oportunidade registrada.');};
    $('ve-lead').onclick=()=>{const name=prompt('Nome ou referência do contato?');if(name?.trim()){state.leads.push({name:name.trim(),time:Date.now()});state.opportunities++;state.last=Date.now();save();render();toast('Contato registrado.');}};
    $('ve-earned-btn').onclick=()=>{const raw=prompt('Quanto entrou de verdade? (R$)');const n=Number(String(raw||'').replace(',','.'));if(Number.isFinite(n)&&n>0){state.earned+=n;state.wins++;state.last=Date.now();save();render();toast(`${money(n)} registrado como ganho real.`);}};
    $('ve-settings').onclick=()=>{const raw=prompt('Qual é sua meta de dinheiro? (R$)',String(state.goal).replace('.',','));if(raw===null)return;const n=Number(String(raw).replace(',','.'));if(Number.isFinite(n)&&n>0){state.goal=n;save();render();toast(`Meta definida em ${money(n)}.`)}else toast('Meta inválida.');};
    $('ve-export').onclick=()=>{const payload={exportedAt:new Date().toISOString(),...state};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='pcgpt-valor.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);toast('Registro exportado.');};
  }
  function render(){panel();const g=$('ve-goal'),e=$('ve-earned'),o=$('ve-opp'),w=$('ve-wins'),l=$('ve-leads'),p=$('ve-progress');if(g)g.textContent=money(state.goal);if(e)e.textContent=money(state.earned);if(o)o.textContent=state.opportunities;if(w)w.textContent=state.wins;if(p)p.style.width=`${Math.min(100,state.goal>0?(state.earned/state.goal)*100:0)}%`;if(l)l.innerHTML=state.leads.length?state.leads.slice(-4).reverse().map(x=>`<div class="output">${esc(x.name)} <small>· ${new Date(x.time).toLocaleDateString('pt-BR')}</small></div>`).join(''):'<div class="output">Nenhum contato registrado ainda.</div>';}
  window.PCGPTValue={state,save,render}; window.addEventListener('load',render); window.setTimeout(render,500);
})();
