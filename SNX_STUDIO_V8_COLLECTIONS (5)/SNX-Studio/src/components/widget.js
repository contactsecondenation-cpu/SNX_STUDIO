import {escapeHTML} from "../core/dom.js";
export function widgetHTML(w,t,phone=false,size){
 const fmt=size||w.format;
 if(w.kind!=="web-clock")return `<img class="${phone?"phone-widget-asset":"widget-preview"} widget--${fmt}" src="${w.src}" alt="${escapeHTML(w.name)}" draggable="false">`;
 return `<div class="${phone?"phone-widget-asset":"widget-preview"} widget--${fmt} web-clock clock--${t.id}" style="--clock-accent:${t.colors.accent};--clock-base:${t.colors.base}" role="img" aria-label="Horloge ${escapeHTML(t.name)}"><span class="clock-orbit" aria-hidden="true"></span><span class="clock-date" data-clock-date>${new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</span><strong data-clock-time>${new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</strong><span class="clock-signature">${escapeHTML(t.name)}</span></div>`;
}
export function refreshClocks(root=document){const d=new Date();root.querySelectorAll('[data-clock-time]').forEach(e=>e.textContent=d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}));root.querySelectorAll('[data-clock-date]').forEach(e=>e.textContent=d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}));}
