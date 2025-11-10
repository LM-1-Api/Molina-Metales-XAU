// Molina Metales — Link único Oro/Plata con USD/ARS, WhatsApp Catalog y TradingView
(function(){
  const qs = new URLSearchParams(location.search);
  const asset = (qs.get('asset')||'xau').toLowerCase()==='xag'?'xag':'xau';

  // UI
  const tabXAU = document.getElementById('tab-xau');
  const tabXAG = document.getElementById('tab-xag');
  const year = document.getElementById('year');
  const updated = document.getElementById('updated');

  const displayCurrency = document.getElementById('displayCurrency');
  const spotUSD = document.getElementById('spotUSD');
  const usdars = document.getElementById('usdars');
  const autorefresh = document.getElementById('autorefresh');
  const btnRefresh = document.getElementById('btn-refresh');
  const btnCopy = document.getElementById('btn-copy');

  const outSpot = document.getElementById('spot-display');
  const out_g = document.getElementById('p_g');
  const out_ozt = document.getElementById('p_ozt');
  const out_kg = document.getElementById('p_kg');
  const out_10g = document.getElementById('p_10g');

  const calcW = document.getElementById('calc-w');
  const calcUnit = document.getElementById('calc-unit');
  const calcF = document.getElementById('calc-f');
  const out_calc = document.getElementById('calc-out');

  const btnWA = document.getElementById('btn-whatsapp');
  const btnCat = document.getElementById('btn-catalogo');

  if(year) year.textContent = new Date().getFullYear();

  // Constantes
  const OZT_TO_G = 31.1034768;
  const G_TO_OZT = 1 / OZT_TO_G;
  const KG_TO_OZT = 1000 * G_TO_OZT;

  function nowStamp(){ return new Date().toLocaleString('es-AR',{hour12:false}); }
  function fmt(n,cur){
    if(!(n>=0)) return '—';
    const opts = { maximumFractionDigits: 2 };
    return (cur==='USD'?'USD ':'ARS ') + n.toLocaleString(cur==='USD'?'en-US':'es-AR', opts);
  }
  function convertUSD(n){
    if(displayCurrency.value==='USD') return n;
    const fx = parseFloat(usdars.value||'0'); if(!(fx>0)) return NaN;
    return n * fx;
  }

  function recalc(){
    const base = parseFloat(spotUSD.value);
    if(isNaN(base)){
      outSpot.textContent='—'; out_g.textContent=out_ozt.textContent=out_kg.textContent=out_10g.textContent='—'; out_calc.textContent='—'; 
      return;
    }
    const p_g = base * G_TO_OZT;
    const p_kg = base * KG_TO_OZT;

    outSpot.textContent = fmt(convertUSD(base), displayCurrency.value);
    out_g.textContent   = fmt(convertUSD(p_g),   displayCurrency.value);
    out_ozt.textContent = fmt(convertUSD(base),  displayCurrency.value);
    out_kg.textContent  = fmt(convertUSD(p_kg),  displayCurrency.value);
    out_10g.textContent = fmt(convertUSD(p_g*10),displayCurrency.value);

    const w = parseFloat(calcW.value);
    const f = parseFloat(calcF.value);
    if(!(w>0 && f>0)){ out_calc.textContent='—'; return; }
    let w_ozt = 0;
    if(calcUnit.value==='g')  w_ozt = w*G_TO_OZT;
    if(calcUnit.value==='ozt') w_ozt = w;
    if(calcUnit.value==='kg')  w_ozt = w*KG_TO_OZT;
    out_calc.textContent = fmt(convertUSD(w_ozt*base*f), displayCurrency.value);
  }

  [spotUSD, usdars, displayCurrency, calcW, calcF].forEach(el=>el.addEventListener('input',recalc));
  calcUnit.addEventListener('change', recalc);

  // TradingView
  function mountTV(a){
    const containerId = 'tv_chart';
    const symbolsId   = 'tv_symbols';
    const symbol = a==='xau' ? 'FOREXCOM:XAUUSD' : 'FOREXCOM:XAGUSD';
    document.getElementById(containerId).innerHTML='';
    document.getElementById(symbolsId).innerHTML='';

    new TradingView.widget({
      container_id: containerId,
      symbol, autosize:true, interval:"60",
      timezone:"America/Argentina/Buenos_Aires", theme:"dark", style:"1", locale:"es",
      hide_top_toolbar:false, hide_legend:false, allow_symbol_change:false, save_image:false,
      studies:["MAExp@tv-basicstudies","Volume@tv-basicstudies"], withdateranges:true
    });

    new TradingView.MiniSymbolOverview({
      container_id: symbolsId, symbols:[[symbol,""]],
      gridLineColor:"rgba(42,42,42,0.4)", dateRange:"12M", height:"100%", width:"100%",
      locale:"es", colorTheme:"dark"
    });
  }

  function setActive(a){
    document.getElementById('tab-xau').classList.toggle('active', a==='xau');
    document.getElementById('tab-xag').classList.toggle('active', a==='xag');
    document.title = 'Molina Metales — ' + (a==='xau'?'Oro XAU/USD':'Plata XAG/USD') + ' en vivo';
    // Número WhatsApp Business
    btnWA.href = 'https://wa.me/5492215687369?text=' + encodeURIComponent('Hola Molina Metales, quiero cotizar ' + (a==='xau'?'Oro XAU/USD':'Plata XAG/USD'));
    btnCat.href = 'https://wa.me/c/5492215687369';
    if(updated) updated.textContent = 'Actualizado — ' + nowStamp();
    mountTV(a);
  }

  // Tabs + URL param
  document.getElementById('tab-xau').addEventListener('click', ()=>{
    const u=new URL(location); u.searchParams.set('asset','xau'); history.replaceState(null,'',u); setActive('xau');
  });
  document.getElementById('tab-xag').addEventListener('click', ()=>{
    const u=new URL(location); u.searchParams.set('asset','xag'); history.replaceState(null,'',u); setActive('xag');
  });

  // Auto-refresh y copy
  let timer=null;
  autorefresh.addEventListener('change', ()=>{
    if(timer){ clearInterval(timer); timer=null; }
    const s=parseInt(autorefresh.value||'0',10);
    if(s>0){ timer=setInterval(()=>{ mountTV(new URLSearchParams(location.search).get('asset')||'xau'); if(updated) updated.textContent='Actualizado — ' + nowStamp(); }, s*1000); }
  });
  btnRefresh.addEventListener('click', ()=>{ mountTV(new URLSearchParams(location.search).get('asset')||'xau'); if(updated) updated.textContent='Actualizado — ' + nowStamp(); });
  btnCopy.addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText(location.href); btnCopy.textContent='Copiado'; setTimeout(()=>btnCopy.textContent='Copy URL',1200);}catch(e){}
  });

  // Defaults
  setActive(asset);
  spotUSD.value = (asset==='xau'?4017.56:50.00);  // ejemplo para ver números
  usdars.value = 1200;                             // cargá tu tipo de cambio del día
  recalc();
})();
