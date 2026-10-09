"""Registro das rotas da API e do frontend estático."""
from backend.rotas.acesso import registrar as registrar_acesso
from backend.rotas.admin import registrar as registrar_admin
from backend.rotas.estatico import registrar as registrar_estatico


def registrar(app):
    registrar_acesso(app)
    registrar_admin(app)
    registrar_estatico(app)
