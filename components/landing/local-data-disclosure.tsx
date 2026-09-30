import { Message } from "@/components/locale-provider";

export function LocalDataDisclosure() {
  return <details className="landing-local-data"><summary><Message k="landing.localData" /></summary><p><Message k="landing.localDetail" /></p></details>;
}
