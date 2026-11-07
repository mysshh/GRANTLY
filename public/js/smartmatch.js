(function(){
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
    if(category==='OBC') flags.push('PM YASASVI Top Class Education in College may be worth checking only if your institution and course are on the notified list and you meet the current income and other conditions.');
    if(!profile.institution) flags.push('Add your institution to narrow institution-restricted opportunities. Some schemes require admission to a notified or approved college.');
    if(!profile.academic_score) flags.push('Add your latest marks or CGPA where available. Merit schemes may depend on Class XII rank, qualifying marks or course-specific academic rules.');
    if(level==='undergraduate') flags.push('Explore the PM-USP Central Sector Scheme only if you meet its Class XII merit, income, regular-course and other scheme conditions. It is not a general UG scholarship.');
    if(income==='private') flags.push('You can still explore merit-based and category-based schemes, but income thresholds will need to be checked individually.');
    if(!flags.length) flags.push('Start with the National Scholarship Portal scheme directory and eligibility checker. Your course, institution, marks and other scheme-specific rules will determine which opportunities fit.');
    const safeCourse=String(profile.course||'your course').replace(/[<>&"]/g,'');
    const safeInstitution=String(profile.institution||"Not added").replace(/[<>&"]/g,"");
    const safeScore=String(profile.academic_score||"Not added").replace(/[<>&"]/g,"");
    matchResults.hidden=false;
    const allSchemes=window.GRANTLY_SCHEMES||[];
    const northEast=["Assam","Arunachal Pradesh","Manipur","Meghalaya","Mizoram","Nagaland","Sikkim","Tripura"];
    function assessScheme(x){
      const tags=(x.category||"").toLowerCase(),name=x.name.toLowerCase(),course=safeCourse.toLowerCase();
      if(tags.includes("obc")&&category!=="OBC")return {kind:"not-match",label:"Category does not match",reason:"This listing is restricted to OBC/EBC/DNT applicants; your selected category is "+category+"."};
      if(tags.split(" ").includes("sc")&&category!=="SC")return {kind:"not-match",label:"Category does not match",reason:"This listing is restricted to SC applicants; your selected category is "+category+"."};
      if(tags.split(" ").includes("st")&&category!=="ST")return {kind:"not-match",label:"Category does not match",reason:"This listing is restricted to ST applicants; your selected category is "+category+"."};
      if(tags.includes("delhi")&&profile.state!=="Delhi")return {kind:"not-match",label:"Domicile does not match",reason:"This listing is Delhi-specific; your selected state/UT is "+profile.state+"."};
      if(tags.includes("northeast")&&!northEast.includes(profile.state))return {kind:"not-match",label:"Region does not match",reason:"This scheme is for eligible students from the North Eastern Region."};
      if(tags.includes("school")&&level!=="school")return {kind:"not-match",label:"Study level does not match",reason:"This is a school-level scheme, while your selected study level is "+level+"."};
      if(tags.includes("postgraduate")&&level!=="postgraduate")return {kind:"not-match",label:"Study level does not match",reason:"This listing is for postgraduate study, not "+level+"."};
      if(tags.includes("technical")&&/(bds|dental|medical|mbbs|nursing)/.test(course))return {kind:"not-match",label:"Course restriction likely",reason:"This AICTE listing is limited to approved technical programmes; "+safeCourse+" is not established as an eligible course."};
      if(tags.includes("agriculture")&&!/(agri|agriculture|horticulture|veterinary|forestry)/.test(course))return {kind:"not-match",label:"Course does not match",reason:"This ICAR scholarship is for agricultural education programmes, not "+safeCourse+"."};
      if(tags.includes("railway")||tags.includes("police"))return {kind:"needs-info",label:"Special family eligibility",reason:"This scheme is limited to eligible wards/widows of specified service personnel. SmartMatch does not collect this family-service information."};
      if(tags.includes("disability"))return {kind:"needs-info",label:"More profile details needed",reason:"This route requires disability-related eligibility details that SmartMatch does not currently collect. It is shown so you can review it if applicable."};
      if(name.includes("renewal"))return {kind:"needs-info",label:"Renewal applicants only",reason:"The current listing is marked for renewal. It is relevant only if you already hold this award and meet renewal rules."};
      if(tags.includes("obc")&&category==="OBC")return {kind:"potential",label:"Potential match",reason:"Your category matches the scheme audience. Verify income, institution, course coverage and any notified-institution restrictions."};
      if(tags.includes("sc")&&category==="SC")return {kind:"potential",label:"Potential match",reason:"Your category matches the scheme audience. Verify income, institution, course coverage and notified-institution rules."};
      if(tags.split(" ").includes("st")&&category==="ST")return {kind:"potential",label:"Potential match",reason:"Your category matches the scheme audience. Verify income, notified-institution, course and fresh/renewal rules."};
      if(level==="undergraduate"&&tags.includes("merit"))return {kind:"needs-info",label:"Check academic conditions",reason:"Your study level may fit, but marks, income, fresh/renewal status and course conditions still need checking."};
      return {kind:"needs-info",label:"Check scheme conditions",reason:"Your profile does not rule this out, but the listing needs additional course, institution, income or applicant-status checks."};
    }
    const assessed=allSchemes.map(x=>({scheme:x,...assessScheme(x)}));
    const potential=assessed.filter(x=>x.kind==="potential");
    const review=assessed.filter(x=>x.kind==="needs-info");
    const excluded=assessed.filter(x=>x.kind==="not-match");
    const renderScheme=x=>'<article class="match-opportunity '+(x.kind==="not-match"?"match-not-fit":"")+'"><span>'+x.label.toUpperCase()+'</span><b>'+x.scheme.name+'</b><p>'+x.scheme.summary+'</p><small>'+x.reason+'</small><div class="match-scheme-actions"><button type="button" data-match-save="'+x.scheme.id+'">＋ Save to my applications</button><a href="/scholarships.html?search='+encodeURIComponent(x.scheme.name)+'">View details ↗</a></div></article>';
    const candidateHtml='<div class="match-opportunities"><div class="match-results-count"><b>'+potential.length+'</b> potential matches <span>·</span> <b>'+review.length+'</b> more to review <span>·</span> '+allSchemes.length+' total catalogue listings</div><h4>Potential matches for your profile</h4>'+(potential.length?potential.map(renderScheme).join(''):'<p>No direct category/location match in the current catalogue. Review the conditional listings below.</p>')+'<h4 class="match-review-heading">Other scholarships worth checking</h4>'+review.map(renderScheme).join('')+'<details class="match-excluded"><summary>See '+excluded.length+' listings that do not currently match your preferences</summary>'+excluded.map(renderScheme).join('')+'</details><p class="match-catalogue-link"><a href="/scholarships.html">Open the complete GRANTLY scholarship directory ↗</a></p></div>';
    matchResults.innerHTML='<div class="match-result-heading"><span class="chapter">YOUR PROFILE IS READY</span><h3>Your next steps, <em>not guesswork.</em></h3><p>We’ve saved your study profile on this device. These are potential routes to investigate, not confirmed eligibility matches.</p></div><div class="profile-summary"><span><small>FIELD</small><b>'+safeCourse+'</b></span><span><small>STUDY LEVEL</small><b>'+level.replace(/^\w/,c=>c.toUpperCase())+'</b></span><span><small>STATE / UT</small><b>'+profile.state+'</b></span><span><small>CATEGORY</small><b>'+category+'</b></span><span><small>INSTITUTION</small><b>'+safeInstitution+'</b></span><span><small>ACADEMIC SCORE</small><b>'+safeScore+'</b></span></div>'+candidateHtml+'<div class="match-guidance"><h4>Important checks</h4>'+flags.map((item,i)=>'<p><b>0'+(i+1)+'</b>'+item+'</p>').join('')+'</div><div class="match-actions"><a href="/scholarships.html">Explore all scholarships ↗</a><a href="/passport.html">Create my Scholarship Passport ↗</a><button type="button" id="edit-match">Edit my profile</button></div><p class="match-disclaimer">These are discovery pointers, not an eligibility decision. Always read the latest scheme guidelines and confirm with your institution or the scheme authority.</p>';
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
})();