import React,{useMemo,useState,useRef} from 'react';
import {DataComponent,Dropdown,SegmentedControl,Button} from '../../data-app-public.jsx';
import {DateLabel} from './HistoryViews.jsx';
import {ModelReports} from './ModelReports.jsx';
import {TimelineMilestones} from './TimelineMilestones.jsx';
import {ModelTechnology} from './ModelTechnology.jsx';
import {timelineEvents,monthKey,orderedMonths} from './timeline-model.js';
import './unified-timeline.css';

const ext={target:'_blank',rel:'noopener noreferrer'};
const labels={all:'论文 + 模型',paper:'只看论文',model:'只看模型'};
export function UnifiedTimeline({papers,models,history,cats,focus,setFocus,onOpen,catalogCount,onCoverage,checkedAt}){
 const type=focus.entryType||'all',year=focus.year||'all',month=focus.month||'all';
 const query=(focus.query||'').trim().toLocaleLowerCase(),corpus=focus.corpus||'all',dateMode=focus.dateMode||'all';
 const vendor=focus.vendor||'all',openness=focus.openness||'all',modality=focus.modality||'all';
 const highlights=focus.highlights||'all',chronology=focus.chronology||'desc';
 const topics=[...new Set((focus.topics??((focus.topic==='all'?'':focus.topic)||'')).split(',').filter(t=>cats.some(c=>c.id===t)))];
 const filters={type,query,topics,corpus,dateMode,vendor,openness,modality,highlights,chronology};
 const baseEvents=useMemo(()=>timelineEvents({papers,models,history,filters}),[papers,models,history,type,query,topics.join(','),corpus,dateMode,vendor,openness,modality,highlights,chronology]);
 const years=[...new Set(baseEvents.map(e=>e.date.slice(0,4)))];
 const [expandedYears,setExpandedYears]=useState(()=>year==='all'?[]:[year]);
 const resultRef=useRef(null);
 const [mobileYears,setMobileYears]=useState(false);
 const toggleYear=y=>setExpandedYears(old=>old.includes(y)?old.filter(v=>v!==y):[...old,y]);
 const chooseYear=(y,m='all')=>{setFocus({year:y,month:m});if(y!=='all')setExpandedYears(old=>[...new Set([...old,y])]);setMobileYears(false);requestAnimationFrame(()=>resultRef.current?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}))};
 const selectFilter=patch=>setFocus({...patch,year:'all',month:'all'});
 const toggleTopic=t=>selectFilter({topics:topics.includes(t)?topics.filter(v=>v!==t).join(','):[...topics,t].join(','),topic:'all'});
 const events=baseEvents.filter(e=>(year==='all'||e.date.startsWith(year))&&(month==='all'||(month.endsWith('-00')?e.date===month.slice(0,4):e.date.startsWith(month))));
 const paperRows=events.filter(e=>e.kind==='paper').map(e=>e.record),modelRows=events.filter(e=>e.kind==='model').map(e=>e.record);
 const groups=events.reduce((a,e)=>{const y=e.date.slice(0,4),m=monthKey(e.date);a[y]??={};(a[y][m]??=[]).push(e);return a},{});
 const vendors=[...new Set(models.map(m=>m.vendor))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
 const selected=[...new Set((focus.compare||'').split(',').filter(id=>models.some(m=>m.id===id)))].slice(0,4);
 const pick=id=>setFocus({compare:selected.includes(id)?selected.filter(x=>x!==id).join(','):selected.length<4?[...selected,id].join(','):selected.join(',')});
 const resetPatch={entryType:'all',year:'all',month:'all',query:'',corpus:'all',topics:'',topic:'all',dateMode:'all',vendor:'all',openness:'all',modality:'all',highlights:'all',chronology:'desc'};
 const reset=()=>setFocus(resetPatch);
 const moreCount=[type!=='model'&&corpus!=='all',type!=='model'&&dateMode!=='all',type!=='paper'&&vendor!=='all',type!=='paper'&&openness!=='all',type!=='paper'&&modality!=='all'].filter(Boolean).length;
 const onOpenPaper=id=>setFocus({model:'',paper:id});
 const exportEvents=()=>{const blob=new Blob([JSON.stringify({title:'NLP 与大模型时间线',scope:{...filters,year,month},events},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='research-and-model-timeline.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 const specView=focus.timelineView==='models';
 const countText=es=>`${es.filter(e=>e.kind==='paper').length} 篇论文 · ${es.filter(e=>e.kind==='model').length} 个模型`;
 const renderEvent=e=>e.kind==='model'?<article className={`unified-event unified-model ${e.milestone?'is-milestone':''}`} key={e.id} data-event-id={e.id} data-model-id={e.record.id} data-event-date={e.date} data-milestone={e.milestone} data-reviewed-rows>
  <div className="unified-date"><time dateTime={e.date}>{e.date}</time><span>{e.record.dateBasis}</span><b>{e.milestone?'重要模型发布':'模型发布'}</b></div>
  <div className="unified-event-body"><div className="unified-model-heading"><button className="unified-title" onClick={()=>setFocus({model:e.record.id})}>{e.title}<span aria-hidden="true">↗</span></button><span>{e.record.vendor}</span></div><p>{e.record.innovation}</p><div className="paper-tags">{(e.record.technicalTopics||[]).map(t=><button key={t} aria-pressed={topics.includes(t)} onClick={()=>toggleTopic(t)}>{cats.find(c=>c.id===t)?.name}</button>)}</div><ModelTechnology model={e.record} compact papers={papers} onOpenPaper={onOpenPaper}/><div className="unified-model-specs"><span><small>总参数 / 激活</small><strong>{e.record.parameterLabel}</strong>{e.record.activeParameters&&<span> / {e.record.activeLabel}</span>}</span><span><small>上下文 / tokens</small><strong>{e.record.context}</strong></span></div><div className="unified-model-meta"><span>{e.record.multimodal}</span><span>{e.record.openness}</span></div><div className="unified-event-actions"><button className="paper-text-button" onClick={()=>setFocus({model:e.record.id})}>参数、价格与详情</button><a {...ext} href={e.record.reportUrl}>{e.record.reportType} ↗</a><label><input type="checkbox" aria-label={`对比 ${e.title}`} checked={selected.includes(e.record.id)} disabled={selected.length>=4&&!selected.includes(e.record.id)} onChange={()=>pick(e.record.id)}/>加入对比</label></div></div>
 </article>:<article className={`unified-event unified-paper paper-time-item ${e.milestone?'is-milestone':''}`} key={e.id} data-event-id={e.id} data-paper-id={e.record.id} data-event-date={e.date} data-milestone={e.milestone} data-reviewed-rows>
  <div className="unified-date"><DateLabel paper={e.record}/><span className={`paper-tier tier-${e.record.tier.replace('+','plus')}`}>{e.record.tier}</span>{e.milestone&&<b className="unified-milestone-badge">✦ 里程碑论文</b>}</div>
  <div className="unified-event-body"><button className="unified-title paper-time-title" onClick={()=>onOpen(e.record.id)}>{e.milestone?e.record.short:e.title}<span aria-hidden="true">↗</span></button>{e.milestone&&e.record.short!==e.title&&<div className="unified-paper-subtitle">{e.title}</div>}<div className="paper-time-meta">{e.record.venue} {e.record.year} · {e.record.cohort} · {e.record.track}</div><p>{e.record.summary}</p><div className="paper-tags">{e.record.tags.map(t=><button key={t} aria-pressed={topics.includes(t)} onClick={()=>toggleTopic(t)}>{cats.find(c=>c.id===t)?.name}</button>)}</div>{e.milestone&&<div className="unified-milestone-insight"><strong>为什么值得读</strong><span>{e.record.why}</span></div>}</div>
 </article>;
 return <div className="unified-timeline">
  <div className="paper-scope"><span>收录 <b>{papers.length}</b> 篇论文 <i/><b>{models.length}</b> 个模型版本</span><span>1948 起 · NLP 基础到大模型</span><span className="paper-progress">本次检查 {checkedAt} · 条目核验日期见详情</span></div>
  <div className="unified-heading"><h2>NLP 与大模型时间线</h2><SegmentedControl ariaLabel="时间线查看方式" value={specView?'models':'events'} options={[{value:'events',label:'时间线'},{value:'models',label:'模型规格与对比'}]} onChange={timelineView=>setFocus({timelineView,...(timelineView==='models'?{layout:'table'}:{})})}/></div>
  {specView?<ModelReports checkedAt={checkedAt} models={models} papers={papers} onOpenPaper={onOpenPaper} focus={focus} setFocus={setFocus} mode="embedded"/>:<>
   <TimelineMilestones history={history} papers={papers} models={models} onOpen={onOpen} onModel={model=>setFocus({model,paper:''})}/>
   <div className="unified-controls">
    <SegmentedControl ariaLabel="时间线内容" value={type} options={Object.entries(labels).map(([value,label])=>({value,label}))} onChange={entryType=>selectFilter({entryType,...(entryType==='model'?{corpus:'all',dateMode:'all'}:entryType==='paper'?{vendor:'all',openness:'all',modality:'all'}:{})})}/>
    <Dropdown label="重点范围" allLabel="全部动态" value={highlights} choices={['all','milestones']} choiceLabels={{all:'全部动态',milestones:'只看里程碑'}} onChange={highlights=>selectFilter({highlights})}/>
    <label className="paper-search"><input aria-label="搜索时间线" type="search" placeholder="搜索论文、模型或技术…" value={focus.query||''} onChange={e=>selectFilter({query:e.target.value})}/></label>
   </div>
   <div className="unified-subfilters">
    <Dropdown label="添加研究方向" allLabel="全部方向" value="all" choices={['all',...cats.map(c=>c.id)]} choiceLabels={{all:topics.length?'继续添加方向':'全部方向',...Object.fromEntries(cats.map(c=>[c.id,c.name]))}} onChange={t=>t==='all'?selectFilter({topics:'',topic:'all'}):toggleTopic(t)}/>
    <Dropdown label="时间排序" value={chronology} choices={['desc','asc']} choiceLabels={{desc:'从近到远',asc:'从早到晚'}} onChange={chronology=>setFocus({chronology})}/>
    <details className="unified-more-filters"><summary>更多筛选{moreCount?` · ${moreCount}`:''}</summary><div>{type!=='model'&&<><span>论文</span><Dropdown label="文献范围" allLabel="全部论文" value={corpus} choices={['all','current','preprint','history']} choiceLabels={{all:'全部论文',current:'2026 会议论文',preprint:'2026 预印本',history:'历史背景'}} onChange={corpus=>selectFilter({corpus})}/><Dropdown label="日期依据" allLabel="全部可核验日期" value={dateMode} choices={['all','first']} choiceLabels={{all:'全部可核验日期',first:'仅已核验首发'}} onChange={dateMode=>selectFilter({dateMode})}/></>}{type!=='paper'&&<><span>模型</span><Dropdown label="模型厂商" allLabel="全部厂商" value={vendor} choices={['all',...vendors]} choiceLabels={{all:'全部厂商'}} onChange={vendor=>selectFilter({vendor})}/><Dropdown label="开放程度" allLabel="全部开放程度" value={openness} choices={['all',...new Set(models.map(m=>m.openness))]} choiceLabels={{all:'全部开放程度'}} onChange={openness=>selectFilter({openness})}/><Dropdown label="模态能力" allLabel="全部模态" value={modality} choices={['all',...new Set(models.map(m=>m.multimodal))]} choiceLabels={{all:'全部模态'}} onChange={modality=>selectFilter({modality})}/></>}</div></details>
    <button className="paper-text-button" onClick={reset}>重置</button><button className="paper-text-button unified-catalog-link" onClick={onCoverage}>会议题目索引 {catalogCount.toLocaleString()} ↗</button>
   </div>
   {!!topics.length&&<div className="paper-active-tags"><span>方向交集：</span>{topics.map(t=><button key={t} onClick={()=>toggleTopic(t)}>{cats.find(c=>c.id===t)?.name} ×</button>)}<button onClick={()=>selectFilter({topics:'',topic:'all'})}>清空方向</button></div>}
   <ModelReports checkedAt={checkedAt} models={models} papers={papers} onOpenPaper={onOpenPaper} focus={focus} setFocus={setFocus} mode="tools"/>
   <div className="unified-workspace">
    <aside className="unified-year-nav" aria-label="按年份浏览" data-mobile-open={mobileYears}>
     <button className="unified-mobile-years" aria-expanded={mobileYears} onClick={()=>setMobileYears(!mobileYears)}>年份目录 · {year==='all'?'全部年份':year}{month!=='all'?` / ${month.endsWith('-00')?'日期待核':Number(month.slice(5))+' 月'}`:''}<span>{mobileYears?'收起':'展开'} ⌄</span></button>
     <DataComponent id="timeline-year-index" queryId="papers" queryIds={['papers','modelReports']} kind="custom" title="年份" variant="plain" headerControls={<button className="unified-collapse-all" onClick={()=>setExpandedYears([])}>折叠</button>} description="数量为其他筛选条件下该年份的论文与模型发布事件合计。点年份查看全年，箭头展开月份；只含年份的文献单独列入日期待核，不推断月日。" sourceRowsByQuery={{papers:baseEvents.filter(e=>e.kind==='paper').map(e=>e.record),modelReports:baseEvents.filter(e=>e.kind==='model').map(e=>e.record)}} displayRows={years.map(y=>({year:y,papers:baseEvents.filter(e=>e.date.startsWith(y)&&e.kind==='paper').length,models:baseEvents.filter(e=>e.date.startsWith(y)&&e.kind==='model').length}))}>
      <div className="unified-year-tree"><button className={`unified-all-years ${year==='all'?'active':''}`} aria-current={year==='all'?'true':undefined} onClick={()=>chooseYear('all')}>全部年份 <span>{baseEvents.length}</span></button>
      {years.map(y=>{const es=baseEvents.filter(e=>e.date.startsWith(y)),expanded=expandedYears.includes(y),ms=orderedMonths([...new Set(es.map(e=>monthKey(e.date)))],chronology);return <div className={`unified-year-node ${year===y?'active':''}`} key={y}><div className="unified-year-choice"><button className="unified-year-disclosure" aria-expanded={expanded} aria-controls={`months-${y}`} aria-label={`${expanded?'折叠':'展开'} ${y} 年月份`} onClick={()=>toggleYear(y)}><span aria-hidden="true">›</span></button><button className="unified-year-select" aria-label={`查看 ${y} 年`} aria-current={year===y&&month==='all'?'true':undefined} onClick={()=>chooseYear(y)}><strong>{y}</strong><span>{es.length}</span></button></div>{expanded&&<div className="unified-month-tree" id={`months-${y}`}>{ms.map(m=><button key={m} aria-label={`查看 ${y} 年 ${m==='00'?'日期待核':Number(m)+' 月'}`} aria-current={month===`${y}-${m}`?'true':undefined} onClick={()=>chooseYear(y,`${y}-${m}`)}><span>{m==='00'?'日期待核':`${Number(m)} 月`}</span><span>{es.filter(e=>monthKey(e.date)===m).length}</span></button>)}</div>}</div>})}
      </div>
     </DataComponent>
    </aside>
    <section className="unified-main" aria-label="时间线事件">
     <div className="unified-result" ref={resultRef}><div><h3>{year==='all'?'全部年份':`${year} 年`}{month!=='all'?` · ${month.endsWith('-00')?'日期待核':Number(month.slice(5))+' 月'}`:''}</h3><strong data-testid="timeline-count" aria-live="polite">{countText(events)}</strong></div><span className="unified-legend"><i className="model-dot"/>模型 <i className="paper-dot"/>论文 <b>✦</b> 里程碑</span><button className="paper-text-button" onClick={exportEvents}>导出</button></div>
     <DataComponent id="research-timeline" queryId="papers" queryIds={['papers','modelReports','nlpHistory']} kind="custom" title="研究与模型发布事件" showHeading={false} description="论文优先按首次公开日期排列；未核验首发的采用已标注的论文集日期。年份精度的文献置于该年日期待核组，不推断月份或日。模型按所标注的发布事件排列。同日先展示模型，不表示因果或质量顺序。里程碑依据 NLP 历史阅读清单，是编辑性精选；论文和模型可对应同一工作，事件数不是独立研究成果数。" sourceRowsByQuery={{papers:paperRows,modelReports:modelRows,nlpHistory:history.filter(s=>s.paperIds.some(id=>paperRows.some(p=>p.id===id))||(s.modelIds||[]).some(id=>modelRows.some(m=>m.id===id)))}} displayRows={events.map(e=>({id:e.id,type:e.kind==='model'?'模型发布':'论文',date:e.date,title:e.title,milestone:e.milestone,dateBasis:e.record.dateBasis,summary:e.kind==='model'?e.record.innovation:e.record.summary,technicalPoints:e.kind==='model'?e.record.technicalPoints:undefined}))}>
      {!events.length?<div className="paper-empty"><strong>没有匹配的论文或模型</strong><p>可以清空方向、年份或关键词。</p><Button onClick={reset}>重置时间线</Button></div>:years.filter(y=>groups[y]).map(y=><section className="unified-year" key={y} aria-label={`${y} 年动态`}>
       {year==='all'&&<h3 className="unified-year-heading">{y}<span>{countText(Object.values(groups[y]).flat())}</span></h3>}
       <div className="unified-year-events" key={`${y}-${month}-${highlights}-${topics.join(',')}`}>{orderedMonths(Object.keys(groups[y]),chronology).map(m=><section className="unified-month" key={m} aria-label={m==='00'?`${y} 年日期待核`:`${y} 年 ${Number(m)} 月`}><h4>{m==='00'?'日期待核':`${Number(m)} 月`}<span>{countText(groups[y][m])}</span></h4>{m==='00'&&<p className="unified-undated-note">已确认年份，具体月日待核；此处分组不表示年末发布。</p>}{groups[y][m].map(renderEvent)}</section>)}</div>
      </section>)}
     </DataComponent>
     <p className="unified-footnote">里程碑为精选代表作，点击论文标签可筛选，多个方向取交集。模型日期与论文首发日期分别保留；历史基础文献核读至 2026-10-14。</p>
    </section>
   </div>
  </>}
 </div>;
}
