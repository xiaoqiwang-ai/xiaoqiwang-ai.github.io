import {getView,renderView,defaultState} from './results-model.mjs';
const data=JSON.parse(document.querySelector('#research-results-data').textContent);
function animate(panel){
 panel.querySelectorAll('.result-bars').forEach(bars=>{bars.classList.remove('animate');requestAnimationFrame(()=>bars.classList.add('animate'))});
}
document.querySelectorAll('.result-chart').forEach(chart=>{
 const id=chart.dataset.chart,state=defaultState(id);
 chart.querySelectorAll('select[data-control]').forEach(select=>select.addEventListener('change',()=>{
  state[select.dataset.control]=select.value;
  chart.querySelector('.chart-display').innerHTML=renderView(getView(id,state,data));
  animate(chart);
 }));
});
document.querySelectorAll('.result-toggle').forEach(button=>{
 const panel=document.getElementById(button.getAttribute('aria-controls'));
 panel.hidden=true;button.setAttribute('aria-expanded','false');
 button.addEventListener('click',()=>{
  const open=button.getAttribute('aria-expanded')!=='true';
  button.setAttribute('aria-expanded',String(open));panel.hidden=!open;
  if(open)animate(panel);
 });
});
document.documentElement.classList.add('results-ready');
