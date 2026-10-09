"""Montagem do servidor Flask."""
import os
import secrets
from datetime import timedelta

from flask import Flask, abort, g, jsonify, request, session
from werkzeug.exceptions import HTTPException

from backend.db import acesso_expirado, carregar_chave, conectar, iniciar_banco
from backend.rotas import registrar
from backend.sessoes import revogar, usuario as usuario_do_token

ROTAS_SEM_SESSAO = {"/api/csrf", "/api/login"}
ROTAS_COM_SENHA_PENDENTE = {"/api/csrf", "/api/me", "/api/senha", "/api/logout"}


def _rota_de_recuperacao(path):
    return path == "/api/recuperar" or path.startswith("/api/recuperar/")


def _origens_externas():
    bruto = os.environ.get("CORS_ORIGINS", "https://fcosoftware.github.io")
    return {o.strip().rstrip("/") for o in bruto.split(",") if o.strip()}


def _origem_externa():
    return request.headers.get("Origin", "").rstrip("/") in _origens_externas()


def _token_bearer():
    header = request.headers.get("Authorization", "")
    if header.startswith("Bearer "):
        return header[7:].strip()
    return ""


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

    @app.route("/api/<path:resto>", methods=["OPTIONS"])
    def opcoes_api(resto):
        return "", 204

    @app.before_request
    def antes():
        token = _token_bearer()
        uid_bearer = usuario_do_token(token)
        if request.method in ("POST", "PUT", "PATCH", "DELETE") and request.path.startswith("/api"):
            publica = request.path == "/api/login" or _rota_de_recuperacao(request.path)
            if uid_bearer is None and not (_origem_externa() and publica):
                enviado = request.headers.get("X-CSRF-Token", "")
                esperado = session.get("csrf", "")
                if not enviado or not esperado or not secrets.compare_digest(enviado, esperado):
                    abort(400, "Sessão inválida. Recarregue a página e tente novamente.")

        g.user = None
        g.db = conectar()
        g.token = token
        uid = session.get("uid") or uid_bearer
        if not uid:
            return None
        u = g.db.execute("SELECT * FROM usuarios WHERE id=?", (uid,)).fetchone()
        if u is None or not u["ativo"]:
            revogar(token)
            session.clear()
            if request.path.startswith("/api") and request.path not in ROTAS_SEM_SESSAO and not _rota_de_recuperacao(request.path):
                return jsonify(erro="Sua sessão foi encerrada. Faça login novamente."), 401
            return None
        if acesso_expirado(u):
            revogar(token)
            session.clear()
            if request.path.startswith("/api") and request.path not in ROTAS_SEM_SESSAO and not _rota_de_recuperacao(request.path):
                return jsonify(erro="Seu prazo de acesso expirou. Fale com o administrador."), 401
            return None
        g.user = u
        if (
            u["trocar_senha"]
            and request.path.startswith("/api")
            and request.path not in ROTAS_COM_SENHA_PENDENTE
            and not _rota_de_recuperacao(request.path)
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
        origem = request.headers.get("Origin", "").rstrip("/")
        if request.path.startswith("/api") and origem in _origens_externas():
            resp.headers["Access-Control-Allow-Origin"] = origem
            resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-CSRF-Token, Accept"
            resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            resp.headers["Access-Control-Allow-Private-Network"] = "true"
            resp.headers["Vary"] = "Origin"
        return resp

    @app.errorhandler(HTTPException)
    def erro_http(e):
        if request.path.startswith("/api"):
            return jsonify(erro=e.description or "Requisição inválida"), e.code
        return e.get_response()

    registrar(app)
    return app
