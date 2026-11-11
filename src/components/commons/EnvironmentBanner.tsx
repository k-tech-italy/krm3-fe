import { useEffect, useState } from "react";
import { EnvironmentInfo, getEnvironment } from "../../restapi/environment.ts";

export default function EnvironmentBanner() {
  const [environment, setEnvironment] = useState<EnvironmentInfo | null>(null);

  useEffect(() => {
    // Hidden when the colour header is missing (production) or the probe fails.
    getEnvironment()
      .then(setEnvironment)
      .catch(() => setEnvironment(null));
  }, []);

  if (!environment) {
    return null;
  }

  return (
    <div
      data-testid="environment-banner"
      style={{ backgroundColor: environment.color }}
      className="w-full text-center text-sm font-bold text-black py-1"
    >
      {environment.label}
    </div>
  );
}
