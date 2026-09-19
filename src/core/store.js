import { getThemesById } from "../data/catalog.js";
export function createStore(){
 let preferences={},theme="galaxy";
 try{const saved=JSON.parse(localStorage.getItem("snx.studio.v7")||"{}");if(saved&&typeof saved==="object"&&!Array.isArray(saved))preferences=saved;}catch{}
 function get(){const t=getThemesById()[theme]||getThemesById().galaxy,p=preferences[theme]||{};
  const defaults=t.defaultIcons.length?t.defaultIcons:t.icons.slice(0,12).map(i=>i.id);
  const activeWidget=t.widgets.find(w=>w.id===p.widget);
  return Object.freeze({theme,wallpaper:t.wallpapers.some(w=>w.id===p.wallpaper)?p.wallpaper:t.wallpapers[0]?.id||null,
   iconSlots:Array.from({length:12},(_,i)=>t.icons.some(x=>x.id===p.iconSlots?.[i])?p.iconSlots[i]:defaults[i%defaults.length]),
   widget:activeWidget?activeWidget.id:null,
   widgetSize:["small","medium","large"].includes(p.widgetSize)?p.widgetSize:(activeWidget?.format||"medium"),
   favoriteWallpapers:Array.isArray(p.favoriteWallpapers)?p.favoriteWallpapers.filter(id=>t.wallpapers.some(w=>w.id===id)):[],
   selectedSlot:Number.isInteger(p.selectedSlot)&&p.selectedSlot>=0&&p.selectedSlot<12?p.selectedSlot:0});
 }
 return {get,set(patch){if(getThemesById()[patch.theme])theme=patch.theme;preferences[theme]={...get(),...patch};const s=get();preferences[theme]={...s};try{localStorage.setItem("snx.studio.v7",JSON.stringify(preferences));}catch{}return s;}};
}
