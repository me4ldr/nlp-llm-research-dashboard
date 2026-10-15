export const tierLabels = {S:'优先建立全景','A+':'重点拓展',A:'按方向选读'};
export function matchesCorpus(paper,corpus='all') { return corpus==='all'||paper.cohort===({current:'2026 会议',preprint:'2026 预印本',history:'历史背景'}[corpus]); }
export function filterPapers(rows, {query='',topics=[],venue='all',tier='all',status='all',sort='date',corpus='all'}={}, marks={}) {
 const q=query.trim().toLocaleLowerCase();
 const filtered=rows.filter(p=>matchesCorpus(p,corpus)&&(venue==='all'||p.venue===venue)&&(tier==='all'||p.tier===tier)&&topics.every(t=>p.tags.includes(t))&&(status==='all'||(marks[p.id]||'unread')===status)&&(!q||[p.title,p.zh,p.summary,p.categories,p.award,p.venue].join(' ').toLocaleLowerCase().includes(q)));
 return filtered.sort(sort==='date'?(a,b)=>b.date.localeCompare(a.date)||a.rank-b.rank:sort==='title'?(a,b)=>a.title.localeCompare(b.title):sort==='venue'?(a,b)=>a.venue.localeCompare(b.venue)||a.rank-b.rank:(a,b)=>a.rank-b.rank);
}
export function overlaps(rows, id) { const selected=rows.find(p=>p.id===id); if(!selected)return [];return rows.filter(p=>p.id!==id).map(p=>({...p,shared:p.tags.filter(t=>selected.tags.includes(t))})).filter(p=>p.shared.length).sort((a,b)=>b.shared.length-a.shared.length||a.rank-b.rank); }
export function intersection(rows,a,b){return rows.filter(p=>p.tags.includes(a)&&p.tags.includes(b));}
export const shortCategory = {post:'后训练',reason:'推理验证',agents:'Agent',memory:'长期记忆',rag:'检索 RAG',context:'长上下文',arch:'模型架构',eff:'效率优化',data:'预训练数据',eval:'评测可靠性',safety:'安全隐私',multi:'多模态',mechanism:'能力机理',language:'语言多样性',domain:'领域任务',world:'世界模型'};
export const readingRoutes = [
 {id:'data-selection',title:'从数据筛选走到持续训练',description:'沿飞书笔记中的数据质量问题展开，比较通用质量、目标能力与在线适应三种筛选视角。',items:['deita','less','nait','adg','oasis','mixagent'],goals:['复杂度、质量、多样性','目标能力的梯度影响','神经元与数据价值','答案分歧的选择信号','流式数据怎样筛','域之间如何配比']},
 {id:'overview',title:'先建立全景',description:'先看能力如何失效，再理解架构、记忆容量与可信训练。适合第一次快速进入这些方向。',items:['lost','flex','local','memorize','obfuscation','cure'],goals:['多轮为何失效','生成顺序影响什么','注意力有哪些边界','记忆怎样量化','奖励是否可信','如何学会迭代改进']},
 {id:'training',title:'做训练与后训练',description:'沿着探索、多步改进、参数效率与知识迁移阅读。需要熟悉策略梯度、KL 与低秩适配。',items:['steer','cure','geora','eopd','depo'],goals:['探索的动态变化','训练批评与重试','更新空间的几何','蒸馏保留多样性','减少无效采样']},
 {id:'agent',title:'做可靠 Agent',description:'先理解交互与评测，再研究状态、记忆和程序层自我改进。',items:['lost','car','table','implicit','memrl','dgm'],goals:['交互退化','澄清与边界意识','结构化搜索状态','行为是否真的适应','记忆效用学习','代码层的自我改进']},
 {id:'foundation',title:'做理论与语言机理',description:'在形式模型、容量分析与语言现象之间来回比较，特别关注结论的假设范围。',items:['succinct','local','memorize','abstraction','imperfect'],goals:['表达紧凑性','局部与全局互补','记忆与泛化','学习中的抽象','精确语义诊断']},
 {id:'systems',title:'做效率与多模态系统',description:'按优化器、模型压缩、长上下文到文档与语音系统，理解不同层次的成本。',items:['polar','gisp','s2o','freq','olm','lychee'],goals:['优化器数值核心','结构级压缩','注意力执行加速','缓存压缩','开放文档管线','实时语音交互']},
 {id:'evaluation',title:'做评测、语言与安全',description:'从测量设计入手，理解静态基准之外的时效性、隐私和语言文化覆盖。',items:['veritas','hs','afri','poly','palu','obfuscation'],goals:['动态评测','专家规则任务','跨语言模态差异','细粒度语言结构','局部遗忘','反作弊与检测边界']}
];
