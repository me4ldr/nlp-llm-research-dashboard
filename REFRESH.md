# 每日内容更新

应用标识：`dashboard:7b32c0d7-dcb0-494c-a504-165fc9d27aae`。
仓库：`me4ldr/nlp-llm-research-dashboard`。
网页：`https://me4ldr.github.io/nlp-llm-research-dashboard/`。
计划时间：每天北京时间 09:30。内容由 Codex 对话定时任务整理；部署由本仓库 GitHub Actions 执行。

## 每次运行

1. 先读取 GitHub 默认分支和当前数据快照、上次检查记录，保留原应用 ID、布局、分类、阅读路线和跨条目关联。检查是否有他人新提交；出现冲突时处理冲突，不强推。
2. 从上次成功检查向前重叠 7 天查找新资料，避免索引延迟造成遗漏。超大会议批次先同步目录，逐步整理重点，明确未读范围。年度滚动时加入新一届真实官网，不凭路径猜测论文集存在。
3. 检查 ACL、EACL、EMNLP、NAACL、ICLR、ICML、NeurIPS、COLM 的官方论文集或录用列表，以及 arXiv 的 cs.CL、cs.AI、cs.LG 中与 NLP / LLM 有关的新作。arXiv 未核实录用前不能标成顶会论文；优先更新现有会议范围，再补值得跟踪的预印本。
4. 检查已收录模型厂商的官方发布说明、报告、模型卡和定价页；新增型号需核实发布时间及具体版本。参数、上下文、开源许可、模态和价格未披露时写未知，不猜测。价格变化标明现价和依据日期，不能覆盖历史价却保留旧日期。
5. 每篇整理问题、方法、证据、局限、值得读的原因、交叉方向。仅读摘要就标摘要级；技术结论查原文相关段落。每个模型补核心技术点、本代变化、披露程度和原始来源，链接到相关论文，区分继承方法与本代创新。
6. 依稳定 URL / DOI / arXiv ID / 规范标题去重。保持旧 ID，更新查询来源和覆盖数量，检查全部交叉引用。发布和会议日期分别保留精度，未知日/月不得补造。
7. 将核实完成的内容写回原 Data 项目，保留已授权的 DataAppChrome 顶部按钮定制和访问量组件，使用 `--source` 构建并检查受影响视图；原项目需要已有锁定的 Vite 依赖。完成后将 buildStatus 设为 complete。运行 prepare_site.py、validate_site.py，再提交 site、authored 和 runtime-overrides；不得上传 work 缓存、飞书页面或凭据。不要使用预编译构建覆盖用户定制的顶部按钮，也不要因纯界面调整而更新研究证据日期。
8. 等待 GitHub Pages 工作流成功，并通过线上 publication.json、哈希数据与页面内容回读核实。源站失败保留原资料，记录具体失败；部署失败不得声称上线。没有实质变化不生成空提交。

## 发展脉络数据

保留 `nlpHistory` 的阶段 ID、论文及模型引用和出版日期精度。里程碑从 `nlpHistory.paperIds` 和 `modelIds` 去重生成，已合并进统一时间线。页面默认从近到远，也可切换从早到晚；按论文首次公开／出版日期和模型发布日期分别排序。只有年份的记录必须放在该年“日期待核”组，不推断月日。历史阶段有重叠，不能按阶段归属打乱日期。

不再展示独立发展脉络 tab 或研究分支图；旧 tab 地址作为时间线别名保留。左侧年份可展开／折叠月份，计数与当前内容、关键词、里程碑及方向筛选一致。论文方向用 `papers.tags`，模型方向用 `modelReports.technicalTopics`，多选取交集；不要把论文关联误标为厂商使用了该方法。保留现有 `evolution` 查询作为历史研究数据，新增方向时维护引用，但不要自动恢复已移除的分支界面。基础历史文献核读日期和近期研究快照日期分别保留。

顶部横向发展脉络使用完整 `nlpHistory`，不受下方事件筛选影响；阶段点击只展开本阶段说明和代表论文，不改动下方焦点。世界模型使用 `kind=parallel` 和双向标记，不参与阶段编号；它的位置表示阅读联系，不能标成 Agent 之后才诞生的固定阶段。`paperIds` 是里程碑代表作，`relatedPaperIds` 是关联进展，后者不自动计为里程碑。`routes.links` 保留论文／官方发布的区别（Genie 3 当前引用官方发布说明）。AGI 终点保持“开放目标”标记，不添加未经核验的实现年份或将其计为已发布模型。

## 首批官方入口

- ACL Anthology：https://aclanthology.org/ （会议目录与最近论文 RSS；发布由会议协调）
- ICLR：https://proceedings.iclr.cc/
- ICML / PMLR：https://proceedings.mlr.press/
- NeurIPS：https://proceedings.neurips.cc/ 与 https://neurips.cc/
- COLM：https://colmweb.org/
- arXiv：https://arxiv.org/；公告说明：https://info.arxiv.org/help/availability.html
- 模型来源：以当前数据 modelReports 的 sources、technicalSource、reportUrl 为起点，使用已验证的官方发布入口发现新版本。

尚未有正式源佐证的新条目放入本地候选文件，并保留检索日期和未解决问题。待核候选不计入已整理论文数，不自动获得阅读等级或技术结论。
