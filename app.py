"""Zero-dependency development server for the Storyline web app."""

import json
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).parent
PROJECTS_DIR = ROOT / "projects"


def project_slug(title):
    slug = re.sub(r"[^a-z0-9]+", "-", (title or "story").lower()).strip("-")
    return slug or "story"


class StorylineHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def json_response(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):  # noqa: N802 - inherited HTTP method name
        if self.path in ("/", "/index.html"):
            self.path = "/templates/index.html"
            return super().do_GET()
        if self.path == "/api/projects":
            PROJECTS_DIR.mkdir(exist_ok=True)
            projects = []
            for path in sorted(PROJECTS_DIR.glob("*.storyline"), key=lambda item: item.stat().st_mtime, reverse=True):
                try:
                    data = json.loads(path.read_text(encoding="utf-8"))
                except json.JSONDecodeError:
                    data = {}
                projects.append({"file": path.name, "title": data.get("title") or path.stem, "updated": path.stat().st_mtime})
            return self.json_response({"projects": projects})
        if self.path.startswith("/api/projects/"):
            name = Path(self.path.removeprefix("/api/projects/")).name
            path = PROJECTS_DIR / name
            if not path.exists() or path.suffix != ".storyline":
                return self.json_response({"error": "Project not found"}, 404)
            return self.json_response(json.loads(path.read_text(encoding="utf-8")))
        super().do_GET()

    def do_POST(self):  # noqa: N802 - inherited HTTP method name
        if self.path != "/api/projects":
            return self.json_response({"error": "Not found"}, 404)
        length = int(self.headers.get("Content-Length", "0"))
        data = json.loads(self.rfile.read(length) or b"{}")
        PROJECTS_DIR.mkdir(exist_ok=True)
        filename = f"{project_slug(data.get('title'))}.storyline"
        path = PROJECTS_DIR / filename
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")
        return self.json_response({"ok": True, "file": filename, "title": data.get("title") or path.stem})


def run(host="127.0.0.1", port=5000):
    print(f"Storyline is running at http://{host}:{port}")
    ThreadingHTTPServer((host, port), StorylineHandler).serve_forever()


if __name__ == "__main__":
    run()
