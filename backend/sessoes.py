"""Tokens para o site publicado acessar o servidor local sem cookie."""
import secrets
import threading
import time

_VALIDADE = 8 * 60 * 60
_lock = threading.Lock()
_tokens = {}


def emitir(uid):
    token = secrets.token_urlsafe(32)
    with _lock:
        _tokens[token] = (uid, time.time() + _VALIDADE)
    return token


def usuario(token):
    if not token:
        return None
    agora = time.time()
    with _lock:
        item = _tokens.get(token)
        if item is None:
            return None
        uid, expira = item
        if agora > expira:
            _tokens.pop(token, None)
            return None
        return uid


def revogar(token):
    if not token:
        return
    with _lock:
        _tokens.pop(token, None)
