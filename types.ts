
export enum CountryType {
  DEVELOPED = 'Developed (Land A)',
  DEVELOPING = 'Developing (Land B)'
}

export interface AgeGroupData {
  ageRange: string;
  male: number;
  female: number;
}

export interface DemographicSnapshot {
  year: number;
  data: AgeGroupData[];
}

export interface AIInsight {
  title: string;
  content: string;
  keyStats: string[];
}
