import {node,escapeHTML,bind} from "../core/dom.js";
import {money,commerce} from "../data/catalog.js";
/** A single accessible transient dialog. Focus returns to the opening control. */
export function createDialogs(ctx){
 let active=null;
 function close(fromNavigation=false){
  if(!active)return;
  const {el,controller,trigger,kind}=active;active=null;controller.abort();
  if(typeof el.close==="function")el.close();el.remove();
  document.querySelector("#shell").inert=false;
  document.body.classList.remove("modal-open");
  if(trigger?.isConnected)trigger.focus({preventScroll:true});
  if(kind==="purchase"&&!fromNavigation)ctx.dismissPurchase();
 }
 function open(title,body,kind="zoom"){
  close(true);
  const controller=new AbortController(),signal=controller.signal,trigger=document.activeElement;
  const el=node(`<dialog class="dialog dialog--${kind}" aria-labelledby="dialog-title"><div class="dialog-head"><h2 id="dialog-title">${escapeHTML(title)}</h2><button class="close-dialog" data-action="close-dialog" aria-label="Fermer">×</button></div><div class="dialog-body">${body}</div></dialog>`);
  active={el,controller,trigger,kind};document.body.append(el);
  el.addEventListener("cancel",e=>{e.preventDefault();close();},{signal});
  bind(el,signal,action=>{if(action==="close-dialog")close();});
  el.addEventListener("click",e=>{if(e.target===el){const b=el.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close();}},{signal});
  el.addEventListener("keydown",e=>{
   if(e.key==="Escape"){e.preventDefault();e.stopPropagation();close();}
   if(e.key==="Tab"){
    const list=[...el.querySelectorAll('button:not(:disabled),input:not(:disabled),select,summary,a[href],[tabindex="0"]')].filter(x=>x.getClientRects().length);
    const first=list[0],last=list.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
   }
  },{signal});
  if(typeof el.showModal==="function")el.showModal();
  else{el.setAttribute("open","");el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");document.querySelector("#shell").inert=true;}
  document.body.classList.add("modal-open");el.querySelector(".close-dialog").focus();return el;
 }
 function legalBody(){
  return `<div class="legal-details"><details open><summary>SAV / Contact</summary><p>Une question sur un pack ou son installation ? Écrivez à ${escapeHTML(commerce.contactEmail)}, ou via la messagerie de notre boutique Etsy. Réponse sous 24h en semaine.</p></details><details><summary>Commandes &amp; CGV</summary><p>Les commandes s’effectuent exclusivement sur notre boutique Etsy : ${escapeHTML(commerce.etsyUrl)}. Ce site est une démonstration interactive, gratuite et sans paiement ; les conditions générales de vente applicables sont celles affichées sur chaque fiche produit Etsy.</p></details><details><summary>Mentions légales</summary><p>Site édité par ${escapeHTML(commerce.legalOwner)}, ${escapeHTML(commerce.legalAddress)}. Contact : ${escapeHTML(commerce.contactEmail)}.<br>Hébergement : GitHub Pages — GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis.</p></details><details><summary>Politique de confidentialité</summary><p>Ce site ne collecte ni ne transmet aucune donnée personnelle : vos choix de thème restent stockés uniquement sur votre appareil (mémoire locale du navigateur), rien n’est envoyé à un serveur. Les commandes, paiements et données associées sont gérés directement par Etsy, selon sa propre politique de confidentialité.</p></details></div>`;
 }
 function legal(){
  return open("Informations légales",legalBody(),"legal");
 }
 function checkout(){
  const t=ctx.theme();
  const body=`<div class="pack-preview"><img data-protected src="${t.wallpapers[0].thumb||t.cover}" alt="Aperçu ${escapeHTML(t.name)}" draggable="false"><div><h3>${escapeHTML(t.name)}</h3><strong>${t.price===null?"Prix à définir":money(t.price)}</strong>${t.price!==null?'<small>Prix indicatif — le prix ferme est sur Etsy</small>':""}</div></div><div class="demo-note"><strong>Aperçu interactif</strong><p>Ce Studio permet d’essayer le thème sur un téléphone virtuel. La commande se fait sur notre boutique Etsy.</p></div><div class="pack-content"><h3>Contenu du pack</h3><ul><li>${t.wallpapers.length} visuel${t.wallpapers.length>1?"s":""} de fond d’écran</li>${t.icons.length?`<li>${t.icons.length} icônes du thème</li>`:'<li>Icônes du thème : à fournir</li>'}<li>${t.widgets.length?t.widgets.length+" aperçus de widgets (web ou images)":"Aucun widget standard dans les fichiers reçus"}</li></ul><p><strong>Guide d’installation détaillé inclus</strong><br>Icônes et fonds prêts à poser via l’app Raccourcis, sans jailbreak.</p></div><a class="primary pay-button" href="${escapeHTML(commerce.etsyUrl)}" target="_blank" rel="noopener">Voir ce pack sur Etsy →</a>${legalBody()}`;
  return open("Obtenir le pack",body,"purchase");
 }
 function iconPreview(icon,onApply){
  const el=open(icon.name,`<div class="icon-detail"><img src="${icon.src}" alt="${escapeHTML(icon.name)} — aperçu agrandi" draggable="false" data-protected><button class="primary apply-icon" type="button">Appliquer au téléphone</button></div>`,"icon");
  el.querySelector(".apply-icon").addEventListener("click",()=>{onApply();close();},{signal:active.controller.signal});
 }
 return {close,checkout,iconPreview,legal,isOpen:()=>!!active,isPurchase:()=>active?.kind==="purchase"};
}
