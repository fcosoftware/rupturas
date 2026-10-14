"""
Sobe o Giassi Ruptura.

    uv run giassi                 -> http://127.0.0.1:5000
    uv run giassi resetar-admin   -> nova senha temporária do usuário "admin"

Variáveis de ambiente:
    HOST (padrão 127.0.0.1; use 0.0.0.0 para a rede local)
    PORT (padrão 5000)
    ADMIN_PASSWORD (senha inicial do admin, só na primeira criação)
    DATA_DIR (pasta do banco e da chave; padrão ./dados)
    PUBLIC_URL (endereço usado no link do e-mail; padrão: o host do pedido)
    CORS_ORIGINS (origens do site publicado; padrão https://fcosoftware.github.io)
    SMTP_HOST, SMTP_PORT (padrão 587), SMTP_USER, SMTP_PASSWORD, SMTP_FROM
    SMTP_TLS (padrão 1; use 0 para desligar STARTTLS). Porta 465 usa SSL.
"""
import os
import socket
import sys
import threading
import webbrowser

from backend.app import create_app
from backend.db import resetar_admin


def _porta_livre(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((host, port))
        except OSError:
            return False
    return True


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "resetar-admin":
        resetar_admin()
        return
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "5000"))
    if not _porta_livre(host, port):
        print(f"A porta {port} já está em uso. Feche a outra janela do programa e tente de novo.", flush=True)
        if getattr(sys, "frozen", False):
            input("Pressione Enter para sair.")
        sys.exit(1)
    app = create_app()
    url = f"http://{'127.0.0.1' if host == '0.0.0.0' else host}:{port}"
    print(f"Servidor em {url}", flush=True)
    print("Feche esta janela para encerrar.", flush=True)
    if getattr(sys, "frozen", False) and os.environ.get("GIASSI_ABRIR", "1") != "0":
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    from waitress import serve
    serve(app, host=host, port=port)


if __name__ == "__main__":
    main()
