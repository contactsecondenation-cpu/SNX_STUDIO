import { routes, getThemesById } from "../data/catalog.js";
/** Hash router retained; the purchase drawer is a history state inside Studio. */
export function createRouter(onChange){
 const valid=new Set(routes.map(r=>r.id));
 function read(){
  const [raw,slug]=location.hash.slice(1).split("/");
  const aliases={hub:"collections",collection:"studio",preview:"studio",purchase:"studio"};
  const themesById=getThemesById();
  return {route:valid.has(raw)?raw:(aliases[raw]||"home"),theme:themesById[slug]?slug:"galaxy"};
 }
 function url(route,theme="galaxy"){const themesById=getThemesById();return "#"+(valid.has(route)?route:"home")+(route==="studio"?"/"+(themesById[theme]?theme:"galaxy"):"");}
 function changed(){const s=read(),canonical=url(s.route,s.theme);if(location.hash!==canonical)history.replaceState(null,"",canonical);onChange(s);}
 function navigate(route,theme){const next=url(route,theme);if(location.hash!==next){history.pushState(null,"",next);changed();}}
 window.addEventListener("popstate",changed);window.addEventListener("hashchange",changed);
 return {read,url,navigate,start:changed,destroy(){window.removeEventListener("popstate",changed);window.removeEventListener("hashchange",changed);}};
}
