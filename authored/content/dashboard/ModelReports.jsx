import React,{useMemo} from 'react';
import {DataComponent,Dropdown,SegmentedControl,Dialog,DataTable,Button} from '../../data-app-public.jsx';
import './model-reports.css';
import {ModelTechnology,modelSearchText} from './ModelTechnology.jsx';
const ext={target:'_blank',rel:'noopener noreferrer'};
const ALL='all';
function Price({m,detail=false}){return <div className="model-price"><strong>{m.priceLabel}</strong><small>{m.price.input!=null?`${m.price.basis} · ${m.price.currency==='CNY'?'人民币':'美元'} / 百万 tokens · 输入 / 输出`:m.price.note}</small>{m.price.input!=null&&<small>{m.price.note}</small>}{detail&&<small>价格依据日期：{m.price.asOf}</small>}</div>}
function Parameter({m}){return <><strong>{m.parameterLabel}</strong><small>激活：{m.activeLabel}</small></>}
function Badges({m}){return <div className="model-badges"><span>{m.multimodal}</span><span className={m.openness==='闭源'?'':'open'}>{m.openness}</span></div>}
const fields=[['厂商',m=>m.vendor],['发布事件',m=>`${m.releaseDate} · ${m.dateBasis}`],['总参数',m=>m.parameterLabel],['激活参数',m=>m.activeLabel],['架构',m=>m.architecture],['上下文（tokens）',m=>m.context],['输入模态',m=>m.inputModalities],['输出模态',m=>m.outputModalities],['开放程度',m=>m.openness],['许可',m=>m.license]];
export function ModelReports({models,focus,setFocus,mode="full",papers=[],onOpenPaper}){
 const vendor=focus.vendor||ALL,year=focus.year||ALL,open=focus.openness||ALL,modality=focus.modality||ALL,q=(focus.query||'').trim().toLowerCase();
 const vendors=[...new Set(models.map(m=>m.vendor))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
 const years=[...new Set(models.map(m=>m.year))].sort().reverse();
 const rows=useMemo(()=>models.filter(m=>(vendor===ALL||m.vendor===vendor)&&(year===ALL||m.year===year)&&(open===ALL||m.openness===open)&&(modality===ALL||m.multimodal===modality)&&(!q||modelSearchText(m).includes(q))).sort((a,b)=>b.releaseDate.localeCompare(a.releaseDate)||a.name.localeCompare(b.name)),[models,vendor,year,open,modality,q]);
 const current=models.find(m=>m.id===focus.model);
 const selectedIds=(focus.compare||'').split(',').filter(id=>models.some(m=>m.id===id)).slice(0,4);
 const comparison=selectedIds.map(id=>models.find(m=>m.id===id));
 const pick=id=>setFocus({compare:selectedIds.includes(id)?selectedIds.filter(x=>x!==id).join(','):selectedIds.length<4?[...selectedIds,id].join(','):selectedIds.join(',')});
 const reset=()=>setFocus({vendor:ALL,year:ALL,openness:ALL,modality:ALL,query:''});
 const exportRows=()=>{const blob=new Blob([JSON.stringify({title:'大模型技术报告',checkedAt:'2026-10-13',scope:{vendor,year,openness:open,modality,query:q},models:rows},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='llm-technical-reports.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 return <div className="model-reports">
 {mode==='full'&&<><div className="paper-scope"><span><b>{models.length}</b> 个关键型号 <i/><b>{vendors.length}</b> 家研发机构</span><span>2022-11-30 起 · 核验截至 2026-10-13</span><span className="paper-progress">发布日期 ↓ 从近到远</span></div>
 <div className="paper-view-intro model-intro"><div><span className="model-eyebrow">MODEL RELEASE ATLAS / 2022—2026</span><h2>从 ChatGPT，读到这一代大模型</h2><p>按厂商回看代际变化，或选中最多 4 个型号并排比较。覆盖主流通用语言与多模态模型的关键版本，不穷举所有尺寸、微调版和量化版。</p></div><div className="model-intro-note">B = 十亿参数，T = 万亿参数。<br/>“未公开”不猜测；“未核实”保留缺口。</div></div>
 </>}
 {mode!=='tools'&&<><div className="model-controls" aria-label="模型筛选">
 <label className="paper-search"><input type="search" aria-label="搜索模型" placeholder="搜索型号、厂商、架构或技术要点…" value={focus.query||''} onChange={e=>setFocus({query:e.target.value})}/></label>
 <Dropdown label="模型厂商" allLabel="全部厂商" value={vendor} choices={[ALL,...vendors]} choiceLabels={{all:'全部厂商'}} onChange={vendor=>setFocus({vendor})}/>
 <Dropdown label="发布年份" allLabel="全部年份" value={year} choices={[ALL,...years]} choiceLabels={{all:'全部年份'}} onChange={year=>setFocus({year})}/>
 <Dropdown label="开放程度" allLabel="全部开放程度" value={open} choices={[ALL,...new Set(models.map(m=>m.openness))]} choiceLabels={{all:'全部开放程度'}} onChange={openness=>setFocus({openness})}/>
 <Dropdown label="模态能力" allLabel="全部模态" value={modality} choices={[ALL,...new Set(models.map(m=>m.multimodal))]} choiceLabels={{all:'全部模态'}} onChange={modality=>setFocus({modality})}/>
 <button className="paper-text-button" onClick={reset}>重置模型筛选</button></div>
 <div className="model-toolbar"><strong aria-live="polite" data-testid="model-count">{rows.length} 个型号</strong><span>同日发布不表示能力顺序</span><SegmentedControl ariaLabel="模型列表形式" value={focus.layout||'cards'} options={[{value:'cards',label:'时间卡片'},{value:'table',label:'对照表格'}]} onChange={layout=>setFocus({layout})}/><button className="paper-text-button" onClick={exportRows}>导出模型结果</button></div>
 </>}
 {comparison.length>0&&<DataComponent id="model-comparison" queryId="modelReports" kind="custom" title={`已选 ${comparison.length} / 4 · 型号对比`} sourceRows={comparison} displayRows={comparison} headerControls={<button className="paper-text-button" onClick={()=>setFocus({compare:''})}>清空对比</button>}><div className="model-compare-scroll" tabIndex={0} aria-label="型号对比，可横向滚动"><table className="model-compare-table"><thead><tr><th>比较项</th>{comparison.map(m=><th key={m.id}>{m.name}<button aria-label={`移除 ${m.name} 对比`} onClick={()=>pick(m.id)}>×</button></th>)}</tr></thead><tbody>{fields.map(([label,get])=><tr key={label}><th>{label}</th>{comparison.map(m=><td key={m.id}>{get(m)}</td>)}</tr>)}<tr><th>API 输入 / 输出</th>{comparison.map(m=><td key={m.id}><Price m={m} detail/></td>)}</tr><tr><th>技术要点</th>{comparison.map(m=><td key={m.id}><ul className="model-compare-tech">{m.technicalPoints?.map(p=><li key={p.name}><b>{p.name}</b><span>{p.detail}</span></li>)}</ul></td>)}</tr><tr><th>原始资料</th>{comparison.map(m=><td key={m.id}><a {...ext} href={m.reportUrl}>{m.reportType} ↗</a></td>)}</tr></tbody></table></div></DataComponent>}
 {mode!=='tools'&&<><DataComponent id="model-release-catalog" queryId="modelReports" kind="custom" title="大模型发布与技术报告" description="时间为所标注版本的发布事件。价格分别注明现价、历史价或预告价；统一显示每百万 tokens 未缓存文本输入／文本输出，保留原币种。" sourceRows={rows} displayRows={rows}>
 {rows.length===0?<div className="paper-empty"><strong>没有匹配的型号</strong><p>可以放宽厂商、年份或关键词。</p><Button onClick={reset}>重置模型筛选</Button></div>:focus.layout==='table'?<DataTable caption="模型规格与技术报告，按发布日期倒序" rows={rows} rowKey="id" searchable={false} onRowSelect={m=>setFocus({model:m.id})} rowActionLabel={m=>`查看 ${m.name} 的规格与来源`} columns={[
 {field:'releaseDate',label:'发布日期'},{field:'name',label:'型号'},{field:'vendor',label:'厂商'},{field:'parameterLabel',label:'总参数'},{field:'activeLabel',label:'激活参数'},{field:'context',label:'上下文 / tokens'},{field:'priceLabel',label:'API 输入 / 输出',renderCell:(v,m)=><Price m={m}/>},{field:'technicalPoints',label:'技术要点',renderCell:(v,m)=><button className="paper-text-button model-table-tech" onClick={e=>{e.stopPropagation();setFocus({model:m.id})}}>{v?.map(p=>p.name).join(' · ')}</button>},{field:'multimodal',label:'模态'},{field:'openness',label:'开放程度'},{field:'reportType',label:'资料',renderCell:(v,m)=><a {...ext} href={m.reportUrl} onClick={e=>e.stopPropagation()}>{v} ↗</a>}
 ]}/>:<div className="model-card-grid">{rows.map((m,i)=><article className="model-card" key={m.id} data-model-id={m.id} data-reviewed-rows>
 <div className="model-card-top"><time dateTime={m.releaseDate}>{m.releaseDate}</time><span>{m.dateBasis}</span><span>{m.vendor}</span></div>
 <button className="model-name" onClick={()=>setFocus({model:m.id})}>{m.name}<span aria-hidden="true">↗</span></button>
 <Badges m={m}/>
 <dl className="model-stats"><div><dt>总参数 / 激活参数</dt><dd><Parameter m={m}/></dd></div><div><dt>上下文 / tokens</dt><dd><strong>{m.context}</strong><small>{m.architecture}</small></dd></div></dl>
 <Price m={m}/><p className="model-summary">{m.innovation}</p><ModelTechnology model={m} compact papers={papers} onOpenPaper={onOpenPaper}/>
 <div className="model-card-bottom"><a {...ext} href={m.reportUrl}>{m.reportType} ↗</a><button className="paper-text-button" onClick={()=>setFocus({model:m.id})}>规格与来源</button><label className="model-compare-check"><input type="checkbox" aria-label={`对比 ${m.name}`} checked={selectedIds.includes(m.id)} disabled={selectedIds.length>=4&&!selectedIds.includes(m.id)} onChange={()=>pick(m.id)}/>对比</label></div>
 </article>)}</div>}
 </DataComponent>
 <p className="model-footnote">开放权重与训练代码、数据全部开放分别标记。上下文数值可能是原生窗口或需配置的扩展上限；价格按具体 API 版本和条件解释，不用参数量或单价推断模型能力排名。历史型号可能已退役或被同名路由替换。</p>
 </>}
 <Dialog open={!!current} onClose={()=>setFocus({model:''})} title="模型规格与原始资料" expanded className="paper-dialog model-dialog">
 {current&&<div className="model-detail" data-reviewed-rows><div className="model-card-top"><time>{current.releaseDate}</time><span>{current.dateBasis}</span><span>{current.vendor}</span></div><h2>{current.name}</h2><Badges m={current}/><DataComponent id={`model-detail-${current.id}`} queryId="modelReports" kind="custom" title="规格、技术要点与来源" sourceRows={[current]} displayRows={[current]}><p className="model-detail-summary">{current.innovation}</p><ModelTechnology model={current} papers={papers} onOpenPaper={onOpenPaper}/><dl className="model-detail-specs">{fields.map(([label,get])=><div key={label}><dt>{label}</dt><dd>{get(current)}</dd></div>)}</dl><h3>API 价格与适用条件</h3><Price m={current} detail/><h3>规格补充</h3><p>{current.contextNote||'上下文为所标注版本的官方规格；不同接入平台可能设定更小窗口。'}</p><p>{current.openNote}</p>{current.notes&&<p>{current.notes}</p>}<h3>查看原始资料</h3><div className="model-sources">{current.sources.map((s,i)=><a key={i} {...ext} href={s.url}>{s.label} ↗<small>{new URL(s.url).hostname}</small></a>)}</div><p className="model-footnote">核验日期：{current.verifiedAt}。链接类型按实际资料标明；未找到独立技术报告时，提供官方模型卡或发布说明。</p><Button onClick={()=>pick(current.id)} disabled={comparison.length>=4&&!selectedIds.includes(current.id)}>{selectedIds.includes(current.id)?'从对比中移除':'加入型号对比'}</Button></DataComponent></div>}
 </Dialog>
 </div>
}
