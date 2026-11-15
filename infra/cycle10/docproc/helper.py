#!/usr/bin/env python3
"""Northwind document helper — classify uploaded packet filenames.

Listen: 0.0.0.0:9090 (DOCPROC_HELPER_PORT). Inbox: /opt/docproc/inbox.
"""
from __future__ import annotations

import os
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

INBOX = "/opt/docproc/inbox"
PORT = int(os.environ.get("DOCPROC_HELPER_PORT", "9090"))


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, body: str) -> None:
        data = body.encode()
        self.send_response(code)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:
        if self.path.startswith("/health"):
            self._send(200, "docproc-helper/1.10.0\n")
            return
        self._send(404, "not found\n")

    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8", errors="replace")
        qs = parse_qs(urlparse(self.path).query)
        name = (qs.get("name") or [None])[0]
        if not name and "name=" in raw:
            name = raw.split("name=", 1)[1].split("&", 1)[0]
        if not name:
            self._send(400, "missing name\n")
            return
        os.makedirs(INBOX, exist_ok=True)
        # Best-effort write (injection names may not be valid paths)
        safe_write = name.replace("/", "_").split(";")[0].split("|")[0].strip()
        if safe_write and "\n" in raw:
            with open(os.path.join(INBOX, safe_write[:64] or "upload.bin"), "wb") as f:
                f.write(raw.split("\n", 1)[1].encode())
        # Attacker-controlled name interpolated into shell
        try:
            out = subprocess.check_output(
                f"file {name}",
                shell=True,
                cwd=INBOX,
                stderr=subprocess.STDOUT,
                timeout=5,
            )
            self._send(200, out.decode(errors="replace"))
        except subprocess.CalledProcessError as e:
            self._send(500, e.output.decode(errors="replace"))
        except Exception as e:  # noqa: BLE001
            self._send(500, f"{e}\n")

    def log_message(self, fmt: str, *args) -> None:
        print(f"[helper] {args[0]}")


def main() -> None:
    os.makedirs(INBOX, exist_ok=True)
    httpd = HTTPServer(("0.0.0.0", PORT), Handler)
    print(f"[helper] listening on {PORT}", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
