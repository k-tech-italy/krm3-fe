import {useTranslation} from "react-i18next";

export function Welcome() {
    const { t } = useTranslation();
    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-app">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">{t('Welcome')}!</h1>
      <p className="text-lg text-app">
        This is the welcome page. Please use the navigation to continue.
      </p>
    </div>
  );
}
