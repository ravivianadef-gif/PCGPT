/* PCGPT operator — local-first task orchestration. It never impersonates a user or bypasses site rules. */
(() => {
  const KEY='pcgpt-operator-v1';
  const $=s=>document.querySelector(s);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const notify=m=>typeof window.toast==='function'?window.toast(m):void 0;
  let state; try{state=JSON.parse(localStorage.getItem(KEY)||'null')}catch{state=null}
  state ||= {name:'',auto:false,queue:[],runs:0,blocked:0,done:0};
  state.queue ||= [];
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const classify=text=>{
    const t=text.toLowerCase();
    if(/captcha|recaptcha|senha|password|2fa|código de verificação|verification code|idade mínima|menor de idade/.test(t)) return ['BLOQUEAR','Requer credencial, verificação ou regra de idade.'];
    if(/responda|pesquisa|survey|questionário|questionnaire|opinião/.test(t)) return ['REVISAR','Pode exigir respostas pessoais. O operador prepara o fluxo, mas você confirma as respostas.'];
    if(/pesquise|compare|liste|resuma|organize|calcule|converta|texto|planilha|dados/.test(t)) return ['PREPARAR','Tarefa estruturada que o operador consegue organizar localmente.'];
    return ['REVISAR','A tarefa não foi reconhecida com segurança suficiente para execução automática.'];
  };
  function panel(){
    if($('#operator'))return;
    const wrap=document.createElement('section');wrap.id='operator';wrap.className='card';
    wrap.innerHTML=`<div class="card-head"><div><span class="label">OPERADOR</span><h2>Fila de trabalho</h2></div><span class="pulse">◉</span></div><p class="muted">O sistema separa tarefas executáveis, tarefas que precisam de revisão e ações que devem ser bloqueadas.</p><div class="operator-top"><input id="opName" class="task-input" placeholder="Seu nome de trabalho (opcional)" value="${esc(state.name)}"><label class="op-toggle"><input id="opAuto" type="checkbox" ${state.auto?'checked':''}> modo automático local</label></div><div class="command-line"><span>›</span><input id="opInput" autocomplete="off" placeholder="Cole uma oportunidade ou tarefa..."><button id="opAdd">ANALISAR</button></div><div class="value-stats"><div><small>Fila</small><strong id="opQueue">0</strong></div><div><small>Preparadas</small><strong id="opDone">0</strong></div><div><small>Bloqueadas</small><strong id="opBlocked">0</strong></div><div><small>Execuções</small><strong id="opRuns">0</strong></div></div><div id="opList" class="value-leads"></div>`;
    const anchor=[...document.querySelectorAll('.card')].find(x=>/Sinal do Sistema/i.test(x.textContent));(anchor?.parentElement||document.querySelector('main')).appendChild(wrap);
    $('#opName').oninput=e=>{state.name=e.target.value.slice(0,80);save()};
    $('#opAuto').onchange=e=>{state.auto=e.target.checked;save();notify(state.auto?'Modo automático local ligado.':'Modo automático local desligado.')};
    $('#opAdd').onclick=()=>add($('#opInput').value);
    $('#opInput').onkeydown=e=>{if(e.key==='Enter')add(e.target.value)};
  }
  function add(raw){const text=raw.trim();if(!text)return notify('Cole uma tarefa primeiro.');const [kind,reason]=classify(text);state.queue.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),text,kind,reason,time:Date.now(),status:'fila'});save();render();$('#opInput').value='';notify(kind==='BLOQUEAR'?'Ação bloqueada por segurança.':'Tarefa analisada.');if(state.auto&&kind==='PREPARAR')prepare(state.queue.at(-1).id)}
  function prepare(id){const x=state.queue.find(v=>v.id===id);if(!x||x.kind!=='PREPARAR'||x.status==='feito')return;x.status='feito';x.output=`Preparação concluída em ${new Date().toLocaleString('pt-BR')}. ${state.name?'Identidade de trabalho: '+state.name+'. ':''}Próximo passo: revisar e enviar somente em um serviço que permita esse fluxo.`;state.done++;state.runs++;save();render();notify('Tarefa preparada localmente.');}
  function remove(id){state.queue=state.queue.filter(v=>v.id!==id);save();render()}
  function render(){panel();$('#opQueue').textContent=state.queue.filter(x=>x.status==='fila').length;$('#opDone').textContent=state.done;$('#opBlocked').textContent=state.blocked;$('#opRuns').textContent=state.runs;const list=$('#opList');if(!list)return;list.innerHTML=state.queue.slice(-10).reverse().map(x=>{const cls=x.kind==='BLOQUEAR'?'blocked':x.kind==='PREPARAR'?'ready':'review';return `<div class="output op-item ${cls}"><div><b>${esc(x.kind)}</b> · ${esc(x.text.slice(0,180))}<br><small>${esc(x.reason)}${x.output?`<br>${esc(x.output)}`:''}</small></div><div class="op-actions">${x.kind==='PREPARAR'&&x.status==='fila'?`<button class="btn" data-op-run="${x.id}">preparar</button>`:''}<button class="btn" data-op-del="${x.id}">×</button></div></div>`}).join('')||'<div class="output">Fila vazia. O operador está esperando trabalho.</div>';
    list.querySelectorAll('[data-op-run]').forEach(b=>b.onclick=()=>prepare(b.dataset.opRun));
    list.querySelectorAll('[data-op-del]').forEach(b=>b.onclick=()=>remove(b.dataset.opDel));
  }
  window.PCGPTOperator={state,add,prepare,render};window.addEventListener('load',render);setTimeout(render,700);
})();
