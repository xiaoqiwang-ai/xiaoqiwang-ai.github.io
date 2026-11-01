export const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const configs={
 topoenhance:{title:'More reliable road connectivity',controls:[['dataset','Dataset',['Argoverse2','nuScenes']],['metric','Connectivity',['Lane–lane','Lane–traffic']]]},
 mapmergellm:{title:'From local predictions to global maps',controls:[['dataset','Dataset',['Argoverse2','nuScenes']],['detector','Local-map detector',['MapTracker','StreamMapNet']],['metric','Map element',['Road boundary','Lane divider']]]},
 use:{title:'Recognizing unseen categories',controls:[['dataset','Benchmark',['ADE-150','ADE-847','PC-59','PC-459','Average']],['comparison','Compare with',['Two-stage methods','All methods']],['training','USE training',['COCO†','COCO + VG']]]},
 spatialmind:{title:'Predicting what happens next',controls:[['metric','Task',['Future direction','Future relation','Future distance','Overall']],['comparison','Compare with',['API models','Same-data SFT','General-purpose','Spatially specialized','All models']]]},
 reactdrive:{title:'More consistent traffic responses',controls:[['dataset','Dataset',['Waymo','nuPlan']],['metric','Measure',['Traffic overlap','Video FVD','Agent ADE','Agent FDE','Ego ADE','Ego FDE','Image FID']]]},
 gnninterpreter:{title:'Efficient model-level explanations',controls:[['dataset','Dataset',['MUTAG','Cyclicity','Motif','Shape']],['metric','Measure',['Training time','Explanation confidence']]]},
 gnnboundary:{title:'Explaining uncertain decisions',controls:[['pair','Adjacent classes',["Motif · House / House-X", "Motif · House / Complete-4", "Motif · House-X / Complete-5", "Collab · HE / CM", "Collab · HE / Astro", "Enzymes · EC1 / EC4", "Enzymes · EC1 / EC5", "Enzymes · EC1 / EC6", "Enzymes · EC2 / EC3", "Enzymes · EC4 / EC5", "Enzymes · EC5 / EC6"]]]},
 deepgd:{title:'Learning readable graph layouts',controls:[['initialization','DeepGD initialization',['PivotMDS','Random']]]},
 smartgd:{title:'Graph layouts for different goals',controls:[['metric','Layout criterion',['Crossing-angle loss','Edge crossings','Stress']],['variant','SmartGD objective',['XAngle','Xing','Stress','Stress+Xing','Stress+XAngle','7-Aesthetics']],['comparison','Compare with',['Top 5 baselines','All baselines']]]},
 prosam:{title:'Robust visual-reference segmentation',controls:[['dataset','Dataset',['COCO-20i','PASCAL-5i']],['comparison','Comparison',['Reference types','One-shot methods']]]}
};
export const defaultState=id=>Object.fromEntries(configs[id].controls.map(([k,,options])=>[k,options[0]]));
const single=(label,value,ours=false)=>({label,bars:[{label,value,ours}]});
const autoMaximum=groups=>{
 const maximum=Math.max(...groups.flatMap(g=>g.bars.map(b=>b.value||0)));
 const scale=10**Math.floor(Math.log10(maximum||1));
 return [1,2,2.5,4,5,10].find(n=>n*scale>=maximum)*scale;
};
export function getView(id,state,data){
 const d=data[id];let groups,legend,metric,headline,table=d.table,source=d.source,precision=1,note=d.note,axisMax=100,target=null;
 if(id==='topoenhance'){
  const col=state.metric==='Lane–lane'?1:3;
  groups=d.datasets[state.dataset].map(r=>({label:r[0],bars:[{label:'Before',value:r[col],ours:false},{label:'+ TopoEnhance',value:r[col+1],ours:true}]}));
  metric=`${state.metric} TJS · higher is better`;
  legend=['Before','+ TopoEnhance'];
  const r=groups[groups.length-1];headline=`${r.label}: ${r.bars[0].value.toFixed(1)} → ${r.bars[1].value.toFixed(1)} TJS`;
 }else if(id==='mapmergellm'){
  const col=state.metric==='Road boundary'?1:0,rows=d.datasets[state.dataset][state.detector];
  groups=rows.map((r,i)=>single(d.methods[i],r[col],i===2));
  const bestIndex=rows[0][col]>rows[1][col]?0:1,best=rows[bestIndex][col],value=rows[2][col];
  headline=`${value.toFixed(1)} F1 · +${((value/best-1)*100).toFixed(1)}% vs ${d.methods[bestIndex]}`;
  metric=`${state.metric} F1 (%) · higher is better`;legend=['Baselines','MapMergeLLM'];
 }else if(id==='use'){
  const col=d.columns.indexOf(state.dataset);
  const rows=d.baselines.filter(r=>state.comparison==='All methods'||r.type==='two-stage');
  groups=rows.map(r=>single(r.name,r.values[col]));
  const value=d.variants[state.training][col];groups.push(single('USE + SAM',value,true));
  metric=`${state.dataset} mIoU (%) · higher is better`;legend=['Baselines','USE + SAM'];
  const ovseg=d.baselines.find(r=>r.name==='OVSeg').values[col];
  headline=`${value.toFixed(1)} mIoU · +${((value/ovseg-1)*100).toFixed(1)}% vs OVSeg`;
  if(groups.some(g=>g.bars[0].value===null))note+=' “Not reported” denotes a missing table entry, not a zero score.';
 }else if(id==='prosam'){
  precision=2;metric=`${state.dataset} mIoU (%) · higher is better`;
  if(state.comparison==='Reference types'){
   const rows=d.reference[state.dataset];groups=d.prompts.map((p,i)=>({label:p,bars:[{label:'VRP-SAM',value:rows['VRP-SAM'][i],ours:false},{label:'ProSAM',value:rows.ProSAM[i],ours:true}]}));
   legend=['VRP-SAM','ProSAM'];headline='Higher mIoU across all four reference types';
  }else{
   const col=state.dataset==='COCO-20i'?1:2;groups=d.oneShot.map(r=>single(r[0],r[col],r[0]==='ProSAM'));
   legend=['Baselines','ProSAM'];headline=`${groups[groups.length-1].bars[0].value.toFixed(2)} mIoU · best among these methods`;
  }
  table=d.tables[state.comparison];source+=state.comparison==='Reference types'?'#page=5':'#page=6';
 }else if(id==='spatialmind'){
  const col=d.columns.indexOf(state.metric)+2;
  const rows=d.rows.filter(r=>r[1]==='Ours'||state.comparison==='All models'||r[1]===state.comparison);
  groups=rows.map(r=>single(r[0],r[col],r[1]==='Ours'));
  const ours=d.rows.find(r=>r[1]==='Ours')[col],ref=d.rows.find(r=>r[0]===(state.comparison==='Same-data SFT'?'Qwen3-VL-8B + SFT':'GPT-6-Astra (medium)'));
  const unit=state.metric==='Future distance'?'MRA':state.metric==='Overall'?'score':'accuracy';
  headline=`${ours.toFixed(2)}% ${unit}`;
  if(state.comparison==='API models'||state.comparison==='Same-data SFT')headline+=` · +${((ours/ref[col]-1)*100).toFixed(1)}% vs ${ref[0]}`;
  metric=`${state.metric} ${unit} (%) · higher is better`;legend=['Compared models','SpatialMind'];precision=2;
 }else if(id==='reactdrive'){
  const col=d.columns.indexOf(state.metric),rows=d.datasets[state.dataset];
  groups=rows.map((r,i)=>single(d.methods[i],r[col],i===5));
  const ours=rows[5][col],reference=rows[4][col],change=(1-ours/reference)*100;
  headline=state.metric==='Image FID'?`${ours.toFixed(2)} FID · Cosmos3: ${reference.toFixed(2)}`:`${Math.abs(change).toFixed(1)}% ${change>=0?'lower':'higher'} than Cosmos3`;
  const unit=state.metric==='Traffic overlap'?' (%)':state.metric.startsWith('Agent')?' (normalized image space)':'';
  metric=`${state.dataset} · ${state.metric}${unit} · lower is better`;
  legend=['Baselines','ReactDrive'];precision=2;axisMax=autoMaximum(groups);
 }else if(id==='gnninterpreter'){
  const rows=d.datasets[state.dataset],ours=rows.GNNInterpreter,baseline=rows.XGNN;
  legend=baseline?['XGNN','GNNInterpreter']:['GNNInterpreter'];
  if(state.metric==='Training time'){
   groups=[...(baseline?[single('XGNN',baseline.seconds)]:[]),single('GNNInterpreter',ours.seconds,true)];
   metric='Explanation-model training time (seconds) · lower is better';precision=0;axisMax=autoMaximum(groups);
   headline=baseline?`${baseline.seconds} s → ${ours.seconds} s · ${(baseline.seconds/ours.seconds).toFixed(1)}× faster`:`${ours.seconds} seconds per explanation model`;
   note=d.time_note+(baseline?'':' No XGNN result is reported for this dataset.');
  }else{
   groups=rows.classes.map((label,i)=>({label,bars:[...(baseline?[{label:'XGNN',value:baseline.means[i]*100,std:baseline.std[i]*100,ours:false}]:[]),{label:'GNNInterpreter',value:ours.means[i]*100,std:ours.std[i]*100,ours:true}]}));
   metric='Target-class probability (%) · higher is better';headline='Classifier confidence on generated explanations';
   note=d.probability_note+' Bars show means; ± values show standard deviations. This is not classification accuracy.';
  }
 }else if(id==='gnnboundary'){
  const [dataset,pair]=state.pair.split(' · '),r=d.datasets[dataset].find(r=>r[0]+' / '+r[1]===pair);
  groups=[0,1].map(i=>({label:r[i],bars:[{label:'Baseline',value:r[6+i*2]*100,std:r[7+i*2]*100,ours:false},{label:'GNNBoundary',value:r[2+i*2]*100,std:r[3+i*2]*100,ours:true}]}));
  legend=['Baseline','GNNBoundary'];target=50;
  metric='Target-class probability (%) · closer to 50% is better';headline=`${(r[2]*100).toFixed(1)}% / ${(r[4]*100).toFixed(1)}% · near the decision boundary`;
  note=d.note+' Bars show means; ± values show standard deviations. The dashed line marks 50%. Probabilities are not renormalized across the two classes.';
 }else if(id==='deepgd'){
  const ours=d.rows.find(r=>r[0].includes(state.initialization==='PivotMDS'?'PivotMDS init':'random init'));
  groups=[...d.rows.filter(r=>!r[0].startsWith('DeepGD')).map(r=>single(r[0],r[1])),single(ours[0],ours[1],true)];
  metric='Average layout stress · lower is better';legend=['Baselines','DeepGD'];precision=2;axisMax=autoMaximum(groups);
  headline=`${ours[1].toFixed(2)} average stress · Graphviz: 251.93`;
  note='Stress-only optimization, averaged over 1,000 held-out Rome graphs (10–100 nodes). Stress measures how well graph distances are preserved in the layout; it is not a percentage. The selector switches between separately trained initialization settings.';
 }else if(id==='smartgd'){
  const col=d.columns.indexOf(state.metric)+1,ours=d.models.find(r=>r[0]===`SmartGD[${state.variant}]`);
  let rows=d.baselines.slice().sort((a,b)=>a[col]-b[col]);if(state.comparison==='Top 5 baselines')rows=rows.slice(0,5);
  groups=[...rows.map(r=>single(r[0],r[col])),single(ours[0],ours[col],true)];
  legend=['Baselines','SmartGD'];precision=3;axisMax=autoMaximum(groups);
  metric=`Mean ${state.metric.toLowerCase()} · lower is better`;headline=`${ours[col].toFixed(3)} · ${ours[0]}`;
  note='Mean criterion values on 1,000 held-out Rome graphs (10–100 nodes). Each SmartGD objective is a separately trained model. Crossing-angle loss is a penalty, not an angle. '+(state.comparison==='Top 5 baselines'?'Showing the five baselines with the lowest value for the selected criterion. ':'Showing all 14 baselines. ')+'The paper labels its main results table Figure 4. These raw means differ from the per-graph SPC improvements reported elsewhere.';
 }
 return {title:configs[id].title,groups,legend,metric,headline,table,source,precision,note,axisMax,target};
}
export function renderView(view){
 const e=escapeHtml,fmt=v=>v===null?'Not reported':v.toFixed(view.precision);
 const axis=view.axisMax||100,hasStd=view.groups.some(g=>g.bars.some(b=>b.std!==undefined));
 const display=b=>fmt(b.value)+(b.std!==undefined?' ± '+fmt(b.std):'');
 const description=view.groups.map(g=>`${g.label}: ${g.bars.map(b=>`${b.label} ${display(b)}`).join(', ')}`).join('; ');
 return `<div class="result-insight">${e(view.headline)}</div><p class="chart-metric">${e(view.metric)}</p><div class="chart-legend">${view.legend.map((v,i)=>`<span><i class="${i===view.legend.length-1?'ours':'baseline'}-key"></i>${e(v)}</span>`).join('')}</div><div class="result-bars${hasStd?' has-uncertainty':''}" role="img" aria-label="${e(view.metric+'. '+description)}"><div class="chart-axis" aria-hidden="true">${[0,1,2,3,4].map(i=>`<span>${Number((axis*i/4).toFixed(3))}</span>`).join('')}</div>${view.groups.map(g=>`<div class="bar-group"><div class="bar-group-label">${e(g.label)}</div>${g.bars.map(b=>`<div class="bar-line${b.ours?' is-ours':''}" title="${e(g.label+' · '+b.label+': '+display(b))}"><div class="bar-track"><div class="bar-fill${b.ours?' ours':''}" style="width:${b.value===null?0:b.value/axis*100}%"></div>${view.target===null||view.target===undefined?'':`<span class="bar-target" style="left:${view.target/axis*100}%" aria-hidden="true"></span>`}</div><span class="bar-value${b.value===null?' missing-value':''}">${fmt(b.value)}${b.std===undefined?'':`<small class="bar-uncertainty">± ${fmt(b.std)}</small>`}</span></div>`).join('')}</div>`).join('')}</div><p class="chart-source">Source: ${view.source?`<a href="${e(view.source)}" target="_blank" rel="noopener noreferrer">${e(view.table)} ↗</a>`:e(view.table)}</p><p class="chart-note">${e(view.note)}</p>`;
}
export function renderChart(id,data){
 const c=configs[id],s=defaultState(id),e=escapeHtml;
 return `<section class="result-chart" data-chart="${id}" aria-label="${e(id+' experimental results')}"><h5>${e(c.title)}</h5><div class="chart-controls">${c.controls.map(([key,label,options])=>`<label>${label}<select data-control="${key}" aria-label="${e(id+' '+label)}">${options.map(v=>`<option value="${e(v)}">${e(v)}</option>`).join('')}</select></label>`).join('')}</div><div class="chart-display" aria-live="polite">${renderView(getView(id,s,data))}</div></section>`;
}
