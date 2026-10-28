import React,{useMemo} from 'react';
import {DataComponent,Dropdown,DataTable,Button} from '../../data-app-public.jsx';
const ext={target:'_blank',rel:'noopener noreferrer'};
export function DateLabel({paper:p}){return <span className={`paper-date ${p.firstPublicDate?'':'approximate'}`}><time dateTime={p.date}>{p.date}</time><span>{p.firstPublicDate?'首次公开':p.datePrecision==='年'?(p.cohort==='历史背景'?'出版年份 · 月日未核':'仅录用年份 · 日期待核'):p.cohort==='历史背景'?'出版月份 · 首发待核':'论文集 · 首发待核'}</span></span>}
function TopicChoices({cats,value,onChange}){return <Dropdown label="研究方向" allLabel="全部方向" value={value||'all'} choices={['all',...cats.map(c=>c.id)]} choiceLabels={{all:'全部方向',...Object.fromEntries(cats.map(c=>[c.id,c.name]))}} onChange={onChange}/>}
export function Coverage({coverage,catalog,papers,cats,focus,setFocus,onOpen}){
 const q=(focus.query||'').trim().toLocaleLowerCase(),venue=focus.catalogVenue||'all',topic=focus.catalogTopic||'all';
 const rows=useMemo(()=>catalog.filter(r=>(venue==='all'||r.venue===venue)&&(topic==='all'||r.tags.includes(topic))&&(!q||r.title.toLocaleLowerCase().includes(q))),[catalog,q,venue,topic]);
 const total=coverage.reduce((s,r)=>s+(r.catalogCount||0),0);
 return <><div className="paper-view-intro"><h2>覆盖了哪些会议，读到了哪一层</h2><p>已解析 {coverage.filter(r=>r.catalogCount!=null).length} 个会议的 {total.toLocaleString()} 个限定目录条目，题目初筛保留 {catalog.length.toLocaleString()} 条候选。重点整理 {papers.filter(p=>p.cohort==='2026 会议').length} 篇本年度会议论文，另补 {papers.filter(p=>p.cohort==='历史背景').length} 篇历史代表作和 {papers.filter(p=>p.cohort==='2026 预印本').length} 篇预印本。目录检索不等于摘要阅读；预印本不计入会议录用。</p></div>
 <DataComponent id="conference-coverage" queryId="coverage" kind="custom" title="2026 会议覆盖与阅读深度" sourceRows={coverage} displayRows={coverage}>
 <div className="paper-coverage-table"><table><thead><tr><th>会议</th><th>目录条目</th><th>题目候选</th><th>摘要整理</th><th>检索边界与状态</th></tr></thead><tbody>{coverage.map(r=><tr key={r.id}><th><a {...ext} href={r.sourceUrl}>{r.venue} ↗</a></th><td>{r.catalogCount==null?'未获取':r.catalogCount.toLocaleString()}</td><td>{r.indexedCount==null?'未获取':r.indexedCount.toLocaleString()}</td><td>{r.curatedCount}</td><td><b>{r.coverage}</b><p>{r.scope}</p></td></tr>)}</tbody></table></div>
 <p className="paper-coverage-note">目录数按本次解析口径计数，包含的分轨见右列，不能当作主会总录用数。ACL／EACL／COLM／EMNLP 保留所选分轨全部题目；ICLR／ICML／NeurIPS 使用关键词初筛并人工补入已核验重点论文，仍可能误收或漏收。跨会议同题目保留，不能解释为唯一研究工作的总数。NeurIPS 细分活动海报在目录类型中单列，不等同主会论文；UIST 仅补充单篇，未系统解析目录。AAAI、IJCAI、CVPR 等尚未系统纳入。</p>
 </DataComponent>
 <div className="paper-catalog-controls"><h3>检索题目候选</h3><div className="paper-history-controls"><Dropdown label="目录会议" allLabel="全部目录会议" value={venue} choices={['all',...coverage.filter(r=>r.indexedCount).map(r=>r.venue)]} choiceLabels={{all:'全部目录会议'}} onChange={catalogVenue=>setFocus({catalogVenue})}/><TopicChoices cats={cats} value={topic} onChange={catalogTopic=>setFocus({catalogTopic})}/><label className="paper-search"><input aria-label="搜索目录题目" type="search" placeholder="用英文关键词搜索原始题目…" value={focus.query||''} onChange={e=>setFocus({query:e.target.value})}/></label></div></div>
 <DataComponent id="official-title-index" queryId="catalog" kind="custom" title={`${rows.length.toLocaleString()} 条题目候选`} description="题目标签为规则辅助初筛；只有“已整理摘要”的匹配条目进入重点论文库并获得推荐等级。其余条目不推断含金量。" sourceRows={rows} displayRows={rows}>
 <DataTable caption="2026 官方目录候选题目" rows={rows} rowKey="id" searchable={false} columns={[{field:'venue',label:'会议'},{field:'title',label:'原始题目',renderCell:(v,r)=><a {...ext} href={r.url}>{v} ↗</a>},{field:'track',label:'分轨／目录类型'},{field:'categories',label:'题目标签'},{field:'reading',label:'阅读深度',renderCell:(v,r)=>r.curatedId?<button className="paper-text-button" onClick={()=>onOpen(r.curatedId)}>已整理摘要 ↗</button>:v}]}/>
 </DataComponent></>;
}
