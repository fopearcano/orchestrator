"""Zero-dependency development server for the Storyline web app."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).parent


class StorylineHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):  # noqa: N802 - inherited HTTP method name
        if self.path in ("/", "/index.html"):
            self.path = "/templates/index.html"
        super().do_GET()


def run(host="127.0.0.1", port=5000):
    print(f"Storyline is running at http://{host}:{port}")
    ThreadingHTTPServer((host, port), StorylineHandler).serve_forever()


if __name__ == "__main__":
    run()
