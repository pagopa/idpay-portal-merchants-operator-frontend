import { describe, it, expect, vi, beforeEach } from "vitest";
import i18n, {
  configureI18n,
} from "@pagopa/selfcare-common-frontend/lib/locale/locale-utils";
import itLocale from "./it.json";

vi.mock(
  "@pagopa/selfcare-common-frontend/lib/locale/locale-utils",
  async () => {
    const actual: any = await vi.importActual(
      "@pagopa/selfcare-common-frontend/lib/locale/locale-utils"
    );
    return {
      ...actual,
      configureI18n: vi.fn(actual.configureI18n),
      i18n: actual.i18n,
    };
  }
);

describe("locale configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls configureI18n with i18n and it.json", async () => {
    await import("./index");

    expect(configureI18n).toHaveBeenCalledWith({ i18n, it: itLocale });
  });

  it("loads a translation from it.json", async () => {
    await import("./index");

    const translated = i18n.t("commons.exitBtn");
    expect(translated).toBe(itLocale.commons.exitBtn);
  });
});
