import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { LocaleProvider } from "@/components/locale-provider";

export function renderWithLocale(ui: ReactNode) {
  return render(<LocaleProvider>{ui}</LocaleProvider>);
}
