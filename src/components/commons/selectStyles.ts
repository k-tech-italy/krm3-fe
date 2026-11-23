import { GroupBase, StylesConfig } from "react-select";

/** react-select styles following the theme variables in index.css (light and dark mode). */
export function krm3SelectStyles<Option>(
  invalid = false
): StylesConfig<Option, false, GroupBase<Option>> {
  return {
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--color-selector-menu)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--color-selector-selected)"
        : state.isFocused
          ? "var(--color-selector-focused)"
          : "",
    }),
    control: (base) => ({
      ...base,
      color: "var(--color-body-text)",
      backgroundColor: "var(--color-selector-controller)",
      ...(invalid ? { borderColor: "#ef4444" } : {}),
    }),
    singleValue: (base) => ({
      ...base,
      color: "var(--color-body-text)",
    }),
    input: (base) => ({
      ...base,
      color: "var(--color-body-text)",
    }),
    placeholder: (base) => ({
      ...base,
      color: "var(--color-body-text)",
    }),
  };
}
