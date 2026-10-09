"""Banco SQLite de usuários e e-mails."""
import os
import secrets
import sqlite3
from datetime import date, datetime
from pathlib import Path

from werkzeug.security import generate_password_hash

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get("DATA_DIR", ROOT / "dados"))
DB_PATH = DATA_DIR / "usuarios.db"
KEY_PATH = DATA_DIR / "secret.key"

PERMISSOES = {
    "processar": "Processar planilha",
    "baixar": "Baixar planilha processada",
    "email": "Enviar por e-mail",
}
EMAILS_INICIAIS = [
    "alexandre.gorges@giassi.com.br",
    "lidio.silva@giassi.com.br",
    "jolsimar.silva@giassi.com.br",
    "centroloja.lj07@giassi.com.br",
    "bazar.lj07@giassi.com.br",
    "acougue.lj07@giassi.com.br",
]


def carregar_chave():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not KEY_PATH.exists():
        KEY_PATH.write_text(secrets.token_hex(32), encoding="utf-8")
        try:
            os.chmod(KEY_PATH, 0o600)
        except OSError:
            pass
    return KEY_PATH.read_text(encoding="utf-8").strip()


def conectar():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB_PATH, timeout=10)
    db.row_factory = sqlite3.Row
    return db


def _criar_admin(db, senha, trocar_senha=1):
    db.execute(
        "INSERT INTO usuarios (username,nome,senha_hash,is_admin,trocar_senha,"
        "perm_processar,perm_baixar,perm_email,criado_em) VALUES (?,?,?,?,?,?,?,?,?)",
        ("admin", "Administrador", generate_password_hash(senha), 1, trocar_senha, 1, 1, 1,
         datetime.now().isoformat(timespec="seconds")),
    )


def iniciar_banco():
    db = conectar()
    db.execute(
        """CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE COLLATE NOCASE,
            nome TEXT NOT NULL DEFAULT '',
            senha_hash TEXT NOT NULL,
            is_admin INTEGER NOT NULL DEFAULT 0,
            ativo INTEGER NOT NULL DEFAULT 1,
            validade TEXT,
            perm_processar INTEGER NOT NULL DEFAULT 0,
            perm_baixar INTEGER NOT NULL DEFAULT 0,
            perm_email INTEGER NOT NULL DEFAULT 0,
            trocar_senha INTEGER NOT NULL DEFAULT 0,
            criado_em TEXT NOT NULL,
            ultimo_acesso TEXT
        )"""
    )
    db.execute(
        """CREATE TABLE IF NOT EXISTS recuperacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            token TEXT NOT NULL UNIQUE,
            expira_em TEXT NOT NULL,
            criado_em TEXT NOT NULL
        )"""
    )
    db.execute(
        """CREATE TABLE IF NOT EXISTS emails (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            nome TEXT NOT NULL DEFAULT '',
            criado_em TEXT NOT NULL
        )"""
    )
    if db.execute("SELECT COUNT(*) FROM emails").fetchone()[0] == 0:
        agora = datetime.now().isoformat(timespec="seconds")
        db.executemany(
            "INSERT INTO emails (email,nome,criado_em) VALUES (?,?,?)",
            [(em, "", agora) for em in EMAILS_INICIAIS],
        )
    if db.execute("SELECT 1 FROM usuarios WHERE is_admin=1 LIMIT 1").fetchone() is None:
        senha = os.environ.get("ADMIN_PASSWORD") or secrets.token_urlsafe(9)
        _criar_admin(db, senha, trocar_senha=1)
        db.commit()
        print("=" * 60, flush=True)
        print(" Usuário administrador criado", flush=True)
        print("   usuário: admin", flush=True)
        print(f"   senha:   {senha}", flush=True)
        print(" (será pedido para trocar a senha no primeiro acesso)", flush=True)
        print("=" * 60, flush=True)
    db.commit()
    db.close()


def resetar_admin():
    iniciar_banco()
    db = conectar()
    senha = secrets.token_urlsafe(9)
    cur = db.execute(
        "UPDATE usuarios SET senha_hash=?, trocar_senha=1, ativo=1 WHERE username='admin'",
        (generate_password_hash(senha),),
    )
    if cur.rowcount == 0:
        _criar_admin(db, senha, trocar_senha=1)
    db.commit()
    db.close()
    print(f"Nova senha temporária do usuário 'admin': {senha}", flush=True)


def acesso_expirado(u):
    """Administradores não expiram (evita ficar sem acesso ao painel)."""
    if u["is_admin"] or not u["validade"]:
        return False
    return date.today() > date.fromisoformat(u["validade"])


def permissoes_de(u):
    if u["is_admin"]:
        return {k: True for k in PERMISSOES}
    return {k: bool(u[f"perm_{k}"]) for k in PERMISSOES}


def usuario_json(u):
    return {
        "id": u["id"],
        "username": u["username"],
        "nome": u["nome"],
        "is_admin": bool(u["is_admin"]),
        "ativo": bool(u["ativo"]),
        "validade": u["validade"],
        "permissoes": permissoes_de(u),
        "trocar_senha": bool(u["trocar_senha"]),
        "ultimo_acesso": u["ultimo_acesso"],
        "expirado": acesso_expirado(u),
    }
