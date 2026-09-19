import {node} from "./dom.js";
import {createStore} from "./store.js";
import {createRouter} from "./router.js";
import {createDialogs} from "../components/dialogs.js";
import {getThemesById} from "../data/catalog.js";
import {mount as mountHome} from "../views/home.js";
import {mount as mountCollections} from "../views/collections.js";
import {mount as mountStudio} from "../views/studio.js";
import {mount as mountMine} from "../views/mine.js";
const modules={home:mountHome,collections:mountCollections,studio:mountStudio,mine:mountMine};
const titles={home:"Accueil",collections:"Collections",mine:"Pour moi"};
export function boot(){
 const root=document.querySelector("#view-root"),header=document.querySelector("#app-header"),live=document.querySelector("#announcer"),store=createStore();
 let key="",scope=null,noticeTimer;
 const ctx={store,theme:()=>getThemesById()[store.get().theme],navigate:(r,t)=>router.navigate(r,t||store.get().theme),
  announce(message){live.textContent=message;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>live.textContent="",2500);},
  openPurchase(){if(dialogs.isPurchase())return;history.pushState({snxPurchase:true},"",location.hash);dialogs.checkout();},
  dismissPurchase(){if(history.state?.snxPurchase)history.back();}
 };
 const dialogs=createDialogs(ctx);ctx.dialogs=dialogs;
 function render(next){
  const nextKey=next.route+"/"+next.theme;
  if(key===nextKey){
   if(history.state?.snxPurchase&&next.route==="studio"){if(!dialogs.isPurchase())dialogs.checkout();}
   else dialogs.close(true);
   return;
  }
  const previous=key.split("/");key=nextKey;
  function apply(){
   dialogs.close(true);scope?.abort();scope=new AbortController();ctx.signal=scope.signal;
   store.set({theme:next.theme});
   const view=modules[next.route](ctx);root.replaceChildren(view);
   document.body.dataset.route=next.route;
   document.documentElement.style.setProperty("--page-tint",next.route==="studio"?ctx.theme().colors.base:"#0b1730");
   header.replaceChildren();
   if(next.route!=="home")header.append(node(`<div class="header-inner"><button class="brand" data-nav="home" aria-label="SNX Studio — Accueil">SNX <span>Studio</span></button><div class="header-actions">${next.route==="studio"?'<button class="back-button" data-nav="collections">← Collections</button>':""}</div></div>`));
   document.title=next.route==="studio"?ctx.theme().name+" — SNX Studio":"SNX Studio — "+(titles[next.route]||"Accueil");
   window.scrollTo?.(0,0);
   let focus=previous[0]==="studio"&&next.route==="collections"?view.querySelector(`[data-theme="${previous[1]}"]`):view.querySelector("h1");
   if(focus){if(focus.tagName==="H1")focus.tabIndex=-1;focus.focus({preventScroll:true});}
  }
  const reduceMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if(document.startViewTransition&&!reduceMotion)document.startViewTransition(apply);
  else apply();
  if(history.state?.snxPurchase&&next.route==="studio")dialogs.checkout();
 }
 const router=createRouter(render);
 document.querySelector("#shell").addEventListener("click",e=>{const b=e.target.closest("[data-nav]");if(b)ctx.navigate(b.dataset.nav,b.dataset.theme);});
 document.addEventListener("keydown",e=>{
  const editable=e.target.closest('input,textarea,[contenteditable="true"]');
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="a"&&!editable){e.preventDefault();return;}
  if(e.key==="Escape"&&!e.defaultPrevented&&!dialogs.isOpen()&&router.read().route==="studio"){e.preventDefault();ctx.navigate("collections");}
 });
 for(const type of ["dragstart","contextmenu","auxclick","dblclick"])document.addEventListener(type,e=>{if(e.target.closest("img,[data-protected]")&&!e.target.closest("input,textarea"))e.preventDefault();});
 // Suppress a click following a scroll/drag; keyboard activation remains untouched.
 let gesture=null,suppressed=null;
 document.addEventListener("pointerdown",e=>{const target=e.target.closest(".collection-tile,.wallpaper-grid button,.icon-grid button,.category-card");if(e.button===0&&target)gesture={target,x:e.clientX,y:e.clientY,moved:false};});
 document.addEventListener("pointermove",e=>{if(gesture&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>7)gesture.moved=true;});
 document.addEventListener("pointerup",()=>{if(gesture?.moved)suppressed={target:gesture.target,until:performance.now()+350};gesture=null;});
 document.addEventListener("pointercancel",()=>{gesture=null;suppressed=null;});
 document.addEventListener("click",e=>{if(suppressed&&performance.now()<suppressed.until&&suppressed.target.contains(e.target)&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();}suppressed=null;},true);
 document.addEventListener("error",e=>{if(e.target instanceof HTMLImageElement){const image=e.target;image.classList.add("asset-missing");image.alt="Visuel indisponible";}},true);
 document.querySelector("#skip-content").addEventListener("click",()=>root.focus());router.start();
}
