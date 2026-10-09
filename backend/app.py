"""Montagem do servidor Flask."""
import secrets
from datetime import timedelta

from flask import Flask, abort, g, jsonify, request, session
from werkzeug.exceptions import HTTPException

from backend.db import acesso_expirado, carregar_chave, conectar, iniciar_banco
from backend.rotas import registrar

ROTAS_SEM_SESSAO = {"/api/csrf", "/api/login"}
ROTAS_COM_SENHA_PENDENTE = {"/api/csrf", "/api/me", "/api/senha", "/api/logout"}


def create_app():
    iniciar_banco()
    app = Flask(__name__)
    app.secret_key = carregar_chave()
    app.config.update(
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        PERMANENT_SESSION_LIFETIME=timedelta(hours=8),
        JSON_AS_ASCII=False,
    )

    @app.before_request
    def antes():
        if request.method in ("POST", "PUT", "PATCH", "DELETE") and request.path.startswith("/api"):
            enviado = request.headers.get("X-CSRF-Token", "")
            esperado = session.get("csrf", "")
            if not enviado or not esperado or not secrets.compare_digest(enviado, esperado):
                abort(400, "Sessão inválida. Recarregue a página e tente novamente.")

        g.user = None
        g.db = conectar()
        uid = session.get("uid")
        if not uid:
            return None
        u = g.db.execute("SELECT * FROM usuarios WHERE id=?", (uid,)).fetchone()
        if u is None or not u["ativo"]:
            session.clear()
            if request.path.startswith("/api") and request.path not in ROTAS_SEM_SESSAO:
                return jsonify(erro="Sua sessão foi encerrada. Faça login novamente."), 401
            return None
        if acesso_expirado(u):
            session.clear()
            if request.path.startswith("/api") and request.path not in ROTAS_SEM_SESSAO:
                return jsonify(erro="Seu prazo de acesso expirou. Fale com o administrador."), 401
            return None
        g.user = u
        if (
            u["trocar_senha"]
            and request.path.startswith("/api")
            and request.path not in ROTAS_COM_SENHA_PENDENTE
        ):
            return jsonify(erro="Defina uma nova senha para continuar.", codigo="trocar_senha"), 403
        return None

    @app.teardown_appcontext
    def fechar_db(_exc):
        db = g.pop("db", None)
        if db is not None:
            db.close()

    @app.after_request
    def cabecalhos(resp):
        resp.headers["X-Content-Type-Options"] = "nosniff"
        resp.headers["X-Frame-Options"] = "DENY"
        resp.headers["Referrer-Policy"] = "same-origin"
        if request.path.startswith("/api") or resp.mimetype == "text/html":
            resp.headers["Cache-Control"] = "no-store"
        return resp

    @app.errorhandler(HTTPException)
    def erro_http(e):
        if request.path.startswith("/api"):
            return jsonify(erro=e.description or "Requisição inválida"), e.code
        return e.get_response()

    registrar(app)
    return app
