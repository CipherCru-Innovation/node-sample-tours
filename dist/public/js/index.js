"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
require("@babel/polyfill");
const login_1 = require("./login");
const mapbox_1 = require("./mapbox");
const updateSettings_1 = require("./updateSettings");
// DOM elements
const mapbox = document.getElementById('map');
if (mapbox) {
    const locations = JSON.parse(mapbox.dataset.locations);
    (0, mapbox_1.displayMap)(locations);
}
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const passowrd = document.getElementById('password').value;
        (0, login_1.login)(email, passowrd);
    });
}
const logoutButton = document.querySelector('.nav__el--logout');
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        (0, login_1.logout)();
    });
}
const updateProfile = document.querySelector('.form-user-data');
if (updateProfile) {
    updateProfile.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        (0, updateSettings_1.updateData)(form, 'data');
    });
}
const updatePassword = document.querySelector('.form-user-settings');
if (updatePassword) {
    updatePassword.addEventListener('submit', (e) => {
        e.preventDefault();
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        (0, updateSettings_1.updateData)({ passwordCurrent, password, passwordConfirm }, 'password');
    });
}
