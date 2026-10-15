import {PaperInstitutions,InstitutionFilters,InstitutionDetails,InstitutionCoverage} from './PaperInstitutions.jsx';
import React,{useState,useEffect,useMemo} from 'react';
import {useDataApp,useDashboardTabs,DataComponent,Section,SectionHeader,Filters,Dropdown,SegmentedControl,Dialog,DataTable,Button} from '../../data-app-public.jsx';
import {tierLabels,filterPapers,overlaps,shortCategory,readingRoutes} from './model.js';
import './dashboard.css';
import {Coverage,DateLabel} from './HistoryViews.jsx';
import {UnifiedTimeline} from './UnifiedTimeline.jsx';
const tabs=[
 {id:'timeline',label:'时间线',aliases:['models','evolution','connections'],filterIds:[],focusFields:['corpus','topic','dateMode','query','paper','entryType','year','month','vendor','openness','modality','timelineView','layout','model','compare','topics','highlights','chronology','institution','institutionType']},
 {id:'library',label:'论文库',filterIds:['venue','tier'],focusFields:['topics','query','status','sort','paper','layout','corpus','institution','institutionType']},
 {id:'directions',label:'方向全景',filterIds:[],focusFields:['paper']},
 {id:'routes',label:'阅读路线',filterIds:[],focusFields:['paper']},
 {id:'coverage',label:'会议覆盖',filterIds:[],focusFields:['catalogVenue','catalogTopic','query','paper']}
];
const statusLabels={unread:'未读',saved:'待读',done:'已读'};
const categoryColor={训练:'var(--chart-1)',系统:'var(--chart-2)',基础:'var(--chart-3)',工程:'var(--chart-4)',证据:'var(--chart-5)',应用:'var(--chart-6)'};
const ext={target:'_blank',rel:'noopener noreferrer'};
function Tier({value}){return <span className={`paper-tier tier-${value.replace('+','plus')}`} title={`${value} · ${tierLabels[value]}`}>{value}</span>}
function Empty({reset}){return <div className="paper-empty"><strong>这个组合下还没有论文</strong><p>多个方向采用交集筛选；可以移除一个方向，或清空条件。</p><Button onClick={reset}>重置筛选</Button></div>}
function PaperCard({p,catMap,onOpen,onTag,marks,onMark,onInstitution}){return <article className="paper-card" data-paper-id={p.id} data-reviewed-rows>
 <div className="paper-card-meta"><Tier value={p.tier}/><span>{p.venue} {p.year}</span><span>{p.track}</span><span className="paper-rank">#{String(p.rank).padStart(2,'0')}</span></div>
 <button className="paper-card-title" onClick={()=>onOpen(p.id)}><h3>{p.zh}</h3><span lang="en">{p.title}</span></button>
 <DateLabel paper={p}/><PaperInstitutions paper={p} onSelect={onInstitution} onOpen={()=>onOpen(p.id)}/><p className="paper-card-summary">{p.summary}</p>
 <div className="paper-tags">{p.tags.map(t=><button key={t} onClick={()=>onTag(t)}>{catMap[t]?.name}</button>)}</div>
 <div className="paper-card-footer"><span className="paper-award">{p.award||(p.track.includes('待核')?'官网目录 · 分轨待核对':p.cohort+' · '+p.role)}</span><button className="paper-mark" aria-label={`${p.zh}：${statusLabels[marks[p.id]||'unread']}，点击切换`} onClick={()=>onMark(p.id)}>{marks[p.id]==='done'?'✓ 已读':marks[p.id]==='saved'?'◉ 待读':'+ 待读'}</button></div>
 <button className="paper-detail-button" onClick={()=>onOpen(p.id)}>摘要、评价与关联 <span aria-hidden="true">↗</span></button>
 </article>}
