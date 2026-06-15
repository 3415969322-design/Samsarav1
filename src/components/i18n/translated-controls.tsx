"use client";

import type { ComponentProps } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

type InputProps = Omit<ComponentProps<"input">, "placeholder"> & {
  placeholderKey?: TranslationKey;
};

type TextareaProps = Omit<ComponentProps<"textarea">, "placeholder"> & {
  placeholderKey?: TranslationKey;
};

type SelectProps = ComponentProps<"select"> & {
  options: {
    labelKey: TranslationKey;
    value: string;
  }[];
};

export function TranslatedInput({ placeholderKey, ...props }: InputProps) {
  const { t } = useLanguage();

  return <input {...props} placeholder={placeholderKey ? t(placeholderKey) : undefined} />;
}

export function TranslatedTextarea({ placeholderKey, ...props }: TextareaProps) {
  const { t } = useLanguage();

  return (
    <textarea
      {...props}
      placeholder={placeholderKey ? t(placeholderKey) : undefined}
    />
  );
}

export function TranslatedSelect({ options, ...props }: SelectProps) {
  const { t } = useLanguage();

  return (
    <select {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {t(option.labelKey)}
        </option>
      ))}
    </select>
  );
}
