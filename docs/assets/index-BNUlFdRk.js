(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function t(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(r){if(r.ep)return;r.ep=!0;const n=t(r);fetch(r.href,n)}})();const _e="".replace(/\/$/,""),oe=!!_e;let j="",P=sessionStorage.getItem("sessao")||"";class ie extends Error{constructor(a,t,o){super(a),this.status=t,this.codigo=o==null?void 0:o.codigo,this.data=o}}function xe(e){return`${_e}${e}`}async function $e(e){const a=await e.text();if(!a)return{};try{return JSON.parse(a)}catch{throw new ie("O servidor respondeu de forma inesperada. Recarregue a página.",e.status,{})}}async function Ke(){if(oe)return"";const e=await fetch(xe("/api/csrf"),{credentials:"same-origin"});return j=(await $e(e)).csrf||"",j}async function le(e,{method:a="GET",body:t,_retry:o=!1}={}){const r={Accept:"application/json"};t!==void 0&&(r["Content-Type"]="application/json"),P&&(r.Authorization=`Bearer ${P}`),!oe&&a!=="GET"&&a!=="HEAD"&&(r["X-CSRF-Token"]=j||await Ke());let n;try{n=await fetch(xe(e),{method:a,headers:r,credentials:oe?"omit":"same-origin",body:t!==void 0?JSON.stringify(t):void 0})}catch{throw new ie("Não foi possível conectar ao servidor neste computador. Deixe o sistema local aberto e tente de novo.",0,{})}const i=await $e(n);if(i.csrf&&(j=i.csrf),e==="/api/logout"?(P="",sessionStorage.removeItem("sessao")):n.ok&&i.token&&(P=i.token,sessionStorage.setItem("sessao",P)),n.status===400&&!o&&String(i.erro||"").includes("Sessão inválida"))return j="",le(e,{method:a,body:t,_retry:!0});if(!n.ok)throw new ie(i.erro||"Falha na requisição.",n.status,i);return i}function S(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function se(e){if(!e)return"";const[a,t,o]=e.split("-");return`${o}/${t}/${a}`}const Te=!0,ce="ruptura.contas",W="ruptura.sessao",Q="ruptura.senhaInicial",Ze=["alexandre.gorges@giassi.com.br","lidio.silva@giassi.com.br","jolsimar.silva@giassi.com.br","centroloja.lj07@giassi.com.br","bazar.lj07@giassi.com.br","acougue.lj07@giassi.com.br"];function $(){try{const e=JSON.parse(localStorage.getItem(ce)||"");return!e||!Array.isArray(e.usuarios)?{usuarios:[]}:e}catch{return{usuarios:[]}}}function I(e){localStorage.setItem(ce,JSON.stringify(e))}function H(e){return[...e].map(a=>a.toString(16).padStart(2,"0")).join("")}function ke(){const e="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789",a=crypto.getRandomValues(new Uint8Array(10));let t="";for(const o of a)t+=e[o%e.length];return`${t}a7`}async function F(e,a){const t=new TextEncoder,o=await crypto.subtle.importKey("raw",t.encode(e),"PBKDF2",!1,["deriveBits"]),r=await crypto.subtle.deriveBits({name:"PBKDF2",salt:t.encode(a),iterations:12e4,hash:"SHA-256"},o,256);return H(new Uint8Array(r))}function Ne(e,a){if(e.length!==a.length)return!1;let t=0;for(let o=0;o<e.length;o+=1)t|=e.charCodeAt(o)^a.charCodeAt(o);return t===0}function de(e){return e.length<8?"A senha deve ter pelo menos 8 caracteres.":!/[A-Za-z]/.test(e)||!/\d/.test(e)?"A senha deve conter letras e números.":""}const Xe={processar:"Processar planilha",baixar:"Baixar planilha processada",email:"Enviar por e-mail"};function qe(){const e=new Date,a=String(e.getMonth()+1).padStart(2,"0"),t=String(e.getDate()).padStart(2,"0");return`${e.getFullYear()}-${a}-${t}`}function ue(e){return e.is_admin||!e.validade?!1:qe()>e.validade}function Ye(e){if(e.is_admin)return{processar:!0,baixar:!0,email:!0};const a=e.permissoes||{};return{processar:!!a.processar,baixar:!!a.baixar,email:!!a.email}}function me(e){return{id:e.id,username:e.username,nome:e.nome,email:e.email||"",is_admin:!!e.is_admin,ativo:e.ativo!==!1,estatico:!0,trocar_senha:!!e.trocar_senha,validade:e.is_admin?"":e.validade||"",expirado:ue(e),ultimo_acesso:e.ultimo_acesso||"",permissoes:Ye(e),emails:Ze.map(a=>({email:a,nome:""}))}}function ea(e){return/^[A-Za-z0-9._-]{3,32}$/.test(e)?"":"Usuário: 3 a 32 caracteres (letras, números, ponto, hífen ou sublinhado)."}function Re(e){return e&&(!/^\d{4}-\d{2}-\d{2}$/.test(e)||Number.isNaN(new Date(`${e}T00:00:00`).getTime()))?"Data de validade inválida.":""}function M(){const e=pe();if(!(e!=null&&e.is_admin))throw new Error("Acesso restrito ao administrador.");return e}function Ie(e,a){return e.filter(t=>t.is_admin&&t.ativo!==!1&&t.id!==a).length}async function Oe(e){const a=H(crypto.getRandomValues(new Uint8Array(16))),t={id:1,username:"admin",nome:"Administrador",salt:a,hash:await F(e,a),is_admin:!0,ativo:!0,trocar_senha:!0,permissoes:{processar:!0,baixar:!0,email:!0}};I({usuarios:[t]}),localStorage.setItem(Q,e)}async function fe(){$().usuarios.length||await Oe(ke())}function aa(){const e=$().usuarios.find(a=>a.username==="admin");return e!=null&&e.trocar_senha&&localStorage.getItem(Q)||""}function pe(){const e=Number(sessionStorage.getItem(W)||0),a=$().usuarios.find(t=>t.id===e&&t.ativo!==!1);return!a||ue(a)?(a&&sessionStorage.removeItem(W),null):me(a)}async function ta(e,a){await fe();const t=$().usuarios.find(i=>i.username.toLowerCase()===e.toLowerCase()),o=t?await F(a,t.salt):"";if(!t||!Ne(o,t.hash))throw new Error("Usuário ou senha incorretos.");if(!t.ativo)throw new Error("Este usuário está desativado. Fale com o administrador.");if(ue(t))throw new Error("Seu acesso expirou. Fale com o administrador.");const r=$(),n=r.usuarios.find(i=>i.id===t.id);return n.ultimo_acesso=new Date().toISOString().slice(0,19),I(r),sessionStorage.setItem(W,String(t.id)),me(n)}function G(){sessionStorage.removeItem(W)}async function ra({atual:e,nova:a,confirma:t}){const o=pe();if(!o)throw new Error("Faça login para continuar.");if(a!==t)throw new Error("A confirmação não confere com a nova senha.");if(a===e)throw new Error("A nova senha deve ser diferente da atual.");const r=de(a);if(r)throw new Error(r);const n=$(),i=n.usuarios.find(m=>m.id===o.id),c=await F(e,i.salt);if(!Ne(c,i.hash))throw new Error("Senha atual incorreta.");return i.salt=H(crypto.getRandomValues(new Uint8Array(16))),i.hash=await F(a,i.salt),i.trocar_senha=!1,I(n),localStorage.removeItem(Q),{mensagem:"Senha alterada com sucesso."}}async function na(){G(),localStorage.removeItem(ce),localStorage.removeItem(Q);const e=ke();return await Oe(e),e}function Ee(){return{eu_id:M().id,hoje:qe(),permissoes:Xe,usuarios:$().usuarios.map(me)}}async function oa({username:e,nome:a,senha:t,validade:o,is_admin:r,permissoes:n}){M();const i=String(e||"").trim(),c=ea(i)||de(String(t||""))||Re(o||"");if(c)throw new Error(c);const m=$();if(m.usuarios.some(s=>s.username.toLowerCase()===i.toLowerCase()))throw new Error("Já existe um usuário com esse nome.");const u=!!r,d=H(crypto.getRandomValues(new Uint8Array(16))),g=m.usuarios.reduce((s,w)=>Math.max(s,w.id),0)+1;return m.usuarios.push({id:g,username:i,nome:String(a||"").trim().slice(0,80),email:"",salt:d,hash:await F(t,d),is_admin:u,ativo:!0,trocar_senha:!0,validade:u?"":o||"",permissoes:u?{processar:!0,baixar:!0,email:!0}:{processar:!!(n!=null&&n.processar),baixar:!!(n!=null&&n.baixar),email:!!(n!=null&&n.email)},ultimo_acesso:""}),I(m),{ok:!0,mensagem:`Usuário '${i}' criado. Ele deverá trocar a senha no primeiro acesso.`}}function ia(e,{nome:a,validade:t,is_admin:o,ativo:r,permissoes:n}){const i=M(),c=$(),m=c.usuarios.find(s=>s.id===Number(e));if(!m)throw new Error("Usuário não encontrado.");const u=Re(t||"");if(u)throw new Error(u);const d=m.id===i.id?!0:!!o,g=m.id===i.id?!0:!!r;if(m.is_admin&&(!d||!g)&&Ie(c.usuarios,m.id)===0)throw new Error("É preciso manter pelo menos um administrador ativo.");return m.nome=String(a||"").trim().slice(0,80),m.is_admin=d,m.ativo=g,m.validade=d?"":t||"",m.permissoes=d?{processar:!0,baixar:!0,email:!0}:{processar:!!(n!=null&&n.processar),baixar:!!(n!=null&&n.baixar),email:!!(n!=null&&n.email)},I(c),{ok:!0,mensagem:`Usuário '${m.username}' atualizado.`}}async function sa(e,a){const t=M(),o=de(String(a||""));if(o)throw new Error(o);const r=$(),n=r.usuarios.find(i=>i.id===Number(e));if(!n)throw new Error("Usuário não encontrado.");return n.salt=H(crypto.getRandomValues(new Uint8Array(16))),n.hash=await F(a,n.salt),n.trocar_senha=n.id!==t.id,I(r),{ok:!0,mensagem:`Senha de '${n.username}' redefinida.`}}function la(e){const a=M(),t=$(),o=t.usuarios.find(r=>r.id===Number(e));if(!o)throw new Error("Usuário não encontrado.");if(o.id===a.id)throw new Error("Você não pode excluir o próprio usuário.");if(o.is_admin&&Ie(t.usuarios,o.id)===0)throw new Error("É preciso manter pelo menos um administrador ativo.");return t.usuarios=t.usuarios.filter(r=>r.id!==o.id),I(t),{ok:!0,mensagem:`Usuário '${o.username}' excluído.`}}function ca(e,{ir:a}){e.innerHTML='<p class="dica">Carregando...</p>',t();async function t(){await fe();const o=aa();e.innerHTML=`
    <div class="wrap">
      <div class="topo">
        <p class="tag">CENTRO DE DISTRIBUIÇÃO</p>
        <h1>Processador de Planilha</h1>
      </div>
      <div class="caixa">
        <div id="msgs"></div>
        ${o?`<p class="dica">Primeiro acesso neste navegador. Usuário <strong>admin</strong>, senha temporária <strong>${S(o)}</strong>.</p>`:""}
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
    </div>`;const r=e.querySelector("#msgs");e.querySelector("form").addEventListener("submit",async n=>{n.preventDefault(),r.innerHTML="";const i=n.target.querySelector("button");i.disabled=!0;try{Te&&await ta(e.querySelector("#username").value.trim(),e.querySelector("#senha").value),a("/")}catch(c){r.innerHTML=`<p class="msg erro">${S(c.message)}</p>`,i.disabled=!1}}),e.querySelector("#recuperar").addEventListener("click",n=>{n.preventDefault(),a("/recuperar")})}}function Se(e,{ir:a,obrigatoria:t}){var r,n;e.innerHTML=`
    <div class="wrap">
      <div class="topo"><h1>Alterar senha</h1></div>
      <div class="caixa">
        <div id="msgs"></div>
        ${t?'<p class="msg ok">Por segurança, defina uma nova senha para continuar.</p>':""}
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
        ${t?'<button class="btn sec" id="sair" type="button">Sair</button>':'<a class="btn sec" href="/" id="voltar">Voltar</a>'}
      </div>
    </div>`;const o=e.querySelector("#msgs");e.querySelector("form").addEventListener("submit",async i=>{i.preventDefault(),o.innerHTML="";try{const c={atual:e.querySelector("#atual").value,nova:e.querySelector("#nova").value,confirma:e.querySelector("#confirma").value},m=Te?await ra(c):await le("/api/senha",{method:"POST",body:c});o.innerHTML=`<p class="msg ok">${S(m.mensagem)}</p>`,a("/")}catch(c){o.innerHTML=`<p class="msg erro">${S(c.message)}</p>`}}),(r=e.querySelector("#sair"))==null||r.addEventListener("click",async()=>{G(),a("/login")}),(n=e.querySelector("#voltar"))==null||n.addEventListener("click",i=>{i.preventDefault(),a("/")})}const da="modulepreload",ua=function(e){return"/rupturas/"+e},we={},ma=function(a,t,o){let r=Promise.resolve();if(t&&t.length>0){let i=function(u){return Promise.all(u.map(d=>Promise.resolve(d).then(g=>({status:"fulfilled",value:g}),g=>({status:"rejected",reason:g}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),m=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));r=i(t.map(u=>{if(u=ua(u),u in we)return;we[u]=!0;const d=u.endsWith(".css"),g=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${g}`))return;const s=document.createElement("link");if(s.rel=d?"stylesheet":da,d||(s.as="script"),s.crossOrigin="",s.href=u,m&&s.setAttribute("nonce",m),document.head.appendChild(s),d)return new Promise((w,f)=>{s.addEventListener("load",w),s.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${u}`)))})}))}function n(i){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=i,window.dispatchEvent(c),!c.defaultPrevented)throw i}return r.then(i=>{for(const c of i||[])c.status==="rejected"&&n(c.reason);return a().catch(n)})},Ae=["CARGA","CT_UN","CT_TT","DATA","NOTA","VEÍCULO"],fa=["PALETE","Q_NF","Q_PALETE","EST_INI","SEÇÃO"],pa=["COD.","SEÇÃO","Q_NF","Q_PALETE","EST_INI"],ha={PALETE:14,"COD.":12,DESCRIÇÃO:48,EAN:16,EMBAL:12,Q_NF:10,Q_PALETE:12,EST_INI:10,SEÇÃO:10,ULT_ENT_CD:13,ULT_SAI_LJ:13},va="FFF36A10",ba="FFFFFFFF",ga="FF6BBE6B",ya="FFFCE4D6",Ea="FFFFFFFF";function Ce(e){return e==null?null:typeof e=="object"?e.richText?e.richText.map(a=>a.text).join(""):"result"in e?e.result:"text"in e?e.text:e:e}function re(e){return e==null||e===""?NaN:Number(e)}function Sa(e,{perms:a,emails:t}){const o=e.querySelector("#console");function r(f,b){o.style.display="block";const p=document.createElement("div");b&&(p.className=b),p.textContent=f,o.appendChild(p),o.scrollTop=o.scrollHeight}if(a.processar){const f=e.querySelector("#arquivo"),b=e.querySelector("#fname"),p=e.querySelector("#nomeSaida"),v=e.querySelector("#btnProcessar"),y=e.querySelector("#btnBaixar");let N=null,J=null,K="Report_processado.xlsx";f.addEventListener("change",T=>{const C=T.target.files[0];C&&(N=C,b.textContent=C.name,v.disabled=!1,p.value||(p.value=C.name.replace(/\.xlsx$/i,"")+"_processado"),y&&(y.style.display="none"))}),v.addEventListener("click",async()=>{o.innerHTML="",y&&(y.style.display="none"),v.disabled=!0;try{r("📊 Processando planilha...");const T=await ma(()=>import("./exceljs.min-_FHOiBEn.js").then(l=>l.e),[]),C=T.default??T,Fe=await N.arrayBuffer(),ve=new C.Workbook;await ve.xlsx.load(Fe);const Z=ve.worksheets[0],De=Z.getRow(1);let x=[];De.eachCell({includeEmpty:!0},(l,h)=>{x[h-1]=Ce(l.value)}),x=x.map(l=>l==null?"":String(l));let E=[];for(let l=2;l<=Z.rowCount;l++){const h=Z.getRow(l),_={};let k=!0;x.forEach((te,O)=>{const z=Ce(h.getCell(O+1).value);z!=null&&z!==""&&(k=!1),_[te]=z}),k||E.push(_)}if(E.length>0&&x.length>0){const l=x[0],h=E[E.length-1][l];h!=null&&String(h).includes("Qt Itens")&&(E.pop(),r("✓ Linha de resumo removida do final","ok"))}r(`✓ Arquivo lido com sucesso: ${N.name}`,"ok"),r(`  Linhas originais: ${E.length}`),r(`  Colunas originais: ${x.length}`),r(`  Colunas: [${x.join(", ")}]`);const X=Ae.filter(l=>x.includes(l)),be=Ae.filter(l=>!x.includes(l)),L=x.filter(l=>!X.includes(l));if(X.length>0&&r(`✓ Colunas removidas: [${X.join(", ")}]`,"ok"),be.length>0&&r(`⚠️  Colunas não encontradas: [${be.join(", ")}]`,"warn"),!L.includes("EST_INI")){r("❌ ERRO: Coluna 'EST_INI' não encontrada na planilha!","err"),r(`   Colunas disponíveis: [${L.join(", ")}]`,"err");return}const Pe=E.length;if(E=E.filter(l=>{const h=l.EST_INI;return typeof h=="number"?h===0:Number(h)===0&&h!==null&&h!==""&&h!==void 0}),r("✓ Linhas filtradas por EST_INI == 0","ok"),r(`  Linhas removidas (EST_INI != 0): ${Pe-E.length}`),r(`  Linhas restantes: ${E.length}`),E.length===0){r("⚠️  Aviso: Nenhuma linha restante após o filtro!","warn"),r("   Todas as linhas tinham EST_INI diferente de zero.","warn");return}L.includes("PALETE")&&(E.sort((l,h)=>{const _=re(l.PALETE),k=re(h.PALETE);return!isNaN(_)&&!isNaN(k)?_-k:String(l.PALETE).localeCompare(String(h.PALETE))}),r("✓ Linhas ordenadas por PALETE (crescente)","ok")),fa.forEach(l=>{L.includes(l)&&E.forEach(h=>{const _=re(h[l]);h[l]=isNaN(_)?0:Math.trunc(_)})}),r("🎨 Aplicando formatação profissional..."),r("📄 Configurando página (paisagem, margens zero, 1 página)...");const Y=new C.Workbook,A=Y.addWorksheet("Dados");A.addRow(L),E.forEach(l=>A.addRow(L.map(h=>l[h]))),A.pageSetup={orientation:"landscape",fitToPage:!0,fitToWidth:1,fitToHeight:0,margins:{left:.3,right:.3,top:.75,bottom:.75,header:.3,footer:.3}};try{Y.definedNames.add("'Dados'!$1:$1","Print_Titles")}catch{}const Ue={name:"Calibri",size:11,bold:!0,color:{argb:ba}},je={type:"pattern",pattern:"solid",fgColor:{argb:va}},He={type:"pattern",pattern:"solid",fgColor:{argb:ya}},Me={type:"pattern",pattern:"solid",fgColor:{argb:Ea}},B={style:"thin",color:{argb:ga}},ge={left:B,right:B,top:B,bottom:B},Be={horizontal:"center",vertical:"center",wrapText:!0},ze={horizontal:"left",vertical:"center",wrapText:!1},Ve={horizontal:"center",vertical:"center",wrapText:!1},We={name:"Calibri",size:10},ye=A.getRow(1);ye.eachCell(l=>{l.font=Ue,l.fill=je,l.alignment=Be,l.border=ge}),ye.height=30;for(let l=2;l<=A.rowCount;l++){const h=A.getRow(l),_=l%2===0?He:Me;L.forEach((k,te)=>{const O=h.getCell(te+1);O.font=We,O.fill=_,O.border=ge,O.alignment=pa.includes(k)?Ve:ze})}L.forEach((l,h)=>{A.getColumn(h+1).width=ha[l]||15}),A.views=[{state:"frozen",ySplit:1,zoomScale:100}],A.autoFilter={from:{row:1,column:1},to:{row:A.rowCount,column:L.length}};let D=A.rowCount+2;const ee=A.getCell(D,3);ee.value="RESUMO",ee.font={name:"Calibri",size:12,bold:!0,color:{argb:"FFF36A10"}},ee.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FFE8F5E9"}},D+=1;const Qe=L.includes("Q_NF")?E.reduce((l,h)=>l+(Number(h.Q_NF)||0),0):"N/A",Ge=L.includes("SEÇÃO")?new Set(E.map(l=>l.SEÇÃO)).size:"N/A";[["Total de Itens:",E.length],["Total de Volumes (Q_NF):",Qe],["Seções Únicas:",Ge]].forEach(([l,h])=>{const _=A.getCell(D,3);_.value=l,_.font={name:"Calibri",size:10};const k=A.getCell(D,4);k.value=h,k.font={name:"Calibri",size:10,bold:!0},D+=1});const Je=await Y.xlsx.writeBuffer();J=new Blob([Je],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});let ae=(p.value||"Report_processado").trim();ae.toLowerCase().endsWith(".xlsx")||(ae+=".xlsx"),K=ae,r(""),r("  ✅ PLANILHA PROCESSADA COM SUCESSO!","ok"),r(`   📁 Arquivo de saída: ${K}`),r(`   📊 Linhas finais: ${E.length}`),r(`   📋 Colunas finais: ${L.length}`),r(`   📑 Colunas: [${L.join(", ")}]`),r("   🚀 Planilha pronta para visualizar, imprimir e distribuir!","ok"),y&&(y.style.display="block")}catch(T){r("❌ Erro ao processar a planilha: "+T.message,"err"),console.error(T)}finally{v.disabled=!1}}),y==null||y.addEventListener("click",()=>{if(!J)return;const T=URL.createObjectURL(J),C=document.createElement("a");C.href=T,C.download=K,document.body.appendChild(C),C.click(),document.body.removeChild(C),setTimeout(()=>URL.revokeObjectURL(T),5e3)})}if(!a.email)return;const n=e.querySelector("#listaDestinatarios"),i=e.querySelector("#buscaEmail"),c=e.querySelector("#resultadosEmail");let m=-1;function u(f=""){const b=document.createElement("div");b.className="dest-linha";const p=document.createElement("input");p.type="email",p.className="dest-input",p.placeholder="destinatario@email.com",p.autocomplete="email",p.autocapitalize="off",p.spellcheck=!1,p.value=f;const v=document.createElement("button");return v.type="button",v.className="btn-remover",v.textContent="✕",v.addEventListener("click",()=>b.remove()),b.append(p,v),b}function d(){return Array.from(e.querySelectorAll(".dest-input")).map(f=>f.value.trim().toLowerCase())}function g(f){if(!f||d().includes(f.toLowerCase()))return!1;const b=Array.from(e.querySelectorAll(".dest-input")).find(p=>!p.value.trim());return b?b.value=f:n.appendChild(u(f)),!0}function s(f){return(f||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}function w(){const f=s(i.value.trim()),b=d(),p=t.filter(v=>!b.includes(v.email.toLowerCase())&&(!f||s(v.email).includes(f)||s(v.nome).includes(f)));if(c.innerHTML="",m=-1,!p.length){const v=document.createElement("div");v.className="vazio",v.textContent=t.length?"Nenhum e-mail encontrado.":"Nenhum e-mail cadastrado. Peça ao administrador.",c.appendChild(v)}p.forEach(v=>{const y=document.createElement("button");if(y.type="button",y.className="item",y.textContent=v.email,v.nome){const N=document.createElement("small");N.textContent=v.nome,y.appendChild(N)}y.addEventListener("mousedown",N=>N.preventDefault()),y.addEventListener("click",()=>{g(v.email),i.value="",w(),i.focus()}),c.appendChild(y)}),c.hidden=!1}i.addEventListener("input",w),i.addEventListener("focus",w),i.addEventListener("blur",()=>{c.hidden=!0}),i.addEventListener("keydown",f=>{const b=c.querySelectorAll(".item");if(f.key==="ArrowDown"||f.key==="ArrowUp"){if(f.preventDefault(),!b.length)return;m=(m+(f.key==="ArrowDown"?1:-1)+b.length)%b.length,b.forEach((p,v)=>p.classList.toggle("ativo",v===m)),b[m].scrollIntoView({block:"nearest"})}else if(f.key==="Enter"){f.preventDefault();const p=b[m>=0?m:0];p&&p.click()}else f.key==="Escape"&&(c.hidden=!0)}),e.querySelector("#btnAddTodos").addEventListener("click",()=>{t.forEach(f=>g(f.email))}),e.querySelector("#btnAddDest").addEventListener("click",()=>{n.appendChild(u())}),e.querySelector("#btnEnviarEmail").addEventListener("click",()=>{const f=Array.from(e.querySelectorAll(".dest-input")).map(y=>y.value.trim()).filter(y=>y.length>0);if(f.length===0){r("❌ Adicione ao menos um destinatário antes de enviar.","err");return}const b=encodeURIComponent(f.join(",")),p=encodeURIComponent(e.querySelector("#assunto").value||"Produtos em Ruptura"),v=encodeURIComponent(e.querySelector("#corpoEmail").value||"");window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${b}&su=${p}&body=${v}`,"_blank"),r("📧 Gmail aberto com destinatários, assunto e corpo preenchidos. Anexe a planilha baixada manualmente.","ok")})}function Le(e,{ir:a,me:t}){var n,i,c;const o=t.permissoes||{},r=!t.is_admin&&t.validade?` · acesso até ${se(t.validade)}`:"";e.innerHTML=`
    <div class="card">
      <div class="userbar">
        <span>👤 ${S(t.nome||t.username)}${S(r)}</span>
        <span class="acoes">
          ${t.is_admin?'<a href="/admin" id="ir-admin">Administração</a>':""}
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
    </div>`,(n=e.querySelector("#ir-admin"))==null||n.addEventListener("click",m=>{m.preventDefault(),a("/admin")}),(i=e.querySelector("#ir-senha"))==null||i.addEventListener("click",m=>{m.preventDefault(),a("/senha")}),(c=e.querySelector("#sair"))==null||c.addEventListener("click",async()=>{t.estatico?G():await le("/api/logout",{method:"POST"}),a("/login")}),Sa(e,{perms:o,emails:t.emails||[]})}function ne(e,a,t){e.innerHTML=a?`<p class="msg ${t}">${S(a)}</p>`:""}function wa(e){return e.ativo?e.expirado?`<span class="selo off">Expirado em ${S(se(e.validade))}</span>`:e.validade&&!e.is_admin?`<span class="selo warn">Até ${S(se(e.validade))}</span>`:`<span class="selo ok">Ativo${e.is_admin?"":" · sem prazo"}</span>`:'<span class="selo off">Desativado</span>'}async function Aa(e,{ir:a}){{Ca(e,{ir:a});return}}function Ca(e,{ir:a}){e.innerHTML=`
    <div class="wrap larga">
      <div class="barra">
        <h1>Administração de usuários</h1>
        <div class="links">
          <a class="btn peq sec" href="/" id="ir-home">Ir para a ferramenta</a>
          <button class="btn peq perigo" id="sair" type="button">Sair</button>
        </div>
      </div>
      <div id="msgs"></div>
      <div id="conteudo"></div>
    </div>`;const t=e.querySelector("#msgs");e.querySelector("#ir-home").addEventListener("click",u=>{u.preventDefault(),a("/")}),e.querySelector("#sair").addEventListener("click",()=>{G(),a("/login")});let o;try{o=Ee()}catch(u){ne(t,u.message,"erro");return}r(o);function r(u){const d=Object.entries(u.permissoes).map(([s,w])=>`<label><input type="checkbox" name="perm_${s}" ${s!=="email"?"checked":""}> ${S(w)}</label>`).join(""),g=u.usuarios.map(s=>{const w=Object.entries(u.permissoes).map(([b,p])=>`<label><input type="checkbox" name="perm_${b}" ${s.permissoes[b]||s.is_admin?"checked":""} ${s.is_admin?"disabled":""}> ${S(p)}</label>`).join(""),f=s.ultimo_acesso?s.ultimo_acesso.replace("T"," "):"nunca";return`
        <details class="usuario">
          <summary>
            <span class="nome-u">${S(s.username)}</span>
            ${s.nome?`<span class="meta">${S(s.nome)}</span>`:""}
            ${s.is_admin?'<span class="selo adm">Administrador</span>':""}
            ${wa(s)}
            <span class="meta">Último acesso: ${S(f)}</span>
          </summary>
          <div class="corpo-u">
            <form data-acao="editar" data-id="${s.id}">
              <div class="grade">
                <div><label>Nome</label><input type="text" name="nome" value="${S(s.nome)}" maxlength="80"></div>
                <div><label>Acesso válido até</label><input type="date" name="validade" value="${S(s.validade||"")}" ${s.is_admin?"disabled":""}></div>
              </div>
              <label>Permissões</label>
              <div class="checks">
                ${w}
                <label><input type="checkbox" name="is_admin" ${s.is_admin?"checked":""} ${s.id===u.eu_id?"disabled":""}> Administrador</label>
                <label><input type="checkbox" name="ativo" ${s.ativo?"checked":""} ${s.id===u.eu_id?"disabled":""}> Usuário ativo</label>
              </div>
              ${s.is_admin?'<p class="dica">Administradores têm todas as permissões e não expiram.</p>':""}
              <div class="acoes-u"><button class="btn peq" type="submit">Salvar alterações</button></div>
            </form>
            <div class="sub">
              <form data-acao="senha" data-id="${s.id}" autocomplete="off">
                <div><label>Redefinir senha</label><input type="password" name="senha" minlength="8" required placeholder="nova senha temporária" autocomplete="new-password"></div>
                <button class="btn peq sec" type="submit">Redefinir</button>
              </form>
            </div>
            ${s.id!==u.eu_id?`
            <div class="sub">
              <form data-acao="excluir" data-id="${s.id}">
                <button class="btn peq perigo" type="submit">Excluir usuário</button>
              </form>
            </div>`:""}
          </div>
        </details>`}).join("");e.querySelector("#conteudo").innerHTML=`
      <div class="painel">
        <h2>Novo usuário</h2>
        <form data-acao="novo" autocomplete="off">
          <div class="grade">
            <div><label>Usuário (login)</label><input type="text" name="username" required autocapitalize="off" spellcheck="false"></div>
            <div><label>Nome</label><input type="text" name="nome" maxlength="80"></div>
            <div><label>Senha inicial</label><input type="password" name="senha" required minlength="8" autocomplete="new-password"></div>
            <div><label>Acesso válido até</label><input type="date" name="validade" min="${S(u.hoje)}"><p class="dica">Vazio = sem prazo. O último dia vale por inteiro.</p></div>
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
      <div class="painel">
        <h2>Usuários (${u.usuarios.length})</h2>
        ${g}
      </div>`,e.querySelector("#conteudo").querySelectorAll("form").forEach(s=>{s.addEventListener("submit",w=>m(w,s))})}function n(u){const d={};return u.querySelectorAll('input[name^="perm_"]').forEach(g=>{d[g.name.slice(5)]=g.checked}),d}function i(u,d){return u.querySelector(`[name="${d}"]`)}async function c(u){try{const d=await u();ne(t,d.mensagem||"","ok"),o=Ee(),r(o)}catch(d){ne(t,d.message,"erro")}}function m(u,d){u.preventDefault();const g=d.dataset.acao,s=d.dataset.id;if(g==="novo")return c(()=>oa({username:i(d,"username").value.trim(),nome:i(d,"nome").value,senha:i(d,"senha").value,validade:i(d,"validade").value,is_admin:i(d,"is_admin").checked,permissoes:n(d)}));if(g==="editar")return c(()=>ia(s,{nome:i(d,"nome").value,validade:i(d,"validade").value,is_admin:i(d,"is_admin").checked,ativo:i(d,"ativo").checked,permissoes:n(d)}));if(g==="senha")return c(()=>sa(s,i(d,"senha").value));if(g==="excluir"){const w=d.closest(".usuario").querySelector(".nome-u").textContent;return confirm(`Excluir o usuário ${w}? Esta ação não pode ser desfeita.`)?c(()=>la(s)):void 0}}}function La(e,{ir:a,path:t}){const o="/recuperar/";t.startsWith(o)&&decodeURIComponent(t.slice(o.length)),_a(e,{ir:a})}function _a(e,{ir:a}){e.innerHTML=`
    <div class="wrap">
      <div class="topo"><h1>Recuperar senha</h1></div>
      <div class="caixa">
        <div id="msgs"></div>
        <p class="dica">Neste site a conta fica salva neste navegador. Recriar o acesso gera uma nova senha temporária do usuário admin e apaga a senha anterior deste navegador.</p>
        <button class="btn" id="recriar" type="button">Recriar acesso do admin</button>
        <a class="btn sec" href="/login" id="voltar">Voltar ao login</a>
      </div>
    </div>`,e.querySelector("#voltar").addEventListener("click",t=>{t.preventDefault(),a("/login")}),e.querySelector("#recriar").addEventListener("click",async()=>{const t=await na();e.querySelector("#msgs").innerHTML=`<p class="msg ok">Nova senha temporária do admin: <strong>${S(t)}</strong></p>`})}const q=document.getElementById("app"),V="/rupturas/".replace(/\/$/,"");function xa(){let e=location.pathname;return V&&e.startsWith(V)&&(e=e.slice(V.length)),!e||e==="/"?"/":e.startsWith("/")?e:`/${e}`}function U(e){return`${V}${e}`}function R(e){const a=U(e);location.pathname!==a&&history.pushState({},"",a),he()}async function he(){const e=(await fe(),pe());let a=xa();if(a==="/recuperar"||a.startsWith("/recuperar/")){La(q,{ir:R,path:a});return}if(!e){a!=="/login"&&history.replaceState({},"",U("/login")),ca(q,{ir:R});return}if(e.trocar_senha&&a!=="/senha"){history.replaceState({},"",U("/senha")),Se(q,{ir:R,obrigatoria:!0});return}if(!e.trocar_senha&&(a==="/login"||a==="/senha")&&(history.replaceState({},"",U("/")),a="/"),a==="/admin"){if(!e.is_admin){history.replaceState({},"",U("/")),Le(q,{ir:R,me:e});return}Aa(q,{ir:R});return}if(a==="/senha"){Se(q,{ir:R,obrigatoria:!1});return}Le(q,{ir:R,me:e})}window.addEventListener("popstate",()=>he());he();
