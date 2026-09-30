import {themes as packs} from "./packs.js";
import {premiumPacks} from "./premiumPacks.js";
import {loadCustomThemes} from "./customThemes.js";
function build(){const custom=loadCustomThemes();const classic=packs.map(t=>t.id==="jade"?{...t,name:"Jade — Classique"}:t);const list=[...premiumPacks,...classic,...custom];return {list,byId:Object.fromEntries(list.map(t=>[t.id,t]))};}
let cache=build();
export function refreshThemes(){cache=build();return cache.list;}
export function getThemes(){return cache.list;}
export function getThemesById(){return cache.byId;}
export const routes=[{id:"home",label:"Accueil"},{id:"collections",label:"Collections"},{id:"studio",label:"Studio"},{id:"mine",label:"Pour moi"}];
export const money=n=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(n);
export const formats=[{id:"small",name:"Small"},{id:"medium",name:"Medium"},{id:"large",name:"Large"}];
export const commerce={
 mode:"demo",
 contactEmail:"jphkkrysv@gmail.com",
 etsyUrl:"https://www.etsy.com/shop/SoftGlowIcons",
 legalOwner:"SnX-StuDiO KIM",
 legalAddress:"Montpellier, France"
};
