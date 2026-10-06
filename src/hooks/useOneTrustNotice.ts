import { Dispatch, SetStateAction, useEffect, useLayoutEffect } from 'react';

const NOTICE_SCRIPT_ID = 'otprivacy-notice-script';

const loadNoticeScript = (): Promise<void> => {
  const existingScript = document.getElementById(NOTICE_SCRIPT_ID);

  if (existingScript) {
    return window.OneTrust?.NoticeApi?.Initialized ?? Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = NOTICE_SCRIPT_ID;
    script.src = import.meta.env.VITE_ONE_TRUST_OTNOTICE_CDN_URL;
    script.type = 'text/javascript';
    script.charset = 'UTF-8';
    script.text = `settings="${import.meta.env.VITE_ONE_TRUST_OTNOTICE_CDN_SETTINGS}"`;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load OneTrust Notice SDK'));
    document.head.appendChild(script);
  });
};

export const useOneTrustNotice = (
  url: string,
  contentLoaded: boolean,
  setContentLoaded: Dispatch<SetStateAction<boolean>>,
  urlPrefix: string
) => {
  useEffect(() => {
    let isMounted = true;

    loadNoticeScript()
      .then(() => window.OneTrust?.NoticeApi?.Initialized)
      .then(() => {
        if (!window.OneTrust?.NoticeApi) {
          throw new Error('OneTrust Notice API is not available');
        }

        return window.OneTrust.NoticeApi.LoadNotices([url], false);
      })
      .catch(() => {
        // The SDK can fail independently of the application page. The container
        // remains available and contentLoaded indicates that loading is complete.
      })
      .finally(() => {
        if (isMounted) {
          setContentLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setContentLoaded, url]);

  useLayoutEffect(() => {
    if (!contentLoaded) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const links = document.querySelectorAll('.otnotice-content a');

      links.forEach((link) => {
        const href = link.getAttribute('href');

        if (href?.startsWith('#')) {
          const baseUrl = import.meta.env.BASE_URL.replace(/\/+$/, '');
          const normalizedRoute = `/${urlPrefix.replace(/^\/+|\/+$/g, '')}`;
          link.setAttribute('href', `${baseUrl}${normalizedRoute}${href}`);
        }
      });

      const sidebar = document.getElementsByClassName('otnotice-menu')[0];

      if (sidebar instanceof HTMLElement) {
        sidebar.style.maxHeight = '65%';
      }
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [contentLoaded, urlPrefix]);
};
