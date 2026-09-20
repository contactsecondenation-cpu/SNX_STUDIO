import {widgetHTML,refreshClocks} from "../components/widget.js";
import {node,escapeHTML,bind} from "../core/dom.js";
import {phoneHTML} from "../components/phone.js";
import {formats} from "../data/catalog.js";
export function mount(ctx){
 const t=ctx.theme();let category="wallpapers";
 const types=[{id:"wallpapers",title:"Fonds d’écran",items:t.wallpapers},{id:"icons",title:"Icônes",items:t.icons},{id:"widgets",title:"Widgets",items:t.widgets}];
 const el=node(`<section class="studio-view" data-view="studio" style="--accent:${t.colors.accent};--theme-base:${t.colors.base}"><div class="studio-heading"><div><p class="eyebrow">Votre studio</p><h1>${escapeHTML(t.name)}</h1></div><button class="primary obtain" data-action="purchase">Obtenir le pack</button></div><div class="studio-workspace"><div class="category-cards" role="tablist" aria-label="Personnaliser le téléphone">${types.map((c,n)=>`<button id="tab-${c.id}" class="category-card" data-action="category" data-category="${c.id}" role="tab" aria-controls="asset-panel" aria-selected="${n===0}" tabindex="${n===0?0:-1}"><div class="category-art" aria-hidden="true">${c.items.slice(0,c.id==="wallpapers"?2:3).map(i=>`<img src="${i.thumb||i.src}" alt="" draggable="false">`).join("")}${!c.items.length?'<span class="empty-widget-shape"></span>':""}</div><span class="category-label"><strong>${c.title}</strong><small>${c.items.length?c.items.length+(c.id==="widgets"?" à essayer":(c.items.length>1?" disponibles":" disponible")):"À venir"}</small></span></button>`).join("")}</div><div class="phone-stage"><div class="phone-frame">${phoneHTML(ctx.store.get(),category)}</div><p class="phone-caption">Votre composition</p><button type="button" class="rotate-toggle" data-action="rotate-wallpapers" aria-pressed="false">↻ Rotation des fonds ★</button></div><section id="asset-panel" class="asset-panel" role="tabpanel" tabindex="0" aria-labelledby="tab-wallpapers"></section></div></section>`);
 function sizePhone(){const stage=el.querySelector(".phone-stage"),frame=el.querySelector(".phone-frame");const width=Math.min(300,stage.clientWidth-10,Math.max(200,stage.clientHeight-74)*268/550);frame.style.width=width+"px";frame.style.height=(width*550/268)+"px";frame.style.setProperty("--phone-scale",width/268);}
 let observer=null;
 if(typeof ResizeObserver!=="undefined"){observer=new ResizeObserver(sizePhone);observer.observe(el.querySelector(".phone-stage"));}
 const clockTimer=setInterval(()=>refreshClocks(el),1000);
 let rotateTimer=null;
 function stopRotate(){if(rotateTimer){clearInterval(rotateTimer);rotateTimer=null;}el.querySelector(".rotate-toggle")?.setAttribute("aria-pressed","false");}
 function startRotate(){
  const s=ctx.store.get();
  const pool=s.favoriteWallpapers.length?s.favoriteWallpapers:t.wallpapers.map(w=>w.id);
  if(pool.length<2){ctx.announce("Choisissez au moins deux fonds avec l’étoile ★ pour activer la rotation.");return;}
  let i=Math.max(0,pool.indexOf(s.wallpaper));
  rotateTimer=setInterval(()=>{i=(i+1)%pool.length;ctx.store.set({wallpaper:pool[i]});updatePhone();if(category==="wallpapers")panel();},4000);
  el.querySelector(".rotate-toggle").setAttribute("aria-pressed","true");
 }
 ctx.signal.addEventListener("abort",()=>{observer?.disconnect();clearInterval(clockTimer);stopRotate();},{once:true});
 function updatePhone(){el.querySelector(".phone").replaceWith(node(phoneHTML(ctx.store.get(),category)));}
 function panel(){const s=ctx.store.get(),p=el.querySelector("#asset-panel");p.setAttribute("aria-labelledby","tab-"+category);
  if(category==="wallpapers")p.innerHTML=`<div class="asset-panel-heading"><h2>Choisissez votre fond</h2><p>Touchez un fond pour l’essayer. L’étoile ★ l’ajoute à la rotation automatique.</p></div><div class="wallpaper-grid">${t.wallpapers.map(w=>`<div class="wallpaper-card"><button data-action="wallpaper" data-wallpaper="${w.id}" aria-pressed="${w.id===s.wallpaper}"><img src="${w.thumb||w.src}" alt="${escapeHTML(w.name)}" draggable="false" data-protected><span>${escapeHTML(w.name)}</span></button><button type="button" class="fav-toggle" data-action="fav-wallpaper" data-wallpaper="${w.id}" aria-pressed="${s.favoriteWallpapers.includes(w.id)}" aria-label="${s.favoriteWallpapers.includes(w.id)?"Retirer":"Ajouter"} ${escapeHTML(w.name)} de la rotation">★</button></div>`).join("")}</div>`;
  if(category==="icons")p.innerHTML=`<div class="asset-panel-heading"><h2>Choisissez vos icônes</h2><p>Touchez une icône pour la voir en grand, puis appliquez-la à l’emplacement ${s.selectedSlot+1}.</p></div><div class="icon-grid">${t.icons.map(i=>`<button data-action="icon" data-icon="${i.id}" aria-label="Agrandir ${escapeHTML(i.name)}" aria-pressed="${s.iconSlots[s.selectedSlot]===i.id}" title="${escapeHTML(i.name)}"><img src="${i.thumb||i.src}" alt="${escapeHTML(i.name)}" draggable="false" loading="lazy"></button>`).join("")}</div>`;
  if(category==="widgets"){
   const activeWidget=t.widgets.find(w=>w.id===s.widget);
   p.innerHTML=`<div class="asset-panel-heading"><h2>Widgets du thème</h2></div>${t.widgets.length?`<p class="widget-note">${t.widgets.some(w=>w.kind==="web-clock")?"Horloge créée pour cet univers, active dans cet aperçu web. Version installable à venir.":"Visuels fournis ou extraits des captures. Heure et météo fixes ; fichiers installables à venir."} Touchez à nouveau pour retirer.</p><div class="widget-grid">${t.widgets.map(w=>`<button data-action="widget" data-widget="${w.id}" aria-pressed="${w.id===s.widget}">${widgetHTML(w,t,false,w.id===s.widget?s.widgetSize:w.format)}<span>${escapeHTML(w.name)}</span></button>`).join("")}</div>${activeWidget?`<div class="widget-size-picker"><span>Taille de l’aperçu</span><div class="size-row">${formats.map(f=>`<button type="button" class="size-btn" data-action="widget-size" data-size="${f.id}" aria-pressed="${s.widgetSize===f.id}">${f.name}</button>`).join("")}</div></div>`:""}`:'<div class="empty-widgets"><span class="empty-widget-shape" aria-hidden="true"></span><p>Les widgets de cet univers<br>arrivent prochainement.</p><small>Aucun widget fourni dans ce pack pour le moment.</small></div>'}`;
  }
 }
 function chooseCategory(id,focus=false){category=id;el.querySelectorAll('[role="tab"]').forEach(b=>{const selected=b.dataset.category===id;b.setAttribute("aria-selected",String(selected));b.tabIndex=selected?0:-1;if(selected&&focus)b.focus();});updatePhone();panel();}
 bind(el,ctx.signal,(action,b)=>{
  if(action==="category")chooseCategory(b.dataset.category);
  if(action==="slot"){const slot=Number(b.dataset.slot);const s=ctx.store.get();const currentIcon=t.icons.find(i=>i.id===s.iconSlots[slot]);ctx.store.set({selectedSlot:slot});chooseCategory("icons");el.querySelector(`[data-slot="${slot}"]`).focus({preventScroll:true});if(currentIcon)ctx.dialogs.iconPreview(currentIcon,()=>{});}
  if(action==="wallpaper"){stopRotate();ctx.store.set({wallpaper:b.dataset.wallpaper});updatePhone();el.querySelectorAll(".wallpaper-grid [data-action=wallpaper]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));ctx.announce("Fond appliqué.");}
  if(action==="fav-wallpaper"){const s=ctx.store.get();const set=new Set(s.favoriteWallpapers);const on=!set.has(b.dataset.wallpaper);if(on)set.add(b.dataset.wallpaper);else set.delete(b.dataset.wallpaper);ctx.store.set({favoriteWallpapers:[...set]});b.setAttribute("aria-pressed",String(on));ctx.announce(on?"Ajouté à la rotation.":"Retiré de la rotation.");}
  if(action==="rotate-wallpapers"){if(rotateTimer)stopRotate();else startRotate();}
  if(action==="icon"){const icon=t.icons.find(i=>i.id===b.dataset.icon);ctx.dialogs.iconPreview(icon,()=>{const s=ctx.store.get(),slots=[...s.iconSlots];slots[s.selectedSlot]=icon.id;ctx.store.set({iconSlots:slots});updatePhone();el.querySelectorAll('.icon-grid button').forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.icon===icon.id)));ctx.announce("Icône appliquée à l’emplacement "+(s.selectedSlot+1)+".");});}
  if(action==="widget"){const s=ctx.store.get();const turningOn=s.widget!==b.dataset.widget;const w=t.widgets.find(w=>w.id===b.dataset.widget);ctx.store.set({widget:turningOn?b.dataset.widget:null,widgetSize:turningOn?w.format:s.widgetSize});updatePhone();panel();ctx.announce("Aperçu du widget mis à jour.");}
  if(action==="widget-size"){ctx.store.set({widgetSize:b.dataset.size});updatePhone();panel();ctx.announce("Taille du widget mise à jour.");}
  if(action==="purchase")ctx.openPurchase();
 });
 el.querySelector('[role="tablist"]').addEventListener("keydown",e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();const list=types.map(t=>t.id),i=list.indexOf(category);const j=e.key==='Home'?0:e.key==='End'?2:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:2))%3;chooseCategory(list[j],true);},{signal:ctx.signal});
 panel();requestAnimationFrame(()=>{if(el.isConnected)sizePhone();});return el;
}
