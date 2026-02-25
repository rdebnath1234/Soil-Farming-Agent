import { SoilProperties } from './types/advice.types';

export function generateCropRecommendations(soil: SoilProperties) {
  const items = new Map<string, string>();
  const { ph, clay, sand } = soil;

  if (ph !== null && ph >= 6 && ph <= 7) {
    items.set('Rice', 'pH ৬-৭ হওয়ায় ধান ভালো ফলন দিতে পারে');
    items.set('Wheat', 'pH ৬-৭ রেঞ্জে গম ভালোভাবে বৃদ্ধি পায়');
  }

  if (clay !== null && clay >= 40) {
    items.set('Rice', 'মাটিতে কাদামাটি বেশি, তাই ধানের জন্য পানি ধরে রাখতে সুবিধা হবে');
  }

  if (sand !== null && sand >= 50) {
    items.set('Groundnut', 'বালির পরিমাণ বেশি হওয়ায় বাদামের শিকড় সহজে বৃদ্ধি পাবে');
  }

  if (ph !== null && ph < 6) {
    items.set('Potato', 'মাটি সামান্য অম্লীয় হওয়ায় আলুর জন্য উপযুক্ত');
  }

  if (!items.size) {
    items.set('Rice', 'মাটির প্রোফাইল অনুযায়ী ধান একটি নিরাপদ পছন্দ');
    items.set('Wheat', 'মাটির সাধারণ উর্বরতা অনুযায়ী গমও বিবেচ্য');
  }

  return Array.from(items.entries())
    .slice(0, 5)
    .map(([crop, why_bn]) => ({ crop, why_bn }));
}
