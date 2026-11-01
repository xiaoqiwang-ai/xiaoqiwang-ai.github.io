const root=document.documentElement;
const theme=document.querySelector('#theme-toggle');
function syncTheme(){const dark=root.classList.contains('dark');theme.setAttribute('aria-pressed',String(dark));theme.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`)}
syncTheme();theme.addEventListener('click',()=>{root.classList.toggle('dark');try{localStorage.setItem('xiaoqi-theme',root.classList.contains('dark')?'dark':'light')}catch{}syncTheme()});
const menu=document.querySelector('#menu-toggle'),nav=document.querySelector('#nav-links');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
const search=document.querySelector('#paper-search'),papers=[...document.querySelectorAll('.publication')],filters=[...document.querySelectorAll('[data-filter]')],clear=document.querySelector('#clear-search');let category='All';
function filterPapers(){const query=search.value.toLowerCase().trim();let count=0;papers.forEach(p=>{const show=(category==='All'||p.dataset.category===category)&&query.split(/\s+/).every(w=>p.dataset.search.includes(w));p.hidden=!show;if(show)count++});document.querySelectorAll('.publication-group').forEach(g=>{g.hidden=![...g.querySelectorAll('.publication')].some(p=>!p.hidden)});document.querySelector('#result-count').textContent=`${count}${count===14?'':' of 14'} publications`;document.querySelector('#no-results').hidden=count!==0;clear.hidden=!(query||category!=='All')}
search.addEventListener('input',filterPapers);filters.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.filter;filters.forEach(f=>{const active=f===b;f.classList.toggle('selected',active);f.setAttribute('aria-pressed',String(active))});filterPapers()}));
clear.addEventListener('click',()=>{category='All';search.value='';filters.forEach(f=>{const active=f.dataset.filter==='All';f.classList.toggle('selected',active);f.setAttribute('aria-pressed',String(active))});filterPapers();search.focus()});
const sections=[...document.querySelectorAll('main>section[id]')];
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.filter(e=>e.isIntersecting).forEach(e=>{document.querySelectorAll('.nav-links a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))})},{rootMargin:'-15% 0px -65% 0px'});sections.forEach(s=>observer.observe(s))}

const petDialog=document.querySelector('#pet-lightbox');
if(petDialog){
 const petButtons=[...document.querySelectorAll('.pet-photo')];
 const fullPhoto=document.querySelector('#pet-full-image');
 let petIndex=0;
 function showPet(index){
  petIndex=(index+petButtons.length)%petButtons.length;
  const photo=petButtons[petIndex].querySelector('img');
  fullPhoto.src=photo.src;fullPhoto.alt=photo.alt;
  document.querySelector('#pet-photo-count').textContent=`${petIndex+1} / ${petButtons.length}`;
 }
 petButtons.forEach((button,index)=>button.addEventListener('click',()=>{
  showPet(index);petDialog.showModal();document.body.classList.add('pet-viewing');
 }));
 petDialog.querySelector('.pet-close').addEventListener('click',()=>petDialog.close());
 document.querySelector('#pet-previous').addEventListener('click',()=>showPet(petIndex-1));
 document.querySelector('#pet-next').addEventListener('click',()=>showPet(petIndex+1));
 petDialog.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();showPet(petIndex+(event.key==='ArrowLeft'?-1:1));
  }
 });
 petDialog.addEventListener('click',event=>{if(event.target===petDialog)petDialog.close()});
 petDialog.addEventListener('close',()=>document.body.classList.remove('pet-viewing'));
}
