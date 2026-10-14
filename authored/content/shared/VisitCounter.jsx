import React from 'react';

const publicOrigin = 'https://me4ldr.github.io';
const publicPath = '/nlp-llm-research-dashboard/';

export function VisitCounter() {
  const live = typeof window !== 'undefined' && window.location.origin === publicOrigin
    && window.location.pathname.startsWith(publicPath);
  const style = {display:'inline-flex',alignItems:'center',flexShrink:0,height:32,maxWidth:'40vw'};
  const note = '本看板累计访问次数（PV），非独立访客数；从接入起统计。切换分类和标签不重复计数。统计服务：不蒜子。';
  return <span className="research-visit-counter" style={style} title={note}>
    {live ? <iframe title="看板累计访问量" src={`${publicOrigin}${publicPath}visits.html`}
      referrerPolicy="no-referrer" scrolling="no"
      style={{width:148,height:32,border:0,display:'block',colorScheme:'light dark'}} />
      : <span style={{fontSize:13,color:'var(--secondary)',whiteSpace:'nowrap'}}>访问量 · 线上统计</span>}
  </span>;
}
