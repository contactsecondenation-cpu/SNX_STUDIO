import {node,escapeHTML} from "../core/dom.js";
import {getThemes} from "../data/catalog.js";
export function mount(){
 const themes=getThemes();
 return node(`<section class="collections-view" data-view="collections"><div class="collections-heading"><p class="eyebrow">Collections</p><h1>Des univers à votre image.</h1></div><div class="collections-grid">${themes.map((t,i)=>{
  const badge=[t.defaultIcons[1],t.defaultIcons[8],t.defaultIcons[10]].filter(Boolean).map(id=>t.icons.find(ic=>ic.id===id)).filter(Boolean).slice(0,3);
  return `<button class="collection-tile" data-nav="studio" data-theme="${t.id}" style="--accent:${t.colors.accent};--theme-base:${t.colors.base};--i:${i}" aria-label="Essayer ${escapeHTML(t.name)}"><img class="tile-cover" src="${t.cover}" alt="" draggable="false" data-protected><span class="tile-scrim" aria-hidden="true"></span>${t.custom?'<span class="custom-badge">Personnel</span>':""}${badge.length?`<span class="tile-icon-badge" aria-hidden="true">${badge.map(i=>`<img src="${i.src}" alt="" draggable="false">`).join("")}</span>`:""}<span class="tile-caption"><strong>${escapeHTML(t.name)}</strong><span>${t.wallpapers.length} fond${t.wallpapers.length>1?"s":""} · ${t.icons.length} icônes</span></span></button>`;
 }).join("")}</div></section>`);
}
