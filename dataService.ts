
import { CountryType, AgeGroupData } from './types';

const AGE_RANGES = [
  '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39',
  '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74',
  '75-79', '80-84', '85-89', '90-94', '95-99', '100+'
];

/**
 * Generates realistic population distributions based on year and country type.
 * Uses mathematical models to simulate demographic transition.
 */
export const getPopulationData = (year: number, type: CountryType): AgeGroupData[] => {
  const isDeveloped = type === CountryType.DEVELOPED;
  
  // Base factors that shift with time
  // Birth rate decline: faster in developed, slower in developing
  const birthRateFactor = isDeveloped 
    ? Math.max(0.3, 1 - (year - 1950) / 120) 
    : Math.max(0.4, 1.5 - (year - 1950) / 150);

  // Survival rate increase: life expectancy improvement
  const survivalGrowth = (year - 1950) / 150;

  return AGE_RANGES.map((ageRange, index) => {
    const ageValue = index * 5;
    
    // Calculate a "base" population curve
    // In 1950, most countries had a pyramid (high births, high deaths)
    // Developed countries transition to barrel/constrictive shapes
    
    let basePop: number;
    
    if (isDeveloped) {
      // Developed: Starts as pyramid, becomes barrel by 2000, then top-heavy by 2100
      const peakAge = Math.min(60, 20 + (year - 1950) / 2); // The bulge moves up
      const spread = 25 + (year - 1950) / 10;
      basePop = 100 * Math.exp(-Math.pow(ageValue - peakAge, 2) / (2 * Math.pow(spread, 2)));
      
      // Taper off for very old
      if (ageValue > 80) basePop *= Math.max(0.1, 1 - (ageValue - 80) / (40 + survivalGrowth * 20));
      
      // Younger generations shrinking
      if (ageValue < peakAge) {
        const shrinkFactor = Math.max(0.4, 1 - (year - 1950) / 200);
        basePop *= (0.7 + 0.3 * (ageValue / peakAge)) * shrinkFactor;
      }
    } else {
      // Developing: Starts as wide pyramid, slowly transitions but remains bottom-heavy longer
      const slope = Math.max(0.015, 0.05 - (year - 1950) / 4000);
      basePop = 150 * Math.exp(-slope * ageValue);
      
      // Add a slight bulge that moves up over time (improved infant mortality)
      const bulgePos = Math.max(0, (year - 1970) / 3);
      if (ageValue < bulgePos + 20) {
        basePop *= (1 + 0.2 * Math.exp(-Math.pow(ageValue - bulgePos, 2) / 100));
      }
    }

    // Small random variance to make it look "real"
    const variance = 1 + (Math.sin(year + index) * 0.02);
    
    // Final values (millions)
    const male = Math.max(1, basePop * variance * 0.5);
    const female = Math.max(1, basePop * variance * 0.51 * (1 + (ageValue / 500))); // Females live longer

    return {
      ageRange,
      male: parseFloat(male.toFixed(2)),
      female: parseFloat(female.toFixed(2))
    };
  });
};
