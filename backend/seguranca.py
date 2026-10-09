"""Validação, CSRF e limite de tentativas de login."""
import re
import secrets
import time
from datetime import date
from functools import wraps

from flask import g, jsonify, request, session

from backend.db import PERMISSOES

EMAIL_RE = re.compile(r"[^@\s,;]+@[^@\s,;]+\.[^@\s,;]+")
SENHA_MIN = 8
MAX_TENTATIVAS = 5
JANELA_BLOQUEIO = 10 * 60
_falhas = {}


def csrf_token():
    if "csrf" not in session:
        session["csrf"] = secrets.token_hex(16)
    return session["csrf"]


def corpo():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def login_required(f):
    @wraps(f)
    def wrapper(*a, **kw):
        if g.user is None:
            return jsonify(erro="Faça login para continuar."), 401
        return f(*a, **kw)
    return wrapper


def admin_required(f):
    @wraps(f)
    @login_required
    def wrapper(*a, **kw):
        if not g.user["is_admin"]:
            return jsonify(erro="Acesso restrito ao administrador."), 403
        return f(*a, **kw)
    return wrapper


def _chave_falha(username):
    return (request.remote_addr, (username or "").lower())


def bloqueado(username):
    agora = time.time()
    lista = [t for t in _falhas.get(_chave_falha(username), []) if agora - t < JANELA_BLOQUEIO]
    _falhas[_chave_falha(username)] = lista
    return len(lista) >= MAX_TENTATIVAS


def registrar_falha(username):
    _falhas.setdefault(_chave_falha(username), []).append(time.time())


def limpar_falhas(username):
    _falhas.pop(_chave_falha(username), None)


def validar_senha(senha):
    if len(senha) < SENHA_MIN:
        return f"A senha deve ter pelo menos {SENHA_MIN} caracteres."
    if not re.search(r"[A-Za-z]", senha) or not re.search(r"\d", senha):
        return "A senha deve conter letras e números."
    return None


def validar_username(nome):
    if not re.fullmatch(r"[A-Za-z0-9._-]{3,32}", nome):
        return "Usuário: 3 a 32 caracteres (letras, números, ponto, hífen ou sublinhado)."
    return None


def validar_data(txt):
    if not txt:
        return None, None
    try:
        return date.fromisoformat(txt).isoformat(), None
    except ValueError:
        return None, "Data de validade inválida."


def admins_ativos(db, excluindo=None):
    q = "SELECT COUNT(*) FROM usuarios WHERE is_admin=1 AND ativo=1"
    args = ()
    if excluindo is not None:
        q += " AND id<>?"
        args = (excluindo,)
    return db.execute(q, args).fetchone()[0]


def ler_usuario_form(data, incluir_ativo=True):
    perms = data.get("permissoes") if isinstance(data.get("permissoes"), dict) else {}
    dados = {
        "nome": str(data.get("nome", "")).strip()[:80],
        "is_admin": 1 if data.get("is_admin") else 0,
        "validade": str(data.get("validade", "") or "").strip(),
        **{f"perm_{k}": 1 if perms.get(k) else 0 for k in PERMISSOES},
    }
    if incluir_ativo:
        dados["ativo"] = 1 if data.get("ativo") else 0
    if dados["is_admin"]:
        dados["validade"] = ""
        for k in PERMISSOES:
            dados[f"perm_{k}"] = 1
    return dados
