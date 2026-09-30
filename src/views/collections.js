import {node,escapeHTML} from "../core/dom.js";
import {getThemes} from "../data/catalog.js";
const DEFAULT_TINT="#241a30";
const BOOK_URLS={jade:"book-jade.html",brume:"book-brume.html",galet:"book-galet.html"};
const PREMIUM_IDS=["jade","saphir","amethyste"];
export function mount(ctx){
 const themes=getThemes().filter(t=>!t.unlisted);
 const premium=PREMIUM_IDS.map(id=>themes.find(t=>t.id===id)).filter(Boolean);
 const other=themes.filter(t=>!PREMIUM_IDS.includes(t.id));
 const totalIcons=themes.reduce((n,t)=>n+t.icons.length,0);
 const renderTiles=list=>list.map((t,i)=>{
  const badge=[t.defaultIcons[1],t.defaultIcons[8],t.defaultIcons[10]].filter(Boolean).map(id=>t.icons.find(ic=>ic.id===id)).filter(Boolean).slice(0,3);
  const bookUrl=BOOK_URLS[t.id];
  const tag=bookUrl?"a":"button";
  const nav=bookUrl?`href="${bookUrl}"`:`data-nav="studio" data-theme="${t.id}"`;
  return `<${tag} class="collection-tile" ${nav} style="--accent:${t.colors.accent};--theme-base:${t.colors.base};--i:${i}" aria-label="${bookUrl?"Feuilleter":"Essayer"} ${escapeHTML(t.name)}"><img class="tile-cover" src="${t.cover}" alt="" draggable="false" data-protected loading="${i<6?"eager":"lazy"}" decoding="async"><span class="tile-scrim" aria-hidden="true"></span>${t.isNew?'<span class="custom-badge">Nouveau</span>':""}${t.custom?'<span class="custom-badge">Personnel</span>':""}${badge.length?`<span class="tile-icon-badge" aria-hidden="true">${badge.map(i=>`<img src="${i.thumb||i.src}" alt="" draggable="false" loading="lazy" decoding="async">`).join("")}</span>`:""}<span class="tile-caption"><strong>${escapeHTML(t.name)}</strong><span>${t.wallpapers.length} fond${t.wallpapers.length>1?"s":""} · ${t.icons.length} icônes</span></span></${tag}>`;
 }).join("");
 const view=node(`<section class="collections-view" data-view="collections"><div class="collections-heading"><p class="eyebrow">Collections</p><h1>Des univers à votre image.</h1><p class="collections-count">${themes.length} univers disponibles · ${totalIcons} icônes prêtes à l’emploi</p></div><section class="premium-collection" aria-labelledby="premium-title"><div class="collection-section-heading"><p class="eyebrow">La collection précieuse</p><h2 id="premium-title">Premium ++</h2><p>Jade, saphir, améthyste. Trois univers, une même signature.</p></div><div class="collections-grid premium-grid">${renderTiles(premium)}</div></section><section aria-labelledby="other-title"><div class="collection-section-heading"><h2 id="other-title">Tous nos autres univers</h2></div><div class="collections-grid">${renderTiles(other)}</div></section></section>`);
 for(const tile of view.querySelectorAll(".collection-tile")){
  const tint=tile.style.getPropertyValue("--accent");
  tile.addEventListener("pointerenter",()=>document.documentElement.style.setProperty("--page-tint",tint),{signal:ctx?.signal});
  tile.addEventListener("focus",()=>document.documentElement.style.setProperty("--page-tint",tint),{signal:ctx?.signal});
 }
 view.addEventListener("pointerleave",()=>document.documentElement.style.setProperty("--page-tint",DEFAULT_TINT));
 ctx?.signal?.addEventListener("abort",()=>document.documentElement.style.setProperty("--page-tint",DEFAULT_TINT),{once:true});
 return view;
}
