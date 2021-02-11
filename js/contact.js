class ContactFormContainer extends HTMLElement {

    constructor() {
        super();

        const contactForm = this.querySelector("#contact-form");
        const afterSubmitText = this.querySelector("#after-submit-text");
        const errorText = this.querySelector("#error-text");

        if (!contactForm || !afterSubmitText || !errorText) {
            return;
        }

        contactForm.addEventListener("submit", e => {
            e.preventDefault();

            const result = this._submitForm();

            if (!result) {
                errorText.style.display = "block";
                return;
            }

            afterSubmitText.style.display = "block";
            contactForm.style.display = "none";
            errorText.style.display = "none"
        })
    }

    _submitForm() {
        return false;
    }
}

export function LoadContact() {
    customElements.define("contact-form-container", ContactFormContainer);
}