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

## 论文作者单位

维护每篇重点论文的 `institutions`（id/name/nameEn/type）、`institutionLabels`、`affiliationStatus`、`affiliationSources`、`affiliationsCheckedAt` 与核验成功时的 `affiliationsVerifiedAt`。单位必须查所引版本的作者署名、脚注或官方研究历史资料；按研究开展时的归属记录，不从作者姓名、邮箱、当前任职、转载站点或致谢资助方推断。院系／实验室归并到所属大学或企业，沿用已有机构 ID；联合署名保留所有已确认单位，不把第一项称为牵头机构。同名不明机构不能强行合并。

`type` 为 university/company/research/other；性质未确认和独立研究者列 other，并在 affiliationNote 说明。无法确认单位时 institutions 为空、status 为 pending，页面显示待核实，不能解释为无所属单位。仅核对单位不更新论文阅读深度、技术证据核验日、历史价格日期或研究刷新记录。同步 `affiliationEnrichment` 的覆盖数量，会议题目索引不自动继承作者单位。论文库与时间线保留大学／企业、校企合作和具体机构筛选，中英文名称可搜索，详情保留原始来源。

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

## 补漏与中断恢复

- 分开记录任务触发、实际执行、完成核验与发布成功。没有提交可能是无变化，不能据此判定任务未执行；没有完成记录也不能写成检查成功。检查连续覆盖区间和未完成任务，从最早未覆盖日期继续补查并向前重叠 7 天。
- 每阶段保存来源结果、候选、未完成范围与完成检查点；恢复时优先读取这些小文件。工具输出只返回必要字段和短摘录，完整目录／正文留在本地，避免把大量历史对话、论文元数据或原始 HTML 填入上下文。
- 模型发现至少覆盖官方发布博客／索引、产品更新记录、API 模型表和官方权重仓库。官网改域或旧页失效时继续查官方新域及检索索引。单个指南存在占位符，只使该字段不能采用，不能替代对其他官方来源的检查。
- 每次重新处理所有未解决候选；记录 `firstSeenAt`、`lastAttemptAt`、`status`、`unresolvedFields`、`sourcesTried` 与 `nextAction`。连续两次仍待核时必须换用其他官方入口，并明确剩余缺口；不能只复制上次理由。已经确认型号和发布事件、且有可归纳的正式资料时先入库，参数、独立报告、许可或价格等缺项逐字段标未知。
- 发布、博客、API 开放和权重开放分别核实日期。Highspeed 等同模型服务档可在本行清楚列价，不重复当作新基础模型；历史补录按真实发布日期排序，不计作今日新发布。预告开放不等于已经开放权重。
- Kimi 固定复查入口：[研究博客](https://www.kimi.ai/blog/)、[Kimi Code 最新动态](https://www.kimi.com/code/docs/en/kimi-code/whats-new.html)、[API 平台](https://platform.kimi.ai/)、[API 定价](https://platform.kimi.ai/docs/pricing/chat)、[官方权重](https://huggingface.co/moonshotai)。Z.ai 博客正文不可读时，交叉检查 [AutoClaw 官方模型介绍](https://autoclaw.z.ai/models/)、[API 文档](https://docs.z.ai/guides/overview/overview) 和 [官方权重](https://huggingface.co/zai-org)，不要只重试博客根页。
- 截至 2026-10-27，Kimi K3.1 Pro 已补录，开放权重仍需复查 11 月 4 日前的兑现情况；GLM-5.3-Flash 是 8 月历史补录。缺口修复不表示已穷尽所有型号或未读论文。
