"""Validate exactly the static bundle uploaded by the Pages workflow."""
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP_ID = "dashboard:7b32c0d7-dcb0-494c-a504-165fc9d27aae"


class Metadata(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.values = {}
        self.feed(html)

    def handle_starttag(self, tag, attributes):
        if tag == "meta":
            attrs = dict(attributes)
            if "name" in attrs:
                self.values[attrs["name"]] = attrs.get("content")


def validate(site=ROOT / "site"):
    manifest = json.loads((site / "data-app-build.json").read_text())
    assert manifest["kind"] in {"separate-data-v1", "source-inline-v1"}, "Unexpected bundle format"
    allowed = {"index.html", "data-app-build.json", ".nojekyll", "publication.json"}
    specs = [(key, manifest[key]) for key in ("html", "snapshot")]
    specs.extend(("asset", spec) for spec in manifest.get("assets", []))
    for key, spec in specs:
        assert Path(spec["path"]).name == spec["path"], "Unsafe bundle path"
        path = site / spec["path"]
        assert not path.is_symlink(), "Symlinks are not publishable"
        blob = path.read_bytes()
        assert len(blob) == spec["bytes"]
        assert hashlib.sha256(blob).hexdigest() == spec["sha256"], f"Invalid {key} digest"
        allowed.add(spec["path"])
    assert {p.name for p in site.iterdir()} == allowed, "Unexpected publication files"
    html = (site / "index.html").read_text()
    metadata = Metadata(html).values
    assert "data-app-local-thread" not in metadata, "Local thread metadata leaked"
    assert "data-app-local-reference" not in metadata, "Local source metadata leaked"
    if manifest["kind"] == "separate-data-v1":
        assert f'content="{manifest["snapshot"]["path"]}"' in html, "Snapshot path must be relative"
    else:
        assert metadata.get("data-app-snapshot-sha256") == manifest["snapshot"]["sha256"], "Embedded snapshot digest differs from provenance sidecar"
        assert {spec["path"] for spec in manifest["assets"]} == {"visits.html"}
        counter = (site / "visits.html").read_text()
        assert 'https://busuanzi.ibruce.info/busuanzi?jsonpCallback=ResearchDashboardCount' in counter
        assert "result.page_pv" in counter and "result.site_pv" not in counter
        assert "/nlp-llm-research-dashboard/visits.html" in counter
    assert not re.search(r'(?:src|href)=[\"\']/snapshot\.', html)
    data = json.loads((site / manifest["snapshot"]["path"]).read_text())
    assert data["id"] == APP_ID
    assert data["buildStatus"] == "complete", "Only completed dashboards can publish"
    queries = data["queries"]
    papers, models = queries["papers"]["rows"], queries["modelReports"]["rows"]
    paper_ids = {p["id"] for p in papers}
    assert len(paper_ids) == len(papers) and len(papers) >= 123
    assert len({m["id"] for m in models}) == len(models) and len(models) >= 73
    for p in papers:
        assert p["summary"] and p["why"] and p["limit"]
        assert p["url"].startswith("https://")
    institutions = {}
    for p in papers:
        assert p["affiliationStatus"] in {"verified", "pending", "partial"}
        units = p["institutions"]
        assert len({i["id"] for i in units}) == len(units), "Duplicate institution within a paper"
        assert p["institutionLabels"] == (" · ".join(i["name"] for i in units) or "待核实")
        if p["affiliationStatus"] == "verified":
            assert units and p["affiliationSources"] and p["affiliationsVerifiedAt"]
        else:
            assert p["affiliationNote"], "Unknown affiliations need an explanation"
        for source in p["affiliationSources"]:
            assert source["url"].startswith("https://") and source["label"]
        for unit in units:
            assert unit["type"] in {"university", "company", "research", "other"}
            assert unit["id"] and unit["name"] and unit["nameEn"]
            assert institutions.setdefault(unit["id"], unit) == unit, "Institution ID has conflicting definitions"
    verified = sum(p["affiliationStatus"] == "verified" for p in papers)
    enrichment = data["affiliationEnrichment"]
    assert enrichment["verifiedPapers"] == verified
    assert enrichment["pendingPapers"] == len(papers) - verified
    assert enrichment["institutionCount"] == len(institutions)
    for m in models:
        assert len(m["technicalPoints"]) >= 3
        assert set(m["relatedPaperIds"]) <= paper_ids
        assert m["technicalSource"].startswith("https://")
    history, branches = queries["nlpHistory"]["rows"], queries["evolution"]["rows"]
    history_ids, branch_ids = {h["id"] for h in history}, {b["id"] for b in branches}
    direction_ids = {c["id"] for c in queries["directions"]["rows"]}
    assert len(history_ids) == len(history) and len(history) >= 10
    assert len(branch_ids) == len(branches)
    assert [h["order"] for h in history] == sorted(h["order"] for h in history)
    for h in history:
        assert set(h["paperIds"]) <= paper_ids
        assert set(h["modelIds"]) <= {m["id"] for m in models}
        assert set(h["branchIds"]) <= branch_ids
        assert h["question"] and h["advance"] and h["limit"] and h["sources"]
    core_tags = []
    for b in branches:
        assert set(b["originStageIds"]) <= history_ids
        assert set(b["tags"]) <= direction_ids and set(b["coreTags"]) <= set(b["tags"])
        assert all(set(s[3]) <= paper_ids for s in b["stages"])
        core_tags.extend(b["coreTags"])
    assert set(core_tags) == direction_ids and len(core_tags) == len(set(core_tags)), "Map grouping must cover every direction exactly once"
    raw = json.dumps(data, ensure_ascii=False)
    assert not re.search(r'/Users/|[?&](?:token|api_key|access_token)=|gh[pousr]_[A-Za-z0-9]{25,}', raw), "Private metadata in publication"
    publication = json.loads((site / "publication.json").read_text())
    counts = {name: len(query["rows"]) for name, query in queries.items()}
    assert publication["appId"] == data["id"]
    assert publication["snapshotSha256"] == manifest["snapshot"]["sha256"]
    assert publication["counts"] == counts
    print(json.dumps({"result": "PASS", "appId": data["id"], "dataGeneratedAt": data["generatedAt"], "counts": counts}, ensure_ascii=False))
    return data


if __name__ == "__main__":
    validate()
