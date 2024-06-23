import { useEffect } from 'react';
import './GoogleTranslate.css';

const GoogleTranslate = () => {
    useEffect(() => {
        const scriptId = 'google-translate-script';

        const addGoogleTranslateScript = () => {
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.type = 'text/javascript';
                script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                document.head.appendChild(script);
            }
        };

        const googleTranslateElementInit = () => {
            if (!window.google || !window.google.translate) {
                return;
            }
            new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'de,ar,en,es,jv,pt,ru,zh-CN,tr',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
            }, 'google_translate_element');
        };

        if (!window.googleTranslateElementInit) {
            window.googleTranslateElementInit = googleTranslateElementInit;
        }

        if (!window.google || !window.google.translate) {
            addGoogleTranslateScript();
        } else {
            googleTranslateElementInit();
        }
    }, []);

    return <div id="google_translate_element"></div>;
};

export default GoogleTranslate;
