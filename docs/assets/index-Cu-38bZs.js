(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))l(a);new MutationObserver(a=>{for(const m of a)if(m.type==="childList")for(const s of m.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&l(s)}).observe(document,{childList:!0,subtree:!0});function r(a){const m={};return a.integrity&&(m.integrity=a.integrity),a.referrerPolicy&&(m.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?m.credentials="include":a.crossOrigin==="anonymous"?m.credentials="omit":m.credentials="same-origin",m}function l(a){if(a.ep)return;a.ep=!0;const m=r(a);fetch(a.href,m)}})();let D="";class we extends Error{constructor(o,r,l){super(o),this.status=r,this.codigo=l==null?void 0:l.codigo,this.data=l}}async function Ce(){return D=(await(await fetch("/api/csrf",{credentials:"same-origin"})).json()).csrf||"",D}async function C(e,{method:o="GET",body:r,_retry:l=!1}={}){const a={Accept:"application/json"};r!==void 0&&(a["Content-Type"]="application/json"),o!=="GET"&&o!=="HEAD"&&(a["X-CSRF-Token"]=D||await Ce());const m=await fetch(e,{method:o,headers:a,credentials:"same-origin",body:r!==void 0?JSON.stringify(r):void 0}),s=await m.json().catch(()=>({}));if(s.csrf&&(D=s.csrf),m.status===400&&!l&&String(s.erro||"").includes("Sessão inválida"))return D="",C(e,{method:o,body:r,_retry:!0});if(!m.ok)throw new we(s.erro||"Falha na requisição.",m.status,s);return s}function g(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function X(e){if(!e)return"";const[o,r,l]=e.split("-");return`${l}/${r}/${o}`}function Ae(e,{ir:o}){e.innerHTML=`
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
        <p class="foot">© 2026 [Francisco Cunha/FCOSOFTWARE]. Todos os direitos reservados.</p>
      </div>
    </div>`;const r=e.querySelector("#msgs");e.querySelector("form").addEventListener("submit",async l=>{l.preventDefault(),r.innerHTML="";const a=l.target.querySelector("button");a.disabled=!0;try{await C("/api/login",{method:"POST",body:{username:e.querySelector("#username").value.trim(),senha:e.querySelector("#senha").value}}),o("/")}catch(m){r.innerHTML=`<p class="msg erro">${g(m.message)}</p>`,a.disabled=!1}})}function ne(e,{ir:o,obrigatoria:r}){var a,m;e.innerHTML=`
    <div class="wrap">
      <div class="topo"><h1>Alterar senha</h1></div>
      <div class="caixa">
        <div id="msgs"></div>
        ${r?'<p class="msg ok">Por segurança, defina uma nova senha para continuar.</p>':""}
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
        ${r?'<button class="btn sec" id="sair" type="button">Sair</button>':'<a class="btn sec" href="/" id="voltar">Voltar</a>'}
      </div>
    </div>`;const l=e.querySelector("#msgs");e.querySelector("form").addEventListener("submit",async s=>{s.preventDefault(),l.innerHTML="";try{const u=await C("/api/senha",{method:"POST",body:{atual:e.querySelector("#atual").value,nova:e.querySelector("#nova").value,confirma:e.querySelector("#confirma").value}});l.innerHTML=`<p class="msg ok">${g(u.mensagem)}</p>`,o("/")}catch(u){l.innerHTML=`<p class="msg erro">${g(u.message)}</p>`}}),(a=e.querySelector("#sair"))==null||a.addEventListener("click",async()=>{await C("/api/logout",{method:"POST"}),o("/login")}),(m=e.querySelector("#voltar"))==null||m.addEventListener("click",s=>{s.preventDefault(),o("/")})}const Le="modulepreload",$e=function(e){return"/ruptura/"+e},oe={},Te=function(o,r,l){let a=Promise.resolve();if(r&&r.length>0){let s=function(d){return Promise.all(d.map(c=>Promise.resolve(c).then(E=>({status:"fulfilled",value:E}),E=>({status:"rejected",reason:E}))))};document.getElementsByTagName("link");const u=document.querySelector("meta[property=csp-nonce]"),T=(u==null?void 0:u.nonce)||(u==null?void 0:u.getAttribute("nonce"));a=s(r.map(d=>{if(d=$e(d),d in oe)return;oe[d]=!0;const c=d.endsWith(".css"),E=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${E}`))return;const S=document.createElement("link");if(S.rel=c?"stylesheet":Le,c||(S.as="script"),S.crossOrigin="",S.href=d,T&&S.setAttribute("nonce",T),document.head.appendChild(S),c)return new Promise((t,i)=>{S.addEventListener("load",t),S.addEventListener("error",()=>i(new Error(`Unable to preload CSS for ${d}`)))})}))}function m(s){const u=new Event("vite:preloadError",{cancelable:!0});if(u.payload=s,window.dispatchEvent(u),!u.defaultPrevented)throw s}return a.then(s=>{for(const u of s||[])u.status==="rejected"&&m(u.reason);return o().catch(m)})},se=["CARGA","CT_UN","CT_TT","DATA","NOTA","VEÍCULO"],xe=["PALETE","Q_NF","Q_PALETE","EST_INI","SEÇÃO"],qe=["COD.","SEÇÃO","Q_NF","Q_PALETE","EST_INI"],_e={PALETE:14,"COD.":12,DESCRIÇÃO:48,EAN:16,EMBAL:12,Q_NF:10,Q_PALETE:12,EST_INI:10,SEÇÃO:10,ULT_ENT_CD:13,ULT_SAI_LJ:13},ke="FFF36A10",Ne="FFFFFFFF",Oe="FF6BBE6B",Re="FFFCE4D6",Pe="FFFFFFFF";function ie(e){return e==null?null:typeof e=="object"?e.richText?e.richText.map(o=>o.text).join(""):"result"in e?e.result:"text"in e?e.text:e:e}function J(e){return e==null||e===""?NaN:Number(e)}function Fe(e,{perms:o,emails:r}){const l=e.querySelector("#console");function a(i,v){l.style.display="block";const p=document.createElement("div");v&&(p.className=v),p.textContent=i,l.appendChild(p),l.scrollTop=l.scrollHeight}if(o.processar){const i=e.querySelector("#arquivo"),v=e.querySelector("#fname"),p=e.querySelector("#nomeSaida"),h=e.querySelector("#btnProcessar"),b=e.querySelector("#btnBaixar");let k=null,H=null,M="Report_processado.xlsx";i.addEventListener("change",q=>{const A=q.target.files[0];A&&(k=A,v.textContent=A.name,h.disabled=!1,p.value||(p.value=A.name.replace(/\.xlsx$/i,"")+"_processado"),b&&(b.style.display="none"))}),h.addEventListener("click",async()=>{l.innerHTML="",b&&(b.style.display="none"),h.disabled=!0;try{a("📊 Processando planilha...");const q=await Te(()=>import("./exceljs.min-_FHOiBEn.js").then(n=>n.e),[]),A=q.default??q,le=await k.arrayBuffer(),Y=new A.Workbook;await Y.xlsx.load(le);const B=Y.worksheets[0],ce=B.getRow(1);let x=[];ce.eachCell({includeEmpty:!0},(n,f)=>{x[f-1]=ie(n.value)}),x=x.map(n=>n==null?"":String(n));let y=[];for(let n=2;n<=B.rowCount;n++){const f=B.getRow(n),$={};let _=!0;x.forEach((G,N)=>{const U=ie(f.getCell(N+1).value);U!=null&&U!==""&&(_=!1),$[G]=U}),_||y.push($)}if(y.length>0&&x.length>0){const n=x[0],f=y[y.length-1][n];f!=null&&String(f).includes("Qt Itens")&&(y.pop(),a("✓ Linha de resumo removida do final","ok"))}a(`✓ Arquivo lido com sucesso: ${k.name}`,"ok"),a(`  Linhas originais: ${y.length}`),a(`  Colunas originais: ${x.length}`),a(`  Colunas: [${x.join(", ")}]`);const z=se.filter(n=>x.includes(n)),ee=se.filter(n=>!x.includes(n)),L=x.filter(n=>!z.includes(n));if(z.length>0&&a(`✓ Colunas removidas: [${z.join(", ")}]`,"ok"),ee.length>0&&a(`⚠️  Colunas não encontradas: [${ee.join(", ")}]`,"warn"),!L.includes("EST_INI")){a("❌ ERRO: Coluna 'EST_INI' não encontrada na planilha!","err"),a(`   Colunas disponíveis: [${L.join(", ")}]`,"err");return}const de=y.length;if(y=y.filter(n=>{const f=n.EST_INI;return typeof f=="number"?f===0:Number(f)===0&&f!==null&&f!==""&&f!==void 0}),a("✓ Linhas filtradas por EST_INI == 0","ok"),a(`  Linhas removidas (EST_INI != 0): ${de-y.length}`),a(`  Linhas restantes: ${y.length}`),y.length===0){a("⚠️  Aviso: Nenhuma linha restante após o filtro!","warn"),a("   Todas as linhas tinham EST_INI diferente de zero.","warn");return}L.includes("PALETE")&&(y.sort((n,f)=>{const $=J(n.PALETE),_=J(f.PALETE);return!isNaN($)&&!isNaN(_)?$-_:String(n.PALETE).localeCompare(String(f.PALETE))}),a("✓ Linhas ordenadas por PALETE (crescente)","ok")),xe.forEach(n=>{L.includes(n)&&y.forEach(f=>{const $=J(f[n]);f[n]=isNaN($)?0:Math.trunc($)})}),a("🎨 Aplicando formatação profissional..."),a("📄 Configurando página (paisagem, margens zero, 1 página)...");const Q=new A.Workbook,w=Q.addWorksheet("Dados");w.addRow(L),y.forEach(n=>w.addRow(L.map(f=>n[f]))),w.pageSetup={orientation:"landscape",fitToPage:!0,fitToWidth:1,fitToHeight:0,margins:{left:.3,right:.3,top:.75,bottom:.75,header:.3,footer:.3}};try{Q.definedNames.add("'Dados'!$1:$1","Print_Titles")}catch{}const ue={name:"Calibri",size:11,bold:!0,color:{argb:Ne}},me={type:"pattern",pattern:"solid",fgColor:{argb:ke}},pe={type:"pattern",pattern:"solid",fgColor:{argb:Re}},fe={type:"pattern",pattern:"solid",fgColor:{argb:Pe}},I={style:"thin",color:{argb:Oe}},ae={left:I,right:I,top:I,bottom:I},he={horizontal:"center",vertical:"center",wrapText:!0},ve={horizontal:"left",vertical:"center",wrapText:!1},be={horizontal:"center",vertical:"center",wrapText:!1},ye={name:"Calibri",size:10},te=w.getRow(1);te.eachCell(n=>{n.font=ue,n.fill=me,n.alignment=he,n.border=ae}),te.height=30;for(let n=2;n<=w.rowCount;n++){const f=w.getRow(n),$=n%2===0?pe:fe;L.forEach((_,G)=>{const N=f.getCell(G+1);N.font=ye,N.fill=$,N.border=ae,N.alignment=qe.includes(_)?be:ve})}L.forEach((n,f)=>{w.getColumn(f+1).width=_e[n]||15}),w.views=[{state:"frozen",ySplit:1,zoomScale:100}],w.autoFilter={from:{row:1,column:1},to:{row:w.rowCount,column:L.length}};let P=w.rowCount+2;const V=w.getCell(P,3);V.value="RESUMO",V.font={name:"Calibri",size:12,bold:!0,color:{argb:"FFF36A10"}},V.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FFE8F5E9"}},P+=1;const ge=L.includes("Q_NF")?y.reduce((n,f)=>n+(Number(f.Q_NF)||0),0):"N/A",Ee=L.includes("SEÇÃO")?new Set(y.map(n=>n.SEÇÃO)).size:"N/A";[["Total de Itens:",y.length],["Total de Volumes (Q_NF):",ge],["Seções Únicas:",Ee]].forEach(([n,f])=>{const $=w.getCell(P,3);$.value=n,$.font={name:"Calibri",size:10};const _=w.getCell(P,4);_.value=f,_.font={name:"Calibri",size:10,bold:!0},P+=1});const Se=await Q.xlsx.writeBuffer();H=new Blob([Se],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});let W=(p.value||"Report_processado").trim();W.toLowerCase().endsWith(".xlsx")||(W+=".xlsx"),M=W,a(""),a("  ✅ PLANILHA PROCESSADA COM SUCESSO!","ok"),a(`   📁 Arquivo de saída: ${M}`),a(`   📊 Linhas finais: ${y.length}`),a(`   📋 Colunas finais: ${L.length}`),a(`   📑 Colunas: [${L.join(", ")}]`),a("   🚀 Planilha pronta para visualizar, imprimir e distribuir!","ok"),b&&(b.style.display="block")}catch(q){a("❌ Erro ao processar a planilha: "+q.message,"err"),console.error(q)}finally{h.disabled=!1}}),b==null||b.addEventListener("click",()=>{if(!H)return;const q=URL.createObjectURL(H),A=document.createElement("a");A.href=q,A.download=M,document.body.appendChild(A),A.click(),document.body.removeChild(A),setTimeout(()=>URL.revokeObjectURL(q),5e3)})}if(!o.email)return;const m=e.querySelector("#listaDestinatarios"),s=e.querySelector("#buscaEmail"),u=e.querySelector("#resultadosEmail");let T=-1;function d(i=""){const v=document.createElement("div");v.className="dest-linha";const p=document.createElement("input");p.type="email",p.className="dest-input",p.placeholder="destinatario@email.com",p.autocomplete="email",p.autocapitalize="off",p.spellcheck=!1,p.value=i;const h=document.createElement("button");return h.type="button",h.className="btn-remover",h.textContent="✕",h.addEventListener("click",()=>v.remove()),v.append(p,h),v}function c(){return Array.from(e.querySelectorAll(".dest-input")).map(i=>i.value.trim().toLowerCase())}function E(i){if(!i||c().includes(i.toLowerCase()))return!1;const v=Array.from(e.querySelectorAll(".dest-input")).find(p=>!p.value.trim());return v?v.value=i:m.appendChild(d(i)),!0}function S(i){return(i||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}function t(){const i=S(s.value.trim()),v=c(),p=r.filter(h=>!v.includes(h.email.toLowerCase())&&(!i||S(h.email).includes(i)||S(h.nome).includes(i)));if(u.innerHTML="",T=-1,!p.length){const h=document.createElement("div");h.className="vazio",h.textContent=r.length?"Nenhum e-mail encontrado.":"Nenhum e-mail cadastrado. Peça ao administrador.",u.appendChild(h)}p.forEach(h=>{const b=document.createElement("button");if(b.type="button",b.className="item",b.textContent=h.email,h.nome){const k=document.createElement("small");k.textContent=h.nome,b.appendChild(k)}b.addEventListener("mousedown",k=>k.preventDefault()),b.addEventListener("click",()=>{E(h.email),s.value="",t(),s.focus()}),u.appendChild(b)}),u.hidden=!1}s.addEventListener("input",t),s.addEventListener("focus",t),s.addEventListener("blur",()=>{u.hidden=!0}),s.addEventListener("keydown",i=>{const v=u.querySelectorAll(".item");if(i.key==="ArrowDown"||i.key==="ArrowUp"){if(i.preventDefault(),!v.length)return;T=(T+(i.key==="ArrowDown"?1:-1)+v.length)%v.length,v.forEach((p,h)=>p.classList.toggle("ativo",h===T)),v[T].scrollIntoView({block:"nearest"})}else if(i.key==="Enter"){i.preventDefault();const p=v[T>=0?T:0];p&&p.click()}else i.key==="Escape"&&(u.hidden=!0)}),e.querySelector("#btnAddTodos").addEventListener("click",()=>{r.forEach(i=>E(i.email))}),e.querySelector("#btnAddDest").addEventListener("click",()=>{m.appendChild(d())}),e.querySelector("#btnEnviarEmail").addEventListener("click",()=>{const i=Array.from(e.querySelectorAll(".dest-input")).map(b=>b.value.trim()).filter(b=>b.length>0);if(i.length===0){a("❌ Adicione ao menos um destinatário antes de enviar.","err");return}const v=encodeURIComponent(i.join(",")),p=encodeURIComponent(e.querySelector("#assunto").value||"Produtos em Ruptura"),h=encodeURIComponent(e.querySelector("#corpoEmail").value||"");window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${v}&su=${p}&body=${h}`,"_blank"),a("📧 Gmail aberto com destinatários, assunto e corpo preenchidos. Anexe a planilha baixada manualmente.","ok")})}function re(e,{ir:o,me:r}){var m,s;const l=r.permissoes||{},a=!r.is_admin&&r.validade?` · acesso até ${X(r.validade)}`:"";e.innerHTML=`
    <div class="card">
      <div class="userbar">
        <span>👤 ${g(r.nome||r.username)}${g(a)}</span>
        <span class="acoes">
          ${r.is_admin?'<a href="/admin" id="ir-admin">Administração</a>':""}
          <a href="/senha" id="ir-senha">Alterar senha</a>
          <button type="button" id="sair">Sair</button>
        </span>
      </div>
      <div class="header">
        <p class="tag">CENTRO DE DISTRIBUIÇÃO</p>
        <h1>Processador de Planilha</h1>
      </div>
      <div class="body">
        ${l.processar?`
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
        ${l.baixar?'<button class="baixar" id="btnBaixar">⬇️ Baixar planilha processada</button>':""}
        `:""}
        ${!l.processar&&!l.email?'<div class="aviso-sem-perm">Seu usuário ainda não tem permissões nesta ferramenta. Fale com o administrador.</div>':""}
        <div class="console" id="console"></div>
        ${l.email?`
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
    </div>`,(m=e.querySelector("#ir-admin"))==null||m.addEventListener("click",u=>{u.preventDefault(),o("/admin")}),(s=e.querySelector("#ir-senha"))==null||s.addEventListener("click",u=>{u.preventDefault(),o("/senha")}),e.querySelector("#sair").addEventListener("click",async()=>{await C("/api/logout",{method:"POST"}),o("/login")}),Fe(e,{perms:l,emails:r.emails||[]})}function K(e,o,r){e.innerHTML=o?`<p class="msg ${r}">${g(o)}</p>`:""}function De(e){return e.ativo?e.expirado?`<span class="selo off">Expirado em ${g(X(e.validade))}</span>`:e.validade&&!e.is_admin?`<span class="selo warn">Até ${g(X(e.validade))}</span>`:`<span class="selo ok">Ativo${e.is_admin?"":" · sem prazo"}</span>`:'<span class="selo off">Desativado</span>'}async function Ie(e,{ir:o}){e.innerHTML=`
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
    </div>`;const r=e.querySelector("#msgs");e.querySelector("#ir-home").addEventListener("click",d=>{d.preventDefault(),o("/")}),e.querySelector("#sair").addEventListener("click",async()=>{await C("/api/logout",{method:"POST"}),o("/login")});let l;try{l=await C("/api/admin")}catch(d){K(r,d.message,"erro");return}a(l);function a(d){const c=Object.entries(d.permissoes).map(([t,i])=>`<label><input type="checkbox" name="perm_${t}" ${t!=="email"?"checked":""}> ${g(i)}</label>`).join(""),E=d.usuarios.map(t=>{const i=Object.entries(d.permissoes).map(([p,h])=>`<label><input type="checkbox" name="perm_${p}" ${t.permissoes[p]||t.is_admin?"checked":""} ${t.is_admin?"disabled":""}> ${g(h)}</label>`).join(""),v=t.ultimo_acesso?t.ultimo_acesso.replace("T"," "):"nunca";return`
        <details class="usuario">
          <summary>
            <span class="nome-u">${g(t.username)}</span>
            ${t.nome?`<span class="meta">${g(t.nome)}</span>`:""}
            ${t.is_admin?'<span class="selo adm">Administrador</span>':""}
            ${De(t)}
            <span class="meta">Último acesso: ${g(v)}</span>
          </summary>
          <div class="corpo-u">
            <form data-acao="editar" data-id="${t.id}">
              <div class="grade">
                <div><label>Nome</label><input type="text" name="nome" value="${g(t.nome)}" maxlength="80"></div>
                <div><label>Acesso válido até</label><input type="date" name="validade" value="${g(t.validade||"")}" ${t.is_admin?"disabled":""}></div>
              </div>
              <label>Permissões</label>
              <div class="checks">
                ${i}
                <label><input type="checkbox" name="is_admin" ${t.is_admin?"checked":""} ${t.id===d.eu_id?"disabled":""}> Administrador</label>
                <label><input type="checkbox" name="ativo" ${t.ativo?"checked":""} ${t.id===d.eu_id?"disabled":""}> Usuário ativo</label>
              </div>
              ${t.is_admin?'<p class="dica">Administradores têm todas as permissões e não expiram.</p>':""}
              <div class="acoes-u"><button class="btn peq" type="submit">Salvar alterações</button></div>
            </form>
            <div class="sub">
              <form data-acao="senha" data-id="${t.id}" autocomplete="off">
                <div><label>Redefinir senha</label><input type="password" name="senha" minlength="8" required placeholder="nova senha temporária" autocomplete="new-password"></div>
                <button class="btn peq sec" type="submit">Redefinir</button>
              </form>
            </div>
            ${t.id!==d.eu_id?`
            <div class="sub">
              <form data-acao="excluir" data-id="${t.id}">
                <button class="btn peq perigo" type="submit">Excluir usuário</button>
              </form>
            </div>`:""}
          </div>
        </details>`}).join(""),S=d.emails.map(t=>`
      <div class="email-item">
        <span><strong>${g(t.email)}</strong>${t.nome?` <span class="meta">· ${g(t.nome)}</span>`:""}</span>
        <button class="btn peq perigo" type="button" data-excluir-email="${t.id}" data-email="${g(t.email)}">Remover</button>
      </div>`).join("")||'<p class="dica">Nenhum e-mail cadastrado.</p>';e.querySelector("#conteudo").innerHTML=`
      <div class="painel">
        <h2>Novo usuário</h2>
        <form data-acao="novo" autocomplete="off">
          <div class="grade">
            <div><label>Usuário (login)</label><input type="text" name="username" required autocapitalize="off" spellcheck="false"></div>
            <div><label>Nome</label><input type="text" name="nome" maxlength="80"></div>
            <div><label>Senha inicial</label><input type="password" name="senha" required minlength="8" autocomplete="new-password"></div>
            <div><label>Acesso válido até</label><input type="date" name="validade" min="${g(d.hoje)}"><p class="dica">Vazio = sem prazo. O último dia vale por inteiro.</p></div>
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
        <div style="margin-top:14px;">${S}</div>
      </div>
      <div class="painel">
        <h2>Usuários (${d.usuarios.length})</h2>
        ${E}
      </div>`,e.querySelector("#conteudo").querySelectorAll("form").forEach(t=>{t.addEventListener("submit",i=>T(i,t))}),e.querySelectorAll("[data-excluir-email]").forEach(t=>{t.addEventListener("click",async()=>{confirm(`Remover ${t.dataset.email} do cadastro?`)&&await u(()=>C(`/api/admin/emails/${t.dataset.excluirEmail}`,{method:"DELETE"}))})})}function m(d){const c={};return d.querySelectorAll('input[name^="perm_"]').forEach(E=>{c[E.name.slice(5)]=E.checked}),c}function s(d,c){return d.querySelector(`[name="${c}"]`)}async function u(d){try{const c=await d();K(r,c.mensagem||"",c.ok===!1?"erro":"ok"),l=await C("/api/admin"),a(l)}catch(c){K(r,c.message,"erro")}}function T(d,c){d.preventDefault();const E=c.dataset.acao,S=c.dataset.id;if(E==="novo")return u(()=>C("/api/admin/usuarios",{method:"POST",body:{username:s(c,"username").value.trim(),nome:s(c,"nome").value,senha:s(c,"senha").value,validade:s(c,"validade").value,is_admin:s(c,"is_admin").checked,permissoes:m(c)}}));if(E==="editar"){const t=s(c,"is_admin"),i=s(c,"ativo");return u(()=>C(`/api/admin/usuarios/${S}`,{method:"PUT",body:{nome:s(c,"nome").value,validade:s(c,"validade").value,is_admin:t.checked,ativo:i.checked,permissoes:m(c)}}))}if(E==="senha")return u(()=>C(`/api/admin/usuarios/${S}/senha`,{method:"POST",body:{senha:s(c,"senha").value}}));if(E==="excluir"){const t=c.closest(".usuario").querySelector(".nome-u").textContent;return confirm(`Excluir o usuário ${t}? Esta ação não pode ser desfeita.`)?u(()=>C(`/api/admin/usuarios/${S}`,{method:"DELETE"})):void 0}}}const O=document.getElementById("app"),j="/ruptura/".replace(/\/$/,"");function Ue(){let e=location.pathname;return j&&e.startsWith(j)&&(e=e.slice(j.length)),!e||e==="/"?"/":e.startsWith("/")?e:`/${e}`}function F(e){return`${j}${e}`}function R(e){const o=F(e);location.pathname!==o&&history.pushState({},"",o),Z()}async function je(){try{return(await C("/api/me")).usuario}catch{return null}}async function Z(){const e=await je();let o=Ue();if(!e){o!=="/login"&&history.replaceState({},"",F("/login")),Ae(O,{ir:R});return}if(e.trocar_senha&&o!=="/senha"){history.replaceState({},"",F("/senha")),ne(O,{ir:R,obrigatoria:!0});return}if(!e.trocar_senha&&(o==="/login"||o==="/senha")&&(history.replaceState({},"",F("/")),o="/"),o==="/admin"){if(!e.is_admin){history.replaceState({},"",F("/")),re(O,{ir:R,me:e});return}Ie(O,{ir:R});return}if(o==="/senha"){ne(O,{ir:R,obrigatoria:!1});return}re(O,{ir:R,me:e})}window.addEventListener("popstate",()=>Z());Z();
