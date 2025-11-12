interface OneTrustNoticeApi {
  Initialized: Promise<void>;
  LoadNotices: (urls: string[], param: boolean) => Promise<void>;
}

interface OneTrustInstance {
  NoticeApi: OneTrustNoticeApi;
}

declare global {
  interface Window {
    OneTrust?: OneTrustInstance;
  }
}

let cookieInitialized = false;
let cookieInitializationPromise: Promise<void> | null = null;


export const initializeCookieOneTrust = (): Promise<void> => {
  if (cookieInitialized) {
    return Promise.resolve();
  }

  if (cookieInitializationPromise) {
    return cookieInitializationPromise;
  }

  cookieInitializationPromise = new Promise((resolve, reject) => {
    const cookieScript = document.createElement('script');
    cookieScript.src = `${import.meta.env.VITE_ONE_TRUST_BASE_URL}/scripttemplates/otSDKStub.js`;
    cookieScript.type = 'text/javascript';
    cookieScript.setAttribute('data-domain-script', import.meta.env.VITE_ONE_TRUST_DOMAIN_ID);

    cookieScript.onload = () => {
      cookieInitialized = true;
      resolve();
    };
    cookieScript.onerror = () => reject(new Error('Failed to load OneTrust SDK'));
    document.head.appendChild(cookieScript);
  });
  return cookieInitializationPromise;
};