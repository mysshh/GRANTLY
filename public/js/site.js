(function(){
const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav-links, .ref-nav');
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
})();