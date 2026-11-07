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
const hero=document.querySelector('.world-hero');
const campus=document.querySelector('.distant-campus');
const world=document.querySelector('.academic-world');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const movingLayers=[...document.querySelectorAll('.floating-book,.floating-paper,.paper-plane,.orbit-star,.grand-stair,.foreground-books')];
let framePending=false;
function updateJourney(){
  if(!hero||reducedMotion)return;
  const bounds=hero.getBoundingClientRect();
  const progress=Math.max(0,Math.min(1,-bounds.top/Math.max(1,hero.offsetHeight)));
  // The campus travels backwards; foreground objects pass at distinct depths.
  if(campus){
    campus.style.transform='translate3d(0,'+(progress*150)+'px,0) scale('+(1-progress*.17)+')';
    campus.style.opacity=String(Math.max(0,1-progress*1.12));
  }
  if(world)world.style.setProperty('--journey-progress',progress.toFixed(3));
  movingLayers.forEach(el=>{
    const speed=el.classList.contains('grand-stair')?.5:
      el.classList.contains('foreground-books')?.22:
      el.classList.contains('paper-plane')?1.05:
      el.classList.contains('floating-paper')?.72:
      el.classList.contains('floating-book')?.42:.82;
    el.style.translate='0 '+(progress*hero.offsetHeight*speed*.5)+'px';
    el.style.opacity=String(Math.max(.04,1-progress*(speed>.8?1.35:.65)));
  });
}
function onScroll(){
  if(framePending)return;
  framePending=true;
  requestAnimationFrame(()=>{updateJourney();framePending=false;});
}
if(!reducedMotion){
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  updateJourney();
}
const revealTargets=document.querySelectorAll('.story-copy,.story-art,.scene,.discovery-heading');
if('IntersectionObserver' in window){
  const reveal=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('in-view');reveal.unobserve(entry.target);}
    });
  },{threshold:.12,rootMargin:'0px 0px -35px 0px'});
  revealTargets.forEach(el=>reveal.observe(el));
}else revealTargets.forEach(el=>el.classList.add('in-view'));