const COLUNAS_REMOVER = ["CARGA", "CT_UN", "CT_TT", "DATA", "NOTA", "VEÍCULO"];
const COLUNAS_INT = ["PALETE", "Q_NF", "Q_PALETE", "EST_INI", "SEÇÃO"];
const COLUNAS_CENTRALIZADAS = ["COD.", "SEÇÃO", "Q_NF", "Q_PALETE", "EST_INI"];
const LARGURAS_COLUNAS = {
  PALETE: 14, "COD.": 12, "DESCRIÇÃO": 48, EAN: 16, EMBAL: 12,
  Q_NF: 10, Q_PALETE: 12, EST_INI: 10, "SEÇÃO": 10,
  ULT_ENT_CD: 13, ULT_SAI_LJ: 13,
};
const CABECALHO_COR = "FFF36A10";
const CABECALHO_FONTE_COR = "FFFFFFFF";
const BORDA_COR = "FF6BBE6B";
const LINHA_PAR_COR = "FFFCE4D6";
const LINHA_IMPAR_COR = "FFFFFFFF";

function cellVal(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "object") {
    if (v.richText) return v.richText.map((t) => t.text).join("");
    if ("result" in v) return v.result;
    if ("text" in v) return v.text;
    return v;
  }
  return v;
}

function paraNumero(v) {
  if (v === null || v === undefined || v === "") return NaN;
  return Number(v);
}

