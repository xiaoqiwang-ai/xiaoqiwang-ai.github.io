import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {renderChart} from './dist/assets/results-model.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const d=JSON.parse(readFileSync(path.join(root,'content.json'),'utf8'));
const resultData=JSON.parse(readFileSync(path.join(root,'results.json'),'utf8'));
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
 scholar:'<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11v6q6 5 12 0v-6M22 9v7"/>',
 linkedin:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.1M11 17v-7m0 3q0-4 5-3v7"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
 moon:'<path d="M20.5 13A9 9 0 0 1 11 3.5 9 9 0 1 0 20.5 13Z"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 profile:'<rect x="2" y="5" width="20" height="15" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M4 17q4-5 8 0m2-7h5m-5 4h5"/>',
 sparkle:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
 search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>'
};
const icon=n=>`<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[n]}</svg>`;
const external=(url,label,cls='')=>`<a class="${cls}" href="${e(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
const social=(url,label,n)=>external(url,icon(n),`social-link social-${n}`).replace('<a ',`<a aria-label="${label}" title="${label}" `);
const cv='/uploads/Xiaoqi_Wang_CV_Nov_2026.pdf';
const heading=(iconName,title)=>`<div class="heading-with-icon"><span class="heading-icon">${icon(iconName)}</span><h2>${title}</h2></div>`;
const pubMap=Object.fromEntries(d.publications.map(p=>[p.id,p]));
function project(text,id){
 const split=text.indexOf(':');
 const title=text.slice(0,split),body=text.slice(split+1).trim();
 // The opening sentence and complete description both come directly from the CV.
 const first=body.match(/^.*?\.(?:\s|$)/)?.[0].trim()||body;
 const remaining=body.slice(first.length).trim();
 const paper=pubMap[id];
 const paperStatus=id==='reactdrive'&&!paper?.url?`<span class="paper-status">${icon('clock')}<span>Paper coming soon</span></span>`:'';
 return `<article class="project" id="project-${id}"><h4>${e(title)}</h4><p>${e(first)}</p>${remaining||resultData[id]?`<button class="result-toggle" id="toggle-${id}" type="button" aria-expanded="true" aria-controls="results-${id}">Results &amp; approach <span class="toggle-sign" aria-hidden="true">+</span></button><div class="project-panel" id="results-${id}" role="region" aria-labelledby="toggle-${id}">${resultData[id]?renderChart(id,resultData):''}${remaining?`<p class="approach-copy">${e(remaining)}</p>`:''}</div>`:''}${paper?.url?external(paper.url,`Paper ${icon('arrow')}`,'text-link'):paperStatus}</article>`;
}
const areaIntros=[
 'Research and production-scale autolabelling for reliable HD maps, from lane connectivity to global map aggregation.',
 'Open-vocabulary and in-context segmentation, connecting vision foundation models with manufacturing applications.',
 'Predicting future spatial relationships and simulating how surrounding traffic responds to ego-vehicle actions.'
];
const areaIds=['hd-maps','vision','world-models'];
const pairs=[['topoenhance','mapmergellm'],['use','prosam'],['spatialmind','reactdrive']];
const research=d.research.map((area,i)=>{
 const projects=area.bullets.filter(b=>pairs[i].some(id=>b.toLowerCase().startsWith(id+':')||b.toLowerCase().startsWith(id+' [')));
 const other=area.bullets.filter(b=>!projects.includes(b));
 const industry=area.industry;
 const industryText=industry?`<div class="industry-overview">${industry.paragraphs.map(t=>{
  let html=e(t);for(const phrase of industry.highlights)html=html.replace(e(phrase),`<strong>${e(phrase)}</strong>`);
  return `<p>${html}</p>`;
 }).join('')}</div><p class="related-research-label">Related research</p>`:'';
 return `<section class="research-area${industry?' industry-area':''}" id="${areaIds[i]}" aria-labelledby="area-${i}"><div class="area-heading"><span class="area-number">0${i+1}</span><div><h3 id="area-${i}">${e(industry?.title||area.title)}</h3>${industry?'':`<p>${areaIntros[i]}</p>`}</div></div>${industryText}<div class="project-grid">${projects.map((t,j)=>project(t,pairs[i][j])).join('')}</div>${other.map(t=>`<p class="application-note">${e(t)}</p>`).join('')}</section>`;
}).join('');
function pub(p){
 const authors=e(p.authors).replace(/Xiaoqi Wang/g,'<strong>Xiaoqi Wang</strong>');
 return `<article class="publication" id="paper-${p.id}" data-category="${e(p.category)}" data-search="${e([p.id,p.title,p.authors,p.venue,p.category].join(' ').toLowerCase())}"><div><h3 class="pub-title">${e(p.title)}</h3><p class="authors">${authors}.</p><p class="venue">${e(p.venue)}</p>${p.url?external(p.url,`${p.url.includes('arxiv')?'Preprint':'Paper'} ↗`,'paper-link'):''}</div></article>`;
}
const pubGroups=['selected','other'].map(g=>`<div class="publication-group" data-group="${g}"><h3 class="pub-group-title">${g==='selected'?'Selected Publications':'Other Publications'}</h3>${d.publications.filter(p=>p.group===g).map(pub).join('')}</div>`).join('');
const portrait=existsSync(path.join(root,'dist/assets/xiaoqi-wang.jpg'))?'<img class="avatar" src="/assets/xiaoqi-wang.jpg" alt="Xiaoqi Wang" width="200" height="200">':'<div class="avatar monogram" aria-label="Xiaoqi Wang initials">XW</div>';
const petGallery=d.pets?.length?`<section class="pet-album" aria-labelledby="pet-album-title"><h3 id="pet-album-title">Meet my furry family</h3><div class="pet-grid">${d.pets.map((pet,i)=>`<button class="pet-photo" type="button" data-pet-index="${i}" aria-label="Enlarge photo: ${e(pet.alt)}" aria-haspopup="dialog"><img src="${e(pet.src)}" alt="${e(pet.alt)}" width="${pet.width}" height="${pet.height}" loading="lazy" decoding="async"></button>`).join('')}</div></section>`:'';
const petLightbox=d.pets?.length?`<dialog class="pet-lightbox" id="pet-lightbox" aria-label="Pet photo album"><div class="pet-lightbox-inner"><button type="button" class="pet-close" aria-label="Close photo">×</button><img id="pet-full-image" alt=""><div class="pet-lightbox-controls"><button type="button" id="pet-previous" aria-label="Previous pet photo">← Previous</button><span id="pet-photo-count" aria-live="polite"></span><button type="button" id="pet-next" aria-label="Next pet photo">Next →</button></div></div></dialog>`:'';
const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Xiaoqi Wang | Research Scientist</title><meta name="description" content="Xiaoqi Wang — Staff Research Scientist at Bosch AI Research Center. Vision foundation models, HD map generation, generative world models, and predictive spatial reasoning.">
<meta name="author" content="Xiaoqi Wang"><meta name="theme-color" content="#f1f5f9"><link rel="canonical" href="https://yolandalalala.github.io/">
<meta property="og:title" content="Xiaoqi Wang | Research Scientist"><meta property="og:description" content="Vision foundation models and autonomous driving. Research, publications, and experience."><meta property="og:type" content="website"><meta property="og:url" content="https://yolandalalala.github.io/">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/academic.css"><link rel="stylesheet" href="/assets/theme.css"><link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="/assets/site.css?v=20261101-6"><link rel="stylesheet" href="/assets/results.css">
<script>try{if(localStorage.getItem('xiaoqi-theme')==='dark')document.documentElement.classList.add('dark')}catch{}</script>
</head><body><a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><nav class="nav-inner" aria-label="Main navigation"><span class="brand">Xiaoqi Wang</span><div class="nav-links" id="nav-links"><a href="#bio" class="active">About Me</a><a href="#research">Projects</a><a href="#experience">Experience</a><a href="#publications">Publications</a><a href="#contact">Contact</a></div><div class="nav-actions"><a class="nav-cv" href="${cv}" target="_blank" rel="noopener">CV ${icon('download')}</a><button class="icon-button" id="theme-toggle" type="button" aria-label="Switch to dark mode" aria-pressed="false">${icon('moon')}</button><button class="icon-button menu-toggle" id="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="nav-links">${icon('menu')}</button></div></nav></header>
<main id="main">
<section class="biography" id="bio"><div class="bio-layout wrap"><aside class="profile"><div class="avatar-wrapper">${portrait}</div><h1>Xiaoqi Wang</h1><p class="chinese-name" lang="zh-Hans">王筱淇</p><p class="pronouns">she / her</p><p class="role">Staff Research Scientist</p><p class="organization">Bosch AI Research Center</p><p class="location">Sunnyvale, California</p><div class="socials">${social('mailto:'+d.email,'Email Xiaoqi','mail')}${social(d.linkedin,'LinkedIn','linkedin')}${social(d.scholar,'Google Scholar','scholar')}</div></aside>
<div class="bio-main">${heading('profile','About Me')}${d.summary.split(/\n\n+/).map(p=>`<p class="bio-copy">${e(p)}</p>`).join('')}${petGallery}<div class="bio-actions"><a class="primary-button" href="${cv}" target="_blank" rel="noopener">${icon('download')} Download CV</a></div>
${heading('scholar','Education')}<div class="education-grid"><article class="education-item"><span class="education-date">2020 – 2024</span><h3>Ph.D. in Computer Science</h3><p>The Ohio State University</p><p class="education-note">Advisor: Prof. Han-Wei Shen</p></article><article class="education-item"><span class="education-date">2018 – 2019</span><h3>M.S. in Data Science</h3><p>Columbia University</p></article><article class="education-item"><span class="education-date">2013 – 2018</span><h3>Dual B.S. degrees in Machine Learning and Finance</h3><p>The Ohio State University</p></article></div>
<div class="interests"><h3>Research interests</h3><div class="interest-list"><a href="#hd-maps">HD map generation</a><a href="#vision">Vision foundation models</a><a href="#world-models">Generative world models</a><a href="#world-models">3D spatial reasoning</a><a href="#graduate">GNNs &amp; visualization</a></div></div></div></div></section>
<section class="section wrap" id="research"><div class="section-heading"><h2>Industry Experience &amp; Applied Research</h2><p class="section-tagline">Perceive. Understand. Anticipate.</p><p class="section-intro">My work spans HD map generation, vision foundation models, and predictive world models, with applications in autonomous driving and manufacturing.</p></div>${research}</section>
<section class="section wrap" id="experience"><div class="section-heading"><p class="eyebrow">Research &amp; practice</p><h2>Experience</h2></div><div class="timeline"><article class="timeline-item"><div class="timeline-meta"><span>Jan 2024 – Present</span><span>Sunnyvale, California</span></div><div><h3>Staff Research Scientist, Tech Lead</h3><p class="employer">Bosch AI Research Center</p><p>Provide technical leadership for AI research and end-to-end model development across autonomous driving and manufacturing. Advance HD map generation, vision foundation models, generative world models, and predictive spatial reasoning, translating research into industrial applications.</p></div></article><article class="timeline-item"><div class="timeline-meta"><span>May 2022 – May 2023</span></div><div><h3>Research Intern</h3><p class="employer">Yahoo Research</p><h4>Webpage Representation Learning</h4><p>${e(d.yahoo)}</p></div></article><article class="timeline-item" id="graduate"><div class="timeline-meta"><span>Aug 2020 – Aug 2024</span></div><div><h3>Ph.D. Research</h3><p class="employer">The Ohio State University</p><p class="advisor">Advisor: Prof. Han-Wei Shen</p><p>Graph neural network explainability and learning-based graph visualization.</p><div class="graduate-projects">${d.graduate.map((t,i)=>project(t,['gnninterpreter','gnnboundary','deepgd','smartgd'][i])).join('')}</div></div></article></div></section>
<section class="section publications-section" id="publications"><div class="wrap"><div class="section-heading"><p class="eyebrow">Research papers</p><h2>Publications</h2><p class="section-intro">Selected work and other publications from my CV. ${external(d.scholar,'Google Scholar ↗')}</p></div><div class="publication-tools"><label class="publication-search">${icon('search')}<span class="sr-only">Search publications</span><input id="paper-search" type="search" placeholder="Search papers, topics, or venues" autocomplete="off"></label><div class="filter-list" role="group" aria-label="Filter publications by topic">${['All','HD maps','Vision','World models','GNNs','Visualization'].map((c,i)=>`<button type="button" data-filter="${c}" aria-pressed="${i===0}" class="filter${i===0?' selected':''}">${c}</button>`).join('')}</div></div><p id="result-count" class="result-count" aria-live="polite">14 publications</p>${pubGroups}<p id="no-results" hidden>No matching publications. Try another title, topic, or venue.</p><button type="button" class="clear-search" id="clear-search" hidden>Clear search and filters</button></div></section>
<section class="contact-section" id="contact"><div class="wrap contact-layout"><div><p class="eyebrow">Get in touch</p><h2>Let’s connect.</h2><p>For research conversations and professional inquiries.</p></div><div class="contact-links"><a href="mailto:${e(d.email)}">${icon('mail')}${e(d.email)}</a>${external(d.linkedin,icon('linkedin')+' LinkedIn')}${external(d.scholar,icon('scholar')+' Google Scholar')}</div></div></section>
</main>${petLightbox}<footer class="site-footer"><div class="wrap footer-inner"><p>© 2026 Xiaoqi Wang</p><p>Adapted from ${external('https://hugoblox.com/templates/academic-cv','HugoBlox Academic')}.</p><a href="#bio">Back to top ↑</a></div></footer>
<script id="research-results-data" type="application/json">${JSON.stringify(resultData).replace(/</g,'\\u003c')}</script><script src="/assets/site.js?v=20261101-5" defer></script><script type="module" src="/assets/results.js"></script></body></html>`;
mkdirSync(path.join(root,'dist'),{recursive:true});writeFileSync(path.join(root,'dist/index.html'),html);
console.log(`Built Xiaoqi Wang website: ${d.publications.length} publications and ${d.research.length} Bosch research areas.`);
