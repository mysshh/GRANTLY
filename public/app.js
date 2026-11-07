const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav-links');
if(menu&&nav){
  menu.setAttribute('aria-expanded','false');
  menu.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    menu.setAttribute('aria-expanded',String(open));
  });
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    nav.classList.remove('open');menu.setAttribute('aria-expanded','false');
  }));
}
const world=document.querySelector('.academic-world');
const hero=document.querySelector('.world-hero');
if(world&&hero){
  const footer=world.querySelector('.hero-bottom');
  if(footer) hero.appendChild(footer);
  document.body.appendChild(world);
}
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const targets=document.querySelectorAll('.story-copy,.story-art,.scene,.discovery-heading');
if('IntersectionObserver' in window&&!reducedMotion){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  targets.forEach(el=>observer.observe(el));
}else targets.forEach(el=>el.classList.add('in-view'));
// SmartMatch profile builder — local-first prototype with cautious, explainable guidance.
const smartForm=document.querySelector('#smartmatch-form');
const matchResults=document.querySelector('#match-results');
if(smartForm&&matchResults){
  const saved=localStorage.getItem('grantly-smartmatch-profile');
  if(saved){
    try{
      const profile=JSON.parse(saved);
      Object.entries(profile).forEach(([key,value])=>{
        const field=smartForm.elements.namedItem(key);
        if(field&&field.type!=='checkbox') field.value=value;
        if(field&&field.type==='checkbox') field.checked=Boolean(value);
      });
    }catch(e){}
  }
  smartForm.addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(smartForm);
    const profile=Object.fromEntries(data.entries());
    profile.consent=data.get('consent')==='on';
    localStorage.setItem('grantly-smartmatch-profile',JSON.stringify(profile));
    const category=profile.category;
    const level=profile.level;
    const income=profile.income;
    const flags=[];
    if(['OBC','SC','ST'].includes(category)) flags.push('Check the relevant post-matric scholarship route for your category. These schemes are administered through state/UT processes and have specific income and course rules.');
    if(category==='OBC') flags.push('PM YASASVI Top Class Education in College may be worth checking if your institution and course are on the notified list and you meet the current income and other conditions.');
    if(level==='undergraduate') flags.push('Explore the PM-USP Central Sector Scheme only if you meet its Class XII merit, income, regular-course and other scheme conditions. It is not a general UG scholarship.');
    if(income==='private') flags.push('You can still explore merit-based and category-based schemes, but income thresholds will need to be checked individually.');
    if(!flags.length) flags.push('Start with the National Scholarship Portal scheme directory and eligibility checker. Your course, institution, marks and other scheme-specific rules will determine which opportunities fit.');
    const safeCourse=String(profile.course||'your course').replace(/[<>&"]/g,'');
    matchResults.hidden=false;
    const allSchemes=window.GRANTLY_SCHEMES||[];
    const northEast=["Assam","Arunachal Pradesh","Manipur","Meghalaya","Mizoram","Nagaland","Sikkim","Tripura"];
    function assessScheme(x){
      const tags=(x.category||"").toLowerCase(),name=x.name.toLowerCase(),course=safeCourse.toLowerCase();
      if(tags.includes("obc")&&category!=="OBC")return {kind:"not-match",label:"Category does not match",reason:"This listing is restricted to OBC/EBC/DNT applicants; your selected category is "+category+"."};
      if(tags.includes("sc")&&category!=="SC")return {kind:"not-match",label:"Category does not match",reason:"This listing is restricted to SC applicants; your selected category is "+category+"."};
      if(tags.includes("delhi")&&profile.state!=="Delhi")return {kind:"not-match",label:"Domicile does not match",reason:"This listing is Delhi-specific; your selected state/UT is "+profile.state+"."};
      if(name.includes("ishan uday")&&!northEast.includes(profile.state))return {kind:"not-match",label:"Region does not match",reason:"This scheme is for eligible students from the North Eastern Region."};
      if((name.includes("pragati")||name.includes("swanath"))&&/(bds|dental|medical|mbbs|nursing)/.test(course))return {kind:"not-match",label:"Course restriction likely",reason:"This AICTE listing is for approved technical degree programmes; a health-professional course such as "+safeCourse+" is not a match on the information available."};
      if(name.includes("disabilities"))return {kind:"needs-info",label:"More profile details needed",reason:"This route requires disability-related eligibility details that SmartMatch does not currently collect. It is shown so you can review it if applicable."};
      if(name.includes("renewal"))return {kind:"needs-info",label:"Renewal applicants only",reason:"The current listing is for existing scholarship holders. It is relevant only if you already hold this award and meet renewal rules."};
      if(tags.includes("obc")&&category==="OBC")return {kind:"potential",label:"Potential match",reason:"Your category matches the scheme audience. Verify income, institution, course coverage and any notified-institution restrictions."};
      if(level==="undergraduate"&&tags.includes("merit"))return {kind:"needs-info",label:"Check academic conditions",reason:"Your study level may fit, but marks, income, fresh/renewal status and course conditions still need checking."};
      return {kind:"needs-info",label:"Check scheme conditions",reason:"Your profile does not rule this out, but the listing needs additional course, institution, income or applicant-status checks."};
    }
    const assessed=allSchemes.map(x=>({scheme:x,...assessScheme(x)}));
    const potential=assessed.filter(x=>x.kind==="potential");
    const review=assessed.filter(x=>x.kind==="needs-info");
    const excluded=assessed.filter(x=>x.kind==="not-match");
    const renderScheme=x=>'<article class="match-opportunity '+(x.kind==="not-match"?"match-not-fit":"")+'"><span>'+x.label.toUpperCase()+'</span><b>'+x.scheme.name+'</b><p>'+x.scheme.summary+'</p><small>'+x.reason+'</small><div class="match-scheme-actions"><button type="button" data-match-save="'+x.scheme.id+'">＋ Save to my applications</button><a href="/scholarships.html?search='+encodeURIComponent(x.scheme.name)+'">View details ↗</a></div></article>';
    const candidateHtml='<div class="match-opportunities"><div class="match-results-count"><b>'+potential.length+'</b> potential matches <span>·</span> <b>'+review.length+'</b> more to review <span>·</span> '+allSchemes.length+' total catalogue listings</div><h4>Potential matches for your profile</h4>'+(potential.length?potential.map(renderScheme).join(''):'<p>No direct category/location match in the current catalogue. Review the conditional listings below.</p>')+'<h4 class="match-review-heading">Other scholarships worth checking</h4>'+review.map(renderScheme).join('')+'<details class="match-excluded"><summary>See '+excluded.length+' listings that do not currently match your preferences</summary>'+excluded.map(renderScheme).join('')+'</details><p class="match-catalogue-link"><a href="/scholarships.html">Open the complete GRANTLY scholarship directory ↗</a></p></div>';
    matchResults.innerHTML='<div class="match-result-heading"><span class="chapter">YOUR PROFILE IS READY</span><h3>Your next steps, <em>not guesswork.</em></h3><p>We’ve saved your study profile on this device. These are potential routes to investigate, not confirmed eligibility matches.</p></div><div class="profile-summary"><span><small>FIELD</small><b>'+safeCourse+'</b></span><span><small>STUDY LEVEL</small><b>'+level.replace(/^\w/,c=>c.toUpperCase())+'</b></span><span><small>STATE / UT</small><b>'+profile.state+'</b></span><span><small>CATEGORY</small><b>'+category+'</b></span></div>'+candidateHtml+'<div class="match-guidance"><h4>Important checks</h4>'+flags.map((item,i)=>'<p><b>0'+(i+1)+'</b>'+item+'</p>').join('')+'</div><div class="match-actions"><a href="/scholarships.html">Explore all scholarships ↗</a><a href="/passport.html">Create my Scholarship Passport ↗</a><button type="button" id="edit-match">Edit my profile</button></div><p class="match-disclaimer">These are discovery pointers, not an eligibility decision. Always read the latest scheme guidelines and confirm with your institution or the scheme authority.</p>';
    matchResults.querySelectorAll("[data-match-save]").forEach(btn=>btn.addEventListener("click",()=>{
      const scheme=allSchemes.find(x=>x.id===btn.dataset.matchSave);if(!scheme)return;
      const key="grantly-application-tracker-v1";let saved=[];try{saved=JSON.parse(localStorage.getItem(key)||"[]");if(!Array.isArray(saved))saved=[];}catch(e){}
      if(saved.some(x=>x.catalogueId===scheme.id)){btn.textContent="✓ Already saved";btn.disabled=true;return;}
      saved.push({id:"cat-"+scheme.id,name:scheme.name,provider:scheme.provider,deadline:scheme.deadline,status:"Interested",url:scheme.source,notes:"Saved from SmartMatch. "+scheme.summary+" Verify eligibility before applying.",catalogueId:scheme.id});
      localStorage.setItem(key,JSON.stringify(saved));btn.textContent="✓ Saved to applications";btn.disabled=true;
    }));
    matchResults.scrollIntoView({behavior:'smooth',block:'start'});
    const edit=document.querySelector('#edit-match');
    if(edit) edit.addEventListener('click',()=>{matchResults.hidden=true;smartForm.scrollIntoView({behavior:'smooth',block:'center'});});
  });
}

