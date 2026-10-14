import React from 'react';
const ext={target:'_blank',rel:'noopener noreferrer'};
export const modelSearchText=m=>[m.name,m.vendor,m.innovation,m.architecture,m.license,m.generationChange,...(m.technicalPoints||[]).flatMap(p=>[p.name,p.detail])].join(' ').toLocaleLowerCase();
export function ModelTechnology({model:m,compact=false,papers=[],onOpenPaper}){
 const points=m.technicalPoints||[];
 if(!points.length)return null;
 const list=items=><ul className="model-tech-points">{items.map(p=><li key={p.name}><strong>{p.name}</strong><span>{p.detail}</span></li>)}</ul>;
 const context=<><p className="model-generation"><b>本代变化</b>{m.generationChange}</p>{list(compact?points.slice(2):points)}<a className="model-tech-source" {...ext} href={m.technicalSource}>技术依据 ↗</a><p className="model-tech-note">{m.technicalNote}</p>{onOpenPaper&&!!m.relatedPaperIds?.length&&<div className="model-tech-reading"><span>联系到论文</span>{m.relatedPaperIds.map(id=>{const p=papers.find(p=>p.id===id);return p?<button key={id} className="paper-text-button" onClick={()=>onOpenPaper(id)}>{p.short} ↗</button>:null})}</div>}</>;
 return <section className={`model-technology ${compact?'compact':''}`} aria-label={`${m.name} 技术要点`}>
  <div className="model-tech-heading"><h3>{m.technicalDisclosure==='能力／服务披露'?'公开能力与改进':'核心技术点'}</h3><span>{m.technicalDisclosure}</span></div>
  {compact?<>{list(points.slice(0,2))}<details><summary>展开本代变化与全部 {points.length} 个要点</summary>{context}</details></>:context}
 </section>;
}
