import React from 'react';
import {Dropdown,DataComponent} from '../../data-app-public.jsx';
import {institutionTypeLabels,institutionFilterLabels,institutionChoices} from './affiliations.js';
import './paper-institutions.css';

export function InstitutionFilters({papers,institution='all',institutionType='all',onChange}){
 const units=institutionChoices(papers);
 return <><Dropdown label="论文机构类型" value={institutionType} choices={Object.keys(institutionFilterLabels)} choiceLabels={institutionFilterLabels} onChange={institutionType=>onChange({institutionType,institution:'all'})}/><Dropdown label="论文作者单位" value={institution} choices={['all',...units.map(i=>i.id)]} choiceLabels={{all:'全部作者单位',...Object.fromEntries(units.map(i=>[i.id,i.name]))}} onChange={institution=>onChange({institution})}/></>;
}
export function PaperInstitutions({paper,onSelect,onOpen,full=false}){
 const units=paper.institutions||[],shown=full?units:units.slice(0,3);
 const verified=paper.affiliationStatus==='verified';
 return <div className={`paper-institutions ${full?'is-full':''}`} data-reviewed-rows>
  {!full&&<span className="paper-institution-label">作者单位</span>}
  {!units.length?<span className="paper-institution-unknown">待核实</span>:shown.map(i=>{
   const content=<><small>{institutionTypeLabels[i.type]||'其他'}</small><span>{i.name}</span></>;
   return onSelect?<button key={i.id} type="button" className="paper-institution" data-institution-type={i.type} title={`${i.nameEn} · 查看相关论文`} onClick={()=>onSelect(i.id)}>{content}</button>:<span key={i.id} className="paper-institution" title={i.nameEn}>{content}</span>;
  })}
  {!full&&units.length>shown.length&&<button type="button" className="paper-institution-more" aria-label={`查看全部 ${units.length} 个作者单位`} onClick={onOpen}>另 {units.length-shown.length} 家 ↗</button>}
  {!!units.length&&!verified&&<span className="paper-institution-unknown">部分待核实</span>}
 </div>;
}
export function InstitutionDetails({paper,onSelect}){
 return <DataComponent id={`affiliations-${paper.id}`} queryId="papers" kind="custom" title="作者单位" showHeading={false} variant="plain" sourceRows={[paper]} displayRows={[paper]}><section className="paper-institution-detail" aria-label="论文作者单位" data-reviewed-rows><h3>作者单位</h3><PaperInstitutions paper={paper} full onSelect={onSelect}/><p>按所引论文版本的署名整理，同一单位的实验室合并展示，名称归一便于检索；排列不表示牵头或贡献排名。</p>{paper.affiliationNote&&<p>{paper.affiliationNote}</p>}<div className="paper-institution-evidence">{paper.affiliationsVerifiedAt&&<span>单位核验：{paper.affiliationsVerifiedAt}</span>}{(paper.affiliationSources||[]).map((s,i)=><a key={i} href={s.url} target="_blank" rel="noopener noreferrer">{s.label} ↗</a>)}</div></section></DataComponent>;
}
export function InstitutionCoverage({papers}){
 const verified=papers.filter(p=>p.affiliationStatus==='verified').length;
 return <span className="paper-institution-coverage">全库单位已核实 {verified} / {papers.length} 篇{verified<papers.length?` · ${papers.length-verified} 篇待核` : ''}</span>;
}
