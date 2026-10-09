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
    SMTP_HOST, SMTP_PORT (padrão 587), SMTP_USER, SMTP_PASSWORD, SMTP_FROM
    SMTP_TLS (padrão 1; use 0 para desligar STARTTLS). Porta 465 usa SSL.
"""
import os
import sys

from backend.app import create_app
from backend.db import resetar_admin


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "resetar-admin":
        resetar_admin()
        return
    app = create_app()
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "5000"))
    from waitress import serve
    print(f"Servidor em http://{host}:{port}", flush=True)
    serve(app, host=host, port=port)


if __name__ == "__main__":
    main()
