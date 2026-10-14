"""Entrega o frontend já compilado."""
import sys
from pathlib import Path

from flask import abort, send_from_directory


def _frontend_dist():
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS) / "frontend" / "dist"
    return Path(__file__).resolve().parents[2] / "frontend" / "dist"


FRONTEND_DIST = _frontend_dist()


def registrar(app):
    @app.route("/", defaults={"caminho": ""})
    @app.route("/<path:caminho>")
    def frontend(caminho):
        if caminho.startswith("api"):
            abort(404, "Não encontrado.")
        index = FRONTEND_DIST / "index.html"
        if not index.is_file():
            return (
                "Frontend ainda não foi gerado. Na pasta frontend, rode npm install e npm run build. "
                "Para desenvolver, use npm run dev (porta 5173) com este servidor no ar.",
                503,
                {"Content-Type": "text/plain; charset=utf-8"},
            )
        alvo = (FRONTEND_DIST / caminho).resolve()
        if caminho and alvo.is_file() and FRONTEND_DIST.resolve() in alvo.parents:
            return send_from_directory(FRONTEND_DIST, caminho)
        return send_from_directory(FRONTEND_DIST, "index.html")
