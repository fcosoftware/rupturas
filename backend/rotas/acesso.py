"""Login, sessão e troca de senha."""
import secrets
from datetime import datetime

from flask import g, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash

from backend.db import acesso_expirado, permissoes_de, usuario_json
from backend.seguranca import (
    bloqueado,
    corpo,
    csrf_token,
    limpar_falhas,
    login_required,
    registrar_falha,
    validar_senha,
)


def emails_cadastrados(db):
    return [{"email": r["email"], "nome": r["nome"]} for r in db.execute(
        "SELECT email,nome FROM emails ORDER BY email COLLATE NOCASE")]


def me_payload(u):
    data = usuario_json(u)
    if permissoes_de(u)["email"]:
        data["emails"] = emails_cadastrados(g.db)
    return data


def registrar(app):
    @app.get("/api/csrf")
    def api_csrf():
        return jsonify(csrf=csrf_token())

    @app.get("/api/me")
    def api_me():
        if g.user is None:
            return jsonify(usuario=None, csrf=csrf_token())
        return jsonify(usuario=me_payload(g.user), csrf=csrf_token())

    @app.post("/api/login")
    def api_login():
        if g.user:
            return jsonify(usuario=me_payload(g.user), csrf=csrf_token())
        data = corpo()
        username = str(data.get("username", "")).strip()
        senha = str(data.get("senha", ""))
        if bloqueado(username):
            return jsonify(erro="Muitas tentativas. Aguarde alguns minutos e tente novamente."), 429
        u = g.db.execute("SELECT * FROM usuarios WHERE username=?", (username,)).fetchone()
        hash_ref = u["senha_hash"] if u else generate_password_hash("x")
        ok = check_password_hash(hash_ref, senha) and u is not None
        if not ok:
            registrar_falha(username)
            return jsonify(erro="Usuário ou senha incorretos."), 401
        if not u["ativo"]:
            return jsonify(erro="Este usuário está desativado. Fale com o administrador."), 403
        if acesso_expirado(u):
            return jsonify(erro="Seu acesso expirou. Fale com o administrador."), 403
        limpar_falhas(username)
        session.clear()
        session.permanent = True
        session["uid"] = u["id"]
        session["csrf"] = secrets.token_hex(16)
        g.db.execute(
            "UPDATE usuarios SET ultimo_acesso=? WHERE id=?",
            (datetime.now().isoformat(timespec="seconds"), u["id"]),
        )
        g.db.commit()
        u = g.db.execute("SELECT * FROM usuarios WHERE id=?", (u["id"],)).fetchone()
        g.user = u
        return jsonify(usuario=me_payload(u), csrf=session["csrf"])

    @app.post("/api/logout")
    def api_sair():
        session.clear()
        session["csrf"] = secrets.token_hex(16)
        return jsonify(ok=True, csrf=session["csrf"])

    @app.post("/api/senha")
    @login_required
    def api_senha():
        data = corpo()
        atual = str(data.get("atual", ""))
        nova = str(data.get("nova", ""))
        conf = str(data.get("confirma", ""))
        if not check_password_hash(g.user["senha_hash"], atual):
            return jsonify(erro="Senha atual incorreta."), 400
        if nova != conf:
            return jsonify(erro="A confirmação não confere com a nova senha."), 400
        if nova == atual:
            return jsonify(erro="A nova senha deve ser diferente da atual."), 400
        if erro := validar_senha(nova):
            return jsonify(erro=erro), 400
        g.db.execute(
            "UPDATE usuarios SET senha_hash=?, trocar_senha=0 WHERE id=?",
            (generate_password_hash(nova), g.user["id"]),
        )
        g.db.commit()
        return jsonify(ok=True, mensagem="Senha alterada com sucesso.")
