import{r as m,aD as S,aO as k,v as e,al as w,aq as $,U as N,bk as I,K as P,ar as A,N as _,ay as B,bC as L,az as O,aA as y,aC as q,aE as g,a0 as E,aa as M,C as J,aj as T,aG as R,bD as D,bd as F,bE as K,bF as Y,bx as G}from"./vendor-Gg0p6gBv.js";const H="/api";function C(i){const[o,l]=m.useState(0);return m.useEffect(()=>{let a=!0;async function t(){if(i)try{const r=await fetch(`${H}/users/${i}/notifications`),h=await r.json();if(!r.ok)return;const b=h.data??[];a&&l(b.filter(p=>!p.isRead).length)}catch{a&&l(0)}}t();const c=window.setInterval(t,3e4);return()=>{a=!1,window.clearInterval(c)}},[i]),o}const Q="/api",W=[{id:"overview",label:"Bosh sahifa",segment:"overview",icon:$},{id:"personal",label:"Shaxsiy ma'lumotlar",segment:"personal",icon:N},{id:"participation",label:"Ishtirok ma'lumotlari",segment:"participation",icon:I},{id:"teams",label:"Jamoalarim",segment:"teams",icon:P},{id:"applications",label:"Arizalarim",segment:"applications",icon:A},{id:"certificates",label:"Sertifikatlar",segment:"certificates",icon:_},{id:"appeals",label:"Apellyatsiyalar",segment:"appeals",icon:B},{id:"roadmap",label:"Yo'l xaritasi",segment:"roadmap",icon:L},{id:"monitoring",label:"Monitoring",segment:"monitoring",icon:O},{id:"notifications",label:"Bildirishnomalar",segment:"notifications",icon:y},{id:"settings",label:"Sozlamalar",segment:"settings",icon:q}],V={solo_participant:"Yakka ishtirokchi",team_leader:"Jamoa rahbari",team_member:"Jamoa a'zosi",mentor:"Mentor",advisor:"Maslahatchi",otm_participant:"OTM ishtirokchisi",independent_participant:"Mustaqil ishtirokchi",initiative_member:"Tashabbuskor",participant:"Ishtirokchi"};function X({mobileOpen:i,onMobileClose:o}){const{pathname:l}=S(),{userId:a}=k(),t=JSON.parse(localStorage.getItem("profileUser")??"null"),c=a??(t==null?void 0:t.id),[r,h]=m.useState({firstName:(t==null?void 0:t.firstName)??"",lastName:(t==null?void 0:t.lastName)??"",role:"participant",profileCompletion:(t==null?void 0:t.profileCompletion)??0});m.useEffect(()=>{if(!c)return;let s=!0;return fetch(`${Q}/users/${c}/profile`).then(d=>d.ok?d.json():null).then(d=>{if(!d||!s)return;const n=d.data;h({firstName:n.firstName??"",lastName:n.lastName??"",role:n.role??"participant",profileCompletion:n.profileCompletion??0});const j=JSON.parse(localStorage.getItem("profileUser")??"{}");localStorage.setItem("profileUser",JSON.stringify({...j,firstName:n.firstName,lastName:n.lastName,email:n.email,profileCompletion:n.profileCompletion??0}))}).catch(()=>{}),()=>{s=!1}},[c]);const b=`/profile/${c??""}`.replace(/\/$/,""),p=s=>`${b}/${s}`,f=C(c),u=s=>l===s||l.startsWith(s+"/"),x=`${r.firstName[0]??"?"}${r.lastName[0]??""}`.toUpperCase(),v=()=>e.jsxs("div",{className:"flex flex-col h-full",children:[e.jsxs("div",{className:"h-[70px] flex items-center gap-3 px-5 border-b border-[var(--p-border)] flex-shrink-0",children:[e.jsx("div",{className:"w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0",children:e.jsx(w,{size:18,className:"text-white"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-bold text-white leading-none",children:"Qashqadaryo"}),e.jsx("p",{className:"text-[11px] text-[var(--p-muted)] leading-none mt-0.5",children:"Startup Ligasi"})]})]}),e.jsxs("div",{className:"px-4 py-4 border-b border-[var(--p-border)] flex-shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm",children:x}),e.jsxs("div",{className:"min-w-0",children:[e.jsxs("p",{className:"text-sm font-semibold text-white truncate",children:[r.lastName," ",r.firstName]}),e.jsx("span",{className:"inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20",children:V[r.role]??"Ishtirokchi"})]})]}),e.jsxs("div",{className:"mt-3",children:[e.jsxs("div",{className:"flex items-center justify-between mb-1",children:[e.jsx("span",{className:"text-[11px] text-[var(--p-muted)]",children:"Profil to'ldirilganligi"}),e.jsxs("span",{className:"text-[11px] font-bold text-white",children:[r.profileCompletion,"%"]})]}),e.jsx("div",{className:"h-1.5 bg-[var(--p-bg)] rounded-full overflow-hidden",children:e.jsx("div",{className:"h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500",style:{width:`${r.profileCompletion}%`}})})]})]}),e.jsx("nav",{className:"flex-1 overflow-y-auto py-3 px-3","aria-label":"Kabinet menyusi",children:e.jsx("ul",{className:"space-y-0.5",children:W.map(s=>{const d=p(s.segment),n=u(d),j=s.icon,z=s.id==="notifications";return e.jsx("li",{children:e.jsxs(g,{to:d,onClick:o,"aria-current":n?"page":void 0,className:`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium
                    ${n?"bg-blue-500/15 text-blue-400 border border-blue-500/25 shadow-[0_0_16px_rgba(47,125,246,0.15)]":"text-[var(--p-text2)] hover:bg-[var(--p-surface)] hover:text-white"}
                  `,children:[e.jsx(j,{size:18,className:"flex-shrink-0"}),e.jsx("span",{className:"flex-1 truncate",children:s.label}),z&&f>0&&e.jsx("span",{className:"flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center",children:f>9?"9+":f})]})},s.id)})})}),e.jsx("div",{className:"p-3 border-t border-[var(--p-border)] flex-shrink-0",children:e.jsxs("div",{className:"rounded-xl bg-[var(--p-surface)] border border-[var(--p-border)] p-3",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx(w,{size:14,className:"text-[var(--p-gold)]"}),e.jsx("span",{className:"text-xs font-bold text-white truncate",children:"QSL 2026"})]}),e.jsxs("div",{className:"flex items-center gap-1.5 text-[11px] text-[var(--p-muted)] mb-2",children:[e.jsx(E,{size:11}),e.jsx("span",{children:"Ariza: 1 iyul — 30 avg"})]}),e.jsxs("div",{className:"flex items-center gap-1.5 mb-3",children:[e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"}),e.jsx("span",{className:"text-[11px] text-green-400 font-medium",children:"Ariza qabuli ochiq"})]}),e.jsxs(g,{to:p("applications"),onClick:o,className:"flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-xs font-semibold text-white",children:["Ariza topshirish",e.jsx(M,{size:13})]})]})})]});return e.jsxs(e.Fragment,{children:[e.jsx("aside",{className:"fixed top-0 left-0 h-screen w-[260px] bg-[var(--p-sidebar)] border-r border-[var(--p-border)] z-40 hidden lg:flex flex-col",children:e.jsx(v,{})}),i&&e.jsx("div",{className:"fixed inset-0 bg-black/50 z-30 lg:hidden",onClick:o,"aria-hidden":"true"}),e.jsx("aside",{className:`
          fixed top-0 left-0 h-screen w-[260px] bg-[var(--p-sidebar)] border-r border-[var(--p-border)]
          z-40 flex flex-col lg:hidden transition-transform duration-300
          ${i?"translate-x-0":"-translate-x-full"}
        `,"aria-hidden":!i,children:e.jsx(v,{})})]})}function Z({onMenuToggle:i}){const o=J(),{userId:l}=k(),a=JSON.parse(localStorage.getItem("profileUser")??"null"),t=(a==null?void 0:a.firstName)??"",c=(a==null?void 0:a.lastName)??"",r=(a==null?void 0:a.email)??"",h=`${t[0]??"?"}${c[0]??""}`.toUpperCase(),b=`/profile/${l??(a==null?void 0:a.id)??""}`.replace(/\/$/,""),p=s=>`${b}/${s}`,f=C(l??(a==null?void 0:a.id)),[u,x]=m.useState(!1),v=()=>{localStorage.removeItem("profileUser"),o("/login")};return e.jsx("header",{className:"sticky top-0 z-30 h-[70px] bg-[var(--p-bg2)]/95 backdrop-blur-xl border-b border-[var(--p-border)] flex-shrink-0",children:e.jsxs("div",{className:"h-full flex items-center justify-between px-5 gap-4",children:[e.jsxs("div",{className:"flex items-center gap-3 flex-1 min-w-0",children:[e.jsx("button",{onClick:i,className:"lg:hidden p-2 hover:bg-[var(--p-surface)] rounded-lg transition-colors","aria-label":"Menyu",children:e.jsx(T,{size:20})}),e.jsxs("div",{className:"hidden sm:flex items-center gap-2 bg-[var(--p-surface)] rounded-xl px-4 py-2 border border-[var(--p-border)] flex-1 max-w-sm",children:[e.jsx(R,{size:16,className:"text-[var(--p-muted)] flex-shrink-0"}),e.jsx("input",{type:"text",placeholder:"Kabinet bo'yicha qidirish...",className:"bg-transparent border-none outline-none text-sm flex-1 text-white placeholder:text-[var(--p-muted)] min-w-0"})]})]}),e.jsxs("div",{className:"flex items-center gap-1.5 flex-shrink-0",children:[e.jsx("button",{className:"p-2 hover:bg-[var(--p-surface)] rounded-lg transition-colors","aria-label":"Yordam",title:"Yordam",children:e.jsx(D,{size:18,className:"text-[var(--p-text2)]"})}),e.jsxs(g,{to:p("notifications"),className:"relative p-2 hover:bg-[var(--p-surface)] rounded-lg transition-colors","aria-label":`Bildirishnomalar${f>0?`, ${f} ta yangi`:""}`,children:[e.jsx(y,{size:18,className:"text-[var(--p-text2)]"}),f>0&&e.jsx("span",{className:"absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full","aria-hidden":"true"})]}),e.jsx("button",{className:"p-2 hover:bg-[var(--p-surface)] rounded-lg transition-colors","aria-label":"Til",title:"Til",children:e.jsx(F,{size:18,className:"text-[var(--p-text2)]"})}),e.jsxs("div",{className:"relative pl-2 border-l border-[var(--p-border)] ml-1",children:[e.jsxs("button",{onClick:()=>x(s=>!s),className:"flex items-center gap-2 hover:bg-[var(--p-surface)] rounded-xl px-2 py-1.5 transition-colors","aria-expanded":u,"aria-haspopup":"menu",children:[e.jsx("div",{className:"w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0",children:h||e.jsx(N,{size:14})}),e.jsxs("div",{className:"hidden sm:block text-left",children:[e.jsx("p",{className:"text-xs font-semibold text-white leading-tight",children:t||"Foydalanuvchi"}),e.jsx("p",{className:"text-[11px] text-[var(--p-muted)] leading-tight",children:"Kabinet"})]}),e.jsx(K,{size:14,className:`text-[var(--p-muted)] transition-transform ${u?"rotate-180":""}`})]}),u&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0 z-10",onClick:()=>x(!1),"aria-hidden":"true"}),e.jsxs("div",{className:"absolute right-0 top-full mt-2 w-52 bg-[var(--p-surface)] border border-[var(--p-border)] rounded-xl shadow-2xl z-20 overflow-hidden",role:"menu",children:[e.jsxs("div",{className:"px-4 py-3 border-b border-[var(--p-border)]",children:[e.jsxs("p",{className:"text-sm font-semibold text-white",children:[c," ",t]}),e.jsx("p",{className:"text-xs text-[var(--p-muted)] truncate",children:r})]}),e.jsxs("div",{className:"py-1",children:[e.jsxs(g,{to:p("personal"),onClick:()=>x(!1),role:"menuitem",className:"flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--p-surface2)] transition-colors text-sm text-[var(--p-text2)] hover:text-white",children:[e.jsx(N,{size:16}),"Profil"]}),e.jsxs(g,{to:"/",onClick:()=>x(!1),role:"menuitem",className:"flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--p-surface2)] transition-colors text-sm text-[var(--p-text2)] hover:text-white",children:[e.jsx(Y,{size:16}),"Bosh sahifaga qaytish"]})]}),e.jsx("div",{className:"border-t border-[var(--p-border)] py-1",children:e.jsxs("button",{onClick:v,role:"menuitem",className:"flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-sm text-red-400 w-full text-left",children:[e.jsx(G,{size:16}),"Chiqish"]})})]})]})]})]})]})})}function ee({children:i}){const[o,l]=m.useState(!1);return e.jsxs("div",{className:"profile-shell min-h-screen bg-[#03101f] text-white",children:[e.jsx("style",{children:`
        .profile-shell {
          --p-bg: #03101f;
          --p-bg2: #07172b;
          --p-sidebar: #041428;
          --p-surface: #0a1b30;
          --p-surface2: #0d223b;
          --p-border: rgba(112,145,190,.18);
          --p-border-strong: rgba(71,118,255,.42);
          --p-text: #f8fafc;
          --p-text2: #aab6c9;
          --p-muted: #718096;
          --p-blue: #2f7df6;
          --p-cyan: #22b7ff;
          --p-green: #2ed57a;
          --p-purple: #a855f7;
          --p-gold: #f5b942;
          --p-red: #ef4f65;
        }

        .light .profile-shell {
          --p-bg: #f4f7fb;
          --p-bg2: #ffffff;
          --p-sidebar: #ffffff;
          --p-surface: #f8fafc;
          --p-surface2: #eef4fb;
          --p-border: rgba(15, 23, 42, .12);
          --p-border-strong: rgba(37, 99, 235, .35);
          --p-text: #0f172a;
          --p-text2: #334155;
          --p-muted: #64748b;
          background: var(--p-bg) !important;
          color: var(--p-text) !important;
        }

        .light .profile-shell [class*="bg-[#03101f]"] {
          background: #f4f7fb !important;
        }

        .light .profile-shell [class*="bg-[#041428]"],
        .light .profile-shell [class*="bg-[#07172b]"] {
          background: #f8fafc !important;
        }

        .light .profile-shell [class*="bg-[#0a1b30]"],
        .light .profile-shell [class*="bg-[#0d223b]"] {
          background: #ffffff !important;
        }

        .light .profile-shell [class*="border-[rgba(112,145,190"] {
          border-color: rgba(15, 23, 42, .12) !important;
        }

        .light .profile-shell [class*="text-white"] {
          color: #0f172a !important;
        }

        .light .profile-shell [class*="text-[#aab6c9]"] {
          color: #334155 !important;
        }

        .light .profile-shell [class*="text-[#718096]"] {
          color: #64748b !important;
        }

        .light .profile-shell [class*="bg-blue-600"],
        .light .profile-shell [class*="bg-green-600"],
        .light .profile-shell [class*="bg-red-500"] {
          color: #ffffff !important;
        }

        .light .profile-shell [class*="bg-blue-600"] *,
        .light .profile-shell [class*="bg-green-600"] *,
        .light .profile-shell [class*="bg-red-500"] * {
          color: #ffffff !important;
        }

        .light .profile-shell input,
        .light .profile-shell select,
        .light .profile-shell textarea {
          color: #0f172a !important;
        }

        .light .profile-shell input::placeholder,
        .light .profile-shell textarea::placeholder {
          color: #94a3b8 !important;
        }
      `}),e.jsx(X,{mobileOpen:o,onMobileClose:()=>l(!1)}),e.jsxs("div",{className:"lg:ml-[260px] flex flex-col min-h-screen",children:[e.jsx(Z,{onMenuToggle:()=>l(a=>!a)}),e.jsx("main",{className:"flex-1 p-5 lg:p-8 overflow-x-hidden",children:i})]}),o&&e.jsx("div",{className:"fixed inset-0 bg-black/60 z-30 lg:hidden",onClick:()=>l(!1),"aria-hidden":"true"})]})}export{ee as P};
