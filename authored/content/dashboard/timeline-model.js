import {matchesInstitution,institutionSearchText} from './affiliations.js';
import {modelSearchText} from './ModelTechnology.jsx';
import {matchesCorpus} from './model.js';

export function timelineEvents({papers,models,history,filters}) {
 const {type,query,topics,corpus,dateMode,vendor,openness,modality,highlights,chronology,institution,institutionType}=filters;
 const q=(query||'').trim().toLocaleLowerCase();
 const paperMilestones=new Set(history.flatMap(s=>s.paperIds));
 const modelMilestones=new Set(history.flatMap(s=>s.modelIds||[]));
 const pr=type==='model'?[]:papers.filter(p=>
  (!q||[p.title,p.zh,p.short,p.summary,p.categories,p.venue,institutionSearchText(p)].join(' ').toLocaleLowerCase().includes(q))&&
  topics.every(t=>p.tags.includes(t))&&matchesCorpus(p,corpus)&&matchesInstitution(p,institution,institutionType)&&
  (dateMode==='all'||p.firstPublicDate)&&(highlights==='all'||paperMilestones.has(p.id))
 ).map(p=>({id:`paper-${p.id}`,kind:'paper',date:p.firstPublicDate||p.date,title:p.zh,record:p,milestone:paperMilestones.has(p.id)}));
 const mr=type==='paper'?[]:models.filter(m=>
  (!q||modelSearchText(m).includes(q))&&topics.every(t=>(m.technicalTopics||[]).includes(t))&&
  (vendor==='all'||m.vendor===vendor)&&(openness==='all'||m.openness===openness)&&(modality==='all'||m.multimodal===modality)&&
  (highlights==='all'||modelMilestones.has(m.id))
 ).map(m=>({id:`model-${m.id}`,kind:'model',date:m.releaseDate,title:m.name,record:m,milestone:modelMilestones.has(m.id)}));
 return [...pr,...mr].sort((a,b)=>{
  const y=a.date.slice(0,4).localeCompare(b.date.slice(0,4));
  if(y)return chronology==='asc'?y:-y;
  // Year-only dates stay in a separate final group, never treated as January or December.
  if((a.date.length===4)!==(b.date.length===4))return a.date.length===4?1:-1;
  const date=a.date.localeCompare(b.date);
  return (chronology==='asc'?date:-date)||(a.kind===b.kind?(a.kind==='paper'?a.record.rank-b.record.rank:a.title.localeCompare(b.title)):a.kind==='model'?-1:1);
 });
}

export const monthKey=date=>date.length>=7?date.slice(5,7):'00';
export const orderedMonths=(months,chronology)=>months.sort((a,b)=>a==='00'?1:b==='00'?-1:chronology==='asc'?a.localeCompare(b):b.localeCompare(a));
