/* PCGPT value engine — local-first, no payment processing. */
(() => {
  const KEY = 'pcgpt-value-v1';
  const state = JSON.parse(localStorage.getItem(KEY) || '{"goal":100,"earned":0,"opportunities":0,"wins":0}');
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  const money = n => `R$ ${Number(n || 0).toFixed(2).replace('.', ',')}`;

  function panel() {
    if (document.getElementById('value-engine')) return;
    const wrap = document.createElement('section');
    wrap.id = 'value-engine';
    wrap.className = 'card';
    wrap.innerHTML = `<div class="eyebrow">VALOR</div><h2>Transforme atividade em oportunidade</h2><p class="muted">Acompanhe dinheiro real separado de potencial. Nada aqui finge que uma oportunidade virou receita.</p><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px"><div><small>Meta</small><strong id="ve-goal">${money(state.goal)}</strong></div><div><small>Recebido</small><strong id="ve-earned">${money(state.earned)}</strong></div><div><small>Oportunidades</small><strong id="ve-opp">${state.opportunities}</strong></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px"><button class="btn primary" id="ve-opportunity">Registrar oportunidade</button><button class="btn" id="ve-earned-btn">Registrar ganho</button></div>`;
    const anchor = [...document.querySelectorAll('.card')].find(x => /Sinal do Sistema/i.test(x.textContent));
    (anchor?.parentElement || document.querySelector('main') || document.body).appendChild(wrap);
    wrap.querySelector('#ve-opportunity').onclick = () => { state.opportunities++; save(); render(); toast('Oportunidade registrada'); };
    wrap.querySelector('#ve-earned-btn').onclick = () => { const raw = prompt('Quanto entrou de verdade? (R$)'); const n = Number(String(raw || '').replace(',', '.')); if (Number.isFinite(n) && n > 0) { state.earned += n; state.wins++; save(); render(); toast(`${money(n)} registrado como ganho real`); } };
  }
  function render() {
    panel();
    const g=document.getElementById('ve-goal'), e=document.getElementById('ve-earned'), o=document.getElementById('ve-opp');
    if(g) g.textContent=money(state.goal); if(e) e.textContent=money(state.earned); if(o) o.textContent=state.opportunities;
  }
  window.PCGPTValue = { state, save, render };
  window.addEventListener('load', render);
  window.setTimeout(render, 500);
})();
