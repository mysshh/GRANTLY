(function(){
// GRANTLY Student Hub — connected browser-local tools.
(function(){
 const $=s=>document.querySelector(s), esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||"null");return v??f}catch(e){return f}};
 const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
 const tabs=[...document.querySelectorAll(".hub-tab")],panels=[...document.querySelectorAll(".hub-panel")];
 tabs.forEach(b=>b.addEventListener("click",()=>{tabs.forEach(x=>x.classList.toggle("active",x===b));panels.forEach(p=>p.classList.toggle("active",p.id==="hub-"+b.dataset.hub));if(b.dataset.hub==="deadlines")renderDeadlines();if(b.dataset.hub==="compare")renderCompare();if(b.dataset.hub==="readiness")renderReadiness();}));
 const profile=()=>read("grantly-smartmatch-profile",{});
 const tracker=()=>read("grantly-application-tracker-v1",[]);
 const vaultKey="grantly-document-checklist-v1";
 const passportKey="grantly-passport-v1";
 function renderEligibility(){
  const p=profile(),out=$("#eligibility-output");if(!out)return;
  if(!p.course){out.innerHTML='<p class="hub-placeholder">Complete SmartMatch first, then return here to check your profile.</p>';return;}
  const items=[];
  if(p.category&&["OBC","SC","ST"].includes(p.category))items.push(["Category-based route","Check the relevant central and state/UT post-matric scheme. Verify certificate format, income ceiling, course and institution conditions."]);
  if(p.category==="OBC")items.push(["Top Class Education (OBC/EBC/DNT)","Check whether your institution/course is on the current notified list and whether you meet the applicable income and other conditions."]);
  if(p.level==="undergraduate")items.push(["PM-USP Central Sector Scheme","Check Class XII merit position, family income, regular-course and renewal conditions. It is not open to every undergraduate student."]);
  if(p.income==="private")items.push(["Income requirement","Your income preference is private. You will need to check income thresholds individually before treating any scheme as a fit."]);
  items.push(["Institution verification","Confirm that your institution and course are eligible and that your institution has completed any required portal verification."]);
  items.push(["Application readiness","Check current academic year, application window, required certificates, bank/Aadhaar rules and renewal conditions in the official guidelines."]);
  out.innerHTML='<div class="eligibility-profile"><b>'+esc(p.course)+'</b><span>'+esc(p.state||"")+' · '+esc(p.level||"")+' · '+esc(p.category||"")+'</span></div>'+items.map((x,i)=>'<article class="eligibility-check"><span>0'+(i+1)+'</span><div><b>'+esc(x[0])+'</b><p>'+esc(x[1])+'</p><small>TO VERIFY WITH OFFICIAL GUIDELINES</small></div></article>').join('')+'<a class="hub-source-link" href="https://scholarships.gov.in/All-Scholarships" target="_blank" rel="noopener">Browse GRANTLY scholarship directory ↗</a>';
 }
 $("#decode-eligibility")?.addEventListener("click",renderEligibility);
 function renderDeadlines(){
  const out=$("#deadline-output");if(!out)return;const rows=tracker().filter(x=>x.deadline).sort((a,b)=>a.deadline.localeCompare(b.deadline));
  if(!rows.length){out.innerHTML='<p class="hub-placeholder">No deadlines yet. Add dates to your opportunities in My Applications and they will appear here.</p>';return;}
  const today=new Date();today.setHours(0,0,0,0);
  out.innerHTML=rows.map(x=>{const d=new Date(x.deadline+"T00:00:00"),days=Math.ceil((d-today)/86400000),label=days<0?"Past deadline":days===0?"Due today":days+" days left";return '<article class="deadline-row"><div class="deadline-date"><b>'+d.toLocaleDateString(undefined,{day:"2-digit"})+'</b><span>'+d.toLocaleDateString(undefined,{month:"short",year:"numeric"})+'</span></div><div><b>'+esc(x.name)+'</b><p>'+esc(x.provider||"Provider not added")+' · '+esc(x.status)+'</p></div><strong class="'+(days>=0&&days<=14?"deadline-soon":"")+'">'+label+'</strong></article>'}).join("");
 }
 const passportForm=$("#passport-form");
 if(passportForm){
  const fields=["full_name","institution","course","study_level","study_year","state","academic_score","category","achievements"];
  const card=(p,email)=>{
   const val=(k,fallback="Not added yet")=>p[k]||fallback;
   $("#passport-card-name").textContent=val("full_name","Your name goes here");
   $("#passport-card-email").textContent=email||"";
   $("#passport-card-course").textContent=val("course");
   $("#passport-card-institution").textContent=val("institution");
   $("#passport-card-level").textContent=val("study_level");
   $("#passport-card-year").textContent=val("study_year");
   $("#passport-number").textContent=p.full_name?"ID · "+String((p.full_name+"-"+(email||"")).split("").reduce((a,c)=>a+c.charCodeAt(0),0)).slice(-6):"ID · NOT ISSUED";
   $("#passport-card-status").textContent=p.full_name&&p.course&&p.institution?"PROFILE READY":"PROFILE INCOMPLETE";
   $("#passport-avatar").textContent=(p.full_name||"✳").trim().charAt(0).toUpperCase();
  };
  const local=read(passportKey,{}),smart=profile();
  const defaults={course:smart.course||"",study_year:smart.year||"",study_level:smart.level==="undergraduate"?"Undergraduate":smart.level||"",state:smart.state||"",category:smart.category||""};
  fields.forEach(k=>{if(passportForm.elements[k])passportForm.elements[k].value=local[k]||defaults[k]||""});
  const account=$("#passport-account"),feedback=$("#passport-feedback");
  async function loadAccount(){
   try{
    const session=await window.hatchable.auth.getSession();
    if(!session?.user){account.innerHTML='<span class="account-dot"></span><span>Not signed in · <a href="/login.html?next=/passport.html">Sign in to save your passport</a></span>';card(local,"");return}
    account.innerHTML='<span class="account-dot"></span><span>Signed in as '+esc(session.user.email)+'</span><button type="button" id="passport-signout">Sign out</button>';
    $("#passport-signout").addEventListener("click",async()=>{await window.hatchable.auth.signOut();location.href="/login.html"});
    const response=await fetch("/api/profile",{credentials:"include"});
    if(!response.ok)throw new Error("Could not load your account profile");
    const data=await response.json(),saved=data.profile||{};
    fields.forEach(k=>{if(passportForm.elements[k]&&saved[k]!=null)passportForm.elements[k].value=saved[k]});
    write(passportKey,saved);
    card(saved,session.user.email);
    renderReadiness();
   }catch(e){account.textContent="Sign in to save and sync your passport across devices.";card(local,"")}
  }
  passportForm.addEventListener("submit",async e=>{
   e.preventDefault();const v=Object.fromEntries(new FormData(passportForm));write(passportKey,v);card(v,"");
   try{
    const response=await fetch("/api/profile",{method:"PUT",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(v)});
    if(response.status===401){feedback.innerHTML='Please <a href="/login.html?next=/passport.html">sign in</a> to save this passport to your account.';return}
    if(!response.ok)throw new Error("Save failed");
    const session=await window.hatchable.auth.getSession();card(v,session?.user?.email||"");feedback.textContent="Passport saved securely to your GRANTLY account.";
   }catch(err){feedback.textContent="Saved on this device for now. Sign in to sync your passport to your account."}
   renderReadiness();
  });
  loadAccount();
 }
 const vaultForm=$("#vault-form");
 function renderVault(){const out=$("#vault-list");if(!out)return;const docs=read(vaultKey,[]);out.innerHTML=docs.length?docs.map((d,i)=>'<div class="vault-row"><div><b>'+esc(d.name)+'</b><small>'+(d.expiry?"Expiry: "+esc(d.expiry):"No expiry date")+(d.notes?" · "+esc(d.notes):"")+'</small></div><button type="button" data-vault-remove="'+i+'">Remove</button></div>').join(""):'<p class="hub-placeholder">Your document checklist is empty. Add the documents you need to prepare.</p>';out.querySelectorAll("[data-vault-remove]").forEach(b=>b.addEventListener("click",()=>{const a=read(vaultKey,[]);a.splice(Number(b.dataset.vaultRemove),1);write(vaultKey,a);renderVault();renderReadiness();}));}
 vaultForm?.addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(vaultForm));const a=read(vaultKey,[]);a.push(d);write(vaultKey,a);vaultForm.reset();renderVault();renderReadiness();});renderVault();
 $("#copilot-generate")?.addEventListener("click",()=>{const topic=$("#copilot-topic").value,ctx=$("#copilot-context").value.trim(),out=$("#copilot-answer");const templates={explain:"Read the rule in four parts: who can apply, what academic/course conditions apply, what income or category proof is required, and which institution or course restrictions apply. Mark each condition as met, not met or still unknown. Do not assume a condition is waived if the wording is unclear.",documents:"Start with this preparation list: current academic marksheet, admission or bonafide certificate, fee receipt, bank account proof, applicable income/category/disability certificate, identity documents required by the provider, and a recent photograph. The exact list varies by scheme—use its official checklist as the source of truth.",essay:"Build your statement around four points: your educational goal, the work you have already put into it, the financial barrier the award would help address, and the specific impact the support would make. Use concrete examples and your own voice; do not invent hardship or achievements.",form:"Copy the exact field label and its help text, then check the official application instructions. Identify what format is requested, which document supports the answer, and whether the field is mandatory. Never guess at legal, bank or identity details."};out.innerHTML='<b>YOUR NEXT STEPS</b><p>'+templates[topic]+'</p>'+(ctx?'<p class="copilot-context-note"><b>Your note:</b> '+esc(ctx)+'</p>':'')+'<small>Template guidance only · verify against the official scheme notice.</small>';});
 function renderCompare(){
  const a=$("#compare-a"),b=$("#compare-b"),out=$("#compare-output");if(!a||!b||!out)return;const rows=tracker();const options=rows.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join("");a.innerHTML=options;b.innerHTML=options;
  if(rows.length<2){out.textContent="Add at least two opportunities to your tracker to compare them.";return;}
  if(a.value===b.value)b.selectedIndex=1;
  const draw=()=>{const x=rows.find(r=>r.id===a.value),y=rows.find(r=>r.id===b.value);if(!x||!y||x.id===y.id){out.textContent="Choose two different opportunities.";return;}out.innerHTML='<div class="compare-grid"><div></div><b>'+esc(x.name)+'</b><b>'+esc(y.name)+'</b>'+[["Provider","provider"],["Deadline","deadline"],["Stage","status"],["Notes / next step","notes"],["Official link","url"]].map(([label,k])=>'<span>'+label+'</span><div>'+esc(x[k]||"Not added")+'</div><div>'+esc(y[k]||"Not added")+'</div>').join("")+'</div>'};
  a.onchange=draw;b.onchange=draw;draw();
 }
 function renderReadiness(){
  if(!$("#readiness-number"))return;
  const p=profile(),pass=read(passportKey,{}),apps=tracker(),docs=read(vaultKey,[]);
  const checks=[["SmartMatch profile completed",Boolean(p.course&&p.state&&p.level&&p.category)],["Passport details added",Boolean(pass.full_name&&pass.institution&&pass.course)],["At least one opportunity saved",apps.length>0],["Application deadline recorded",apps.some(x=>x.deadline)],["Documents checklist started",docs.length>0],["At least one application submitted",apps.some(x=>x.status==="Submitted"||x.status==="Approved")]];
  const score=Math.round(checks.filter(x=>x[1]).length/checks.length*100);
  $("#readiness-number").textContent=score+"%";$("#readiness-bar").style.width=score+"%";
  $("#readiness-items").innerHTML=checks.map(x=>'<div class="readiness-item"><span class="'+(x[1]?"done":"pending")+'">'+(x[1]?"✓":"○")+'</span>'+x[0]+'</div>').join("");
 }
 renderEligibility();renderDeadlines();renderCompare();renderReadiness();
 // On the readiness page, hydrate the passport from the authenticated profile so
 // the score is correct even if the student has not opened the passport page first.
 if($("#readiness-number")){
  fetch("/api/profile",{credentials:"include"}).then(r=>r.ok?r.json():null).then(data=>{
   if(data&&data.profile){write(passportKey,data.profile);renderReadiness();}
  }).catch(()=>{});
 }
})();
})();