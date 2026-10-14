(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const l of o)if(l.type==="childList")for(const s of l.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(o){const l={};return o.integrity&&(l.integrity=o.integrity),o.referrerPolicy&&(l.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?l.credentials="include":o.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(o){if(o.ep)return;o.ep=!0;const l=n(o);fetch(o.href,l)}})();const ye="".replace(/\/$/,""),ae=!!ye;let U="",F=sessionStorage.getItem("sessao")||"";class te extends Error{constructor(a,n,r){super(a),this.status=n,this.codigo=r==null?void 0:r.codigo,this.data=r}}function Ee(e){return`${ye}${e}`}async function Se(e){const a=await e.text();if(!a)return{};try{return JSON.parse(a)}catch{throw new te("O servidor respondeu de forma inesperada. Recarregue a página.",e.status,{})}}async function Me(){if(ae)return"";const e=await fetch(Ee("/api/csrf"),{credentials:"same-origin"});return U=(await Se(e)).csrf||"",U}async function k(e,{method:a="GET",body:n,_retry:r=!1}={}){const o={Accept:"application/json"};n!==void 0&&(o["Content-Type"]="application/json"),F&&(o.Authorization=`Bearer ${F}`),!ae&&a!=="GET"&&a!=="HEAD"&&(o["X-CSRF-Token"]=U||await Me());let l;try{l=await fetch(Ee(e),{method:a,headers:o,credentials:ae?"omit":"same-origin",body:n!==void 0?JSON.stringify(n):void 0})}catch{throw new te("Não foi possível conectar ao servidor neste computador. Deixe o sistema local aberto e tente de novo.",0,{})}const s=await Se(l);if(s.csrf&&(U=s.csrf),e==="/api/logout"?(F="",sessionStorage.removeItem("sessao")):l.ok&&s.token&&(F=s.token,sessionStorage.setItem("sessao",F)),l.status===400&&!r&&String(s.erro||"").includes("Sessão inválida"))return U="",k(e,{method:a,body:n,_retry:!0});if(!l.ok)throw new te(s.erro||"Falha na requisição.",l.status,s);return s}function v(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ne(e){if(!e)return"";const[a,n,r]=e.split("-");return`${r}/${n}/${a}`}const we=!0,oe="ruptura.contas",se="ruptura.sessao",V="ruptura.senhaInicial",ze=["alexandre.gorges@giassi.com.br","lidio.silva@giassi.com.br","jolsimar.silva@giassi.com.br","centroloja.lj07@giassi.com.br","bazar.lj07@giassi.com.br","acougue.lj07@giassi.com.br"];function j(){try{const e=JSON.parse(localStorage.getItem(oe)||"");return!e||!Array.isArray(e.usuarios)?{usuarios:[]}:e}catch{return{usuarios:[]}}}function Ae(e){localStorage.setItem(oe,JSON.stringify(e))}function re(e){return[...e].map(a=>a.toString(16).padStart(2,"0")).join("")}function Ce(){const e="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789",a=crypto.getRandomValues(new Uint8Array(10));let n="";for(const r of a)n+=e[r%e.length];return`${n}a7`}async function z(e,a){const n=new TextEncoder,r=await crypto.subtle.importKey("raw",n.encode(e),"PBKDF2",!1,["deriveBits"]),o=await crypto.subtle.deriveBits({name:"PBKDF2",salt:n.encode(a),iterations:12e4,hash:"SHA-256"},r,256);return re(new Uint8Array(o))}function Le(e,a){if(e.length!==a.length)return!1;let n=0;for(let r=0;r<e.length;r+=1)n|=e.charCodeAt(r)^a.charCodeAt(r);return n===0}function Ve(e){return e.length<8?"A senha deve ter pelo menos 8 caracteres.":!/[A-Za-z]/.test(e)||!/\d/.test(e)?"A senha deve conter letras e números.":""}function $e(e){return{id:e.id,username:e.username,nome:e.nome,is_admin:e.is_admin,estatico:!0,trocar_senha:e.trocar_senha,validade:"",permissoes:e.permissoes,emails:ze.map(a=>({email:a,nome:""}))}}async function Te(e){const a=re(crypto.getRandomValues(new Uint8Array(16))),n={id:1,username:"admin",nome:"Administrador",salt:a,hash:await z(e,a),is_admin:!0,ativo:!0,trocar_senha:!0,permissoes:{processar:!0,baixar:!0,email:!0}};Ae({usuarios:[n]}),localStorage.setItem(V,e)}async function ie(){j().usuarios.length||await Te(Ce())}function We(){const e=j().usuarios.find(a=>a.username==="admin");return e!=null&&e.trocar_senha&&localStorage.getItem(V)||""}function ke(){const e=Number(sessionStorage.getItem(se)||0),a=j().usuarios.find(n=>n.id===e&&n.ativo);return a?$e(a):null}async function Qe(e,a){await ie();const n=j().usuarios.find(o=>o.username.toLowerCase()===e.toLowerCase()),r=n?await z(a,n.salt):"";if(!n||!Le(r,n.hash))throw new Error("Usuário ou senha incorretos.");if(!n.ativo)throw new Error("Este usuário está desativado. Fale com o administrador.");return sessionStorage.setItem(se,String(n.id)),$e(n)}function le(){sessionStorage.removeItem(se)}async function Ge({atual:e,nova:a,confirma:n}){const r=ke();if(!r)throw new Error("Faça login para continuar.");if(a!==n)throw new Error("A confirmação não confere com a nova senha.");if(a===e)throw new Error("A nova senha deve ser diferente da atual.");const o=Ve(a);if(o)throw new Error(o);const l=j(),s=l.usuarios.find(g=>g.id===r.id),c=await z(e,s.salt);if(!Le(c,s.hash))throw new Error("Senha atual incorreta.");return s.salt=re(crypto.getRandomValues(new Uint8Array(16))),s.hash=await z(a,s.salt),s.trocar_senha=!1,Ae(l),localStorage.removeItem(V),{mensagem:"Senha alterada com sucesso."}}async function Je(){le(),localStorage.removeItem(oe),localStorage.removeItem(V);const e=Ce();return await Te(e),e}function Ke(e,{ir:a}){e.innerHTML='<p class="dica">Carregando...</p>',n();async function n(){await ie();const r=We();e.innerHTML=`
    <div class="wrap">
      <div class="topo">
        <p class="tag">CENTRO DE DISTRIBUIÇÃO</p>
        <h1>Processador de Planilha</h1>
      </div>
      <div class="caixa">
        <div id="msgs"></div>
        ${r?`<p class="dica">Primeiro acesso neste navegador. Usuário <strong>admin</strong>, senha temporária <strong>${v(r)}</strong>.</p>`:""}
        <form autocomplete="on">
          <label for="username">Usuário</label>
          <input type="text" id="username" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" required autofocus>
          <label for="senha">Senha</label>
          <input type="password" id="senha" autocomplete="current-password" required>
          <button class="btn" type="submit">Entrar</button>
        </form>
        <a class="link-recuperar" href="/recuperar" id="recuperar">Esqueci minha senha</a>
        <p class="foot">© 2026 [Francisco Cunha/FCOSOFTWARE]. Todos os direitos reservados.</p>
      </div>
    </div>`;const o=e.querySelector("#msgs");e.querySelector("form").addEventListener("submit",async l=>{l.preventDefault(),o.innerHTML="";const s=l.target.querySelector("button");s.disabled=!0;try{we&&await Qe(e.querySelector("#username").value.trim(),e.querySelector("#senha").value),a("/")}catch(c){o.innerHTML=`<p class="msg erro">${v(c.message)}</p>`,s.disabled=!1}}),e.querySelector("#recuperar").addEventListener("click",l=>{l.preventDefault(),a("/recuperar")})}}function fe(e,{ir:a,obrigatoria:n}){var o,l;e.innerHTML=`
    <div class="wrap">
      <div class="topo"><h1>Alterar senha</h1></div>
      <div class="caixa">
        <div id="msgs"></div>
        ${n?'<p class="msg ok">Por segurança, defina uma nova senha para continuar.</p>':""}
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
        ${n?'<button class="btn sec" id="sair" type="button">Sair</button>':'<a class="btn sec" href="/" id="voltar">Voltar</a>'}
      </div>
    </div>`;const r=e.querySelector("#msgs");e.querySelector("form").addEventListener("submit",async s=>{s.preventDefault(),r.innerHTML="";try{const c={atual:e.querySelector("#atual").value,nova:e.querySelector("#nova").value,confirma:e.querySelector("#confirma").value},g=we?await Ge(c):await k("/api/senha",{method:"POST",body:c});r.innerHTML=`<p class="msg ok">${v(g.mensagem)}</p>`,a("/")}catch(c){r.innerHTML=`<p class="msg erro">${v(c.message)}</p>`}}),(o=e.querySelector("#sair"))==null||o.addEventListener("click",async()=>{le(),a("/login")}),(l=e.querySelector("#voltar"))==null||l.addEventListener("click",s=>{s.preventDefault(),a("/")})}const Xe="modulepreload",Ze=function(e){return"/rupturas/"+e},he={},Ye=function(a,n,r){let o=Promise.resolve();if(n&&n.length>0){let s=function(u){return Promise.all(u.map(d=>Promise.resolve(d).then(E=>({status:"fulfilled",value:E}),E=>({status:"rejected",reason:E}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),g=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));o=s(n.map(u=>{if(u=Ze(u),u in he)return;he[u]=!0;const d=u.endsWith(".css"),E=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${E}`))return;const S=document.createElement("link");if(S.rel=d?"stylesheet":Xe,d||(S.as="script"),S.crossOrigin="",S.href=u,g&&S.setAttribute("nonce",g),document.head.appendChild(S),d)return new Promise(($,t)=>{S.addEventListener("load",$),S.addEventListener("error",()=>t(new Error(`Unable to preload CSS for ${u}`)))})}))}function l(s){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=s,window.dispatchEvent(c),!c.defaultPrevented)throw s}return o.then(s=>{for(const c of s||[])c.status==="rejected"&&l(c.reason);return a().catch(l)})},ve=["CARGA","CT_UN","CT_TT","DATA","NOTA","VEÍCULO"],ea=["PALETE","Q_NF","Q_PALETE","EST_INI","SEÇÃO"],aa=["COD.","SEÇÃO","Q_NF","Q_PALETE","EST_INI"],ta={PALETE:14,"COD.":12,DESCRIÇÃO:48,EAN:16,EMBAL:12,Q_NF:10,Q_PALETE:12,EST_INI:10,SEÇÃO:10,ULT_ENT_CD:13,ULT_SAI_LJ:13},na="FFF36A10",oa="FFFFFFFF",sa="FF6BBE6B",ra="FFFCE4D6",ia="FFFFFFFF";function be(e){return e==null?null:typeof e=="object"?e.richText?e.richText.map(a=>a.text).join(""):"result"in e?e.result:"text"in e?e.text:e:e}function ee(e){return e==null||e===""?NaN:Number(e)}function la(e,{perms:a,emails:n}){const r=e.querySelector("#console");function o(t,m){r.style.display="block";const p=document.createElement("div");m&&(p.className=m),p.textContent=t,r.appendChild(p),r.scrollTop=r.scrollHeight}if(a.processar){const t=e.querySelector("#arquivo"),m=e.querySelector("#fname"),p=e.querySelector("#nomeSaida"),f=e.querySelector("#btnProcessar"),b=e.querySelector("#btnBaixar");let _=null,W=null,Q="Report_processado.xlsx";t.addEventListener("change",x=>{const A=x.target.files[0];A&&(_=A,m.textContent=A.name,f.disabled=!1,p.value||(p.value=A.name.replace(/\.xlsx$/i,"")+"_processado"),b&&(b.style.display="none"))}),f.addEventListener("click",async()=>{r.innerHTML="",b&&(b.style.display="none"),f.disabled=!0;try{o("📊 Processando planilha...");const x=await Ye(()=>import("./exceljs.min-_FHOiBEn.js").then(i=>i.e),[]),A=x.default??x,xe=await _.arrayBuffer(),de=new A.Workbook;await de.xlsx.load(xe);const G=de.worksheets[0],qe=G.getRow(1);let T=[];qe.eachCell({includeEmpty:!0},(i,h)=>{T[h-1]=be(i.value)}),T=T.map(i=>i==null?"":String(i));let y=[];for(let i=2;i<=G.rowCount;i++){const h=G.getRow(i),L={};let q=!0;T.forEach((Y,I)=>{const B=be(h.getCell(I+1).value);B!=null&&B!==""&&(q=!1),L[Y]=B}),q||y.push(L)}if(y.length>0&&T.length>0){const i=T[0],h=y[y.length-1][i];h!=null&&String(h).includes("Qt Itens")&&(y.pop(),o("✓ Linha de resumo removida do final","ok"))}o(`✓ Arquivo lido com sucesso: ${_.name}`,"ok"),o(`  Linhas originais: ${y.length}`),o(`  Colunas originais: ${T.length}`),o(`  Colunas: [${T.join(", ")}]`);const J=ve.filter(i=>T.includes(i)),ue=ve.filter(i=>!T.includes(i)),C=T.filter(i=>!J.includes(i));if(J.length>0&&o(`✓ Colunas removidas: [${J.join(", ")}]`,"ok"),ue.length>0&&o(`⚠️  Colunas não encontradas: [${ue.join(", ")}]`,"warn"),!C.includes("EST_INI")){o("❌ ERRO: Coluna 'EST_INI' não encontrada na planilha!","err"),o(`   Colunas disponíveis: [${C.join(", ")}]`,"err");return}const _e=y.length;if(y=y.filter(i=>{const h=i.EST_INI;return typeof h=="number"?h===0:Number(h)===0&&h!==null&&h!==""&&h!==void 0}),o("✓ Linhas filtradas por EST_INI == 0","ok"),o(`  Linhas removidas (EST_INI != 0): ${_e-y.length}`),o(`  Linhas restantes: ${y.length}`),y.length===0){o("⚠️  Aviso: Nenhuma linha restante após o filtro!","warn"),o("   Todas as linhas tinham EST_INI diferente de zero.","warn");return}C.includes("PALETE")&&(y.sort((i,h)=>{const L=ee(i.PALETE),q=ee(h.PALETE);return!isNaN(L)&&!isNaN(q)?L-q:String(i.PALETE).localeCompare(String(h.PALETE))}),o("✓ Linhas ordenadas por PALETE (crescente)","ok")),ea.forEach(i=>{C.includes(i)&&y.forEach(h=>{const L=ee(h[i]);h[i]=isNaN(L)?0:Math.trunc(L)})}),o("🎨 Aplicando formatação profissional..."),o("📄 Configurando página (paisagem, margens zero, 1 página)...");const K=new A.Workbook,w=K.addWorksheet("Dados");w.addRow(C),y.forEach(i=>w.addRow(C.map(h=>i[h]))),w.pageSetup={orientation:"landscape",fitToPage:!0,fitToWidth:1,fitToHeight:0,margins:{left:.3,right:.3,top:.75,bottom:.75,header:.3,footer:.3}};try{K.definedNames.add("'Dados'!$1:$1","Print_Titles")}catch{}const Ne={name:"Calibri",size:11,bold:!0,color:{argb:oa}},Re={type:"pattern",pattern:"solid",fgColor:{argb:na}},Ie={type:"pattern",pattern:"solid",fgColor:{argb:ra}},Oe={type:"pattern",pattern:"solid",fgColor:{argb:ia}},H={style:"thin",color:{argb:sa}},me={left:H,right:H,top:H,bottom:H},Pe={horizontal:"center",vertical:"center",wrapText:!0},Fe={horizontal:"left",vertical:"center",wrapText:!1},De={horizontal:"center",vertical:"center",wrapText:!1},Ue={name:"Calibri",size:10},pe=w.getRow(1);pe.eachCell(i=>{i.font=Ne,i.fill=Re,i.alignment=Pe,i.border=me}),pe.height=30;for(let i=2;i<=w.rowCount;i++){const h=w.getRow(i),L=i%2===0?Ie:Oe;C.forEach((q,Y)=>{const I=h.getCell(Y+1);I.font=Ue,I.fill=L,I.border=me,I.alignment=aa.includes(q)?De:Fe})}C.forEach((i,h)=>{w.getColumn(h+1).width=ta[i]||15}),w.views=[{state:"frozen",ySplit:1,zoomScale:100}],w.autoFilter={from:{row:1,column:1},to:{row:w.rowCount,column:C.length}};let P=w.rowCount+2;const X=w.getCell(P,3);X.value="RESUMO",X.font={name:"Calibri",size:12,bold:!0,color:{argb:"FFF36A10"}},X.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FFE8F5E9"}},P+=1;const je=C.includes("Q_NF")?y.reduce((i,h)=>i+(Number(h.Q_NF)||0),0):"N/A",He=C.includes("SEÇÃO")?new Set(y.map(i=>i.SEÇÃO)).size:"N/A";[["Total de Itens:",y.length],["Total de Volumes (Q_NF):",je],["Seções Únicas:",He]].forEach(([i,h])=>{const L=w.getCell(P,3);L.value=i,L.font={name:"Calibri",size:10};const q=w.getCell(P,4);q.value=h,q.font={name:"Calibri",size:10,bold:!0},P+=1});const Be=await K.xlsx.writeBuffer();W=new Blob([Be],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});let Z=(p.value||"Report_processado").trim();Z.toLowerCase().endsWith(".xlsx")||(Z+=".xlsx"),Q=Z,o(""),o("  ✅ PLANILHA PROCESSADA COM SUCESSO!","ok"),o(`   📁 Arquivo de saída: ${Q}`),o(`   📊 Linhas finais: ${y.length}`),o(`   📋 Colunas finais: ${C.length}`),o(`   📑 Colunas: [${C.join(", ")}]`),o("   🚀 Planilha pronta para visualizar, imprimir e distribuir!","ok"),b&&(b.style.display="block")}catch(x){o("❌ Erro ao processar a planilha: "+x.message,"err"),console.error(x)}finally{f.disabled=!1}}),b==null||b.addEventListener("click",()=>{if(!W)return;const x=URL.createObjectURL(W),A=document.createElement("a");A.href=x,A.download=Q,document.body.appendChild(A),A.click(),document.body.removeChild(A),setTimeout(()=>URL.revokeObjectURL(x),5e3)})}if(!a.email)return;const l=e.querySelector("#listaDestinatarios"),s=e.querySelector("#buscaEmail"),c=e.querySelector("#resultadosEmail");let g=-1;function u(t=""){const m=document.createElement("div");m.className="dest-linha";const p=document.createElement("input");p.type="email",p.className="dest-input",p.placeholder="destinatario@email.com",p.autocomplete="email",p.autocapitalize="off",p.spellcheck=!1,p.value=t;const f=document.createElement("button");return f.type="button",f.className="btn-remover",f.textContent="✕",f.addEventListener("click",()=>m.remove()),m.append(p,f),m}function d(){return Array.from(e.querySelectorAll(".dest-input")).map(t=>t.value.trim().toLowerCase())}function E(t){if(!t||d().includes(t.toLowerCase()))return!1;const m=Array.from(e.querySelectorAll(".dest-input")).find(p=>!p.value.trim());return m?m.value=t:l.appendChild(u(t)),!0}function S(t){return(t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}function $(){const t=S(s.value.trim()),m=d(),p=n.filter(f=>!m.includes(f.email.toLowerCase())&&(!t||S(f.email).includes(t)||S(f.nome).includes(t)));if(c.innerHTML="",g=-1,!p.length){const f=document.createElement("div");f.className="vazio",f.textContent=n.length?"Nenhum e-mail encontrado.":"Nenhum e-mail cadastrado. Peça ao administrador.",c.appendChild(f)}p.forEach(f=>{const b=document.createElement("button");if(b.type="button",b.className="item",b.textContent=f.email,f.nome){const _=document.createElement("small");_.textContent=f.nome,b.appendChild(_)}b.addEventListener("mousedown",_=>_.preventDefault()),b.addEventListener("click",()=>{E(f.email),s.value="",$(),s.focus()}),c.appendChild(b)}),c.hidden=!1}s.addEventListener("input",$),s.addEventListener("focus",$),s.addEventListener("blur",()=>{c.hidden=!0}),s.addEventListener("keydown",t=>{const m=c.querySelectorAll(".item");if(t.key==="ArrowDown"||t.key==="ArrowUp"){if(t.preventDefault(),!m.length)return;g=(g+(t.key==="ArrowDown"?1:-1)+m.length)%m.length,m.forEach((p,f)=>p.classList.toggle("ativo",f===g)),m[g].scrollIntoView({block:"nearest"})}else if(t.key==="Enter"){t.preventDefault();const p=m[g>=0?g:0];p&&p.click()}else t.key==="Escape"&&(c.hidden=!0)}),e.querySelector("#btnAddTodos").addEventListener("click",()=>{n.forEach(t=>E(t.email))}),e.querySelector("#btnAddDest").addEventListener("click",()=>{l.appendChild(u())}),e.querySelector("#btnEnviarEmail").addEventListener("click",()=>{const t=Array.from(e.querySelectorAll(".dest-input")).map(b=>b.value.trim()).filter(b=>b.length>0);if(t.length===0){o("❌ Adicione ao menos um destinatário antes de enviar.","err");return}const m=encodeURIComponent(t.join(",")),p=encodeURIComponent(e.querySelector("#assunto").value||"Produtos em Ruptura"),f=encodeURIComponent(e.querySelector("#corpoEmail").value||"");window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${m}&su=${p}&body=${f}`,"_blank"),o("📧 Gmail aberto com destinatários, assunto e corpo preenchidos. Anexe a planilha baixada manualmente.","ok")})}function ge(e,{ir:a,me:n}){var l,s,c;const r=n.permissoes||{},o=!n.is_admin&&n.validade?` · acesso até ${ne(n.validade)}`:"";e.innerHTML=`
    <div class="card">
      <div class="userbar">
        <span>👤 ${v(n.nome||n.username)}${v(o)}</span>
        <span class="acoes">
          ${!n.estatico&&n.is_admin?'<a href="/admin" id="ir-admin">Administração</a>':""}
          <a href="/senha" id="ir-senha">Alterar senha</a>
          <button type="button" id="sair">Sair</button>
        </span>
      </div>
      <div class="header">
        <p class="tag">CENTRO DE DISTRIBUIÇÃO</p>
        <h1>Processador de Planilha</h1>
      </div>
      <div class="body">
        ${r.processar?`
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
        ${r.baixar?'<button class="baixar" id="btnBaixar">⬇️ Baixar planilha processada</button>':""}
        `:""}
        ${!r.processar&&!r.email?'<div class="aviso-sem-perm">Seu usuário ainda não tem permissões nesta ferramenta. Fale com o administrador.</div>':""}
        <div class="console" id="console"></div>
        ${r.email?`
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
    </div>`,(l=e.querySelector("#ir-admin"))==null||l.addEventListener("click",g=>{g.preventDefault(),a("/admin")}),(s=e.querySelector("#ir-senha"))==null||s.addEventListener("click",g=>{g.preventDefault(),a("/senha")}),(c=e.querySelector("#sair"))==null||c.addEventListener("click",async()=>{n.estatico?le():await k("/api/logout",{method:"POST"}),a("/login")}),la(e,{perms:r,emails:n.emails||[]})}function D(e,a,n){e.innerHTML=a?`<p class="msg ${n}">${v(a)}</p>`:""}function ca(e){return e.ativo?e.expirado?`<span class="selo off">Expirado em ${v(ne(e.validade))}</span>`:e.validade&&!e.is_admin?`<span class="selo warn">Até ${v(ne(e.validade))}</span>`:`<span class="selo ok">Ativo${e.is_admin?"":" · sem prazo"}</span>`:'<span class="selo off">Desativado</span>'}async function da(e,{ir:a}){e.innerHTML=`
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
    </div>`;const n=e.querySelector("#msgs");e.querySelector("#ir-home").addEventListener("click",u=>{u.preventDefault(),a("/")}),e.querySelector("#sair").addEventListener("click",async()=>{await k("/api/logout",{method:"POST"}),a("/login")});let r;try{r=await k("/api/admin")}catch(u){D(n,u.message,"erro");return}o(r);function o(u){const d=Object.entries(u.permissoes).map(([t,m])=>`<label><input type="checkbox" name="perm_${t}" ${t!=="email"?"checked":""}> ${v(m)}</label>`).join(""),E=u.usuarios.map(t=>{const m=Object.entries(u.permissoes).map(([f,b])=>`<label><input type="checkbox" name="perm_${f}" ${t.permissoes[f]||t.is_admin?"checked":""} ${t.is_admin?"disabled":""}> ${v(b)}</label>`).join(""),p=t.ultimo_acesso?t.ultimo_acesso.replace("T"," "):"nunca";return`
        <details class="usuario">
          <summary>
            <span class="nome-u">${v(t.username)}</span>
            ${t.nome?`<span class="meta">${v(t.nome)}</span>`:""}
            ${t.email?`<span class="meta">${v(t.email)}</span>`:'<span class="meta">sem e-mail</span>'}
            ${t.is_admin?'<span class="selo adm">Administrador</span>':""}
            ${ca(t)}
            <span class="meta">Último acesso: ${v(p)}</span>
          </summary>
          <div class="corpo-u">
            <form data-acao="editar" data-id="${t.id}">
              <div class="grade">
                <div><label>Nome</label><input type="text" name="nome" value="${v(t.nome)}" maxlength="80"></div>
                <div><label>E-mail de recuperação</label><input type="email" name="email" value="${v(t.email||"")}" maxlength="120" required autocapitalize="off" spellcheck="false"></div>
                <div><label>Acesso válido até</label><input type="date" name="validade" value="${v(t.validade||"")}" ${t.is_admin?"disabled":""}></div>
              </div>
              <label>Permissões</label>
              <div class="checks">
                ${m}
                <label><input type="checkbox" name="is_admin" ${t.is_admin?"checked":""} ${t.id===u.eu_id?"disabled":""}> Administrador</label>
                <label><input type="checkbox" name="ativo" ${t.ativo?"checked":""} ${t.id===u.eu_id?"disabled":""}> Usuário ativo</label>
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
            ${t.id!==u.eu_id?`
            <div class="sub">
              <form data-acao="excluir" data-id="${t.id}">
                <button class="btn peq perigo" type="submit">Excluir usuário</button>
              </form>
            </div>`:""}
          </div>
        </details>`}).join(""),S=u.emails.map(t=>`
      <div class="email-item">
        <span><strong>${v(t.email)}</strong>${t.nome?` <span class="meta">· ${v(t.nome)}</span>`:""}</span>
        <button class="btn peq perigo" type="button" data-excluir-email="${t.id}" data-email="${v(t.email)}">Remover</button>
      </div>`).join("")||'<p class="dica">Nenhum e-mail cadastrado.</p>',$=(u.recuperacoes||[]).map(t=>`
      <div class="recuperacao">
        <span><strong>${v(t.username)}</strong>${t.nome?` <span class="meta">${v(t.nome)}</span>`:""}
          <span class="meta"> · até ${v((t.expira_em||"").replace("T"," "))}</span>
        </span>
        <span class="acoes">
          <button class="btn peq sec" type="button" data-copiar-token="${v(t.token)}">Copiar link</button>
        </span>
      </div>`).join("")||'<p class="dica">Nenhum pedido em aberto.</p>';e.querySelector("#conteudo").innerHTML=`
      <div class="painel">
        <h2>Recuperação de senha (${(u.recuperacoes||[]).length})</h2>
        <p class="dica">O link é enviado por e-mail. Se a pessoa não receber, copie aqui. Ele vale por 2 horas e só pode ser usado uma vez.</p>
        <div style="margin-top:8px;">${$}</div>
      </div>
      <div class="painel">
        <h2>Novo usuário</h2>
        <form data-acao="novo" autocomplete="off">
          <div class="grade">
            <div><label>Usuário (login)</label><input type="text" name="username" required autocapitalize="off" spellcheck="false"></div>
            <div><label>Nome</label><input type="text" name="nome" maxlength="80"></div>
            <div><label>E-mail de recuperação</label><input type="email" name="email" required maxlength="120" placeholder="nome@empresa.com" autocapitalize="off" spellcheck="false"></div>
            <div><label>Senha inicial</label><input type="password" name="senha" required minlength="8" autocomplete="new-password"></div>
            <div><label>Acesso válido até</label><input type="date" name="validade" min="${v(u.hoje)}"><p class="dica">Vazio = sem prazo. O último dia vale por inteiro.</p></div>
          </div>
          <label>Permissões</label>
          <div class="checks">
            ${d}
            <label><input type="checkbox" name="is_admin"> Administrador (acesso total, sem prazo)</label>
          </div>
          <button class="btn" type="submit" style="width:auto;padding:11px 22px;">Criar usuário</button>
          <p class="dica">No primeiro acesso, o usuário será obrigado a trocar a senha.</p>
        </form>
      </div>
      <div class="painel" id="emails">
        <h2>E-mails cadastrados (${u.emails.length})</h2>
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
        <h2>Usuários (${u.usuarios.length})</h2>
        ${E}
      </div>`,e.querySelector("#conteudo").querySelectorAll("form").forEach(t=>{t.addEventListener("submit",m=>g(m,t))}),e.querySelectorAll("[data-copiar-token]").forEach(t=>{t.addEventListener("click",async()=>{const m=`${location.origin}/recuperar/${t.dataset.copiarToken}`;try{await navigator.clipboard.writeText(m),D(n,"Link copiado.","ok")}catch{D(n,m,"ok")}})}),e.querySelectorAll("[data-excluir-email]").forEach(t=>{t.addEventListener("click",async()=>{confirm(`Remover ${t.dataset.email} do cadastro?`)&&await c(()=>k(`/api/admin/emails/${t.dataset.excluirEmail}`,{method:"DELETE"}))})})}function l(u){const d={};return u.querySelectorAll('input[name^="perm_"]').forEach(E=>{d[E.name.slice(5)]=E.checked}),d}function s(u,d){return u.querySelector(`[name="${d}"]`)}async function c(u){try{const d=await u();D(n,d.mensagem||"",d.ok===!1?"erro":"ok"),r=await k("/api/admin"),o(r)}catch(d){D(n,d.message,"erro")}}function g(u,d){u.preventDefault();const E=d.dataset.acao,S=d.dataset.id;if(E==="novo")return c(()=>k("/api/admin/usuarios",{method:"POST",body:{username:s(d,"username").value.trim(),nome:s(d,"nome").value,email:s(d,"email").value.trim(),senha:s(d,"senha").value,validade:s(d,"validade").value,is_admin:s(d,"is_admin").checked,permissoes:l(d)}}));if(E==="editar"){const $=s(d,"is_admin"),t=s(d,"ativo");return c(()=>k(`/api/admin/usuarios/${S}`,{method:"PUT",body:{nome:s(d,"nome").value,email:s(d,"email").value.trim(),validade:s(d,"validade").value,is_admin:$.checked,ativo:t.checked,permissoes:l(d)}}))}if(E==="senha")return c(()=>k(`/api/admin/usuarios/${S}/senha`,{method:"POST",body:{senha:s(d,"senha").value}}));if(E==="excluir"){const $=d.closest(".usuario").querySelector(".nome-u").textContent;return confirm(`Excluir o usuário ${$}? Esta ação não pode ser desfeita.`)?c(()=>k(`/api/admin/usuarios/${S}`,{method:"DELETE"})):void 0}}}function ua(e,{ir:a,path:n}){const r="/recuperar/";n.startsWith(r)&&decodeURIComponent(n.slice(r.length)),ma(e,{ir:a})}function ma(e,{ir:a}){e.innerHTML=`
    <div class="wrap">
      <div class="topo"><h1>Recuperar senha</h1></div>
      <div class="caixa">
        <div id="msgs"></div>
        <p class="dica">Neste site a conta fica salva neste navegador. Recriar o acesso gera uma nova senha temporária do usuário admin e apaga a senha anterior deste navegador.</p>
        <button class="btn" id="recriar" type="button">Recriar acesso do admin</button>
        <a class="btn sec" href="/login" id="voltar">Voltar ao login</a>
      </div>
    </div>`,e.querySelector("#voltar").addEventListener("click",n=>{n.preventDefault(),a("/login")}),e.querySelector("#recriar").addEventListener("click",async()=>{const n=await Je();e.querySelector("#msgs").innerHTML=`<p class="msg ok">Nova senha temporária do admin: <strong>${v(n)}</strong></p>`})}const N=document.getElementById("app"),M="/rupturas/".replace(/\/$/,"");function pa(){let e=location.pathname;return M&&e.startsWith(M)&&(e=e.slice(M.length)),!e||e==="/"?"/":e.startsWith("/")?e:`/${e}`}function O(e){return`${M}${e}`}function R(e){const a=O(e);location.pathname!==a&&history.pushState({},"",a),ce()}async function ce(){const e=(await ie(),ke());let a=pa();if(a==="/admin"&&(history.replaceState({},"",O("/")),a="/"),a==="/recuperar"||a.startsWith("/recuperar/")){ua(N,{ir:R,path:a});return}if(!e){a!=="/login"&&history.replaceState({},"",O("/login")),Ke(N,{ir:R});return}if(e.trocar_senha&&a!=="/senha"){history.replaceState({},"",O("/senha")),fe(N,{ir:R,obrigatoria:!0});return}if(!e.trocar_senha&&(a==="/login"||a==="/senha")&&(history.replaceState({},"",O("/")),a="/"),a==="/admin"){if(!e.is_admin){history.replaceState({},"",O("/")),ge(N,{ir:R,me:e});return}da(N,{ir:R});return}if(a==="/senha"){fe(N,{ir:R,obrigatoria:!1});return}ge(N,{ir:R,me:e})}window.addEventListener("popstate",()=>ce());ce();
