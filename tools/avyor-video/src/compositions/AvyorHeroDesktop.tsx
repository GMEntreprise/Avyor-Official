import { AvyorHero } from './AvyorHero';
export const AvyorHeroDesktop=({production=false,showGuides=false}:{production?:boolean;showGuides?:boolean})=><AvyorHero format="desktop" production={production} showGuides={showGuides}/>;
