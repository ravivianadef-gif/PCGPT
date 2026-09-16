/* PCGPT value engine — local-first, no payment processing. */
(() => {
  const KEY='pcgpt-value-v2';
  const $=id=>document.getElementById(id);
  let state; try { state=JSON.parse(localStorage.getItem(KEY)||'null'); } catch { state=null; }
  state ||= {goal:100,earned:0,opportunities:0,wins:0,leads:[],last:null};
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const money=n=>`R$ ${Number(n||0).toFixed(2).replace('.',',')}`;
  const esc=s=>String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  function panel(){
    if($('value-engine')) return;
    const wrap=document.createElement('section'); wrap.id='value-engine'; wrap.className='card';
    wrap.innerHTML=`<div class="eyebrow">VALOR</div><h2>Transforme atividade em oportunidade</h2><p class="muted">Dinheiro recebido fica separado de potencial. O sistema registra o que aconteceu de verdade.</p><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:14px"><div><small>Meta</small><strong id="ve-goal">${money(state.goal)}</strong></div><div><small>Recebido</small><strong id="ve-earned">${money(state.earned)}</strong></div><div><small>Oportunidades</small><strong id="ve-opp">${state.opportunities}</strong></div><div><small>Vitórias</small><strong id="ve-wins">${state.wins}</strong></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px"><button class="btn primary" id="ve-opportunity">+ oportunidade</button><button class="btn" id="ve-lead">+ contato</button><button class="btn" id="ve-earned-btn">+ ganho real</button></div><div id="ve-leads" style="margin-top:14px"></div>`;
    const anchor=[...document.querySelectorAll('.card')].find(x=>/Sinal do Sistema/i.test(x.textContent)); (anchor?.parentElement||document.querySelector('main')||document.body).appendChild(wrap);
    $('ve-opportunity').onclick=()=>{state.opportunities++;state.last=Date.now();save();render();toast('Oportunidade registrada.');};
    $('ve-lead').onclick=()=>{const name=prompt('Nome ou referência do contato?');if(name?.trim()){state.leads.push({name:name.trim(),time:Date.now()});state.opportunities++;state.last=Date.now();save();render();toast('Contato registrado.');}};
    $('ve-earned-btn').onclick=()=>{const raw=prompt('Quanto entrou de verdade? (R$)');const n=Number(String(raw||'').replace(',','.'));if(Number.isFinite(n)&&n>0){state.earned+=n;state.wins++;state.last=Date.now();save();render();toast(`${money(n)} registrado como ganho real.`);}};
  }
  function render(){panel();const g=$('ve-goal'),e=$('ve-earned'),o=$('ve-opp'),w=$('ve-wins'),l=$('ve-leads');if(g)g.textContent=money(state.goal);if(e)e.textContent=money(state.earned);if(o)o.textContent=state.opportunities;if(w)w.textContent=state.wins;if(l)l.innerHTML=state.leads.length?state.leads.slice(-4).reverse().map(x=>`<div class="output">${esc(x.name)} <small>· ${new Date(x.time).toLocaleDateString('pt-BR')}</small></div>`).join(''):'<div class="output">Nenhum contato registrado ainda.</div>';}
  window.PCGPTValue={state,save,render}; window.addEventListener('load',render); window.setTimeout(render,500);
})();
