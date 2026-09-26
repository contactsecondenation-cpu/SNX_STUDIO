import {widgetHTML} from "./widget.js";
import {escapeHTML} from "../core/dom.js";
import {getThemesById} from "../data/catalog.js";
/** Crossfades the phone's wallpaper image in place instead of re-rendering the whole phone. */
export function crossfadeWallpaper(screen,wall){
 const old=screen.querySelector(".phone-wallpaper");
 screen.dataset.wallpaperTone=wall?.tone||"dark";screen.dataset.wallpaper=wall?.id||"";
 if(!wall){old?.remove();return;}
 const next=document.createElement("img");
 next.className="phone-wallpaper wallpaper-enter";next.src=wall.src;next.alt="Fond "+wall.name;next.draggable=false;
 if(old)old.insertAdjacentElement("afterend",next);else screen.prepend(next);
 requestAnimationFrame(()=>requestAnimationFrame(()=>next.classList.remove("wallpaper-enter")));
 if(old){old.addEventListener("transitionend",()=>old.remove(),{once:true});setTimeout(()=>old.remove(),400);}
}
export function phoneHTML(state,category="wallpapers"){
 const t=getThemesById()[state.theme],wall=t.wallpapers.find(w=>w.id===state.wallpaper),widget=t.widgets.find(w=>w.id===state.widget);
 const widgetLarge=widget&&state.widgetSize==="large";
 return `<div class="phone" aria-label="Aperçu ${escapeHTML(t.name)}"><div class="phone-screen" data-wallpaper-tone="${wall?.tone||"dark"}" data-wallpaper="${wall?.id||""}" style="--theme-base:${t.colors.base}">${wall?`<img class="phone-wallpaper" src="${wall.src}" alt="Fond ${escapeHTML(wall.name)}" data-protected draggable="false">`:""}<div class="phone-status"><span>9:41</span><span aria-hidden="true">••• ▰</span></div><div class="island" aria-hidden="true"></div><div class="phone-clock"><span>${escapeHTML(t.name)}</span><strong>9:41</strong></div>${widget?widgetHTML(widget,t,true,state.widgetSize):""}<div class="phone-icons">${state.iconSlots.slice(0,widget?(widgetLarge?4:8):12).map((id,slot)=>{const i=t.icons.find(i=>i.id===id);return `<button data-action="slot" data-slot="${slot}" aria-label="Emplacement ${slot+1} : ${escapeHTML(i.name)}" aria-pressed="${category==="icons"&&state.selectedSlot===slot}" ${category!=="icons"?'tabindex="-1"':""}><img src="${i.thumb}" alt="" draggable="false"><span>${escapeHTML(i.name)}</span></button>`;}).join("")}</div><div class="phone-dock">${state.iconSlots.slice(8).map(id=>{const i=t.icons.find(i=>i.id===id);return `<img src="${i.thumb}" alt="${escapeHTML(i.name)}" draggable="false">`;}).join("")}</div><div class="home-indicator" aria-hidden="true"></div></div></div>`;
}
