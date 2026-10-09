"""Cadastro de usuários e e-mails."""
import re
import sqlite3
from datetime import date, datetime

from flask import abort, g, jsonify
from werkzeug.security import generate_password_hash

from backend.db import PERMISSOES, usuario_json
from backend.rotas.recuperar import listar_pendentes
from backend.seguranca import (
    EMAIL_RE,
    admin_required,
    admins_ativos,
    corpo,
    ler_usuario_form,
    validar_data,
    validar_senha,
    validar_username,
)


def registrar(app):
    def buscar_usuario(uid):
        u = g.db.execute("SELECT * FROM usuarios WHERE id=?", (uid,)).fetchone()
        if u is None:
            abort(404, "Usuário não encontrado.")
        return u

    @app.get("/api/admin")
    @admin_required
    def api_admin():
        usuarios = g.db.execute(
            "SELECT * FROM usuarios ORDER BY is_admin DESC, username COLLATE NOCASE"
        ).fetchall()
        emails = g.db.execute(
            "SELECT * FROM emails ORDER BY email COLLATE NOCASE"
        ).fetchall()
        return jsonify(
            usuarios=[usuario_json(u) for u in usuarios],
            emails=[{"id": e["id"], "email": e["email"], "nome": e["nome"]} for e in emails],
            recuperacoes=listar_pendentes(g.db),
            hoje=date.today().isoformat(),
            eu_id=g.user["id"],
            permissoes=PERMISSOES,
        )

    @app.post("/api/admin/usuarios")
    @admin_required
    def api_admin_novo():
        data = corpo()
        username = str(data.get("username", "")).strip()
        senha = str(data.get("senha", ""))
        dados = ler_usuario_form(data, incluir_ativo=False)
        validade, erro = validar_data(dados["validade"])
        erro = erro or validar_username(username) or validar_senha(senha)
        if erro:
            return jsonify(erro=erro), 400
        try:
            g.db.execute(
                "INSERT INTO usuarios (username,nome,senha_hash,is_admin,ativo,validade,"
                "perm_processar,perm_baixar,perm_email,trocar_senha,criado_em) "
                "VALUES (?,?,?,?,?,?,?,?,?,1,?)",
                (username, dados["nome"], generate_password_hash(senha), dados["is_admin"], 1,
                 validade, dados["perm_processar"], dados["perm_baixar"], dados["perm_email"],
                 datetime.now().isoformat(timespec="seconds")),
            )
            g.db.commit()
        except sqlite3.IntegrityError:
            return jsonify(erro="Já existe um usuário com esse nome."), 409
        return jsonify(ok=True, mensagem=f"Usuário '{username}' criado. Ele deverá trocar a senha no primeiro acesso.")

    @app.put("/api/admin/usuarios/<int:uid>")
    @admin_required
    def api_admin_editar(uid):
        u = buscar_usuario(uid)
        dados = ler_usuario_form(corpo())
        validade, erro = validar_data(dados["validade"])
        if erro:
            return jsonify(erro=erro), 400
        if u["id"] == g.user["id"]:
            dados["is_admin"], dados["ativo"] = 1, 1
        elif u["is_admin"] and (not dados["is_admin"] or not dados["ativo"]) \
                and admins_ativos(g.db, excluindo=u["id"]) == 0:
            return jsonify(erro="É preciso manter pelo menos um administrador ativo."), 400
        g.db.execute(
            "UPDATE usuarios SET nome=?,is_admin=?,ativo=?,validade=?,perm_processar=?,"
            "perm_baixar=?,perm_email=? WHERE id=?",
            (dados["nome"], dados["is_admin"], dados["ativo"], validade, dados["perm_processar"],
             dados["perm_baixar"], dados["perm_email"], uid),
        )
        g.db.commit()
        return jsonify(ok=True, mensagem=f"Usuário '{u['username']}' atualizado.")

    @app.post("/api/admin/usuarios/<int:uid>/senha")
    @admin_required
    def api_admin_senha(uid):
        u = buscar_usuario(uid)
        senha = str(corpo().get("senha", ""))
        if erro := validar_senha(senha):
            return jsonify(erro=erro), 400
        g.db.execute(
            "UPDATE usuarios SET senha_hash=?, trocar_senha=? WHERE id=?",
            (generate_password_hash(senha), 0 if u["id"] == g.user["id"] else 1, uid),
        )
        g.db.execute("DELETE FROM recuperacoes WHERE usuario_id=?", (uid,))
        g.db.commit()
        return jsonify(ok=True, mensagem=f"Senha de '{u['username']}' redefinida.")

    @app.delete("/api/admin/usuarios/<int:uid>")
    @admin_required
    def api_admin_excluir(uid):
        u = buscar_usuario(uid)
        if u["id"] == g.user["id"]:
            return jsonify(erro="Você não pode excluir o próprio usuário."), 400
        if u["is_admin"] and admins_ativos(g.db, excluindo=u["id"]) == 0:
            return jsonify(erro="É preciso manter pelo menos um administrador ativo."), 400
        g.db.execute("DELETE FROM recuperacoes WHERE usuario_id=?", (uid,))
        g.db.execute("DELETE FROM usuarios WHERE id=?", (uid,))
        g.db.commit()
        return jsonify(ok=True, mensagem=f"Usuário '{u['username']}' excluído.")

    @app.post("/api/admin/emails")
    @admin_required
    def api_admin_email_novo():
        data = corpo()
        nome = str(data.get("nome", "")).strip()[:80]
        brutos = [e.strip().lower() for e in re.split(r"[,;\s]+", str(data.get("email", ""))) if e.strip()]
        if not brutos:
            return jsonify(erro="Informe ao menos um e-mail."), 400
        novos, repetidos, invalidos = 0, 0, []
        for em in brutos:
            if len(em) > 120 or not EMAIL_RE.fullmatch(em):
                invalidos.append(em)
                continue
            try:
                g.db.execute(
                    "INSERT INTO emails (email,nome,criado_em) VALUES (?,?,?)",
                    (em, nome if len(brutos) == 1 else "",
                     datetime.now().isoformat(timespec="seconds")),
                )
                novos += 1
            except sqlite3.IntegrityError:
                repetidos += 1
        g.db.commit()
        partes = []
        if novos:
            partes.append(f"{novos} e-mail(s) cadastrado(s).")
        if repetidos:
            partes.append(f"{repetidos} e-mail(s) já estavam cadastrados.")
        if invalidos:
            partes.append("E-mail inválido: " + ", ".join(invalidos))
        status = 200 if novos or repetidos else 400
        return jsonify(
            ok=bool(novos),
            mensagem=" ".join(partes),
            novos=novos,
            repetidos=repetidos,
            invalidos=invalidos,
        ), status

    @app.delete("/api/admin/emails/<int:eid>")
    @admin_required
    def api_admin_email_excluir(eid):
        cur = g.db.execute("DELETE FROM emails WHERE id=?", (eid,))
        g.db.commit()
        if cur.rowcount == 0:
            return jsonify(erro="E-mail não encontrado."), 404
        return jsonify(ok=True, mensagem="E-mail removido do cadastro.")
