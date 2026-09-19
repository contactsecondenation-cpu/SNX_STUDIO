import {node,escapeHTML,bind} from "../core/dom.js";
import {addCustomTheme,removeCustomTheme,loadCustomThemes,slugifyThemeId} from "../data/customThemes.js";
import {refreshThemes} from "../data/catalog.js";

function fileToDataURL(file){
 return new Promise((resolve,reject)=>{
  const r=new FileReader();
  r.onload=()=>resolve(r.result);
  r.onerror=()=>reject(new Error("Lecture du fichier impossible."));
  r.readAsDataURL(file);
 });
}

export function mount(ctx){
 let wallpapers=[],icons=[];

 const el=node(`<section class="mine-view" data-view="mine">
  <div class="collections-heading"><p class="eyebrow">Pour moi</p><h1>Créez votre propre thème.</h1><p class="hint mine-intro">Ajoutez vos fonds d’écran et vos icônes : votre thème apparaît ensuite dans Collections, à côté des autres, et se personnalise dans le Studio comme n’importe quel autre univers.</p></div>
  <div class="mine-layout">
   <form id="theme-form" class="mine-form" novalidate>
    <label class="field">Nom du thème<input type="text" name="name" required maxlength="40" placeholder="Ex. Mon univers"></label>
    <div class="color-row">
     <label class="field">Couleur d’accent<input type="color" name="accent" value="#a4c8f4"></label>
     <label class="field">Couleur de fond<input type="color" name="base" value="#15203b"></label>
    </div>
    <div class="upload-block">
     <div class="upload-head"><strong>Fonds d’écran</strong><button type="button" class="ghost-btn" data-action="add-wallpaper">+ Ajouter un fond</button></div>
     <div class="upload-list" data-list="wallpapers"><p class="empty-note">Aucun fond ajouté pour l’instant.</p></div>
    </div>
    <div class="upload-block">
     <div class="upload-head"><strong>Icônes</strong><button type="button" class="ghost-btn" data-action="add-icon">+ Ajouter une icône</button></div>
     <div class="upload-list icon-upload-list" data-list="icons"><p class="empty-note">Aucune icône ajoutée pour l’instant.</p></div>
    </div>
    <input type="file" accept="image/*" data-file-input hidden>
    <button class="primary" type="submit">Créer le thème</button>
    <p class="hint form-error" role="alert" aria-live="polite"></p>
   </form>
   <div class="mine-existing">
    <h2>Vos thèmes personnels</h2>
    <div class="mine-existing-list"></div>
   </div>
  </div>
 </section>`);

 const form=el.querySelector("#theme-form");
 const fileInput=el.querySelector("[data-file-input]");
 const errorNote=el.querySelector(".form-error");
 let pendingKind=null;

 function renderList(kind,items){
  const host=el.querySelector(`[data-list="${kind}"]`);
  if(!items.length){host.innerHTML=`<p class="empty-note">${kind==="wallpapers"?"Aucun fond ajouté pour l’instant.":"Aucune icône ajoutée pour l’instant."}</p>`;return;}
  host.innerHTML=items.map((item,i)=>`<div class="upload-item"><img src="${item.dataUrl}" alt="" draggable="false"><input type="text" class="upload-name" data-kind="${kind}" data-index="${i}" value="${escapeHTML(item.name)}" maxlength="24" aria-label="Nom"><button type="button" class="remove-upload" data-action="remove-${kind==="wallpapers"?"wallpaper":"icon"}" data-index="${i}" aria-label="Retirer">×</button></div>`).join("");
 }

 el.querySelector('[data-action="add-wallpaper"]').addEventListener("click",()=>{pendingKind="wallpapers";fileInput.click();},{signal:ctx.signal});
 el.querySelector('[data-action="add-icon"]').addEventListener("click",()=>{pendingKind="icons";fileInput.click();},{signal:ctx.signal});

 fileInput.addEventListener("change",async()=>{
  const file=fileInput.files?.[0];fileInput.value="";
  if(!file||!pendingKind)return;
  try{
   const dataUrl=await fileToDataURL(file);
   const name=file.name.replace(/\.[a-z0-9]+$/i,"").slice(0,24)||"Sans nom";
   if(pendingKind==="wallpapers"){wallpapers=[...wallpapers,{name,dataUrl}];renderList("wallpapers",wallpapers);}
   else{icons=[...icons,{name,dataUrl}];renderList("icons",icons);}
   errorNote.textContent="";
  }catch{errorNote.textContent="Ce fichier n’a pas pu être lu. Réessayez avec une image plus légère.";}
 },{signal:ctx.signal});

 bind(el,ctx.signal,(action,b)=>{
  if(action==="remove-wallpaper"){wallpapers=wallpapers.filter((_,i)=>i!==Number(b.dataset.index));renderList("wallpapers",wallpapers);}
  if(action==="remove-icon"){icons=icons.filter((_,i)=>i!==Number(b.dataset.index));renderList("icons",icons);}
  if(action==="delete-theme"){
   if(!confirm("Supprimer ce thème personnel ? Cette action est définitive."))return;
   removeCustomTheme(b.dataset.themeId);refreshThemes();renderExisting();ctx.announce("Thème supprimé.");
  }
 });

 el.addEventListener("input",e=>{
  const input=e.target;
  if(input.classList?.contains("upload-name")){
   const kind=input.dataset.kind,i=Number(input.dataset.index);
   if(kind==="wallpapers"&&wallpapers[i])wallpapers[i].name=input.value;
   if(kind==="icons"&&icons[i])icons[i].name=input.value;
  }
 },{signal:ctx.signal});

 function renderExisting(){
  const host=el.querySelector(".mine-existing-list");
  const mine=loadCustomThemes();
  if(!mine.length){host.innerHTML='<p class="empty-note">Vous n’avez pas encore créé de thème. Le formulaire ci-contre vous permet d’en ajouter un en quelques minutes.</p>';return;}
  host.innerHTML=mine.map(theme=>`<div class="mine-theme-card" style="--accent:${theme.colors.accent};--theme-base:${theme.colors.base}"><img src="${theme.cover}" alt="" draggable="false"><div class="mine-theme-info"><strong>${escapeHTML(theme.name)}</strong><span>${theme.wallpapers.length} fond${theme.wallpapers.length>1?"s":""} · ${theme.icons.length} icônes</span></div><div class="mine-theme-actions"><button class="ghost-btn" type="button" data-nav="studio" data-theme="${theme.id}">Ouvrir</button><button class="ghost-btn danger" type="button" data-action="delete-theme" data-theme-id="${theme.id}">Supprimer</button></div></div>`).join("");
 }

 form.addEventListener("submit",e=>{
  e.preventDefault();
  const data=new FormData(form);
  const name=String(data.get("name")||"").trim();
  errorNote.textContent="";
  if(!name){errorNote.textContent="Donnez un nom à votre thème.";form.querySelector('[name="name"]').focus();return;}
  if(!wallpapers.length){errorNote.textContent="Ajoutez au moins un fond d’écran.";return;}
  if(!icons.length){errorNote.textContent="Ajoutez au moins une icône.";return;}
  const id=slugifyThemeId(name);
  const wallpaperObjs=wallpapers.map((w,i)=>({id:`${id}-wall-${i}`,name:w.name||`Fond ${i+1}`,src:w.dataUrl,thumb:w.dataUrl,tone:"dark"}));
  const iconObjs=icons.map((ic,i)=>({id:`${id}-icon-${i}`,name:ic.name||`Icône ${i+1}`,src:ic.dataUrl,thumb:ic.dataUrl}));
  const theme={
   id,name,slug:id,
   colors:{accent:String(data.get("accent")||"#a4c8f4"),base:String(data.get("base")||"#15203b")},
   description:"Thème personnel.",
   cover:wallpaperObjs[0].src,
   wallpapers:wallpaperObjs,
   icons:iconObjs,
   widgets:[],
   defaultIcons:Array.from({length:12},(_,i)=>iconObjs[i%iconObjs.length].id),
   price:null,
   custom:true
  };
  const saved=addCustomTheme(theme);
  if(!saved){errorNote.textContent="Le navigateur a refusé d’enregistrer ce thème (images trop lourdes pour le stockage local). Essayez avec des images plus légères.";return;}
  refreshThemes();
  form.reset();form.querySelector('[name="accent"]').value="#a4c8f4";form.querySelector('[name="base"]').value="#15203b";
  wallpapers=[];icons=[];renderList("wallpapers",wallpapers);renderList("icons",icons);
  renderExisting();
  ctx.announce(`Thème « ${name} » créé. Il apparaît maintenant dans Collections.`);
 });

 renderExisting();
 return el;
}