export function DashboardContent({initialView={}}){
 const shell=useDataApp();
 const {activeTabId}=useDashboardTabs(tabs);
 const requestedTab=initialView.tab||activeTabId;
 const tab=tabs.find(t=>t.id===requestedTab||t.aliases?.includes(requestedTab))?.id||'timeline';
 const papers=shell.queries.papers.rows,cats=shell.queries.directions.rows;
 const catMap=useMemo(()=>Object.fromEntries(cats.map(c=>[c.id,c])),[cats]);
 const focus=shell.viewFocus||{};
 const updateFocus=patch=>shell.setDashboardFocus({...focus,...patch});
 const storageKey=`${shell.snapshot.id}:reading-progress:v1`;
 const [marks,setMarks]=useState(()=>{try{return JSON.parse(localStorage.getItem(storageKey)||'{}')}catch{return {}}});
 const [storageFailed,setStorageFailed]=useState(false);
 const [showTopics,setShowTopics]=useState(false);
 useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(marks));setStorageFailed(false)}catch{setStorageFailed(true)}},[marks,storageKey]);
 const onMark=id=>setMarks(m=>({...m,[id]:!m[id]?'saved':m[id]==='saved'?'done':undefined}));
 const open=id=>updateFocus({paper:id});
 const explore=topicIds=>shell.exploreDashboard('library',{filters:{venue:'all',tier:'all'},focus:{topics:topicIds.join(','),query:'',status:'all',sort:'rank',paper:''}});
 const topics=(focus.topics||'').split(',').filter(t=>catMap[t]);
 const addTopic=t=>updateFocus({topics:topics.includes(t)?topics.filter(x=>x!==t).join(','):[...topics,t].join(',')});
 const opts={query:focus.query||'',topics,venue:shell.filters.venue||'all',tier:shell.filters.tier||'all',status:focus.status||'all',sort:focus.sort||'date',corpus:focus.corpus||'all',institution:focus.institution||'all',institutionType:focus.institutionType||'all'};
 const filtered=filterPapers(papers,opts,marks);
 const reset=()=>{shell.setFilter('venue','all');shell.setFilter('tier','all');updateFocus({topics:'',query:'',status:'all',sort:'date',corpus:'all',institution:'all',institutionType:'all'});};
 const selected=papers.find(p=>p.id===focus.paper);
 const connections=overlaps(papers,selected?.id).slice(0,8);
 const doneCount=papers.filter(p=>marks[p.id]==='done').length;
 const exportRows=()=>{const blob=new Blob([JSON.stringify({title:shell.snapshot.title,checkedAt:shell.snapshot.researchRefresh?.checkedAt,scope:opts,papers:filtered},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='nlp-2026-papers.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 return <article className="paper-dashboard">
 {shell.canReturnFromExploration&&<button className="paper-text-button paper-return" onClick={shell.returnFromExploration}>← 返回上一个视图</button>}
 {tab!=='timeline'&&<div className="paper-scope"><span><b>{papers.length}</b> 篇重点论文 <i/> <b>{cats.length}</b> 个交叉方向</span><span>{papers.filter(p=>p.cohort==='2026 会议').length} 篇 2026 会议 + {papers.filter(p=>p.cohort==='历史背景').length} 篇历史背景 + {papers.filter(p=>p.cohort==='2026 预印本').length} 篇预印本 · 本次检查 {shell.snapshot.researchRefresh?.checkedAt}</span><span className="paper-progress">已读 {doneCount} / {papers.length}</span></div>}
 {tab==='timeline'&&<UnifiedTimeline checkedAt={shell.snapshot.researchRefresh?.checkedAt} history={shell.queries.nlpHistory.rows} papers={papers} models={shell.queries.modelReports.rows} cats={cats} focus={focus} setFocus={updateFocus} onOpen={open} catalogCount={shell.queries.catalog.rows.length} onCoverage={()=>shell.exploreDashboard('coverage',{focus:{catalogVenue:'all',catalogTopic:'all',query:''}})}/>}
 {tab==='coverage'&&<Coverage coverage={shell.queries.coverage.rows} catalog={shell.queries.catalog.rows} papers={papers} cats={cats} focus={focus} setFocus={updateFocus} onOpen={open}/>}
 {tab==='library'&&<>
 <Filters filters={shell.snapshot.filters} queries={shell.queries} values={shell.filters} onChange={shell.setFilter} showClear={false} ariaLabel="论文筛选"><label className="paper-search"><span aria-hidden="true">⌕</span><input aria-label="搜索论文" type="search" placeholder="搜索论文、方法或大学／企业名称…" value={opts.query} onChange={e=>updateFocus({query:e.target.value})}/></label></Filters>
 <div className="paper-library-corpus"><Dropdown label="文献范围" allLabel="全部重点论文" value={opts.corpus} choices={['all','current','preprint','history']} choiceLabels={{all:'全部重点论文',current:'2026 会议论文',preprint:'2026 预印本',history:'历史背景'}} onChange={corpus=>updateFocus({corpus})}/><span className="paper-view-note">默认从近到远，也可切换含金量推荐顺序。</span></div><div className="paper-institution-filterbar"><InstitutionFilters papers={papers} institution={opts.institution} institutionType={opts.institutionType} onChange={updateFocus}/><InstitutionCoverage papers={papers}/></div><div className="paper-library-layout">
 <aside className="paper-topic-rail" aria-label="方向筛选" data-expanded={showTopics}><h2>按方向探索<button className="paper-topic-toggle" aria-expanded={showTopics} onClick={()=>setShowTopics(!showTopics)}>{showTopics?'收起':'展开全部方向'} ⌄</button></h2><p>多选取交集，找跨方向论文</p><button className={!topics.length?'active':''} onClick={()=>updateFocus({topics:''})}>全部方向 <span>{papers.length}</span></button>
 {cats.map(c=><button key={c.id} className={`paper-topic-choice ${topics.includes(c.id)?'active':''}`} onClick={()=>addTopic(c.id)} aria-pressed={topics.includes(c.id)}><span className="paper-topic-dot" style={{background:categoryColor[c.group]}}/>{c.name}<span>{papers.filter(p=>p.tags.includes(c.id)).length}</span></button>)}
 <div className="paper-rail-note">方向数字为全库覆盖数，允许重叠。<br/>评级是阅读推荐，奖项单独展示。</div>
 </aside>
 <section className="paper-library-main" aria-label="论文列表">
 <div className="paper-list-toolbar"><strong aria-live="polite" data-testid="paper-count">{filtered.length} 篇论文</strong><Dropdown label="排序" value={opts.sort} choices={['date','rank','title','venue']} choiceLabels={{date:'时间：从近到远',rank:'含金量推荐顺序',title:'英文标题',venue:'会议'}} onChange={sort=>updateFocus({sort})}/><Dropdown label="阅读状态" allLabel="全部阅读状态" value={opts.status} choices={['all','unread','saved','done']} choiceLabels={{all:'全部阅读状态',...statusLabels}} onChange={status=>updateFocus({status})}/><SegmentedControl ariaLabel="列表形式" value={focus.layout||'cards'} options={[{value:'cards',label:'卡片'},{value:'table',label:'表格'}]} onChange={layout=>updateFocus({layout})}/><button className="paper-text-button" onClick={reset}>重置</button></div>
 {!!topics.length&&<div className="paper-active-tags">交集：{topics.map(t=><button key={t} onClick={()=>addTopic(t)}>{catMap[t].name} ×</button>)}</div>}
 <DataComponent id="paper-catalog" queryId="papers" kind="custom" title="分类与含金量" description="S、A+、A 是当前样本的编辑性阅读等级；序号为通用推荐顺序。综合问题重要性、原创性、证据质量与可迁移启发；它不是会议奖项或客观质量分数。" sourceRows={filtered} displayRows={filtered} variant="plain" headerControls={<button className="paper-text-button" onClick={exportRows}>导出当前结果</button>}>
 {!filtered.length?<Empty reset={reset}/>:focus.layout==='table'?<DataTable caption="重点论文分类与含金量" rows={filtered} searchable={false} rowKey="id" onRowSelect={p=>open(p.id)} rowActionLabel={p=>`查看 ${p.zh} 的摘要与关联`} columns={[{field:'date',label:'可核验日期'},{field:'dateBasis',label:'日期依据'},{field:'rank',label:'顺序'},{field:'tier',label:'等级',renderCell:v=><Tier value={v}/>},{field:'zh',label:'论文'},{field:'conference',label:'会议／分轨'},{field:'institutionLabels',label:'作者单位'},{field:'categories',label:'关联方向'},{field:'award',label:'奖项'}]}/>:<div className="paper-grid">{filtered.map(p=><PaperCard key={p.id} p={p} catMap={catMap} onOpen={open} onTag={addTopic} marks={marks} onMark={onMark} onInstitution={institution=>updateFocus({institution,institutionType:'all'})}/>)}</div>}
 </DataComponent></section></div></>}
 {tab==='directions'&&<>
 <div className="paper-view-intro"><h2>先看问题，再看论文</h2><p>沿微信文章的框架细分为 16 个方向。这里的进展概括以本批论文为依据；方向价值不设总排名。</p></div>
 <DataComponent id="direction-landscape" title="研究方向与进展" queryId="directions" queryIds={["directions","papers"]} kind="custom" sourceRowsByQuery={{directions:cats,papers}} displayRows={cats}>
 <div className="paper-direction-grid">{cats.map((c,index)=><section className="paper-direction" key={c.id} data-reviewed-rows><div className="paper-direction-meta"><span style={{color:categoryColor[c.group]}}>{c.group}</span><span>{String(index+1).padStart(2,'0')} / {papers.filter(p=>p.tags.includes(c.id)).length} 篇</span></div><h3>{c.name}</h3><strong>{c.question}</strong><p>{c.progress}</p><div className="paper-gap"><b>还缺什么</b><p>{c.gap}</p></div><div className="paper-starters">{c.starters.slice(0,3).map(id=><button key={id} onClick={()=>open(id)}>{papers.find(p=>p.id===id)?.short} ↗</button>)}</div><button className="paper-text-button" onClick={()=>explore([c.id])}>查看该方向全部论文 →</button></section>)}</div>
 </DataComponent></>}
 {tab==='routes'&&<>
 <div className="paper-view-intro"><h2>把论文串成一条阅读路线</h2><p>顺序按理解依赖组织，与含金量名次不同。先读摘要建立问题地图，再选择最相关的论文深入方法与实验。</p></div>
 <div className="paper-route-grid">{readingRoutes.map(r=>{const rr=r.items.map(id=>papers.find(p=>p.id===id));return <DataComponent key={r.id} id={`route-${r.id}`} queryId="papers" kind="custom" title={r.title} sourceRows={rr} displayRows={rr} variant="card"><p className="paper-route-intro" data-editable-id={`route-intro-${r.id}`}>{r.description}</p><ol className="paper-route">{rr.map((p,i)=><li key={p.id}><span className={`paper-step ${marks[p.id]==='done'?'done':''}`}>{marks[p.id]==='done'?'✓':i+1}</span><button onClick={()=>open(p.id)}><span>{p.zh}</span><small>{r.goals[i]}</small></button><Tier value={p.tier}/></li>)}</ol></DataComponent>})}</div>
 <Section id="reading-questions" title="读完一篇，留下四个答案"><div className="paper-reading-check"><p><b>问题</b>它推翻了什么直觉，或补上了什么缺口？</p><p><b>证据</b>对照实验是否排除了预算、数据与评测偏差？</p><p><b>边界</b>哪些假设、规模或任务变化可能让结论失效？</p><p><b>延伸</b>它能与相邻方向的哪一个方法或问题结合？</p></div></Section></>}
 {storageFailed&&<p className="paper-storage-error" role="status">当前浏览器无法持久保存阅读记录；本次页面内仍可使用。</p>}
 <Dialog open={!!selected} onClose={()=>updateFocus({paper:''})} title="论文速读与关联" expanded className="paper-dialog">
 {selected&&<div className="paper-detail-body" data-reviewed-rows><div className="paper-detail-meta"><Tier value={selected.tier}/><span>通用阅读顺序 #{selected.rank}</span><span>{selected.conference}</span></div><h2>{selected.zh}</h2><p className="paper-full-title" lang="en">{selected.title}</p><div className="paper-detail-date"><DateLabel paper={selected}/><span>{selected.cohort} · {selected.dateBasis}</span></div><div className="paper-detail-actions"><a className="paper-primary-link" {...ext} href={selected.url}>打开原论文 ↗</a>{selected.award&&<a {...ext} href={selected.awardUrl}>{selected.award} ↗</a>}<button className="paper-mark" onClick={()=>onMark(selected.id)}>{marks[selected.id]==='done'?'✓ 已读':marks[selected.id]==='saved'?'◉ 待读':'+ 加入待读'}</button></div>
 <InstitutionDetails paper={selected} onSelect={institution=>shell.exploreDashboard('library',{filters:{venue:'all',tier:'all'},focus:{institution,institutionType:'all',topics:'',query:'',status:'all',sort:'date',corpus:'all',paper:''}})}/><div className="paper-detail-columns"><div><DataComponent id={`detail-${selected.id}`} title="简单摘要" queryId="papers" kind="custom" sourceRows={[selected]} displayRows={[selected]}><p className="paper-abstract">{selected.summary}</p><h3>为什么值得读</h3><p>{selected.why}</p><div className="paper-limit"><h3>读的时候重点检查</h3><p>{selected.limit}</p></div><p className="paper-depth">阅读深度：{selected.depth} · 未复现实验<br/>{selected.verification}</p>{selected.extra.map((e,i)=><a {...ext} key={i} href={e.url}>{e.label} ↗</a>)}</DataComponent></div>
 <aside><h3>这篇论文覆盖的方向</h3><div className="paper-tags paper-detail-tags">{selected.tags.map(t=><button key={t} onClick={()=>explore([t])}>{catMap[t].name} →</button>)}</div><h3>接着可以联系到</h3><p className="paper-related-hint">全库中共享主题最多的前 8 篇，同分按推荐顺序；不表示互相引用。</p><div className="paper-related-list">{connections.map(p=><button key={p.id} onClick={()=>open(p.id)}><Tier value={p.tier}/><span>{p.zh}<small>{p.shared.map(t=>shortCategory[t]).join(' · ')}</small></span><span>↗</span></button>)}</div></aside></div></div>}
 </Dialog>
 </article>
}
