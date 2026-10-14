# 顶部按钮与访问量

用户明确要求去掉网站右上角的 Ask ChatGPT、Publish，并增加访问量。唯一受保护的源码改动是 `src/components/DataAppChrome.jsx`：浏览模式显示 `VisitCounter`，编辑模式保留 Cancel / Save。

该改动已通过 Data 项目的 scoped authorization 脚本更新完整性清单。这里保存对应文件用于审查和维护；不要把清单覆盖到不匹配的其他版本运行时。每日更新在原项目构建，使用 `--source` 以保留改动。

`VisitCounter.jsx` 位于 `authored/content/shared/`。静态计数页面位于 `public/visits.html`，发布到相同固定路径，统计本看板的 PV。计数页面通过限定来源的 CSP 加载不蒜子的 JSONP 响应；请求的 Referer 是固定计数页面，不含主页面的筛选或搜索状态。服务错误、超时显示“暂不可用”，不会伪造 0 或历史访问数。
