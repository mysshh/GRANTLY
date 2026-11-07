(function(){
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
})();