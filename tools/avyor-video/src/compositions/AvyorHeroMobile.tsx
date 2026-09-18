import { AvyorHero } from './AvyorHero';
export const AvyorHeroMobile=({production=false,showGuides=false}:{production?:boolean;showGuides?:boolean})=><AvyorHero format="mobile" production={production} showGuides={showGuides}/>;
