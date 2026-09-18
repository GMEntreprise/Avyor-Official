import creatorsPoster from '../assets/heroes/creators-desktop.webp';
import creatorsMobilePoster from '../assets/heroes/creators-mobile.webp';
import creatorsVideo from '../assets/heroes/creators-desktop.mp4';
import creatorsMobileVideo from '../assets/heroes/creators-mobile.mp4';
import brandsPoster from '../assets/heroes/brands-desktop.webp';
import brandsMobilePoster from '../assets/heroes/brands-mobile.webp';
import brandsVideo from '../assets/heroes/brands-desktop.mp4';
import brandsMobileVideo from '../assets/heroes/brands-mobile.mp4';
import featuresPoster from '../assets/heroes/features-desktop.webp';
import featuresMobilePoster from '../assets/heroes/features-mobile.webp';
import featuresVideo from '../assets/heroes/features-desktop.mp4';
import featuresMobileVideo from '../assets/heroes/features-mobile.mp4';

export interface PageHeroMedia {
  poster: string;
  mobilePoster: string;
  video: string;
  mobileVideo: string;
}

export const pageHeroes: Readonly<Record<string, PageHeroMedia | undefined>> = {
  creators: {
    poster: creatorsPoster,
    mobilePoster: creatorsMobilePoster,
    video: creatorsVideo,
    mobileVideo: creatorsMobileVideo,
  },
  brands: {
    poster: brandsPoster,
    mobilePoster: brandsMobilePoster,
    video: brandsVideo,
    mobileVideo: brandsMobileVideo,
  },
  features: {
    poster: featuresPoster,
    mobilePoster: featuresMobilePoster,
    video: featuresVideo,
    mobileVideo: featuresMobileVideo,
  },
};
