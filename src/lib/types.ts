export type BusinessDetails = {
  websiteUrl: string;
  businessName: string;
  tagline: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  socialLinks: string;
  keyStaff: string;
};

export type LogoAsset = {
  dataUrl: string;
  fileName: string;
  mimeType: string;
};

export type BrandIntake = {
  business: BusinessDetails;
  logo: LogoAsset | null;
  submittedAt: string;
};

export const INTAKE_STORAGE_KEY = "brandpunk:intake";
