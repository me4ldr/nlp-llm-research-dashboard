import React,{useRef,useState} from 'react';
import {DataComponent} from '../../data-app-public.jsx';
import './timeline-milestones.css';

const stageLabels={ngram:'N-gram',statistical:'统计 NLP',neural:'神经语言模型',embeddings:'word2vec',seq2seq:'Seq2Seq / Attention','transformer-era':'Transformer',transfer:'ELMo / GPT / BERT',scale:'规模化语言模型',alignment:'指令对齐 / ChatGPT',branches:'推理 / 多模态 / Agent'};
export function TimelineMilestones({history,papers,models,onOpen,onModel}){
 const [selected,setSelected]=useState('');
 const rail=useRef(null);
 const stages=[...history].sort((a,b)=>a.order-b.order);
 const current=stages.find(s=>s.id===selected);
 const paperIds=new Set(stages.flatMap(s=>s.paperIds)),modelIds=new Set(stages.flatMap(s=>s.modelIds||[]));
 const scopedPapers=papers.filter(p=>paperIds.has(p.id)),scopedModels=models.filter(m=>modelIds.has(m.id));
 const select=id=>setSelected(old=>old===id?'':id);
 const move=direction=>rail.current?.scrollBy({left:direction*rail.current.clientWidth*.7,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 return <div className="timeline-milestones">
  <DataComponent id="timeline-milestone-overview" title="发展脉络" queryId="nlpHistory" queryIds={['nlpHistory','papers','modelReports']} kind="custom" description="依据已整理的 NLP 历史阶段组织阅读；时期重叠，横向间距不代表年数，连线不是引用关系或唯一发展路径。AGI 是此图的开放目标，不对应已核验的发布事件。此处是固定历史概览，不受下方论文与模型筛选影响。" sourceRowsByQuery={{nlpHistory:stages,papers:scopedPapers,modelReports:scopedModels}} displayRows={stages.map(s=>({stage:s.title,period:s.period,question:s.question,advance:s.advance,paperIds:s.paperIds,modelIds:s.modelIds}))} headerControls={<div className="timeline-lineage-nav"><button aria-label="向左浏览发展脉络" onClick={()=>move(-1)}>←</button><button aria-label="向右浏览发展脉络" onClick={()=>move(1)}>→</button></div>}>
   <div className="timeline-lineage-scroll" ref={rail} tabIndex={0} aria-label="从 N-gram 到 AGI 的发展脉络，可横向滚动">
    <ol className="timeline-lineage-track">
     {stages.map((s,i)=><li key={s.id}><button className="timeline-lineage-node" aria-expanded={selected===s.id} aria-controls="timeline-stage-detail" onClick={()=>select(s.id)} data-stage-id={s.id} data-reviewed-rows><small>{s.period}</small><span className="timeline-lineage-dot" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><strong>{stageLabels[s.id]||s.title}</strong><span className="timeline-lineage-hint">{s.paperIds.length} 篇代表论文</span></button></li>)}
     <li className="timeline-lineage-goal"><button className="timeline-lineage-node" aria-expanded={selected==='agi'} aria-controls="timeline-stage-detail" onClick={()=>select('agi')} data-stage-id="agi"><small>开放目标</small><span className="timeline-lineage-dot" aria-hidden="true">◇</span><strong>AGI</strong><span className="timeline-lineage-hint">通用人工智能</span></button></li>
    </ol>
   </div>
   <div className="timeline-lineage-caption"><span>点击阶段，展开代表论文与关键变化</span><span>时期存在重叠 · AGI 为研究目标</span></div>
   {!!selected&&<section id="timeline-stage-detail" className="timeline-stage-detail" aria-label={current?`${current.title} 阶段详情`:'AGI 目标说明'}>
    <div className="timeline-stage-heading"><div><small>{current?.period||'开放目标'}</small><h3>{current?.id==='branches'?'推理、多模态与 Agent':current?.title||'AGI · 通用人工智能'}</h3></div><button className="paper-text-button" onClick={()=>setSelected('')}>收起 ×</button></div>
    {current?<><div className="timeline-stage-copy"><div><strong>{current.question}</strong><p>{current.advance}</p></div><div><strong>留下的问题</strong><p>{current.limit}</p></div></div><div className="timeline-stage-papers"><span>代表论文</span>{current.paperIds.map(id=>{const p=papers.find(p=>p.id===id);return p?<button key={id} onClick={()=>onOpen(id)}><b>{p.short}</b><small>{p.firstPublicDate||p.date}</small><span aria-hidden="true">↗</span></button>:null})}{(current.modelIds||[]).map(id=>{const m=models.find(m=>m.id===id);return m?<button className="timeline-stage-model" key={id} onClick={()=>onModel(id)}><b>{m.name}</b><small>模型发布 · {m.releaseDate}</small><span aria-hidden="true">↗</span></button>:null})}</div></>:<p className="timeline-agi-note">在这张图里，AGI 表示通用人工智能这一开放研究目标，不对应已核验的模型发布，也不设定实现年份。前面的论文与模型记录展示已有进展，不能据此推断 AGI 已经实现或必然按这条路线实现。</p>}
   </section>}
  </DataComponent>
 </div>;
}
