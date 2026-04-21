const dot=document.getElementById('cursor-dot'),ring=document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px'});
function lerp(a,b,t){return a+(b-a)*t}
function animCursor(){rx=lerp(rx,mx,.12);ry=lerp(ry,my,.12);ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animCursor)}
animCursor();
document.querySelectorAll('a,button,.project-card,.skill-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-grow'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-grow'));
});
 
// Navbar
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>{nav.classList.toggle('stuck',window.scrollY>50)},{passive:true});
 
// Hamburger
const ham=document.getElementById('ham'),drawer=document.getElementById('drawer');
ham.addEventListener('click',()=>{ham.classList.toggle('open');drawer.classList.toggle('open');document.body.style.overflow=drawer.classList.contains('open')?'hidden':''});
document.querySelectorAll('.drawer-link').forEach(l=>{l.addEventListener('click',()=>{ham.classList.remove('open');drawer.classList.remove('open');document.body.style.overflow=''})});
 
// Scroll reveal
const srEls=document.querySelectorAll('.sr,.sr-left,.sr-right');
const srObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('up');srObs.unobserve(e.target)}})},{threshold:.13});
srEls.forEach(el=>srObs.observe(el));
 
// Skill bars
const bars=document.querySelectorAll('.bar-fill');
const barObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.style.width=e.target.dataset.w+'%';barObs.unobserve(e.target)}})},{threshold:.5});
bars.forEach(b=>barObs.observe(b));
 
// Contact form
function handleSend(){
  const n=document.getElementById('name').value.trim(),em=document.getElementById('email').value.trim(),msg=document.getElementById('message').value.trim();
  if(!n||!em||!msg){alert('Please fill in name, email and message.');return;}
  const btn=document.getElementById('sendBtn'),toast=document.getElementById('toast');
  btn.disabled=true;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
  setTimeout(()=>{btn.innerHTML='<i class="fa-solid fa-check"></i> Sent!';toast.style.display='block';
    setTimeout(()=>{btn.disabled=false;btn.innerHTML='<i class="fa-solid fa-paper-plane"></i> Send Message';toast.style.display='none';['name','email','subject','message'].forEach(id=>{document.getElementById(id).value=''})},4000)},1400);
}
 
// Stagger hero chips
document.querySelectorAll('.chip').forEach((c,i)=>{c.style.opacity='0';c.style.transform='translateY(12px)';c.style.transition=`opacity .5s ${.6+i*.08}s ease,transform .5s ${.6+i*.08}s ease`;requestAnimationFrame(()=>{c.style.opacity='1';c.style.transform='translateY(0)'})});