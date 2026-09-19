import {node,escapeHTML,bind} from "../core/dom.js";
import {money,commerce,formats} from "../data/catalog.js";
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
 function checkout(){
  const t=ctx.theme();
  const body=`<div class="pack-preview"><img data-protected src="${t.wallpapers[0].thumb||t.cover}" alt="Aperçu ${escapeHTML(t.name)}" draggable="false"><div><h3>${escapeHTML(t.name)}</h3><strong>${t.price===null?"Prix à définir":money(t.price)}</strong>${t.price!==null?'<small>Prix de démonstration</small>':""}</div></div><div class="demo-note"><strong>Démonstration — aucun paiement disponible</strong><p>Aucune commande ni donnée bancaire ne sera transmise.</p></div><div class="pack-content"><h3>Contenu disponible à l’essai</h3><ul><li>${t.wallpapers.length} visuel${t.wallpapers.length>1?"s":""} de fond d’écran</li>${t.icons.length?`<li>${t.icons.length} icônes du thème</li>`:'<li>Icônes du thème : à fournir</li>'}<li>${t.widgets.length?t.widgets.length+" aperçus de widgets (web ou images)":"Aucun widget standard dans les fichiers reçus"}</li></ul><p><strong>1 widget personnalisé offert par achat.</strong><br>Création à partir des éléments fournis par le client.</p></div><form id="checkout-form"><fieldset><legend>Taille du widget offert</legend><div class="radio-row">${formats.map((f,i)=>`<label><input type="radio" name="gift-size" value="${f.id}" ${i===0?"checked":""}> ${f.name}</label>`).join("")}</div></fieldset><label for="order-email">Votre email</label><input id="order-email" name="email" type="email" autocomplete="email" placeholder="vous@exemple.fr" required><p class="hint">Pour la commande, la livraison et le support. Aucun compte requis.</p><fieldset><legend>Moyen de paiement prévu</legend><div class="radio-row">${commerce.methods.map((m,i)=>`<label><input type="radio" name="payment" value="${m.id}" ${i===0?"checked":""}> ${m.name}</label>`).join("")}</div></fieldset><label class="terms-check"><input type="checkbox" name="terms" required> <span>J’accepte les conditions générales de vente.</span></label><button class="primary pay-button" type="submit" disabled>Paiement indisponible</button></form><div class="legal-details"><details><summary>SAV / Contact</summary><p>${commerce.contactEmail?escapeHTML(commerce.contactEmail):"Le contact du vendeur sera renseigné avant l’ouverture des ventes."}</p></details><details><summary>CGV</summary><p>Démonstration non marchande. Les CGV définitives, les modalités de livraison et les conditions de personnalisation restent à renseigner avant toute vente.</p></details><details><summary>Mentions légales</summary><p>L’identité et les coordonnées de l’éditeur ainsi que les informations d’hébergement restent à renseigner avant publication commerciale.</p></details><details><summary>Politique de confidentialité</summary><p>Cette démonstration conserve uniquement vos choix de thèmes sur votre appareil. L’email saisi reste dans ce formulaire et n’est pas envoyé ni enregistré. La politique du service commercial reste à compléter avant son ouverture.</p></details></div>`;
  const el=open("Obtenir le pack",body,"purchase");
  el.querySelector("form").addEventListener("submit",e=>e.preventDefault(),{signal:active.controller.signal});
 }
 function iconPreview(icon,onApply){
  const el=open(icon.name,`<div class="icon-detail"><img src="${icon.src}" alt="${escapeHTML(icon.name)} — aperçu agrandi" draggable="false" data-protected><button class="primary apply-icon" type="button">Appliquer au téléphone</button></div>`,"icon");
  el.querySelector(".apply-icon").addEventListener("click",()=>{onApply();close();},{signal:active.controller.signal});
 }
 return {close,checkout,iconPreview,isOpen:()=>!!active,isPurchase:()=>active?.kind==="purchase"};
}
