import React, {useMemo, useState} from 'react';
import {DataComponent, Dialog, Dropdown, SegmentedControl} from '../../data-app-public.jsx';
import {intersection} from './model.js';
import './evolution.css';

const branchName = b => b.title.split('：')[0];
const idsFor = b => [...new Set(b.stages.flatMap(s => s[3]))];
const nodeLabels = {ngram:'N-gram · 规则',statistical:'统计 NLP · HMM / CRF',neural:'神经 LM · RNN',embeddings:'word2vec',seq2seq:'Seq2Seq · Attention','transformer-era':'Transformer',transfer:'ELMo · GPT · BERT',scale:'GPT-3 · Scaling Laws',alignment:'指令对齐 · ChatGPT',branches:'大模型研究'};
const branchLabels = {'data-path':'预训练与数据','reason-path':'对齐与推理','agent-path':'Agent 与工具','knowledge-path':'检索与记忆','architecture-path':'架构与效率','world-path':'多模态与世界模型','trust-path':'评测与安全','language-path':'语言与机理'};

function PaperLinks({ids, paperMap, onOpen}) {
  return <div className="evo-paper-links">{ids.map(id => {const p=paperMap[id];return p&&<button key={id} onClick={()=>onOpen(id)} title={p.title}><strong>{p.short}<span aria-hidden="true">↗</span></strong><small>{p.date} · {p.venue} · {p.tier}</small></button>})}</div>;
}

