"use client";

import { getCountryOptions } from "@/lib/countries";

type Props = {
  value: string; // ISO2
  onChange: (iso2: string) => void;
  id?: string;
};

// Web equivalent of the app's country/dial-code picker
// (KIS/src/components/common/SafeCountryPicker.tsx, wrapping
// react-native-country-picker-modal) - a native <select> here instead of a
// modal sheet, same underlying data shape (ISO2 + dial code), fully
// keyboard/screen-reader accessible with zero extra UI to build.
export function CountrySelect({ value, onChange, id }: Props) {
  const options = getCountryOptions();
  return (
    <select id={id} name="country" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((c) => (
        <option key={c.iso2} value={c.iso2}>
          {c.name} ({c.dialCode})
        </option>
      ))}
    </select>
  );
}