export function ligarFerramenta(raiz, { perms, emails }) {
  const consoleEl = raiz.querySelector("#console");
  function log(msg, tipo) {
    consoleEl.style.display = "block";
    const span = document.createElement("div");
    if (tipo) span.className = tipo;
    span.textContent = msg;
    consoleEl.appendChild(span);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  if (perms.processar) {
    const inputArquivo = raiz.querySelector("#arquivo");
    const fnameEl = raiz.querySelector("#fname");
    const nomeSaidaEl = raiz.querySelector("#nomeSaida");
    const btnProcessar = raiz.querySelector("#btnProcessar");
    const btnBaixar = raiz.querySelector("#btnBaixar");
    let arquivoSelecionado = null;
    let blobResultado = null;
    let nomeArquivoResultado = "Report_processado.xlsx";

    inputArquivo.addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (!f) return;
      arquivoSelecionado = f;
      fnameEl.textContent = f.name;
      btnProcessar.disabled = false;
      if (!nomeSaidaEl.value) {
        nomeSaidaEl.value = f.name.replace(/\.xlsx$/i, "") + "_processado";
      }
      if (btnBaixar) btnBaixar.style.display = "none";
    });

    btnProcessar.addEventListener("click", async () => {
      consoleEl.innerHTML = "";
      if (btnBaixar) btnBaixar.style.display = "none";
      btnProcessar.disabled = true;
      try {
        log("📊 Processando planilha...");
        const mod = await import("exceljs/dist/exceljs.min.js");
        const ExcelJS = mod.default ?? mod;
        const buffer = await arquivoSelecionado.arrayBuffer();
        const wbEntrada = new ExcelJS.Workbook();
        await wbEntrada.xlsx.load(buffer);
        const wsEntrada = wbEntrada.worksheets[0];

        const headerRow = wsEntrada.getRow(1);
        let headers = [];
        headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          headers[colNumber - 1] = cellVal(cell.value);
        });
        headers = headers.map((h) => (h === null || h === undefined ? "" : String(h)));

        let linhas = [];
        for (let r = 2; r <= wsEntrada.rowCount; r++) {
          const row = wsEntrada.getRow(r);
          const obj = {};
          let vazio = true;
          headers.forEach((h, i) => {
            const v = cellVal(row.getCell(i + 1).value);
            if (v !== null && v !== undefined && v !== "") vazio = false;
            obj[h] = v;
          });
          if (!vazio) linhas.push(obj);
        }

        if (linhas.length > 0 && headers.length > 0) {
          const primeiraCol = headers[0];
          const valorUltima = linhas[linhas.length - 1][primeiraCol];
          if (valorUltima !== null && valorUltima !== undefined && String(valorUltima).includes("Qt Itens")) {
            linhas.pop();
            log("✓ Linha de resumo removida do final", "ok");
          }
        }

        log(`✓ Arquivo lido com sucesso: ${arquivoSelecionado.name}`, "ok");
        log(`  Linhas originais: ${linhas.length}`);
        log(`  Colunas originais: ${headers.length}`);
        log(`  Colunas: [${headers.join(", ")}]`);

        const colunasExistentes = COLUNAS_REMOVER.filter((c) => headers.includes(c));
        const colunasNaoEncontradas = COLUNAS_REMOVER.filter((c) => !headers.includes(c));
        const colunasFinais = headers.filter((h) => !colunasExistentes.includes(h));
        if (colunasExistentes.length > 0) log(`✓ Colunas removidas: [${colunasExistentes.join(", ")}]`, "ok");
        if (colunasNaoEncontradas.length > 0) log(`⚠️  Colunas não encontradas: [${colunasNaoEncontradas.join(", ")}]`, "warn");

        if (!colunasFinais.includes("EST_INI")) {
          log("❌ ERRO: Coluna 'EST_INI' não encontrada na planilha!", "err");
          log(`   Colunas disponíveis: [${colunasFinais.join(", ")}]`, "err");
          return;
        }

        const linhasAntes = linhas.length;
        linhas = linhas.filter((l) => {
          const v = l.EST_INI;
          return typeof v === "number" ? v === 0 : Number(v) === 0 && v !== null && v !== "" && v !== undefined;
        });
        log("✓ Linhas filtradas por EST_INI == 0", "ok");
        log(`  Linhas removidas (EST_INI != 0): ${linhasAntes - linhas.length}`);
        log(`  Linhas restantes: ${linhas.length}`);
        if (linhas.length === 0) {
          log("⚠️  Aviso: Nenhuma linha restante após o filtro!", "warn");
          log("   Todas as linhas tinham EST_INI diferente de zero.", "warn");
          return;
        }

        if (colunasFinais.includes("PALETE")) {
          linhas.sort((a, b) => {
            const na = paraNumero(a.PALETE);
            const nb = paraNumero(b.PALETE);
            if (!isNaN(na) && !isNaN(nb)) return na - nb;
            return String(a.PALETE).localeCompare(String(b.PALETE));
          });
          log("✓ Linhas ordenadas por PALETE (crescente)", "ok");
        }

        COLUNAS_INT.forEach((col) => {
          if (!colunasFinais.includes(col)) return;
          linhas.forEach((l) => {
            const n = paraNumero(l[col]);
            l[col] = isNaN(n) ? 0 : Math.trunc(n);
          });
        });

        log("🎨 Aplicando formatação profissional...");
        log("📄 Configurando página (paisagem, margens zero, 1 página)...");

        const wbSaida = new ExcelJS.Workbook();
        const ws = wbSaida.addWorksheet("Dados");
        ws.addRow(colunasFinais);
        linhas.forEach((l) => ws.addRow(colunasFinais.map((c) => l[c])));
        ws.pageSetup = {
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          margins: { left: 0.3, right: 0.3, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
        };
        try {
          wbSaida.definedNames.add("'Dados'!$1:$1", "Print_Titles");
        } catch {
          /* repetição de cabeçalho é opcional */
        }

        const fonteCabecalho = { name: "Calibri", size: 11, bold: true, color: { argb: CABECALHO_FONTE_COR } };
        const fillCabecalho = { type: "pattern", pattern: "solid", fgColor: { argb: CABECALHO_COR } };
        const fillPar = { type: "pattern", pattern: "solid", fgColor: { argb: LINHA_PAR_COR } };
        const fillImpar = { type: "pattern", pattern: "solid", fgColor: { argb: LINHA_IMPAR_COR } };
        const bordaFina = { style: "thin", color: { argb: BORDA_COR } };
        const borda = { left: bordaFina, right: bordaFina, top: bordaFina, bottom: bordaFina };
        const alinhCabecalho = { horizontal: "center", vertical: "center", wrapText: true };
        const alinhDados = { horizontal: "left", vertical: "center", wrapText: false };
        const alinhNumero = { horizontal: "center", vertical: "center", wrapText: false };
        const fonteDados = { name: "Calibri", size: 10 };

        const headerRowOut = ws.getRow(1);
        headerRowOut.eachCell((cell) => {
          cell.font = fonteCabecalho;
          cell.fill = fillCabecalho;
          cell.alignment = alinhCabecalho;
          cell.border = borda;
        });
        headerRowOut.height = 30;

        for (let r = 2; r <= ws.rowCount; r++) {
          const row = ws.getRow(r);
          const fill = r % 2 === 0 ? fillPar : fillImpar;
          colunasFinais.forEach((colName, idx) => {
            const cell = row.getCell(idx + 1);
            cell.font = fonteDados;
            cell.fill = fill;
            cell.border = borda;
            cell.alignment = COLUNAS_CENTRALIZADAS.includes(colName) ? alinhNumero : alinhDados;
          });
        }
        colunasFinais.forEach((colName, idx) => {
          ws.getColumn(idx + 1).width = LARGURAS_COLUNAS[colName] || 15;
        });
        ws.views = [{ state: "frozen", ySplit: 1, zoomScale: 100 }];
        ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: ws.rowCount, column: colunasFinais.length } };

        let resumoRow = ws.rowCount + 2;
        const cellTitulo = ws.getCell(resumoRow, 3);
        cellTitulo.value = "RESUMO";
        cellTitulo.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFF36A10" } };
        cellTitulo.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F5E9" } };
        resumoRow += 1;

        const totalVolumes = colunasFinais.includes("Q_NF")
          ? linhas.reduce((s, l) => s + (Number(l.Q_NF) || 0), 0)
          : "N/A";
        const secoesUnicas = colunasFinais.includes("SEÇÃO")
          ? new Set(linhas.map((l) => l["SEÇÃO"])).size
          : "N/A";
        [
          ["Total de Itens:", linhas.length],
          ["Total de Volumes (Q_NF):", totalVolumes],
          ["Seções Únicas:", secoesUnicas],
        ].forEach(([label, valor]) => {
          const cLabel = ws.getCell(resumoRow, 3);
          cLabel.value = label;
          cLabel.font = { name: "Calibri", size: 10 };
          const cValor = ws.getCell(resumoRow, 4);
          cValor.value = valor;
          cValor.font = { name: "Calibri", size: 10, bold: true };
          resumoRow += 1;
        });

        const buf = await wbSaida.xlsx.writeBuffer();
        blobResultado = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        let nomeSaida = (nomeSaidaEl.value || "Report_processado").trim();
        if (!nomeSaida.toLowerCase().endsWith(".xlsx")) nomeSaida += ".xlsx";
        nomeArquivoResultado = nomeSaida;

        log("");
        log("  ✅ PLANILHA PROCESSADA COM SUCESSO!", "ok");
        log(`   📁 Arquivo de saída: ${nomeArquivoResultado}`);
        log(`   📊 Linhas finais: ${linhas.length}`);
        log(`   📋 Colunas finais: ${colunasFinais.length}`);
        log(`   📑 Colunas: [${colunasFinais.join(", ")}]`);
        log("   🚀 Planilha pronta para visualizar, imprimir e distribuir!", "ok");
        if (btnBaixar) btnBaixar.style.display = "block";
      } catch (err) {
        log("❌ Erro ao processar a planilha: " + err.message, "err");
        console.error(err);
      } finally {
        btnProcessar.disabled = false;
      }
    });

    btnBaixar?.addEventListener("click", () => {
      if (!blobResultado) return;
      const url = URL.createObjectURL(blobResultado);
      const a = document.createElement("a");
      a.href = url;
      a.download = nomeArquivoResultado;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    });
  }

  if (!perms.email) return;

  const listaDestinatarios = raiz.querySelector("#listaDestinatarios");
  const buscaEl = raiz.querySelector("#buscaEmail");
  const resultadosEl = raiz.querySelector("#resultadosEmail");
  let itemAtivo = -1;

  function criarLinhaDestinatario(valor = "") {
    const linha = document.createElement("div");
    linha.className = "dest-linha";
    const input = document.createElement("input");
    input.type = "email";
    input.className = "dest-input";
    input.placeholder = "destinatario@email.com";
    input.autocomplete = "email";
    input.autocapitalize = "off";
    input.spellcheck = false;
    input.value = valor;
    const remover = document.createElement("button");
    remover.type = "button";
    remover.className = "btn-remover";
    remover.textContent = "✕";
    remover.addEventListener("click", () => linha.remove());
    linha.append(input, remover);
    return linha;
  }

  function emailsNaLista() {
    return Array.from(raiz.querySelectorAll(".dest-input")).map((i) => i.value.trim().toLowerCase());
  }

  function adicionarDestinatario(email) {
    if (!email || emailsNaLista().includes(email.toLowerCase())) return false;
    const vazia = Array.from(raiz.querySelectorAll(".dest-input")).find((i) => !i.value.trim());
    if (vazia) vazia.value = email;
    else listaDestinatarios.appendChild(criarLinhaDestinatario(email));
    return true;
  }

  function normaliza(t) {
    return (t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function renderResultados() {
    const q = normaliza(buscaEl.value.trim());
    const jaTem = emailsNaLista();
    const achados = emails.filter((e) =>
      !jaTem.includes(e.email.toLowerCase()) &&
      (!q || normaliza(e.email).includes(q) || normaliza(e.nome).includes(q)));
    resultadosEl.innerHTML = "";
    itemAtivo = -1;
    if (!achados.length) {
      const v = document.createElement("div");
      v.className = "vazio";
      v.textContent = emails.length ? "Nenhum e-mail encontrado." : "Nenhum e-mail cadastrado. Peça ao administrador.";
      resultadosEl.appendChild(v);
    }
    achados.forEach((e) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "item";
      b.textContent = e.email;
      if (e.nome) {
        const sm = document.createElement("small");
        sm.textContent = e.nome;
        b.appendChild(sm);
      }
      b.addEventListener("mousedown", (ev) => ev.preventDefault());
      b.addEventListener("click", () => {
        adicionarDestinatario(e.email);
        buscaEl.value = "";
        renderResultados();
        buscaEl.focus();
      });
      resultadosEl.appendChild(b);
    });
    resultadosEl.hidden = false;
  }

  buscaEl.addEventListener("input", renderResultados);
  buscaEl.addEventListener("focus", renderResultados);
  buscaEl.addEventListener("blur", () => { resultadosEl.hidden = true; });
  buscaEl.addEventListener("keydown", (ev) => {
    const itens = resultadosEl.querySelectorAll(".item");
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      if (!itens.length) return;
      itemAtivo = (itemAtivo + (ev.key === "ArrowDown" ? 1 : -1) + itens.length) % itens.length;
      itens.forEach((it, k) => it.classList.toggle("ativo", k === itemAtivo));
      itens[itemAtivo].scrollIntoView({ block: "nearest" });
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      const alvo = itens[itemAtivo >= 0 ? itemAtivo : 0];
      if (alvo) alvo.click();
    } else if (ev.key === "Escape") {
      resultadosEl.hidden = true;
    }
  });

  raiz.querySelector("#btnAddTodos").addEventListener("click", () => {
    emails.forEach((e) => adicionarDestinatario(e.email));
  });
  raiz.querySelector("#btnAddDest").addEventListener("click", () => {
    listaDestinatarios.appendChild(criarLinhaDestinatario());
  });
  raiz.querySelector("#btnEnviarEmail").addEventListener("click", () => {
    const destinatarios = Array.from(raiz.querySelectorAll(".dest-input"))
      .map((i) => i.value.trim())
      .filter((v) => v.length > 0);
    if (destinatarios.length === 0) {
      log("❌ Adicione ao menos um destinatário antes de enviar.", "err");
      return;
    }
    const to = encodeURIComponent(destinatarios.join(","));
    const su = encodeURIComponent(raiz.querySelector("#assunto").value || "Produtos em Ruptura");
    const body = encodeURIComponent(raiz.querySelector("#corpoEmail").value || "");
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`, "_blank");
    log("📧 Gmail aberto com destinatários, assunto e corpo preenchidos. Anexe a planilha baixada manualmente.", "ok");
  });
}
