(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const l of t)if(l.type==="childList")for(const i of l.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function s(t){const l={};return t.integrity&&(l.integrity=t.integrity),t.referrerPolicy&&(l.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?l.credentials="include":t.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function o(t){if(t.ep)return;t.ep=!0;const l=s(t);fetch(t.href,l)}})();const ue="http://127.0.0.1:5000".replace(/\/$/,""),Z=!!ue;let U="",D=sessionStorage.getItem("sessao")||"";class Y extends Error{constructor(n,s,o){super(n),this.status=s,this.codigo=o==null?void 0:o.codigo,this.data=o}}function me(e){return`${ue}${e}`}async function pe(e){const n=await e.text();if(!n)return{};try{return JSON.parse(n)}catch{throw new Y("O servidor respondeu de forma inesperada. Recarregue a página.",e.status,{})}}async function Ae(){if(Z)return"";const e=await fetch(me("/api/csrf"),{credentials:"same-origin"});return U=(await pe(e)).csrf||"",U}async function S(e,{method:n="GET",body:s,_retry:o=!1}={}){const t={Accept:"application/json"};s!==void 0&&(t["Content-Type"]="application/json"),D&&(t.Authorization=`Bearer ${D}`),!Z&&n!=="GET"&&n!=="HEAD"&&(t["X-CSRF-Token"]=U||await Ae());let l;try{l=await fetch(me(e),{method:n,headers:t,credentials:Z?"omit":"same-origin",body:s!==void 0?JSON.stringify(s):void 0})}catch{throw new Y("Não foi possível conectar ao servidor neste computador. Deixe o sistema local aberto e tente de novo.",0,{})}const i=await pe(l);if(i.csrf&&(U=i.csrf),e==="/api/logout"?(D="",sessionStorage.removeItem("sessao")):l.ok&&i.token&&(D=i.token,sessionStorage.setItem("sessao",D)),l.status===400&&!o&&String(i.erro||"").includes("Sessão inválida"))return U="",S(e,{method:n,body:s,_retry:!0});if(!l.ok)throw new Y(i.erro||"Falha na requisição.",l.status,i);return i}function h(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ee(e){if(!e)return"";const[n,s,o]=e.split("-");return`${o}/${s}/${n}`}function qe(e,{ir:n}){e.innerHTML=`
    <div class="wrap">
      <div class="topo">
        <p class="tag">CENTRO DE DISTRIBUIÇÃO</p>
        <h1>Processador de Planilha</h1>
      </div>
      <div class="caixa">
        <div id="msgs"></div>
        <form autocomplete="on">
          <label for="username">Usuário</label>
          <input type="text" id="username" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" required autofocus>
          <label for="senha">Senha</label>
          <input type="password" id="senha" autocomplete="current-password" required>
          <button class="btn" type="submit">Entrar</button>
        </form>
        <p class="dica">O login usa o servidor que está aberto neste computador.</p>
        <a class="link-recuperar" href="/recuperar" id="recuperar">Esqueci minha senha</a>
        <p class="foot">© 2026 [Francisco Cunha/FCOSOFTWARE]. Todos os direitos reservados.</p>
      </div>
    </div>`;const s=e.querySelector("#msgs");e.querySelector("form").addEventListener("submit",async o=>{o.preventDefault(),s.innerHTML="";const t=o.target.querySelector("button");t.disabled=!0;try{await S("/api/login",{method:"POST",body:{username:e.querySelector("#username").value.trim(),senha:e.querySelector("#senha").value}}),n("/")}catch(l){s.innerHTML=`<p class="msg erro">${h(l.message)}</p>`,t.disabled=!1}}),e.querySelector("#recuperar").addEventListener("click",o=>{o.preventDefault(),n("/recuperar")})}function ie(e,{ir:n,obrigatoria:s}){var t,l;e.innerHTML=`
    <div class="wrap">
      <div class="topo"><h1>Alterar senha</h1></div>
      <div class="caixa">
        <div id="msgs"></div>
        ${s?'<p class="msg ok">Por segurança, defina uma nova senha para continuar.</p>':""}
        <form>
          <label for="atual">Senha atual</label>
          <input type="password" id="atual" autocomplete="current-password" required autofocus>
          <label for="nova">Nova senha</label>
          <input type="password" id="nova" autocomplete="new-password" required minlength="8">
          <p class="dica">Mínimo de 8 caracteres, com letras e números.</p>
          <label for="confirma">Confirmar nova senha</label>
          <input type="password" id="confirma" autocomplete="new-password" required minlength="8">
          <button class="btn" type="submit">Salvar senha</button>
        </form>
        ${s?'<button class="btn sec" id="sair" type="button">Sair</button>':'<a class="btn sec" href="/" id="voltar">Voltar</a>'}
      </div>
    </div>`;const o=e.querySelector("#msgs");e.querySelector("form").addEventListener("submit",async i=>{i.preventDefault(),o.innerHTML="";try{const u=await S("/api/senha",{method:"POST",body:{atual:e.querySelector("#atual").value,nova:e.querySelector("#nova").value,confirma:e.querySelector("#confirma").value}});o.innerHTML=`<p class="msg ok">${h(u.mensagem)}</p>`,n("/")}catch(u){o.innerHTML=`<p class="msg erro">${h(u.message)}</p>`}}),(t=e.querySelector("#sair"))==null||t.addEventListener("click",async()=>{await S("/api/logout",{method:"POST"}),n("/login")}),(l=e.querySelector("#voltar"))==null||l.addEventListener("click",i=>{i.preventDefault(),n("/")})}const xe="modulepreload",_e=function(e){return"/rupturas/"+e},re={},Ne=function(n,s,o){let t=Promise.resolve();if(s&&s.length>0){let i=function(d){return Promise.all(d.map(c=>Promise.resolve(c).then(y=>({status:"fulfilled",value:y}),y=>({status:"rejected",reason:y}))))};document.getElementsByTagName("link");const u=document.querySelector("meta[property=csp-nonce]"),T=(u==null?void 0:u.nonce)||(u==null?void 0:u.getAttribute("nonce"));t=i(s.map(d=>{if(d=_e(d),d in re)return;re[d]=!0;const c=d.endsWith(".css"),y=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${y}`))return;const E=document.createElement("link");if(E.rel=c?"stylesheet":xe,c||(E.as="script"),E.crossOrigin="",E.href=d,T&&E.setAttribute("nonce",T),document.head.appendChild(E),c)return new Promise((k,a)=>{E.addEventListener("load",k),E.addEventListener("error",()=>a(new Error(`Unable to preload CSS for ${d}`)))})}))}function l(i){const u=new Event("vite:preloadError",{cancelable:!0});if(u.payload=i,window.dispatchEvent(u),!u.defaultPrevented)throw i}return t.then(i=>{for(const u of i||[])u.status==="rejected"&&l(u.reason);return n().catch(l)})},le=["CARGA","CT_UN","CT_TT","DATA","NOTA","VEÍCULO"],Oe=["PALETE","Q_NF","Q_PALETE","EST_INI","SEÇÃO"],Re=["COD.","SEÇÃO","Q_NF","Q_PALETE","EST_INI"],Pe={PALETE:14,"COD.":12,DESCRIÇÃO:48,EAN:16,EMBAL:12,Q_NF:10,Q_PALETE:12,EST_INI:10,SEÇÃO:10,ULT_ENT_CD:13,ULT_SAI_LJ:13},De="FFF36A10",Ie="FFFFFFFF",Fe="FF6BBE6B",Ue="FFFCE4D6",He="FFFFFFFF";function ce(e){return e==null?null:typeof e=="object"?e.richText?e.richText.map(n=>n.text).join(""):"result"in e?e.result:"text"in e?e.text:e:e}function K(e){return e==null||e===""?NaN:Number(e)}function Me(e,{perms:n,emails:s}){const o=e.querySelector("#console");function t(a,m){o.style.display="block";const p=document.createElement("div");m&&(p.className=m),p.textContent=a,o.appendChild(p),o.scrollTop=o.scrollHeight}if(n.processar){const a=e.querySelector("#arquivo"),m=e.querySelector("#fname"),p=e.querySelector("#nomeSaida"),f=e.querySelector("#btnProcessar"),b=e.querySelector("#btnBaixar");let _=null,z=null,B="Report_processado.xlsx";a.addEventListener("change",q=>{const L=q.target.files[0];L&&(_=L,m.textContent=L.name,f.disabled=!1,p.value||(p.value=L.name.replace(/\.xlsx$/i,"")+"_processado"),b&&(b.style.display="none"))}),f.addEventListener("click",async()=>{o.innerHTML="",b&&(b.style.display="none"),f.disabled=!0;try{t("📊 Processando planilha...");const q=await Ne(()=>import("./exceljs.min-_FHOiBEn.js").then(r=>r.e),[]),L=q.default??q,fe=await _.arrayBuffer(),te=new L.Workbook;await te.xlsx.load(fe);const V=te.worksheets[0],ve=V.getRow(1);let A=[];ve.eachCell({includeEmpty:!0},(r,v)=>{A[v-1]=ce(r.value)}),A=A.map(r=>r==null?"":String(r));let g=[];for(let r=2;r<=V.rowCount;r++){const v=V.getRow(r),C={};let x=!0;A.forEach((X,R)=>{const M=ce(v.getCell(R+1).value);M!=null&&M!==""&&(x=!1),C[X]=M}),x||g.push(C)}if(g.length>0&&A.length>0){const r=A[0],v=g[g.length-1][r];v!=null&&String(v).includes("Qt Itens")&&(g.pop(),t("✓ Linha de resumo removida do final","ok"))}t(`✓ Arquivo lido com sucesso: ${_.name}`,"ok"),t(`  Linhas originais: ${g.length}`),t(`  Colunas originais: ${A.length}`),t(`  Colunas: [${A.join(", ")}]`);const W=le.filter(r=>A.includes(r)),ne=le.filter(r=>!A.includes(r)),$=A.filter(r=>!W.includes(r));if(W.length>0&&t(`✓ Colunas removidas: [${W.join(", ")}]`,"ok"),ne.length>0&&t(`⚠️  Colunas não encontradas: [${ne.join(", ")}]`,"warn"),!$.includes("EST_INI")){t("❌ ERRO: Coluna 'EST_INI' não encontrada na planilha!","err"),t(`   Colunas disponíveis: [${$.join(", ")}]`,"err");return}const he=g.length;if(g=g.filter(r=>{const v=r.EST_INI;return typeof v=="number"?v===0:Number(v)===0&&v!==null&&v!==""&&v!==void 0}),t("✓ Linhas filtradas por EST_INI == 0","ok"),t(`  Linhas removidas (EST_INI != 0): ${he-g.length}`),t(`  Linhas restantes: ${g.length}`),g.length===0){t("⚠️  Aviso: Nenhuma linha restante após o filtro!","warn"),t("   Todas as linhas tinham EST_INI diferente de zero.","warn");return}$.includes("PALETE")&&(g.sort((r,v)=>{const C=K(r.PALETE),x=K(v.PALETE);return!isNaN(C)&&!isNaN(x)?C-x:String(r.PALETE).localeCompare(String(v.PALETE))}),t("✓ Linhas ordenadas por PALETE (crescente)","ok")),Oe.forEach(r=>{$.includes(r)&&g.forEach(v=>{const C=K(v[r]);v[r]=isNaN(C)?0:Math.trunc(C)})}),t("🎨 Aplicando formatação profissional..."),t("📄 Configurando página (paisagem, margens zero, 1 página)...");const Q=new L.Workbook,w=Q.addWorksheet("Dados");w.addRow($),g.forEach(r=>w.addRow($.map(v=>r[v]))),w.pageSetup={orientation:"landscape",fitToPage:!0,fitToWidth:1,fitToHeight:0,margins:{left:.3,right:.3,top:.75,bottom:.75,header:.3,footer:.3}};try{Q.definedNames.add("'Dados'!$1:$1","Print_Titles")}catch{}const be={name:"Calibri",size:11,bold:!0,color:{argb:Ie}},ge={type:"pattern",pattern:"solid",fgColor:{argb:De}},ye={type:"pattern",pattern:"solid",fgColor:{argb:Ue}},Ee={type:"pattern",pattern:"solid",fgColor:{argb:He}},H={style:"thin",color:{argb:Fe}},oe={left:H,right:H,top:H,bottom:H},Se={horizontal:"center",vertical:"center",wrapText:!0},we={horizontal:"left",vertical:"center",wrapText:!1},Le={horizontal:"center",vertical:"center",wrapText:!1},$e={name:"Calibri",size:10},se=w.getRow(1);se.eachCell(r=>{r.font=be,r.fill=ge,r.alignment=Se,r.border=oe}),se.height=30;for(let r=2;r<=w.rowCount;r++){const v=w.getRow(r),C=r%2===0?ye:Ee;$.forEach((x,X)=>{const R=v.getCell(X+1);R.font=$e,R.fill=C,R.border=oe,R.alignment=Re.includes(x)?Le:we})}$.forEach((r,v)=>{w.getColumn(v+1).width=Pe[r]||15}),w.views=[{state:"frozen",ySplit:1,zoomScale:100}],w.autoFilter={from:{row:1,column:1},to:{row:w.rowCount,column:$.length}};let P=w.rowCount+2;const G=w.getCell(P,3);G.value="RESUMO",G.font={name:"Calibri",size:12,bold:!0,color:{argb:"FFF36A10"}},G.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FFE8F5E9"}},P+=1;const Ce=$.includes("Q_NF")?g.reduce((r,v)=>r+(Number(v.Q_NF)||0),0):"N/A",Te=$.includes("SEÇÃO")?new Set(g.map(r=>r.SEÇÃO)).size:"N/A";[["Total de Itens:",g.length],["Total de Volumes (Q_NF):",Ce],["Seções Únicas:",Te]].forEach(([r,v])=>{const C=w.getCell(P,3);C.value=r,C.font={name:"Calibri",size:10};const x=w.getCell(P,4);x.value=v,x.font={name:"Calibri",size:10,bold:!0},P+=1});const ke=await Q.xlsx.writeBuffer();z=new Blob([ke],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});let J=(p.value||"Report_processado").trim();J.toLowerCase().endsWith(".xlsx")||(J+=".xlsx"),B=J,t(""),t("  ✅ PLANILHA PROCESSADA COM SUCESSO!","ok"),t(`   📁 Arquivo de saída: ${B}`),t(`   📊 Linhas finais: ${g.length}`),t(`   📋 Colunas finais: ${$.length}`),t(`   📑 Colunas: [${$.join(", ")}]`),t("   🚀 Planilha pronta para visualizar, imprimir e distribuir!","ok"),b&&(b.style.display="block")}catch(q){t("❌ Erro ao processar a planilha: "+q.message,"err"),console.error(q)}finally{f.disabled=!1}}),b==null||b.addEventListener("click",()=>{if(!z)return;const q=URL.createObjectURL(z),L=document.createElement("a");L.href=q,L.download=B,document.body.appendChild(L),L.click(),document.body.removeChild(L),setTimeout(()=>URL.revokeObjectURL(q),5e3)})}if(!n.email)return;const l=e.querySelector("#listaDestinatarios"),i=e.querySelector("#buscaEmail"),u=e.querySelector("#resultadosEmail");let T=-1;function d(a=""){const m=document.createElement("div");m.className="dest-linha";const p=document.createElement("input");p.type="email",p.className="dest-input",p.placeholder="destinatario@email.com",p.autocomplete="email",p.autocapitalize="off",p.spellcheck=!1,p.value=a;const f=document.createElement("button");return f.type="button",f.className="btn-remover",f.textContent="✕",f.addEventListener("click",()=>m.remove()),m.append(p,f),m}function c(){return Array.from(e.querySelectorAll(".dest-input")).map(a=>a.value.trim().toLowerCase())}function y(a){if(!a||c().includes(a.toLowerCase()))return!1;const m=Array.from(e.querySelectorAll(".dest-input")).find(p=>!p.value.trim());return m?m.value=a:l.appendChild(d(a)),!0}function E(a){return(a||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}function k(){const a=E(i.value.trim()),m=c(),p=s.filter(f=>!m.includes(f.email.toLowerCase())&&(!a||E(f.email).includes(a)||E(f.nome).includes(a)));if(u.innerHTML="",T=-1,!p.length){const f=document.createElement("div");f.className="vazio",f.textContent=s.length?"Nenhum e-mail encontrado.":"Nenhum e-mail cadastrado. Peça ao administrador.",u.appendChild(f)}p.forEach(f=>{const b=document.createElement("button");if(b.type="button",b.className="item",b.textContent=f.email,f.nome){const _=document.createElement("small");_.textContent=f.nome,b.appendChild(_)}b.addEventListener("mousedown",_=>_.preventDefault()),b.addEventListener("click",()=>{y(f.email),i.value="",k(),i.focus()}),u.appendChild(b)}),u.hidden=!1}i.addEventListener("input",k),i.addEventListener("focus",k),i.addEventListener("blur",()=>{u.hidden=!0}),i.addEventListener("keydown",a=>{const m=u.querySelectorAll(".item");if(a.key==="ArrowDown"||a.key==="ArrowUp"){if(a.preventDefault(),!m.length)return;T=(T+(a.key==="ArrowDown"?1:-1)+m.length)%m.length,m.forEach((p,f)=>p.classList.toggle("ativo",f===T)),m[T].scrollIntoView({block:"nearest"})}else if(a.key==="Enter"){a.preventDefault();const p=m[T>=0?T:0];p&&p.click()}else a.key==="Escape"&&(u.hidden=!0)}),e.querySelector("#btnAddTodos").addEventListener("click",()=>{s.forEach(a=>y(a.email))}),e.querySelector("#btnAddDest").addEventListener("click",()=>{l.appendChild(d())}),e.querySelector("#btnEnviarEmail").addEventListener("click",()=>{const a=Array.from(e.querySelectorAll(".dest-input")).map(b=>b.value.trim()).filter(b=>b.length>0);if(a.length===0){t("❌ Adicione ao menos um destinatário antes de enviar.","err");return}const m=encodeURIComponent(a.join(",")),p=encodeURIComponent(e.querySelector("#assunto").value||"Produtos em Ruptura"),f=encodeURIComponent(e.querySelector("#corpoEmail").value||"");window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${m}&su=${p}&body=${f}`,"_blank"),t("📧 Gmail aberto com destinatários, assunto e corpo preenchidos. Anexe a planilha baixada manualmente.","ok")})}function de(e,{ir:n,me:s}){var l,i;const o=s.permissoes||{},t=!s.is_admin&&s.validade?` · acesso até ${ee(s.validade)}`:"";e.innerHTML=`
    <div class="card">
      <div class="userbar">
        <span>👤 ${h(s.nome||s.username)}${h(t)}</span>
        <span class="acoes">
          ${s.is_admin?'<a href="/admin" id="ir-admin">Administração</a>':""}
          <a href="/senha" id="ir-senha">Alterar senha</a>
          <button type="button" id="sair">Sair</button>
        </span>
      </div>
      <div class="header">
        <p class="tag">CENTRO DE DISTRIBUIÇÃO</p>
        <h1>Processador de Planilha</h1>
      </div>
      <div class="body">
        ${o.processar?`
        <div class="step">
          <label>1. Selecione a planilha (.xlsx)</label>
          <div class="filebox">
            <label class="btn-pick" for="arquivo">Escolher arquivo</label>
            <input type="file" id="arquivo" accept=".xlsx">
            <div class="fname" id="fname">Nenhum arquivo selecionado</div>
          </div>
        </div>
        <div class="step">
          <label>2. Nome da nova planilha</label>
          <input type="text" id="nomeSaida" placeholder="ex: Report_processado">
        </div>
        <button class="principal" id="btnProcessar" disabled>Processar planilha</button>
        ${o.baixar?'<button class="baixar" id="btnBaixar">⬇️ Baixar planilha processada</button>':""}
        `:""}
        ${!o.processar&&!o.email?'<div class="aviso-sem-perm">Seu usuário ainda não tem permissões nesta ferramenta. Fale com o administrador.</div>':""}
        <div class="console" id="console"></div>
        ${o.email?`
        <hr class="divisor">
        <div class="step">
          <label>3. Enviar por e-mail</label>
          <label class="suave">Remetente</label>
          <input type="email" id="remetente" placeholder="seu-email@gmail.com" autocomplete="email" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="email">
          <p class="hint">Informativo — o Gmail sempre envia pela conta que estiver logada no navegador/app.</p>
          <label class="suave">Destinatários</label>
          <div class="busca-wrap">
            <input type="text" id="buscaEmail" placeholder="🔍 Pesquisar e-mail cadastrado..." autocomplete="off" autocapitalize="off" spellcheck="false">
            <div id="resultadosEmail" class="resultados" hidden></div>
          </div>
          <div class="busca-acoes"><button type="button" class="btn-link" id="btnAddTodos">Adicionar todos os cadastrados</button></div>
          <div id="listaDestinatarios"></div>
          <button type="button" class="btn-add-dest" id="btnAddDest">+ Digitar outro e-mail</button>
          <label class="suave">Assunto</label>
          <input type="text" id="assunto" value="Produtos em Ruptura">
          <label class="suave">Corpo do e-mail</label>
          <textarea id="corpoEmail">Segue o relatório dos produtos que estão zerados em nossa loja!!</textarea>
          <button class="enviar" id="btnEnviarEmail">📧 Abrir no Gmail</button>
          <p class="hint">Isso abre o Gmail já preenchido. O Gmail não permite anexar o arquivo automaticamente pelo link — anexe a planilha baixada manualmente antes de enviar.</p>
        </div>`:""}
        <p class="foot">Tudo roda no navegador — a planilha não é enviada para nenhum servidor.<br>© 2026 [Francisco Cunha/FCOSOFTWARE]. Todos os direitos reservados. Desenvolvido com foco em performance.</p>
      </div>
    </div>`,(l=e.querySelector("#ir-admin"))==null||l.addEventListener("click",u=>{u.preventDefault(),n("/admin")}),(i=e.querySelector("#ir-senha"))==null||i.addEventListener("click",u=>{u.preventDefault(),n("/senha")}),e.querySelector("#sair").addEventListener("click",async()=>{await S("/api/logout",{method:"POST"}),n("/login")}),Me(e,{perms:o,emails:s.emails||[]})}function I(e,n,s){e.innerHTML=n?`<p class="msg ${s}">${h(n)}</p>`:""}function je(e){return e.ativo?e.expirado?`<span class="selo off">Expirado em ${h(ee(e.validade))}</span>`:e.validade&&!e.is_admin?`<span class="selo warn">Até ${h(ee(e.validade))}</span>`:`<span class="selo ok">Ativo${e.is_admin?"":" · sem prazo"}</span>`:'<span class="selo off">Desativado</span>'}async function ze(e,{ir:n}){e.innerHTML=`
    <div class="wrap larga">
      <div class="barra">
        <h1>Administração de usuários</h1>
        <div class="links">
          <a class="btn peq sec" href="/" id="ir-home">Ir para a ferramenta</a>
          <button class="btn peq perigo" id="sair" type="button">Sair</button>
        </div>
      </div>
      <div id="msgs"></div>
      <div id="conteudo"><p class="dica">Carregando...</p></div>
    </div>`;const s=e.querySelector("#msgs");e.querySelector("#ir-home").addEventListener("click",d=>{d.preventDefault(),n("/")}),e.querySelector("#sair").addEventListener("click",async()=>{await S("/api/logout",{method:"POST"}),n("/login")});let o;try{o=await S("/api/admin")}catch(d){I(s,d.message,"erro");return}t(o);function t(d){const c=Object.entries(d.permissoes).map(([a,m])=>`<label><input type="checkbox" name="perm_${a}" ${a!=="email"?"checked":""}> ${h(m)}</label>`).join(""),y=d.usuarios.map(a=>{const m=Object.entries(d.permissoes).map(([f,b])=>`<label><input type="checkbox" name="perm_${f}" ${a.permissoes[f]||a.is_admin?"checked":""} ${a.is_admin?"disabled":""}> ${h(b)}</label>`).join(""),p=a.ultimo_acesso?a.ultimo_acesso.replace("T"," "):"nunca";return`
        <details class="usuario">
          <summary>
            <span class="nome-u">${h(a.username)}</span>
            ${a.nome?`<span class="meta">${h(a.nome)}</span>`:""}
            ${a.email?`<span class="meta">${h(a.email)}</span>`:'<span class="meta">sem e-mail</span>'}
            ${a.is_admin?'<span class="selo adm">Administrador</span>':""}
            ${je(a)}
            <span class="meta">Último acesso: ${h(p)}</span>
          </summary>
          <div class="corpo-u">
            <form data-acao="editar" data-id="${a.id}">
              <div class="grade">
                <div><label>Nome</label><input type="text" name="nome" value="${h(a.nome)}" maxlength="80"></div>
                <div><label>E-mail de recuperação</label><input type="email" name="email" value="${h(a.email||"")}" maxlength="120" required autocapitalize="off" spellcheck="false"></div>
                <div><label>Acesso válido até</label><input type="date" name="validade" value="${h(a.validade||"")}" ${a.is_admin?"disabled":""}></div>
              </div>
              <label>Permissões</label>
              <div class="checks">
                ${m}
                <label><input type="checkbox" name="is_admin" ${a.is_admin?"checked":""} ${a.id===d.eu_id?"disabled":""}> Administrador</label>
                <label><input type="checkbox" name="ativo" ${a.ativo?"checked":""} ${a.id===d.eu_id?"disabled":""}> Usuário ativo</label>
              </div>
              ${a.is_admin?'<p class="dica">Administradores têm todas as permissões e não expiram.</p>':""}
              <div class="acoes-u"><button class="btn peq" type="submit">Salvar alterações</button></div>
            </form>
            <div class="sub">
              <form data-acao="senha" data-id="${a.id}" autocomplete="off">
                <div><label>Redefinir senha</label><input type="password" name="senha" minlength="8" required placeholder="nova senha temporária" autocomplete="new-password"></div>
                <button class="btn peq sec" type="submit">Redefinir</button>
              </form>
            </div>
            ${a.id!==d.eu_id?`
            <div class="sub">
              <form data-acao="excluir" data-id="${a.id}">
                <button class="btn peq perigo" type="submit">Excluir usuário</button>
              </form>
            </div>`:""}
          </div>
        </details>`}).join(""),E=d.emails.map(a=>`
      <div class="email-item">
        <span><strong>${h(a.email)}</strong>${a.nome?` <span class="meta">· ${h(a.nome)}</span>`:""}</span>
        <button class="btn peq perigo" type="button" data-excluir-email="${a.id}" data-email="${h(a.email)}">Remover</button>
      </div>`).join("")||'<p class="dica">Nenhum e-mail cadastrado.</p>',k=(d.recuperacoes||[]).map(a=>`
      <div class="recuperacao">
        <span><strong>${h(a.username)}</strong>${a.nome?` <span class="meta">${h(a.nome)}</span>`:""}
          <span class="meta"> · até ${h((a.expira_em||"").replace("T"," "))}</span>
        </span>
        <span class="acoes">
          <button class="btn peq sec" type="button" data-copiar-token="${h(a.token)}">Copiar link</button>
        </span>
      </div>`).join("")||'<p class="dica">Nenhum pedido em aberto.</p>';e.querySelector("#conteudo").innerHTML=`
      <div class="painel">
        <h2>Recuperação de senha (${(d.recuperacoes||[]).length})</h2>
        <p class="dica">O link é enviado por e-mail. Se a pessoa não receber, copie aqui. Ele vale por 2 horas e só pode ser usado uma vez.</p>
        <div style="margin-top:8px;">${k}</div>
      </div>
      <div class="painel">
        <h2>Novo usuário</h2>
        <form data-acao="novo" autocomplete="off">
          <div class="grade">
            <div><label>Usuário (login)</label><input type="text" name="username" required autocapitalize="off" spellcheck="false"></div>
            <div><label>Nome</label><input type="text" name="nome" maxlength="80"></div>
            <div><label>E-mail de recuperação</label><input type="email" name="email" required maxlength="120" placeholder="nome@empresa.com" autocapitalize="off" spellcheck="false"></div>
            <div><label>Senha inicial</label><input type="password" name="senha" required minlength="8" autocomplete="new-password"></div>
            <div><label>Acesso válido até</label><input type="date" name="validade" min="${h(d.hoje)}"><p class="dica">Vazio = sem prazo. O último dia vale por inteiro.</p></div>
          </div>
          <label>Permissões</label>
          <div class="checks">
            ${c}
            <label><input type="checkbox" name="is_admin"> Administrador (acesso total, sem prazo)</label>
          </div>
          <button class="btn" type="submit" style="width:auto;padding:11px 22px;">Criar usuário</button>
          <p class="dica">No primeiro acesso, o usuário será obrigado a trocar a senha.</p>
        </form>
      </div>
      <div class="painel" id="emails">
        <h2>E-mails cadastrados (${d.emails.length})</h2>
        <p class="dica">Estes e-mails aparecem na busca de destinatários da tela principal.</p>
        <form data-acao="email" autocomplete="off">
          <div class="grade">
            <div><label>E-mail(s)</label><input type="text" name="email" required placeholder="nome@empresa.com (vários: separe por vírgula)" autocapitalize="off" spellcheck="false"></div>
            <div><label>Nome / setor (opcional)</label><input type="text" name="nome" maxlength="80" placeholder="ex: Açougue Loja 07"></div>
          </div>
          <button class="btn" type="submit" style="width:auto;padding:11px 22px;">Cadastrar e-mail</button>
        </form>
        <div style="margin-top:14px;">${E}</div>
      </div>
      <div class="painel">
        <h2>Usuários (${d.usuarios.length})</h2>
        ${y}
      </div>`,e.querySelector("#conteudo").querySelectorAll("form").forEach(a=>{a.addEventListener("submit",m=>T(m,a))}),e.querySelectorAll("[data-copiar-token]").forEach(a=>{a.addEventListener("click",async()=>{const m=`${location.origin}/recuperar/${a.dataset.copiarToken}`;try{await navigator.clipboard.writeText(m),I(s,"Link copiado.","ok")}catch{I(s,m,"ok")}})}),e.querySelectorAll("[data-excluir-email]").forEach(a=>{a.addEventListener("click",async()=>{confirm(`Remover ${a.dataset.email} do cadastro?`)&&await u(()=>S(`/api/admin/emails/${a.dataset.excluirEmail}`,{method:"DELETE"}))})})}function l(d){const c={};return d.querySelectorAll('input[name^="perm_"]').forEach(y=>{c[y.name.slice(5)]=y.checked}),c}function i(d,c){return d.querySelector(`[name="${c}"]`)}async function u(d){try{const c=await d();I(s,c.mensagem||"",c.ok===!1?"erro":"ok"),o=await S("/api/admin"),t(o)}catch(c){I(s,c.message,"erro")}}function T(d,c){d.preventDefault();const y=c.dataset.acao,E=c.dataset.id;if(y==="novo")return u(()=>S("/api/admin/usuarios",{method:"POST",body:{username:i(c,"username").value.trim(),nome:i(c,"nome").value,email:i(c,"email").value.trim(),senha:i(c,"senha").value,validade:i(c,"validade").value,is_admin:i(c,"is_admin").checked,permissoes:l(c)}}));if(y==="editar"){const k=i(c,"is_admin"),a=i(c,"ativo");return u(()=>S(`/api/admin/usuarios/${E}`,{method:"PUT",body:{nome:i(c,"nome").value,email:i(c,"email").value.trim(),validade:i(c,"validade").value,is_admin:k.checked,ativo:a.checked,permissoes:l(c)}}))}if(y==="senha")return u(()=>S(`/api/admin/usuarios/${E}/senha`,{method:"POST",body:{senha:i(c,"senha").value}}));if(y==="excluir"){const k=c.closest(".usuario").querySelector(".nome-u").textContent;return confirm(`Excluir o usuário ${k}? Esta ação não pode ser desfeita.`)?u(()=>S(`/api/admin/usuarios/${E}`,{method:"DELETE"})):void 0}}}function Be(e,{ir:n,path:s}){const o="/recuperar/",t=s.startsWith(o)?decodeURIComponent(s.slice(o.length)):"";t?We(e,{ir:n,token:t}):Ve(e,{ir:n})}function Ve(e,{ir:n}){e.innerHTML=`
    <div class="wrap">
      <div class="topo"><h1>Recuperar senha</h1></div>
      <div class="caixa">
        <div id="msgs"></div>
        <p class="dica">Informe o e-mail cadastrado na sua conta. Você recebe um link para criar uma nova senha. O link vale por 2 horas.</p>
        <form>
          <label for="email">E-mail</label>
          <input type="email" id="email" autocomplete="email" autocapitalize="off" spellcheck="false" inputmode="email" required autofocus>
          <button class="btn" type="submit">Enviar link por e-mail</button>
        </form>
        <a class="btn sec" href="/login" id="voltar">Voltar ao login</a>
      </div>
    </div>`;const s=e.querySelector("#msgs");e.querySelector("#voltar").addEventListener("click",o=>{o.preventDefault(),n("/login")}),e.querySelector("form").addEventListener("submit",async o=>{o.preventDefault(),s.innerHTML="";const t=o.target.querySelector("button");t.disabled=!0;try{const l=await S("/api/recuperar",{method:"POST",body:{email:e.querySelector("#email").value.trim()}});s.innerHTML=`<p class="msg ok">${h(l.mensagem)}</p>`}catch(l){s.innerHTML=`<p class="msg erro">${h(l.message)}</p>`,t.disabled=!1}})}function We(e,{ir:n,token:s}){e.innerHTML=`
    <div class="wrap">
      <div class="topo"><h1>Nova senha</h1></div>
      <div class="caixa">
        <div id="msgs"><p class="dica">Conferindo o link...</p></div>
        <form hidden>
          <label for="nova">Nova senha</label>
          <input type="password" id="nova" autocomplete="new-password" required minlength="8">
          <p class="dica">Mínimo de 8 caracteres, com letras e números.</p>
          <label for="confirma">Confirmar nova senha</label>
          <input type="password" id="confirma" autocomplete="new-password" required minlength="8">
          <button class="btn" type="submit">Salvar senha</button>
        </form>
        <a class="btn sec" href="/login" id="voltar">Voltar ao login</a>
      </div>
    </div>`;const o=e.querySelector("#msgs"),t=e.querySelector("form");e.querySelector("#voltar").addEventListener("click",l=>{l.preventDefault(),n("/login")}),S(`/api/recuperar/${encodeURIComponent(s)}`).then(()=>{o.innerHTML="",t.hidden=!1}).catch(l=>{o.innerHTML=`<p class="msg erro">${h(l.message)}</p>`}),t.addEventListener("submit",async l=>{l.preventDefault(),o.innerHTML="";try{const i=await S(`/api/recuperar/${encodeURIComponent(s)}`,{method:"POST",body:{nova:e.querySelector("#nova").value,confirma:e.querySelector("#confirma").value}});o.innerHTML=`<p class="msg ok">${h(i.mensagem)}</p>`,t.hidden=!0}catch(i){o.innerHTML=`<p class="msg erro">${h(i.message)}</p>`}})}const N=document.getElementById("app"),j="/rupturas/".replace(/\/$/,"");function Qe(){let e=location.pathname;return j&&e.startsWith(j)&&(e=e.slice(j.length)),!e||e==="/"?"/":e.startsWith("/")?e:`/${e}`}function F(e){return`${j}${e}`}function O(e){const n=F(e);location.pathname!==n&&history.pushState({},"",n),ae()}async function Ge(){try{return(await S("/api/me")).usuario}catch{return null}}async function ae(){const e=await Ge();let n=Qe();if(n==="/recuperar"||n.startsWith("/recuperar/")){Be(N,{ir:O,path:n});return}if(!e){n!=="/login"&&history.replaceState({},"",F("/login")),qe(N,{ir:O});return}if(e.trocar_senha&&n!=="/senha"){history.replaceState({},"",F("/senha")),ie(N,{ir:O,obrigatoria:!0});return}if(!e.trocar_senha&&(n==="/login"||n==="/senha")&&(history.replaceState({},"",F("/")),n="/"),n==="/admin"){if(!e.is_admin){history.replaceState({},"",F("/")),de(N,{ir:O,me:e});return}ze(N,{ir:O});return}if(n==="/senha"){ie(N,{ir:O,obrigatoria:!1});return}de(N,{ir:O,me:e})}window.addEventListener("popstate",()=>ae());ae();
