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

// Keep one illustrated academic landscape fixed behind the entire journey.
const world=document.querySelector('.academic-world');
const hero=document.querySelector('.world-hero');
if(world&&hero){
  const heroFooter=world.querySelector('.hero-bottom');
  if(heroFooter) hero.appendChild(heroFooter);
  document.body.appendChild(world);
}

const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets=document.querySelectorAll('.story-copy,.story-art,.scene,.discovery-heading');
if('IntersectionObserver' in window&&!reducedMotion){
  const reveal=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('in-view');reveal.unobserve(entry.target);}
    });
  },{threshold:.12,rootMargin:'0px 0px -35px 0px'});
  revealTargets.forEach(el=>reveal.observe(el));
}else revealTargets.forEach(el=>el.classList.add('in-view'));