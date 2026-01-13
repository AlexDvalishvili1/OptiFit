import {parsePhoneNumberFromString} from "libphonenumber-js";

export function derivePhoneValidation(phoneRaw: string, phoneTouched: boolean) {
    const parsed = parsePhoneNumberFromString(phoneRaw);

    const phoneHasDigits = /\d/.test(phoneRaw);

    const hasNationalDigits = (() => {
        if (!parsed) return false;
        const nn = String(parsed.nationalNumber ?? "");
        return /\d/.test(nn);
    })();

    const phoneValid = !!parsed?.isValid();

    const showPhoneOk = phoneTouched && phoneHasDigits && phoneValid;
    const showPhoneError = phoneTouched && hasNationalDigits && !phoneValid;

    return {
        phoneValid,
        showPhoneOk,
        showPhoneError,
    };
}