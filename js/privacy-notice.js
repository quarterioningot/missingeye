const template = `
<div>
    <p>
        We do not store or transfer any of your private information, any storage is local or session based and
        absolutely no cookies are used. It's as simple as that!
    </p>
    <p>
        Third-party services that are embedded on this site might not respect the same levels of privacy as this site.
    </p>
    <p>
        By proceeding you acknowledge that you have read this notice and agree with it.
    </p>
    <button>Close</button>
</div>
`

const LS_PATH = "system/privacy-notice";

class PrivacyNotice extends HTMLElement {
    constructor() {
        super();

        const privacySettingsRaw = localStorage.getItem(LS_PATH);
        const privacySettings = JSON.parse(privacySettingsRaw);

        if (privacySettings && privacySettings.dismissed) {
            this.remove();
            return;
        }

        this.innerHTML = template;

        this.querySelector("button").addEventListener("click", () => {
           this.remove();
           localStorage.setItem(LS_PATH, JSON.stringify({
               dismissed: true
           }));
        });
    }
}

export function LoadPrivacyNotice() {
    customElements.define("privacy-notice", PrivacyNotice);
}