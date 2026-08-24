import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

export type CountryOption = {
  /** ISO 3166-1 alpha-2, e.g. "CM" - sent to Django as `country`. */
  iso2: CountryCode;
  /** e.g. "Cameroon" */
  name: string;
  /** e.g. "+237" - sent to Django as `phone_country_code`. */
  dialCode: string;
};

// Country list + dial codes come from libphonenumber-js's bundled metadata
// (the same authoritative dataset most production phone inputs use) rather
// than a hand-maintained list - no separate country-name package needed
// since Intl.DisplayNames (built into Node 18+/all modern browsers) covers
// that from the ISO2 code alone.
let cached: CountryOption[] | null = null;

export function getCountryOptions(): CountryOption[] {
  if (cached) return cached;
  const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
  cached = getCountries()
    .map((iso2) => {
      let dialCode = "";
      try {
        dialCode = `+${getCountryCallingCode(iso2)}`;
      } catch {
        return null;
      }
      const name = displayNames.of(iso2) || iso2;
      return { iso2, name, dialCode };
    })
    .filter((c): c is CountryOption => c !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
  return cached;
}

export function findCountry(iso2: string): CountryOption | undefined {
  return getCountryOptions().find((c) => c.iso2 === iso2);
}