;
// GRANTLY Application Tracker — browser-local prototype.
(function(){
 const form=document.querySelector("#tracker-form"), list=document.querySelector("#tracker-list");
 if(!form||!list)return;
 const key="grantly-application-tracker-v1";
 let records=[],editing=null,filter="All";
 try{records=JSON.parse(localStorage.getItem(key)||"[]");if(!Array.isArray(records))records=[];}catch(e){records=[];}
 const $=s=>document.querySelector(s);
 const esc=s=>String(s||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});
 const validUrl=s=>{try{let u=new URL(s);return u.protocol==="https:"||u.protocol==="http:"?u.href:"";}catch(e){return "";}};
 function persist(){localStorage.setItem(key,JSON.stringify(records));}
 function stats(){
  $("#tracker-total").textContent=String(records.length).padStart(2,"0");
  $("#tracker-active").textContent=String(records.filter(x=>x.status==="Interested"||x.status==="Preparing").length).padStart(2,"0");
  $("#tracker-submitted").textContent=String(records.filter(x=>x.status==="Submitted").length).padStart(2,"0");
  $("#tracker-awarded").textContent=String(records.filter(x=>x.status==="Approved").length).padStart(2,"0");
 }
 function render(){
  stats();
  document.querySelectorAll(".tracker-filters button").forEach(b=>b.classList.toggle("active",b.dataset.filter===filter));
  let rows=records.filter(x=>filter==="All"||x.status===filter).sort((a,b)=>(a.deadline||"9999").localeCompare(b.deadline||"9999"));
  if(!rows.length){
   list.innerHTML='<div class="tracker-empty"><span>✧</span><h4>'+(records.length?"Nothing in this chapter yet.":"Your list starts with one opportunity.")+'</h4><p>'+(records.length?"Try another stage filter.":"Add a scholarship you want to explore, then keep track of every step.")+'</p><button type="button" id="tracker-empty-add">＋ Add an opportunity</button></div>';
   $("#tracker-empty-add").addEventListener("click",()=>openForm());return;
  }
  list.innerHTML=rows.map(x=>{
   let u=validUrl(x.url),d=x.deadline?new Date(x.deadline+"T00:00:00").toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"}):"No deadline added";
   return '<article class="tracker-card"><div class="tracker-card-top"><span class="tracker-status">'+esc(x.status)+'</span><span class="tracker-deadline">◷ '+esc(d)+'</span></div><h4>'+esc(x.name)+'</h4><p class="tracker-provider">'+esc(x.provider||"Provider not added")+'</p>'+(x.notes?'<p class="tracker-notes">'+esc(x.notes)+'</p>':"")+'<div class="tracker-card-bottom">'+(u?'<a href="'+esc(u)+'" target="_blank" rel="noopener">Official page ↗</a>':"<span></span>")+'<button type="button" data-edit="'+esc(x.id)+'">Edit details</button></div></article>';
  }).join("");
  list.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>openForm(b.dataset.edit)));
 }
 function openForm(id){
  editing=id||null;form.reset();let x=records.find(r=>r.id===id);
  $("#tracker-form-heading").textContent=x?"Edit opportunity":"Add an opportunity";$("#tracker-delete").hidden=!x;
  if(x)Object.keys(x).forEach(k=>{if(form.elements[k])form.elements[k].value=x[k];});
  form.hidden=false;form.scrollIntoView({behavior:"smooth",block:"center"});form.elements.name.focus();
 }
 function closeForm(){form.hidden=true;editing=null;form.reset();}
 $("#tracker-add").addEventListener("click",()=>openForm());
 $("#tracker-cancel").addEventListener("click",closeForm);
 form.addEventListener("submit",function(e){
  e.preventDefault();let d=Object.fromEntries(new FormData(form).entries());
  if(d.url&&!validUrl(d.url)){alert("Please enter a valid http or https link.");return;}
  if(editing)records=records.map(x=>x.id===editing?Object.assign({},x,d):x);
  else records.push(Object.assign({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7)},d));
  persist();closeForm();render();
 });
 $("#tracker-delete").addEventListener("click",function(){if(!editing)return;records=records.filter(x=>x.id!==editing);persist();closeForm();render();});
 document.querySelectorAll(".tracker-filters button").forEach(b=>b.addEventListener("click",()=>{filter=b.dataset.filter;render();}));
 render();
})();

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
    card(saved,session.user.email);
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
  const checks=[["SmartMatch profile completed",Boolean(p.course&&p.state&&p.level&&p.category)],["Passport details added",Boolean(pass.name&&pass.institution&&pass.course)],["At least one opportunity saved",apps.length>0],["Application deadline recorded",apps.some(x=>x.deadline)],["Documents checklist started",docs.length>0],["At least one application submitted",apps.some(x=>x.status==="Submitted"||x.status==="Approved")]];
  const score=Math.round(checks.filter(x=>x[1]).length/checks.length*100);
  $("#readiness-number").textContent=score+"%";$("#readiness-bar").style.width=score+"%";
  $("#readiness-items").innerHTML=checks.map(x=>'<div class="readiness-item"><span class="'+(x[1]?"done":"pending")+'">'+(x[1]?"✓":"○")+'</span>'+x[0]+'</div>').join("");
 }
 renderEligibility();renderDeadlines();renderCompare();renderReadiness();
})();

