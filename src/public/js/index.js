/** @format */

import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateData } from './updateSettings';
// DOM elements
const mapbox = document.getElementById('map');
if (mapbox) {
    const locations = JSON.parse(mapbox.dataset.locations);
    displayMap(locations);
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const passowrd = document.getElementById('password').value;
        login(email, passowrd);
    });
}

const logoutButton = document.querySelector('.nav__el--logout');
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        logout();
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

        updateData(form, 'data');
    });
}

const updatePassword = document.querySelector('.form-user-settings');
if (updatePassword) {
    updatePassword.addEventListener('submit', (e) => {
        e.preventDefault();
        const passwordCurrent =
            document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm =
            document.getElementById('password-confirm').value;

        updateData({ passwordCurrent, password, passwordConfirm }, 'password');
    });
}
