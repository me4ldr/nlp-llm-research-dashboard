import React,{useMemo} from 'react';
import {DataComponent,Dropdown,SegmentedControl,Button} from '../../data-app-public.jsx';
import {DateLabel} from './HistoryViews.jsx';
import {ModelReports} from './ModelReports.jsx';
import {ModelTechnology,modelSearchText} from './ModelTechnology.jsx';
import './unified-timeline.css';

const ext={target:'_blank',rel:'noopener noreferrer'};
const labels={all:'全部动态',paper:'只看论文',model:'只看模型'};
export function UnifiedTimeline({papers,models,cats,focus,setFocus,onOpen,catalogCount,onCoverage}){
 const legacyPaperCut=(focus.topic&&focus.topic!=='all')||(focus.corpus&&focus.corpus!=='all')||focus.dateMode==='first';
 const type=focus.entryType||(legacyPaperCut?'paper':'all'),year=focus.year||'all',query=(focus.query||'').trim().toLocaleLowerCase();
 const corpus=focus.corpus||'all',topic=focus.topic||'all',dateMode=focus.dateMode||'all';
 const vendor=focus.vendor||'all',openness=focus.openness||'all',modality=focus.modality||'all';
 const years=[...new Set([...papers.map(p=>p.date.slice(0,4)),...models.map(m=>m.year)])].sort().reverse();
 const vendors=[...new Set(models.map(m=>m.vendor))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
 const month=focus.month||'all';
 const baseEvents=useMemo(()=>{
  const pr=type==='model'?[]:papers.filter(p=>(year==='all'||p.date.startsWith(year))&&(!query||[p.title,p.zh,p.summary].join(' ').toLocaleLowerCase().includes(query))&&(type!=='paper'||((corpus==='all'||p.cohort===(corpus==='current'?'2026 会议':'历史背景'))&&(topic==='all'||p.tags.includes(topic))&&(dateMode==='all'||p.firstPublicDate)))).map(p=>({id:`paper-${p.id}`,kind:'paper',date:p.date,title:p.zh,record:p}));
  const mr=type==='paper'?[]:models.filter(m=>(year==='all'||m.year===year)&&(!query||modelSearchText(m).includes(query))&&(type!=='model'||((vendor==='all'||m.vendor===vendor)&&(openness==='all'||m.openness===openness)&&(modality==='all'||m.multimodal===modality)))).map(m=>({id:`model-${m.id}`,kind:'model',date:m.releaseDate,title:m.name,record:m}));
  return [...pr,...mr].sort((a,b)=>b.date.localeCompare(a.date)||(a.kind===b.kind?(a.kind==='paper'?a.record.rank-b.record.rank:a.title.localeCompare(b.title)):a.kind==='model'?-1:1));
 },[papers,models,type,year,query,corpus,topic,dateMode,vendor,openness,modality]);
 const events=useMemo(()=>month==='all'?baseEvents:baseEvents.filter(e=>e.date.startsWith(month)),[baseEvents,month]);
 const months=[...new Set(baseEvents.filter(e=>e.date.length>=7).map(e=>e.date.slice(0,7)))].sort().reverse();
 const monthLabels=Object.fromEntries(months.map(m=>{const es=baseEvents.filter(e=>e.date.startsWith(m));return [m,`${m} · ${es.filter(e=>e.kind==='paper').length} 篇论文 / ${es.filter(e=>e.kind==='model').length} 模型`]}));
 const paperRows=events.filter(e=>e.kind==='paper').map(e=>e.record),modelRows=events.filter(e=>e.kind==='model').map(e=>e.record);
 const groups=useMemo(()=>events.reduce((a,e)=>{const y=e.date.slice(0,4),month=e.date.slice(5,7)||'00';a[y]??={};(a[y][month]??=[]).push(e);return a},{}),[events]);
 const selected=[...new Set((focus.compare||'').split(',').filter(id=>models.some(m=>m.id===id)))].slice(0,4);
 const pick=id=>setFocus({compare:selected.includes(id)?selected.filter(x=>x!==id).join(','):selected.length<4?[...selected,id].join(','):selected.join(',')});
 const resetPatch={entryType:'all',year:'all',month:'all',query:'',corpus:'all',topic:'all',dateMode:'all',vendor:'all',openness:'all',modality:'all'};
 const reset=()=>setFocus(resetPatch);
 const onOpenPaper=id=>setFocus({model:'',paper:id});
 const currentCount=papers.filter(p=>p.cohort==='2026 会议').length;
 const exportEvents=()=>{const blob=new Blob([JSON.stringify({title:'论文与模型发布时间线',scope:{type,year,month,query,...(type==='paper'?{corpus,topic,dateMode}:type==='model'?{vendor,openness,modality}:{})},events},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='research-and-model-timeline.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 const specView=focus.timelineView==='models';
 return <div className="unified-timeline">
  <div className="paper-scope"><span>收录 <b>{papers.length}</b> 篇论文 <i/><b>{models.length}</b> 个模型版本</span><span>模型始于 ChatGPT · 论文含更早的基础研究</span><span className="paper-progress">截至 2026-10-13</span></div>
  <div className="unified-heading"><h2>论文进展与模型发布</h2><SegmentedControl ariaLabel="时间线查看方式" value={specView?'models':'events'} options={[{value:'events',label:'时间线'},{value:'models',label:'模型规格与对比'}]} onChange={timelineView=>setFocus({timelineView,...(timelineView==='models'?{layout:'table'}:{})})}/></div>
  {specView?<ModelReports models={models} papers={papers} onOpenPaper={onOpenPaper} focus={focus} setFocus={setFocus} mode="embedded"/>:<>
   <div className="unified-reading-guide"><div><strong>论文与模型，放在同一条研究时间线上</strong><p>这里展示已整理摘要的重点论文；今年录用的论文可能早在往年首发。更多题目可到会议目录检索。</p></div><div className="unified-scope-links"><button onClick={()=>setFocus({...resetPatch,entryType:'paper',corpus:'current'})}>今年会议 <b>{currentCount}</b> 篇</button><button onClick={()=>setFocus({...resetPatch,entryType:'paper',corpus:'history'})}>历史基础 <b>{papers.length-currentCount}</b> 篇</button><button onClick={onCoverage}>题目索引 <b>{catalogCount.toLocaleString()}</b> 条 ↗</button></div></div>
   <div className="unified-controls">
    <SegmentedControl ariaLabel="时间线内容" value={type} options={Object.entries(labels).map(([value,label])=>({value,label}))} onChange={entryType=>setFocus({entryType})}/>
    <Dropdown label="时间线年份" allLabel="全部年份" value={year} choices={['all',...years]} choiceLabels={{all:'全部年份'}} onChange={year=>setFocus({year,month:'all'})}/>
    <Dropdown label="时间线月份" allLabel="全部月份" value={month} choices={['all',...months]} choiceLabels={{all:'全部月份',...monthLabels}} onChange={month=>setFocus({month})}/>
    <label className="paper-search"><input aria-label="搜索时间线" type="search" placeholder="搜索论文、模型或技术…" value={focus.query||''} onChange={e=>setFocus({query:e.target.value})}/></label>
    <button className="paper-text-button" onClick={reset}>重置时间线</button>
   </div>
   {type==='paper'&&<div className="unified-subfilters"><span>论文筛选</span><Dropdown label="文献范围" allLabel="全部重点论文" value={corpus} choices={['all','current','history']} choiceLabels={{all:'全部重点论文',current:'2026 会议论文',history:'历史背景'}} onChange={corpus=>setFocus({corpus})}/><Dropdown label="研究方向" allLabel="全部方向" value={topic} choices={['all',...cats.map(c=>c.id)]} choiceLabels={{all:'全部方向',...Object.fromEntries(cats.map(c=>[c.id,c.name]))}} onChange={topic=>setFocus({topic})}/><Dropdown label="日期依据" allLabel="全部可核验日期" value={dateMode} choices={['all','first']} choiceLabels={{all:'全部可核验日期',first:'仅已核验首发'}} onChange={dateMode=>setFocus({dateMode})}/></div>}
   {type==='model'&&<div className="unified-subfilters"><span>模型筛选</span><Dropdown label="模型厂商" allLabel="全部厂商" value={vendor} choices={['all',...vendors]} choiceLabels={{all:'全部厂商'}} onChange={vendor=>setFocus({vendor})}/><Dropdown label="开放程度" allLabel="全部开放程度" value={openness} choices={['all',...new Set(models.map(m=>m.openness))]} choiceLabels={{all:'全部开放程度'}} onChange={openness=>setFocus({openness})}/><Dropdown label="模态能力" allLabel="全部模态" value={modality} choices={['all',...new Set(models.map(m=>m.multimodal))]} choiceLabels={{all:'全部模态'}} onChange={modality=>setFocus({modality})}/></div>}
   <div className="unified-result"><strong data-testid="timeline-count" aria-live="polite">{paperRows.length} 篇论文 · {modelRows.length} 个模型发布</strong><span className="unified-legend"><i className="model-dot"/>模型发布 <i className="paper-dot"/>论文 · 从近到远</span><button className="paper-text-button" onClick={exportEvents}>导出时间线</button></div>
   <ModelReports models={models} papers={papers} onOpenPaper={onOpenPaper} focus={focus} setFocus={setFocus} mode="tools"/>
   <DataComponent id="research-timeline" queryId="papers" queryIds={['papers','modelReports']} kind="custom" title="研究与模型发布事件" description="论文优先按首次公开日期排列；未核验首发的采用已标注的论文集日期。仅核验录用年份的置于该年日期待核分组，不推断月份或日。模型按所标注的发布事件排列。同日先展示模型，不表示因果或质量顺序。两类事件可对应同一项工作，不应相加作为唯一研究工作数。" sourceRowsByQuery={{papers:paperRows,modelReports:modelRows}} displayRows={events.map(e=>({id:e.id,type:e.kind==='model'?'模型发布':'论文',date:e.date,title:e.title,dateBasis:e.record.dateBasis,summary:e.kind==='model'?e.record.innovation:e.record.summary,technicalPoints:e.kind==='model'?e.record.technicalPoints:undefined}))}>
    {type==='all'&&paperRows.length>0&&<aside className="unified-paper-guide" aria-label="最近论文速览" data-reviewed-rows><div><strong>最近论文速览</strong><span>按当前范围内可核验日期</span></div><div className="unified-paper-shortcuts">{paperRows.filter(p=>p.datePrecision!=='年').slice(0,3).map(p=><button key={p.id} onClick={()=>onOpen(p.id)}><small>{p.date} · {p.venue}</small><b>{p.short}</b><span>{p.zh} ↗</span></button>)}</div></aside>}
    {!events.length?<div className="paper-empty"><strong>没有匹配的论文或模型</strong><p>可以放宽年份或关键词。</p><Button onClick={reset}>重置时间线</Button></div>:Object.keys(groups).sort().reverse().map(y=><section className="unified-year" key={y} aria-label={`${y} 年动态`}><div className="unified-year-label"><h3>{y}</h3><span>{Object.values(groups[y]).flat().length} 条动态</span></div><div className="unified-year-events">{Object.keys(groups[y]).sort().reverse().map(month=><section className="unified-month" key={month} aria-label={month==='00'?`${y} 年日期待核`:`${y} 年 ${Number(month)} 月`}><h4>{month==='00'?'日期待核':`${Number(month)} 月`}<span>{groups[y][month].filter(e=>e.kind==='paper').length} 篇论文 · {groups[y][month].filter(e=>e.kind==='model').length} 个模型</span></h4>{month==='00'&&<p className="unified-undated-note">已确认所标注的年份，具体月日待核；此处分组不表示年末发布。</p>}{groups[y][month].map(e=>e.kind==='model'?<article className="unified-event unified-model" key={e.id} data-event-id={e.id} data-model-id={e.record.id} data-event-date={e.date} data-reviewed-rows>
     <div className="unified-date"><time dateTime={e.date}>{e.date}</time><span>{e.record.dateBasis}</span><b>模型发布</b></div>
     <div className="unified-event-body"><div className="unified-model-heading"><button className="unified-title" onClick={()=>setFocus({model:e.record.id})}>{e.title}<span aria-hidden="true">↗</span></button><span>{e.record.vendor}</span></div><p>{e.record.innovation}</p><ModelTechnology model={e.record} compact papers={papers} onOpenPaper={onOpenPaper}/><div className="unified-model-specs"><span><small>总参数 / 激活</small><strong>{e.record.parameterLabel}</strong>{e.record.activeParameters&&<span> / {e.record.activeLabel}</span>}</span><span><small>上下文 / tokens</small><strong>{e.record.context}</strong></span></div><div className="unified-model-meta"><span>{e.record.multimodal}</span><span>{e.record.openness}</span></div><div className="unified-event-actions"><button className="paper-text-button" onClick={()=>setFocus({model:e.record.id})}>参数、价格与详情</button><a {...ext} href={e.record.reportUrl}>{e.record.reportType} ↗</a><label><input type="checkbox" aria-label={`对比 ${e.title}`} checked={selected.includes(e.record.id)} disabled={selected.length>=4&&!selected.includes(e.record.id)} onChange={()=>pick(e.record.id)}/>加入对比</label></div></div>
    </article>:<article className="unified-event unified-paper paper-time-item" key={e.id} data-event-id={e.id} data-paper-id={e.record.id} data-event-date={e.date} data-reviewed-rows><div className="unified-date"><DateLabel paper={e.record}/><span className={`paper-tier tier-${e.record.tier.replace('+','plus')}`}>{e.record.tier}</span></div><div className="unified-event-body"><button className="unified-title paper-time-title" onClick={()=>onOpen(e.record.id)}>{e.title}<span aria-hidden="true">↗</span></button><div className="paper-time-meta">{e.record.venue} {e.record.year} · {e.record.cohort} · {e.record.track}</div><p>{e.record.summary}</p><div className="paper-tags">{e.record.tags.map(t=><button key={t} onClick={()=>setFocus({entryType:'paper',topic:t})}>{cats.find(c=>c.id===t)?.name}</button>)}</div></div></article>)}</section>)}</div></section>)}
   </DataComponent>
  </>}
 </div>;
}
