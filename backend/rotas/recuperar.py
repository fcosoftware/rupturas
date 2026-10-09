"""Pedido e conclusão de recuperação de senha."""
import os
import secrets
import time
from datetime import datetime, timedelta

from flask import current_app, g, jsonify, request
from werkzeug.security import generate_password_hash

from backend.correio import enviar_recuperacao, smtp_configurado
from backend.db import acesso_expirado
from backend.seguranca import EMAIL_RE, corpo, validar_senha

VALIDADE = timedelta(hours=2)
MAX_PEDIDOS = 5
JANELA = 10 * 60
_pedidos = {}


def _limpar_expiradas(db):
    agora = datetime.now().isoformat(timespec="seconds")
    db.execute("DELETE FROM recuperacoes WHERE expira_em <= ?", (agora,))


def listar_pendentes(db):
    _limpar_expiradas(db)
    db.commit()
    rows = db.execute(
        """SELECT r.id, r.token, r.expira_em, r.criado_em, u.username, u.nome
           FROM recuperacoes r
           JOIN usuarios u ON u.id = r.usuario_id
           ORDER BY r.criado_em DESC"""
    ).fetchall()
    return [
        {
            "id": r["id"],
            "username": r["username"],
            "nome": r["nome"],
            "token": r["token"],
            "expira_em": r["expira_em"],
            "criado_em": r["criado_em"],
        }
        for r in rows
    ]


def _bloqueado(ip):
    agora = time.time()
    lista = [t for t in _pedidos.get(ip, []) if agora - t < JANELA]
    _pedidos[ip] = lista
    return len(lista) >= MAX_PEDIDOS


def registrar(app):
    @app.post("/api/recuperar")
    def api_recuperar():
        email = str(corpo().get("email", "")).strip().lower()
        if not email or len(email) > 120 or not EMAIL_RE.fullmatch(email):
            return jsonify(erro="Informe um e-mail válido."), 400
        if not smtp_configurado():
            return jsonify(erro="O envio de e-mail de recuperação não está configurado. Fale com o administrador."), 503
        ip = request.remote_addr or ""
        if _bloqueado(ip):
            return jsonify(erro="Muitos pedidos. Aguarde alguns minutos e tente novamente."), 429
        _pedidos.setdefault(ip, []).append(time.time())
        _limpar_expiradas(g.db)
        u = g.db.execute(
            "SELECT * FROM usuarios WHERE email=? COLLATE NOCASE",
            (email,),
        ).fetchone()
        if u is not None and u["ativo"] and not acesso_expirado(u):
            token = secrets.token_urlsafe(32)
            expira = (datetime.now() + VALIDADE).isoformat(timespec="seconds")
            g.db.execute("DELETE FROM recuperacoes WHERE usuario_id=?", (u["id"],))
            g.db.execute(
                "INSERT INTO recuperacoes (usuario_id, token, expira_em, criado_em) VALUES (?,?,?,?)",
                (u["id"], token, expira, datetime.now().isoformat(timespec="seconds")),
            )
            g.db.commit()
            base = os.environ.get("PUBLIC_URL", "").strip().rstrip("/") or request.host_url.rstrip("/")
            try:
                enviar_recuperacao(u["email"], u["nome"] or u["username"], f"{base}/recuperar/{token}")
            except Exception:
                current_app.logger.exception("Falha ao enviar e-mail de recuperação")
        return jsonify(
            ok=True,
            mensagem="Se este e-mail estiver cadastrado em uma conta ativa, você receberá um link para definir uma nova senha. O link vale por 2 horas.",
        )

    @app.get("/api/recuperar/<token>")
    def api_recuperar_valido(token):
        if _buscar(token) is None:
            return jsonify(erro="Link inválido ou expirado."), 404
        return jsonify(ok=True)

    @app.post("/api/recuperar/<token>")
    def api_recuperar_concluir(token):
        row = _buscar(token)
        if row is None:
            return jsonify(erro="Link inválido ou expirado."), 404
        data = corpo()
        nova = str(data.get("nova", ""))
        conf = str(data.get("confirma", ""))
        if nova != conf:
            return jsonify(erro="A confirmação não confere com a nova senha."), 400
        if erro := validar_senha(nova):
            return jsonify(erro=erro), 400
        g.db.execute(
            "UPDATE usuarios SET senha_hash=?, trocar_senha=0 WHERE id=?",
            (generate_password_hash(nova), row["usuario_id"]),
        )
        g.db.execute("DELETE FROM recuperacoes WHERE usuario_id=?", (row["usuario_id"],))
        g.db.commit()
        return jsonify(ok=True, mensagem="Senha alterada. Entre com a nova senha.")


def _buscar(token):
    _limpar_expiradas(g.db)
    g.db.commit()
    return g.db.execute(
        "SELECT * FROM recuperacoes WHERE token=?",
        (token,),
    ).fetchone()
