(function(){
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
})();