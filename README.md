# NLP / 大模型研究地图

[打开时间线](https://me4ldr.github.io/nlp-llm-research-dashboard/?view=1&tab=timeline)

按时间、方向和阅读优先级整理 NLP / 大模型论文、模型技术报告与发展脉络。论文带摘要、阅读价值、局限和原文链接；模型包含技术机制、本代变化、参数、上下文、API 价格口径、开放程度及相关论文。

首次发布包含 123 篇带摘要论文、73 个模型版本、224 个模型技术要点。15,056 条会议题目索引属于检索候选集，不代表全部已读；S / A+ / A 是编辑性阅读优先级，不是会议官方排名。

2026-10-14 增加 12 篇 NLP 基础文献，目前共 135 篇重点论文。发展脉络已合并进[时间线](https://me4ldr.github.io/nlp-llm-research-dashboard/?view=1&tab=timeline)：左侧按年份浏览，箭头展开／折叠月份；论文与模型在同一时间线上展示，支持从近到远或从早到晚排序。27 篇精选里程碑论文及 2 个重要模型发布单独突出，也可只看里程碑。研究分支图已移除，通过方向标签多选取交集寻找跨方向论文和模型。旧 evolution、connections、models 地址仍可打开时间线。

## 更新与部署

- 内容更新：当前 Codex 对话每天北京时间 09:30 检查官方来源、核实并整理新增内容。需要运行 Codex 的电脑和应用在线。
- 网站部署：内容更新通过校验后推送 `main`，GitHub Actions 自动部署到 GitHub Pages。网页托管本身不依赖该电脑在线。
- 部署工作流不会自行阅读论文或改写数据。未获得足够证据的条目保留在候选列表，不自动变成已核实摘要。
- 更新时间分开记录：数据生成时间、逐条核验日期、API 价格依据日期。部署不等于重新核实全部资料。
- 本站为静态页面。筛选、待读和已读等浏览器本地状态不在不同设备间同步；在线访问不提供多人共同编辑后端。
- 右上角访问量为本看板累计打开次数（PV），从接入统计时开始，不代表独立访客数。由[不蒜子](https://busuanzi.ibruce.info/)通过固定的本站 `visits.html` 页面计数，切换标签或筛选不重复计数，其他 GitHub Pages 项目的流量不合并。服务不可用时显示“暂不可用”，本地预览不计数。

## 文件

- `site/`：完整、可直接托管的已编译应用与带哈希的数据文件。
- `authored/`：看板的 React / CSS 内容源文件与主题。
- `runtime-overrides/`：用户明确要求的顶部按钮调整、对应完整性清单及访问量页面；保留于每日更新。
- `scripts/prepare_site.py`：使用本机已安装的 Codex Data 编译器生成独立发布包，保留应用 ID，去除本地对话路由信息。
- `scripts/validate_site.py`：校验 HTML / 数据完整性、主要字段和跨论文链接。
- `REFRESH.md`：来源与每日更新方法。

内容仍在原有 Codex Data 项目中编辑；此仓库不包含完整 Data 插件、登录凭据、飞书原文、研究下载缓存或本地对话记录。构建需要本机已安装的 Data 插件及原项目锁定的 Vite 依赖。顶部按钮定制通过有范围的授权校验，必须使用 `--source` 编译，不能切回默认预编译外壳。发布包标记为 `source-inline-v1`：数据嵌入 HTML，同时保留哈希 sidecar 供核验；不冒充拆分加载。GitHub Actions 直接校验和部署静态文件。

```sh
python3 scripts/prepare_site.py --project /path/to/paper-dashboard --node /path/to/node --cli /path/to/data-app.mjs
python3 scripts/validate_site.py
git add site authored runtime-overrides
git commit -m "Update reviewed research dashboard"
git push origin main
```

## 资料与边界

出处以每条记录的官方论文集、原始论文、模型卡和厂商发布说明为准。第三方笔记仅参考组织方式；不将产品宣传推断成未披露的内部架构。论文首次公开、录用年份、论文集上线、模型预览和正式发布分别标注。价格保留原币种、计费单位和依据日期。

原始论文、报告及商标的权利属于各自权利人。本站提供整理、链接与研究导航。
