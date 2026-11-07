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
    matchResults.innerHTML='<div class="match-result-heading"><span class="chapter">YOUR PROFILE IS READY</span><h3>Your next steps, <em>not guesswork.</em></h3><p>We’ve saved your study profile on this device. Here are the official routes worth checking first.</p></div><div class="profile-summary"><span><small>FIELD</small><b>'+safeCourse+'</b></span><span><small>STUDY LEVEL</small><b>'+level.replace(/^\w/,c=>c.toUpperCase())+'</b></span><span><small>STATE / UT</small><b>'+profile.state+'</b></span><span><small>CATEGORY</small><b>'+category+'</b></span></div><div class="match-guidance"><h4>Where to look next</h4>'+flags.map((item,i)=>'<p><b>0'+(i+1)+'</b>'+item+'</p>').join('')+'</div><div class="match-actions"><a href="https://scholarships.gov.in/All-Scholarships" target="_blank" rel="noopener">Browse official schemes ↗</a><a href="https://scholarships.gov.in/Students" target="_blank" rel="noopener">Open eligibility checker ↗</a><button type="button" id="edit-match">Edit my profile</button></div><p class="match-disclaimer">These are discovery pointers, not an eligibility decision. Always read the latest official scheme guidelines and confirm with your institution or the scheme authority.</p>';
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