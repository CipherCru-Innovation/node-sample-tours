"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showAlert = exports.hideAlert = void 0;
const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el)
        el.parentElement.removeChild(el);
};
exports.hideAlert = hideAlert;
const showAlert = (type, msg) => {
    (0, exports.hideAlert)();
    const markup = `<div class="alert alert--${type.toLowerCase()}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(exports.hideAlert, 5000);
};
exports.showAlert = showAlert;
