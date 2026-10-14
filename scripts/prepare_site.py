"""Compile the same authored app for public static hosting, without local routing IDs.

This never edits the original app, its protected runtime, or its local preview.
It uses the installed Data compiler in a clean temporary copy, with no old dist.
"""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from validate_site import ROOT, validate


def describe(path):
    blob = path.read_bytes()
    return {"path": path.name, "bytes": len(blob), "sha256": hashlib.sha256(blob).hexdigest()}


def prepare(project, node, cli):
    project = project.resolve()
    data = json.loads((project / "src/data.json").read_text())
    if data.get("buildStatus") != "complete":
        raise ValueError("Finish and verify the source app before packaging")
    if not (project / "node_modules/vite").exists():
        raise ValueError("The authorized header customization requires local source-build dependencies")
    with tempfile.TemporaryDirectory(prefix="research-pages-") as temp:
        app = Path(temp) / "app"
        excluded_root = {"dist", ".git", ".data-app-offline", ".data-app-assets"}
        def ignore(directory, names):
            # Dependency packages also contain dist/; keep their installed files.
            skipped = {"__pycache__", ".DS_Store"}
            if Path(directory) == project:
                skipped |= excluded_root
            return set(names) & skipped
        shutil.copytree(project, app, ignore=ignore, symlinks=True)
        env = dict(os.environ)
        env.pop("CODEX_SESSION_ID", None)
        env.pop("CODEX_THREAD_ID", None)
        # Source compilation preserves the explicitly requested protected header edit.
        # The source compiler embeds its snapshot; the sidecar below is for provenance.
        subprocess.run([node, cli, "build", "--project-dir", str(app), "--source"], env=env, check=True)
        source = app / "dist"
        staging = Path(temp) / "site"
        staging.mkdir()
        for name in ("index.html", "visits.html"):
            shutil.copyfile(source / name, staging / name)
        snapshot_hash = hashlib.sha256((app / "src/data.json").read_bytes()).hexdigest()
        snapshot_name = f"snapshot.{snapshot_hash}.json"
        shutil.copyfile(app / "src/data.json", staging / snapshot_name)
        manifest = {
            "kind": "source-inline-v1", "appId": data["id"],
            "html": describe(staging / "index.html"),
            "snapshot": describe(staging / snapshot_name),
            "assets": [describe(staging / "visits.html")],
            "protectedRuntimeSha256": hashlib.sha256((app / "protected-runtime.json").read_bytes()).hexdigest(),
        }
        (staging / "data-app-build.json").write_text(json.dumps(manifest, indent=2) + "\n")
        (staging / ".nojekyll").touch()
        publication = {
            "appId": data["id"], "dataGeneratedAt": data["generatedAt"],
            "snapshotSha256": manifest["snapshot"]["sha256"],
            "counts": {name: len(query["rows"]) for name, query in data["queries"].items()},
            "refresh": {"timezone": "Asia/Shanghai", "time": "09:30", "execution": "Codex thread heartbeat", "requiresHostOnline": True},
        }
        (staging / "publication.json").write_text(json.dumps(publication, ensure_ascii=False, indent=2) + "\n")
        validate(staging)
        # Remove only files in this script's generated output directory.
        target = ROOT / "site"
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(staging, target)
        authored = ROOT / "authored"
        if authored.exists():
            shutil.rmtree(authored)
        shutil.copytree(project / "src/content", authored / "content")
        shutil.copyfile(project / "src/theme.css", authored / "theme.css")
        overrides = ROOT / "runtime-overrides"
        for name in ("src/components/DataAppChrome.jsx", "protected-runtime.json", "public/visits.html"):
            dest = overrides / name
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(project / name, dest)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", type=Path, required=True)
    parser.add_argument("--node", required=True)
    parser.add_argument("--cli", required=True)
    args = parser.parse_args()
    prepare(args.project, args.node, args.cli)
