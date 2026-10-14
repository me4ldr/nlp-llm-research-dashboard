"""Validate exactly the static bundle uploaded by the Pages workflow."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP_ID = "dashboard:7b32c0d7-dcb0-494c-a504-165fc9d27aae"


def validate(site=ROOT / "site"):
    manifest = json.loads((site / "data-app-build.json").read_text())
    assert manifest["kind"] == "separate-data-v1", "Unexpected bundle format"
    allowed = {"index.html", "data-app-build.json", ".nojekyll", "publication.json"}
    for key in ("html", "snapshot"):
        spec = manifest[key]
        assert Path(spec["path"]).name == spec["path"], "Unsafe bundle path"
        path = site / spec["path"]
        assert not path.is_symlink(), "Symlinks are not publishable"
        blob = path.read_bytes()
        assert len(blob) == spec["bytes"]
        assert hashlib.sha256(blob).hexdigest() == spec["sha256"], f"Invalid {key} digest"
        allowed.add(spec["path"])
    assert {p.name for p in site.iterdir()} == allowed, "Unexpected publication files"
    html = (site / "index.html").read_text()
    assert 'name="data-app-local-thread"' not in html, "Local thread metadata leaked"
    assert f'content="{manifest["snapshot"]["path"]}"' in html, "Snapshot path must be relative"
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
    for m in models:
        assert len(m["technicalPoints"]) >= 3
        assert set(m["relatedPaperIds"]) <= paper_ids
        assert m["technicalSource"].startswith("https://")
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

