"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { INTAKE_STORAGE_KEY, type BrandIntake, type LogoAsset } from "@/lib/types";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function IntakeForm() {
  const router = useRouter();

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [keyStaff, setKeyStaff] = useState("");

  const [logo, setLogo] = useState<LogoAsset | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoError(null);

    const allowed = ["image/png", "image/svg+xml", "image/jpeg"];
    if (!allowed.includes(file.type)) {
      setLogoError("Please upload a PNG, SVG, or JPG file.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Logo must be smaller than 5MB.");
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setLogo({ dataUrl, fileName: file.name, mimeType: file.type });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (!businessName.trim()) {
      setSubmitError("Business name is required.");
      return;
    }
    if (!logo) {
      setSubmitError("Upload a logo to continue.");
      return;
    }

    setIsSubmitting(true);

    const intake: BrandIntake = {
      business: {
        websiteUrl: websiteUrl.trim(),
        businessName: businessName.trim(),
        tagline: tagline.trim(),
        registrationNumber: registrationNumber.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        socialLinks: socialLinks.trim(),
        keyStaff: keyStaff.trim(),
      },
      logo,
      submittedAt: new Date().toISOString(),
    };

    try {
      window.sessionStorage.setItem(INTAKE_STORAGE_KEY, JSON.stringify(intake));
    } catch {
      setSubmitError("Your logo file is too large to continue. Try a smaller image.");
      setIsSubmitting(false);
      return;
    }

    router.push("/analyzing");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sticker-shadow w-full max-w-2xl border-4 border-foreground bg-background/80 p-6 backdrop-blur sm:p-8"
    >
      <div className="space-y-8">
        <section className="space-y-2">
          <label htmlFor="websiteUrl" className="font-display flex items-baseline gap-2 text-sm uppercase tracking-wide text-foreground">
            <span className="text-accent">01</span> Website URL
          </label>
          <input
            id="websiteUrl"
            type="url"
            inputMode="url"
            placeholder="https://yourbusiness.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full border-2 border-foreground/30 bg-black/40 px-4 py-3 font-mono text-base text-foreground placeholder:text-foreground/30 outline-none focus:border-accent"
          />
        </section>

        <section className="space-y-2">
          <label htmlFor="logo" className="font-display flex items-baseline gap-2 text-sm uppercase tracking-wide text-foreground">
            <span className="text-accent">02</span> Upload Logo
          </label>
          <label
            htmlFor="logo"
            className="flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-foreground/30 bg-black/20 px-4 py-8 text-center transition hover:border-accent"
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo.dataUrl}
                alt="Uploaded logo preview"
                className="max-h-24 max-w-full object-contain"
              />
            ) : (
              <span className="font-mono text-sm text-foreground/50">PNG / SVG / JPG — drop it here or click to browse</span>
            )}
            {logo && <span className="font-mono text-xs text-foreground/40">{logo.fileName} — click to replace</span>}
            <input
              id="logo"
              type="file"
              accept="image/png,image/svg+xml,image/jpeg"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>
          {logoError && <p className="font-mono text-sm text-accent-2">{logoError}</p>}
        </section>

        <section className="space-y-4">
          <p className="font-display flex items-baseline gap-2 text-sm uppercase tracking-wide text-foreground">
            <span className="text-accent">03</span> Business Details
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Business name" required>
              <input
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={inputClass}
                placeholder="Acme Plumbing"
              />
            </Field>
            <Field label="Tagline">
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className={inputClass}
                placeholder="Reliable plumbing across Melbourne"
              />
            </Field>
            <Field label="ABN / company number">
              <input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className={inputClass}
                placeholder="12 345 678 901"
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="(03) 9000 0000"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="hello@yourbusiness.com"
              />
            </Field>
            <Field label="Social links">
              <input
                value={socialLinks}
                onChange={(e) => setSocialLinks(e.target.value)}
                className={inputClass}
                placeholder="instagram.com/yourbusiness"
              />
            </Field>
            <Field label="Address" full>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClass}
                placeholder="123 Example St, Melbourne VIC"
              />
            </Field>
            <Field label="Key staff (names / titles)" full>
              <textarea
                value={keyStaff}
                onChange={(e) => setKeyStaff(e.target.value)}
                className={`${inputClass} min-h-20 resize-y`}
                placeholder="Sarah Lee — Sales Manager&#10;Steve Lee — Director"
              />
            </Field>
          </div>
        </section>

        {submitError && <p className="font-mono text-sm text-accent-2">{submitError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="font-display sticker-shadow w-full border-4 border-ink bg-accent px-6 py-4 text-center text-lg uppercase tracking-wide text-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Firing Up The Studio…" : "Hey Punk, Create My Brand Pack"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full border-2 border-foreground/30 bg-black/40 px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-foreground/30 outline-none focus:border-accent";

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="font-mono text-xs font-medium uppercase tracking-wide text-foreground/50">
        {label}
        {required && <span className="text-accent-2"> *</span>}
      </span>
      {children}
    </label>
  );
}
