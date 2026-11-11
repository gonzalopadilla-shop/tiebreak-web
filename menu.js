function initializeTiebreakMenu(){
let menu=window.TIEBREAK_MENU;if(!menu)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eur=v=>v.toLocaleString('es-ES',{style:'currency',currency:'EUR'});
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const icons={
 gluten:['Gluten','#9c4b3d','<path d="M12 22V3M12 9C5 9 5 4 5 4s7 0 7 5Zm0 5c-7 0-7-5-7-5s7 0 7 5Zm0 5c-7 0-7-5-7-5s7 0 7 5Zm0-12c7 0 7-5 7-5s-7 0-7 5Zm0 5c7 0 7-5 7-5s-7 0-7 5Zm0 5c7 0 7-5 7-5s-7 0-7 5Z"/>'],
 crustaceos:['Crustáceos','#b8334b','<ellipse cx="12" cy="14" rx="5" ry="4"/><path d="m7 12-4-4-1-4m2 3 2-4m11 9 4-4 1-4m-2 3-2-4M8 17l-4 3m12-3 4 3M7 14H2m15 0h5M10 10V7m4 3V7"/>'],
 huevo:['Huevo','#d68b34','<path d="M19 15c0 5-3 7-7 7s-7-2-7-7S9 2 12 2s7 8 7 13Z"/>'],
 pescado:['Pescado','#23638e','<path d="M4 12C9 4 16 4 20 12c-4 8-11 8-16 0ZM4 12 1 7v10l3-5Zm7-5 2-4 3 4m-5 10 2 4 3-4"/><circle cx="17" cy="11" r="1" fill="currentColor"/>'],
 cacahuetes:['Cacahuetes','#a36e4e','<path d="M9 3c-5 0-7 6-3 9-5 5-1 10 3 9 3 0 5-3 5-6 7-2 7-8 3-11-3-3-6-1-8-1Z"/><path d="m8 6 7 12m-9-9 10 5m-8-1 7-5"/>'],
 soja:['Soja','#467b55','<path d="M4 21C1 12 13 1 21 3c2 10-7 19-17 18Z"/><path d="M4 21 19 5"/><circle cx="8" cy="16" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="16" cy="8" r="2"/>'],
 leche:['Leche','#197da6','<path d="M6 8h12v14H6V8Zm0 0 3-5h6l3 5M9 3V1h6v2M6 13h12"/><path d="M12 15c-4 5-1 6 0 6s4-1 0-6Z"/>'],
 'frutos-cascara':['Frutos de cáscara','#9f7764','<path d="M12 2C1 9 2 21 12 22 22 21 23 9 12 2Z"/><path d="M12 2v20M9 6 7 11l2 5-1 4m7-14 2 5-2 5 1 4"/>'],
 apio:['Apio','#466d52','<path d="M9 22h6L14 8h-4L9 22Zm3-14V2m-2 8L4 4m10 6 6-6M4 4l1 6m-1-6 6 1m10-1-1 6m1-6-6 1"/>'],
 mostaza:['Mostaza','#c88b32','<path d="M8 8h8l2 4v10H6V12l2-4Zm1 0V5h6v3m-3-3V1m-6 15h12"/>'],
 sesamo:['Sésamo','#ba8574','<ellipse cx="6" cy="8" rx="2" ry="4" transform="rotate(-30 6 8)"/><ellipse cx="17" cy="7" rx="2" ry="4" transform="rotate(25 17 7)"/><ellipse cx="12" cy="18" rx="2" ry="4"/>'],
 sulfitos:['Sulfitos','#594465','<text x="2" y="16" fill="currentColor" stroke="none" font-size="12" font-family="sans-serif" font-weight="700">SO₂</text>'],
 altramuces:['Altramuces','#b44773','<path d="M12 21C0 16 3 9 8 13c-4-12 4-14 5-2 3-12 11-8 5 2 8-2 7 7-6 8Z"/>'],
 moluscos:['Moluscos','#65516e','<path d="M3 13C0 0 24 0 21 13l-6 8H9l-6-8Z"/><path d="m5 6 5 13M10 3l2 16M15 3l-2 16m6-13-5 13M9 21h6"/>']
};
let selected='Todo',query='';const root=document.querySelector('#dishes'),filters=document.querySelector('#filters');
function badge(key){const [name,color,shape]=icons[key];return `<button type="button" class="allergen-badge" style="--allergen-color:${color}" aria-label="${name}: indicado en la carta" title="${name}" data-allergen="${key}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shape}</svg><span class="allergen-tooltip">${name}</span></button>`;}
function draw(){filters.innerHTML=['Todo',...menu.categories].map(c=>`<button type="button" data-category="${esc(c)}" class="${c===selected?'active':''}" aria-pressed="${c===selected}">${esc(c)}</button>`).join('');
 const matches=menu.dishes.filter(d=>(selected==='Todo'||selected===d.category)&&normalize(d.name+' '+(d.description||'')+' '+d.category).includes(normalize(query)));
 document.querySelector('#menu-count').textContent=`${matches.length} ${matches.length===1?'plato':'platos'} · Tapa y ración cuando se indican en la carta`;
 root.innerHTML=menu.categories.map(c=>{const rows=matches.filter(d=>d.category===c);if(!rows.length)return '';return `<section class="menu-category"><div class="menu-category-title"><p class="eyebrow">TIE BREAK · LA CARTA</p><h3>${esc(c)}</h3></div><div class="menu-items">${rows.map(d=>`<article class="menu-item" data-dish="${esc(d.id)}">${d.image?`<img class="menu-dish-photo" src="${esc(d.image)}" alt="${esc(d.name)}" loading="lazy" decoding="async">`: ''}<div class="menu-item-main"><h4>${esc(d.name)}</h4>${d.description?`<p>${esc(d.description)}</p>`:''}${d.menuType==='setMenu'&&d.courses?.length?`<div class="set-menu-courses">${d.courses.map(c=>`<div><strong>${esc(c.label)}</strong>${c.description?`<p>${esc(c.description).replace(/\n/g,'<br>')}</p>`:''}${c.items?.length?`<div class="public-course-options">${c.items.map(item=>`<div class="public-course-dish">${item.image?`<img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy">`:''}<div><h5>${esc(item.name)}</h5>${item.description?`<p>${esc(item.description)}</p>`:''}<div class="allergen-row">${item.allergens.map(badge).join('')}${item.allergenReview?'<span class="allergen-review">Alérgeno por confirmar</span>':''}${item.allergenNote?`<span class="allergen-unspecified">${esc(item.allergenNote)}</span>`:''}</div></div></div>`).join('')}</div>`:''}</div>`).join('')}</div>`:''}<div class="allergen-row">${d.allergens.map(badge).join('')}${d.allergenReview?'<span class="allergen-review" title="Un símbolo rosa de la carta necesita confirmación del local.">Alérgeno por confirmar</span>':''}${d.allergenNote?`<span class="allergen-unspecified">${esc(d.allergenNote)}</span>`:''}</div></div><div class="menu-prices">${d.prices.map(([label,value])=>`<div><span>${esc(label)}</span><strong>${value===null?'Consultar':eur(value)}</strong></div>`).join('')}</div></article>`).join('')}</div></section>`}).join('')||'<p class="menu-empty">No encontramos ese plato. Prueba otro nombre o categoría.</p>';
}
filters.onclick=e=>{const button=e.target.closest('[data-category]');if(button){selected=button.dataset.category;draw();}};
document.querySelector('#menu-search').oninput=e=>{query=e.target.value;draw();};
document.querySelector('#allergen-legend').innerHTML=Object.keys(icons).map(k=>`<span class="legend-item">${badge(k)}<span>${icons[k][0]}</span></span>`).join('');
document.querySelector('#carta').addEventListener('click',e=>{const button=e.target.closest('[data-allergen]');if(button){const name=icons[button.dataset.allergen][0];document.querySelector('#allergen-message').textContent=`${name}: indicado en la carta facilitada. Consulta con el personal en caso de alergia o intolerancia.`;}});
window.addEventListener('tiebreak-menu-updated',()=>{menu=window.TIEBREAK_MENU;if(selected!=='Todo'&&!menu.categories.includes(selected))selected='Todo';draw();});
draw();
}
if(window.TIEBREAK_MENU)initializeTiebreakMenu();
else window.addEventListener('tiebreak-menu-ready',initializeTiebreakMenu,{once:true});
