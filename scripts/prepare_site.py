"""Compile the same authored app for public static hosting, without local routing IDs.

This never edits the original app, its protected runtime, or its local preview.
It uses the installed Data compiler in a clean temporary copy, with no old dist.
"""
import argparse
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from validate_site import ROOT, validate


def prepare(project, node, cli):
    project = project.resolve()
    data = json.loads((project / "src/data.json").read_text())
    if data.get("buildStatus") != "complete":
        raise ValueError("Finish and verify the source app before packaging")
    with tempfile.TemporaryDirectory(prefix="research-pages-") as temp:
        app = Path(temp) / "app"
        shutil.copytree(project, app, ignore=shutil.ignore_patterns(
            "dist", "node_modules", ".git", ".data-app-offline", ".data-app-assets", ".openai", "__pycache__"))
        env = dict(os.environ)
        env.pop("CODEX_SESSION_ID", None)
        env.pop("CODEX_THREAD_ID", None)
        subprocess.run([node, cli, "build", "--project-dir", str(app), "--separate-data"], env=env, check=True)
        source = app / "dist"
        manifest = json.loads((source / "data-app-build.json").read_text())
        staging = Path(temp) / "site"
        staging.mkdir()
        for name in (manifest["html"]["path"], manifest["snapshot"]["path"], "data-app-build.json"):
            shutil.copyfile(source / name, staging / name)
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


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", type=Path, required=True)
    parser.add_argument("--node", required=True)
    parser.add_argument("--cli", required=True)
    args = parser.parse_args()
    prepare(args.project, args.node, args.cli)