/* GRANTLY in-app scholarship catalogue — curated summaries with source provenance. */
(function(){
 const root=document.querySelector("#scholarship-results");if(!root)return;
 const records=[
 {id:"yasasvi-college",name:"PM YASASVI — Top Class Education in College",provider:"Department of Social Justice & Empowerment",category:"obc welfare",audience:"OBC, EBC and DNT students",level:"College / undergraduate and eligible higher education",deadline:"2026-11-30",summary:"Central sector support for eligible students admitted to notified institutions. Institution/course list, income ceiling and detailed conditions must be checked.",source:"https://scholarships.gov.in/All-Scholarships",sourceLabel:"National Scholarship Portal"},
 {id:"delhi-obc-post",name:"PM YASASVI Post-Matric Scholarship — Delhi",provider:"Government of NCT of Delhi",category:"obc welfare delhi",audience:"OBC, EBC and DNT students domiciled in Delhi",level:"Post-matric studies",deadline:"2027-02-15",matchTerms:"bds dental medical health professional degree undergraduate",summary:"Delhi domicile scheme listed on NSP for AY 2026–27. Confirm domicile, category certificate, income and course conditions in the current scheme notice.",source:"https://scholarships.gov.in/allschemesdomicile?stateidschems=76",sourceLabel:"NSP — Delhi domicile schemes"},
 {id:"delhi-sc-post",name:"Post-Matric Scholarship for SC Students — Delhi",provider:"Government of NCT of Delhi",category:"sc welfare delhi",audience:"SC students domiciled in Delhi",level:"Post-matric studies",deadline:"2027-02-15",summary:"Delhi domicile scheme listed on NSP for AY 2026–27. Verify course, institution, income, domicile and certificate requirements before applying.",source:"https://scholarships.gov.in/allschemesdomicile?stateidschems=76",sourceLabel:"NSP — Delhi domicile schemes"},
 {id:"pmusp-renewal",name:"PM-USP Central Sector Scheme (CSSS) — Renewal",provider:"Department of Higher Education",category:"merit",audience:"Existing scholarship holders applying for renewal",level:"College and university students",deadline:"2026-11-30",summary:"The current NSP listing specifically identifies the renewal application window. Fresh applicants should not assume this listing is open to them; check the scheme notice.",source:"https://scholarships.gov.in/All-Scholarships",sourceLabel:"National Scholarship Portal"},
 {id:"pragati-degree",name:"AICTE Pragati Scholarship — Technical Degree",provider:"All India Council for Technical Education",category:"merit",audience:"Girl students meeting the AICTE scheme conditions",level:"AICTE-approved technical degree programmes",deadline:"2026-11-30",summary:"Listed for AY 2026–27 on NSP. This is for eligible technical degree programmes; do not assume every university or professional course qualifies.",source:"https://scholarships.gov.in/All-Scholarships",sourceLabel:"National Scholarship Portal"},
 {id:"swanath-degree",name:"AICTE Swanath Scholarship — Technical Degree",provider:"All India Council for Technical Education",category:"welfare",audience:"Students meeting the scheme's specified vulnerable-background criteria",level:"AICTE-approved technical degree programmes",deadline:"2026-11-30",summary:"Listed for AY 2026–27 on NSP. Eligibility is restricted to specified applicant groups and eligible technical institutions/programmes.",source:"https://scholarships.gov.in/All-Scholarships",sourceLabel:"National Scholarship Portal"},
 {id:"ishan-uday",name:"Ishan Uday Special Scholarship Scheme",provider:"University Grants Commission",category:"merit",audience:"Eligible students from the North Eastern Region",level:"Undergraduate studies",deadline:"2026-11-30",summary:"Listed for AY 2026–27 on NSP. Domicile, income, admission and other scheme conditions apply; verify the current UGC guidelines.",source:"https://scholarships.gov.in/All-Scholarships",sourceLabel:"National Scholarship Portal"},
 {id:"postmatric-disability",name:"Post-Matric Scholarship for Students with Disabilities",provider:"Department of Empowerment of Persons with Disabilities",category:"disability welfare",audience:"Eligible students with benchmark disabilities",level:"Post-matric studies",deadline:"2026-11-30",summary:"Listed for AY 2026–27 on NSP. Disability certification, course, income and other scheme rules apply. NSP notes UDID consent requirements for disabled applicants.",source:"https://scholarships.gov.in/All-Scholarships",sourceLabel:"National Scholarship Portal"}
 ];
 const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 window.GRANTLY_SCHEMES=records;
 const search=document.querySelector("#scholarship-search"),cat=document.querySelector("#scholarship-category"),status=document.querySelector("#scholarship-status"),count=document.querySelector("#catalogue-count");
 const initialSearch=new URLSearchParams(location.search).get("search");if(initialSearch)search.value=initialSearch;
 function render(){
  const q=(search.value||"").toLowerCase().trim(),c=cat.value,s=status.value;
  const rows=records.filter(x=>(!q||[x.name,x.provider,x.audience,x.level,x.summary,x.matchTerms||""].join(" ").toLowerCase().includes(q))&&(c==="all"||x.category.split(" ").includes(c))&&(s==="all"||(s==="open"&&x.deadline>="2026-11-07")||(s==="soon"&&x.deadline<="2026-11-30")));
  count.textContent=rows.length+" opportunities in this catalogue";
  root.innerHTML=rows.map(x=>'<article class="scholarship-card"><div class="scholarship-card-top"><span class="scheme-tag">'+(x.category.includes("merit")?"MERIT BASED":"WELFARE / CATEGORY BASED")+'</span><span class="scheme-deadline">APPLY BY '+new Date(x.deadline+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})+'</span></div><h2>'+esc(x.name)+'</h2><p class="scheme-provider">'+esc(x.provider)+'</p><div class="scheme-facts"><span><small>WHO IT IS FOR</small><b>'+esc(x.audience)+'</b></span><span><small>STUDY LEVEL</small><b>'+esc(x.level)+'</b></span></div><p class="scheme-summary">'+esc(x.summary)+'</p><div class="scheme-actions"><button type="button" data-save="'+esc(x.id)+'">＋ Save to my applications</button><a href="'+esc(x.source)+'" target="_blank" rel="noopener">Verify source ↗</a></div><small class="scheme-source">SOURCE: '+esc(x.sourceLabel)+' · NSP AY 2026–27</small></article>').join("")||'<div class="catalogue-empty">No matching scholarships in this starter catalogue. Try another filter or broaden your search.</div>';
  root.querySelectorAll("[data-save]").forEach(btn=>btn.addEventListener("click",()=>{
   const x=records.find(r=>r.id===btn.dataset.save),key="grantly-application-tracker-v1";let list=[];try{list=JSON.parse(localStorage.getItem(key)||"[]");if(!Array.isArray(list))list=[];}catch(e){}
   if(list.some(r=>r.catalogueId===x.id)){btn.textContent="✓ Already in your applications";btn.disabled=true;return;}
   list.push({id:"cat-"+x.id,name:x.name,provider:x.provider,deadline:x.deadline,status:"Interested",url:x.source,notes:"Saved from GRANTLY catalogue. Verify eligibility and application instructions at the source.",catalogueId:x.id});
   localStorage.setItem(key,JSON.stringify(list));btn.textContent="✓ Added to my applications";btn.disabled=true;
  }));
 }
 [search,cat,status].forEach(el=>el.addEventListener("input",render));render();
})();
/* GRANTLY account-aware navigation */
(function(){
 const nav=document.querySelector(".topbar");if(!nav)return;
 const slot=document.createElement("a");slot.className="account-nav";slot.href="/login.html?next=/passport.html";slot.textContent="Sign in ↗";
 const cta=nav.querySelector(".nav-cta");if(cta)cta.insertAdjacentElement("beforebegin",slot);else nav.appendChild(slot);
 const A=window.hatchable&&window.hatchable.auth;if(!A)return;
 A.getSession().then(s=>{
  if(!s||!s.user)return;
  slot.href="/passport.html";slot.textContent="My passport ↗";slot.title=s.user.email;
 }).catch(()=>{});
})();