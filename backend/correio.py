"""Envio do e-mail com o link de recuperação de senha."""
import os
import smtplib
from email.message import EmailMessage


def smtp_configurado():
    return bool(os.environ.get("SMTP_HOST", "").strip() and _remetente())


def enviar_recuperacao(destino, nome, link):
    if not smtp_configurado():
        raise RuntimeError("SMTP não configurado")
    mensagem = EmailMessage()
    mensagem["Subject"] = "Recuperação de senha — Processador de Planilha"
    mensagem["From"] = _remetente()
    mensagem["To"] = destino
    tratamento = nome.strip() if nome and nome.strip() else "olá"
    mensagem.set_content(
        f"{tratamento},\n\n"
        "Recebemos um pedido para redefinir a senha da sua conta.\n\n"
        "Abra o link abaixo para criar uma nova senha. "
        "Ele vale por 2 horas e só pode ser usado uma vez:\n\n"
        f"{link}\n\n"
        "Se você não pediu isso, ignore este e-mail.\n"
    )
    host = os.environ["SMTP_HOST"].strip()
    port = int(os.environ.get("SMTP_PORT", "587"))
    usuario = os.environ.get("SMTP_USER", "").strip()
    senha = os.environ.get("SMTP_PASSWORD", "")
    with _conectar(host, port) as smtp:
        if usuario:
            smtp.login(usuario, senha)
        smtp.send_message(mensagem)


def _remetente():
    return os.environ.get("SMTP_FROM", "").strip() or os.environ.get("SMTP_USER", "").strip()


def _conectar(host, port):
    timeout = 20
    if os.environ.get("SMTP_SSL", "").strip() == "1" or port == 465:
        return smtplib.SMTP_SSL(host, port, timeout=timeout)
    smtp = smtplib.SMTP(host, port, timeout=timeout)
    smtp.ehlo()
    if os.environ.get("SMTP_TLS", "1").strip() != "0":
        smtp.starttls()
        smtp.ehlo()
    return smtp
