import { useState, useEffect } from 'react';

export function usePWA(autoShowDelay = 30000) {
  const [prompt, setPrompt]     = useState(null);
  const [showBanner, setBanner] = useState(false);

  useEffect(() => {
    const onPrompt    = e => { e.preventDefault(); setPrompt(e); };
    const onInstalled = () => { setPrompt(null); setBanner(false); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!prompt) return;
    const t = setTimeout(() => setBanner(true), autoShowDelay);
    return () => clearTimeout(t);
  }, [prompt, autoShowDelay]);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    setPrompt(null);
    setBanner(false);
  };

  return { canInstall: !!prompt, showBanner, install, dismissBanner: () => setBanner(false) };
}
