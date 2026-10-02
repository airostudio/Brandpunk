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
export const ANALYSIS_STORAGE_KEY = "brandpunk:analysis";
export const CONCEPT_STORAGE_KEY = "brandpunk:concept";

/**
 * No payment processor is wired up yet — this flag only toggles which
 * assets the ZIP builder includes so the Pro experience can be built,
 * demoed, and tested ahead of real billing.
 */
export type PlanTier = "free" | "pro";
export const PLAN_STORAGE_KEY = "brandpunk:plan";