export function Evolution({history, branches, papers, models, cats, focus, setFocus, onOpen, onExplore, onModel}) {
  const [dialogOpen,setDialogOpen]=useState(false);
  const paperMap=useMemo(()=>Object.fromEntries(papers.map(p=>[p.id,p])),[papers]);
  const catMap=useMemo(()=>Object.fromEntries(cats.map(c=>[c.id,c])),[cats]);
  const stage=history.find(s=>s.id===focus.stage)||history[0];
  const branch=branches.find(b=>b.id===focus.branch)||branches.find(b=>b.tags.includes(focus.category))||branches[0];
  const isBranch=focus.nodeType==='branch'||(!focus.nodeType&&!focus.stage&&!!(focus.branch||focus.category));
  const panel=['overview','papers','cross'].includes(focus.panel)?focus.panel:'overview';
  const branchIds=idsFor(branch);
  const branchTopicRows=papers.filter(p=>branch.coreTags.some(t=>p.tags.includes(t)));
  const peers=branches.filter(b=>b.id!==branch.id).map(b=>({...b,shared:branchTopicRows.filter(p=>b.coreTags.some(t=>p.tags.includes(t))).map(p=>p.id)})).sort((a,b)=>b.shared.length-a.shared.length);
  const peerBranch=peers.find(b=>b.id===focus.peerBranch);
  const topic=catMap[focus.category]?focus.category:branch.tags[0];
  const peer=catMap[focus.peer]&&focus.peer!==topic?focus.peer:'';
  const topicRows=papers.filter(p=>p.tags.includes(topic));
  const linked=cats.filter(c=>c.id!==topic).map(c=>({...c,count:intersection(papers,topic,c.id).length})).sort((a,b)=>b.count-a.count);
  const crossRows=(peerBranch?peerBranch.shared.map(id=>paperMap[id]):peer?intersection(papers,topic,peer):topicRows).slice().sort((a,b)=>b.date.localeCompare(a.date)||a.rank-b.rank);
  const stages=focus.order==='newest'?branch.stages:[...branch.stages].reverse();
  const title=isBranch?branchName(branch):stage.title;
  const showDetail=()=>{if(window.matchMedia('(max-width: 1100px)').matches)setDialogOpen(true)};
  const selectStage=id=>{setFocus({stage:id,nodeType:'stage',panel:'overview'});showDetail()};
  const selectBranch=id=>{const b=branches.find(b=>b.id===id);setFocus({branch:id,nodeType:'branch',panel:'overview',category:b.tags[0],peer:'',peerBranch:''});showDetail()};
  const openPaper=id=>{setDialogOpen(false);onOpen(id)};
  const openModel=id=>{setDialogOpen(false);onModel(id)};
  const crossBranch=id=>{setFocus({panel:'cross',peerBranch:id,peer:''});showDetail()};
  const crossTitle=peerBranch?`${branchLabels[branch.id]} × ${branchLabels[peerBranch.id]}`:peer?`${catMap[topic].name} × ${catMap[peer].name}`:catMap[topic].name;
  const stageY=i=>38+i*54;
  const branchY=i=>108+i*62;

  const detail=<div className="evo-inspector-body" data-node-detail={isBranch?branch.id:stage.id}>
    <div className="evo-detail-heading"><small>{isBranch?'大模型研究分支':stage.period}</small><h3>{title}</h3><p>{isBranch?branch.caption:stage.tagline}</p></div>
    {isBranch?<>
      <SegmentedControl ariaLabel="分支详情" value={panel} options={[{value:'overview',label:'脉络解读'},{value:'papers',label:'阶段论文'},{value:'cross',label:'交叉关系'}]} onChange={value=>setFocus({panel:value})}/>
      {panel==='overview'&&<DataComponent id="evolution-origin" queryId="evolution" queryIds={['evolution','nlpHistory']} kind="custom" title="这条路线在解决什么" sourceRowsByQuery={{evolution:[branch],nlpHistory:history.filter(h=>branch.originStageIds.includes(h.id))}} displayRows={[branch]} variant="plain">
        <p className="evo-question">{branch.question}</p><dl className="evo-explanation"><div><dt>从哪里来</dt><dd>{branch.origin}</dd></div><div><dt>当前瓶颈</dt><dd>{branch.frontier}</dd></div></dl>
        <h4>回看基础</h4><div className="evo-inline-links">{branch.originStageIds.map(id=><button key={id} onClick={()=>selectStage(id)}>{nodeLabels[id]} ↗</button>)}</div>
        <h4>连接的研究方向</h4><div className="evo-inline-links">{branch.tags.map(id=><button key={id} onClick={()=>setFocus({panel:'cross',category:id,peer:'',peerBranch:''})}>{catMap[id].name} ↗</button>)}</div>
        <button className="evo-primary-action" onClick={()=>setFocus({panel:'papers'})}>顺着阶段读 {branchIds.length} 篇论文 →</button>
      </DataComponent>}
      {panel==='papers'&&<DataComponent id={`evolution-${branch.id}`} queryId="evolution" queryIds={['evolution','papers']} kind="custom" title="阶段变化与代表论文" sourceRowsByQuery={{evolution:[branch],papers:branchIds.map(id=>paperMap[id])}} displayRows={stages.map(s=>({period:s[0],stage:s[1],interpretation:s[2],paperIds:s[3]}))} variant="plain" headerControls={<SegmentedControl ariaLabel="分支时间顺序" value={focus.order==='newest'?'newest':'oldest'} options={[{value:'oldest',label:'从早到晚'},{value:'newest',label:'最新在前'}]} onChange={order=>setFocus({order})}/>}>
        <ol className="evo-mini-timeline">{stages.map(s=><li key={s[1]} data-reviewed-rows><time>{s[0]}</time><h4>{s[1]}</h4><p>{s[2]}</p><PaperLinks ids={s[3]} paperMap={paperMap} onOpen={openPaper}/></li>)}</ol>
      </DataComponent>}
      {panel==='cross'&&<>
        <DataComponent id="evolution-branch-intersections" queryId="evolution" queryIds={['evolution','papers']} kind="custom" title="与其他分支一起读" sourceRowsByQuery={{evolution:branches,papers:branchTopicRows}} displayRows={peers.map(b=>({branch:branchLabels[b.id],sharedPaperIds:b.shared,sharedPaperCount:b.shared.length}))} variant="plain">
          <div className="evo-cross-choices">{peers.map(b=><button key={b.id} data-peer-branch={b.id} aria-pressed={peerBranch?.id===b.id} onClick={()=>setFocus({peerBranch:b.id,peer:''})}><span>{branchLabels[b.id]}</span><b>{b.shared.length} 篇</b></button>)}</div>
          <p className="evo-note">当前分组：{branch.coreTags.map(id=>catMap[id].name).join("、")}。按论文标签取交集，不表示引用次数。</p>
        </DataComponent>
        <details className="evo-topic-disclosure" open={!peerBranch}><summary>按 16 个细分方向找交叉</summary><div className="evo-topic-controls"><Dropdown label="中心方向" showLabel value={topic} choices={cats.map(c=>c.id)} choiceLabels={Object.fromEntries(cats.map(c=>[c.id,c.name]))} onChange={category=>setFocus({category,peer:'',peerBranch:''})}/><Dropdown label="交叉方向" showLabel value={peer||'all'} choices={['all',...linked.map(c=>c.id)]} choiceLabels={{all:'全部',...Object.fromEntries(linked.map(c=>[c.id,`${c.name} · ${c.count}`]))}} onChange={value=>setFocus({peer:value==='all'?'':value,peerBranch:''})}/></div></details>
        <DataComponent id="topic-papers" queryId="papers" kind="custom" title={`${crossTitle} · ${crossRows.length} 篇`} sourceRows={crossRows} displayRows={crossRows} variant="plain" headerControls={!peerBranch&&<button className="paper-text-button" onClick={()=>{setDialogOpen(false);onExplore(peer?[topic,peer]:[topic])}}>在论文库查看 →</button>}>
          {peerBranch&&<p className="evo-note">交叉分组：{peerBranch.coreTags.map(id=>catMap[id].name).join("、")}</p>}{!crossRows.length?<div className="evo-empty">当前论文库没有这个交集的条目；不代表两个方向没有研究联系。</div>:<div className="evo-cross-papers">{crossRows.map(p=><article key={p.id} data-reviewed-rows data-cross-paper={p.id}><small>{p.date} · {p.venue} · {p.tier}</small><button onClick={()=>openPaper(p.id)}>{p.zh} ↗</button><p>{p.summary}</p></article>)}</div>}
        </DataComponent>
      </>}
    </>:<DataComponent id="nlp-stage-detail" queryId="nlpHistory" queryIds={['nlpHistory','papers','modelReports']} kind="custom" title="这个阶段带来了什么" sourceRowsByQuery={{nlpHistory:[stage],papers:stage.paperIds.map(id=>paperMap[id]),modelReports:models.filter(m=>stage.modelIds.includes(m.id))}} displayRows={[stage]} variant="plain">
      <div data-stage-detail={stage.id} data-reviewed-rows><p className="evo-question">{stage.question}</p><dl className="evo-explanation"><div><dt>关键变化</dt><dd>{stage.advance}</dd></div><div><dt>留下的问题</dt><dd>{stage.limit}</dd></div><div><dt>下一步</dt><dd>{stage.next}</dd></div></dl>
        <details className="evo-example"><summary>例子与补充说明</summary><p>{stage.example}</p></details>
        <h4>代表论文与发布</h4><PaperLinks ids={stage.paperIds} paperMap={paperMap} onOpen={openPaper}/>{stage.modelIds.map(id=>{const m=models.find(m=>m.id===id);return m&&<button key={id} className="evo-model-link" onClick={()=>openModel(id)}>{m.name}<small>{m.releaseDate} · 模型发布 ↗</small></button>})}
        <h4>延伸到今天</h4><div className="evo-inline-links">{stage.branchIds.map(id=><button key={id} onClick={()=>selectBranch(id)}>{branchLabels[id]} →</button>)}</div>
      </div>
    </DataComponent>}
  </div>;

  return <div className="evo-page">
    <div className="evo-workspace">
      <div className="evo-map-column">
        <DataComponent id="nlp-mainline" queryId="nlpHistory" queryIds={['nlpHistory','evolution','papers']} kind="custom" title="NLP → 大模型 → 今天的研究分支" sourceRowsByQuery={{nlpHistory:history,evolution:branches,papers:papers.filter(p=>history.some(h=>h.paperIds.includes(p.id))||branches.some(b=>idsFor(b).includes(p.id)))}} displayRows={[...history,...branches]} description="实线表示学习主线与分组；虚线表示选中分支所关联的历史基础。方法可长期并存，分支并非统一诞生于 ChatGPT 之后，也不是论文引用图。" variant="plain">
          <p className="evo-map-hint">左侧读演变，右侧看分支；点节点展开，点“交叉”找共同论文。</p><div className="evo-map" data-reviewed-rows>
            <div className="evo-map-label evo-map-label-main">NLP 基础 → 通用大模型</div><div className="evo-map-label evo-map-label-branches">当下研究分支</div>
            <svg viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true" className="evo-map-lines">
              {history.slice(0,-1).map((h,i)=><path key={h.id} className="evo-trunk" d={`M 220 ${stageY(i)+44} V ${stageY(i+1)}`}/>)}
              <path className="evo-bus" d={`M 440 ${stageY(9)+22} H 515 V ${branchY(0)+22}`}/>
              {branches.map((b,i)=><path key={b.id} className={`evo-bus ${isBranch&&b.id===branch.id?'is-active':''}`} d={`M 515 ${branchY(i)+22} H 580`}/>)}
              {isBranch&&branch.originStageIds.map(id=>{const i=history.findIndex(h=>h.id===id),bi=branches.findIndex(b=>b.id===branch.id);return <path className="evo-origin-line" key={id} d={`M 440 ${stageY(i)+22} C 485 ${stageY(i)+22}, 535 ${branchY(bi)+22}, 580 ${branchY(bi)+22}`}/>})}
            </svg>
            {history.map((s,i)=><button className={`evo-map-node evo-history-node ${i>=5?'evo-modern':''} ${isBranch&&branch.originStageIds.includes(s.id)?'is-origin':''}`} key={s.id} style={{top:`${stageY(i)/6}%`}} data-stage-id={s.id} aria-pressed={!isBranch&&s.id===stage.id} onClick={()=>selectStage(s.id)} title={`${s.title} · ${s.tagline}`}><span className="evo-node-number">{String(i+1).padStart(2,'0')}</span><span><time>{s.period}</time><strong>{nodeLabels[s.id]||s.title}</strong></span><span aria-hidden="true" className="evo-node-arrow">›</span></button>)}
            {branches.map((b,i)=>{const shared=peers.find(p=>p.id===b.id)?.shared.length||0;return <div key={b.id} className="evo-branch-node-wrap" style={{top:`${branchY(i)/6}%`}}><button className={`evo-map-node evo-branch-node ${!isBranch&&stage.branchIds.includes(b.id)?'is-related':''}`} data-branch-id={b.id} aria-pressed={isBranch&&branch.id===b.id} onClick={()=>selectBranch(b.id)} title={b.title}><span><strong>{branchLabels[b.id]}</strong><small>{isBranch&&branch.id!==b.id?`与所选分支共 ${shared} 篇` : b.caption}</small></span><span aria-hidden="true" className="evo-node-arrow">›</span></button>{isBranch&&b.id!==branch.id&&shared>0&&<button className="evo-shared-jump" onClick={()=>crossBranch(b.id)} aria-label={`查看${branchLabels[branch.id]}与${branchLabels[b.id]}的 ${shared} 篇共同论文`}>交叉 ↗</button>}</div>})}
          </div>
          <div className="evo-map-legend"><span><i className="evo-line-key"/>学习主线</span><span><i className="evo-line-key dashed"/>选中分支的历史基础</span><span>节点可点开</span></div>
          <p className="evo-note">阶段存在重叠；连线表示阅读脉络，不表示直接引用或方法完全替代。</p>
        </DataComponent>
        <button className="evo-mobile-detail" onClick={()=>setDialogOpen(true)}><span><small>当前选中</small><strong>{title}</strong></span><b>查看详情 ↗</b></button>
      </div>
      <aside className="evo-inspector" aria-label="所选节点详情">{!dialogOpen&&detail}</aside>
    </div>
    <p className="evo-note evo-freshness">基础脉络核读：2026-10-14 · 近期研究快照：2026-10-13。原文链接、摘要与阅读深度见论文详情。</p>
    <Dialog open={dialogOpen} onClose={()=>setDialogOpen(false)} title="发展脉络 · 节点详情" expanded className="evo-detail-dialog">{dialogOpen&&detail}</Dialog>
  </div>;
}
