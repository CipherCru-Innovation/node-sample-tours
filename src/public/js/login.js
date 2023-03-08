/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/v1/auth/login',
            data: {
                username: email,
                password
            }
        });
        if (res.data.status === 'SUCCESS') {
            showAlert('SUCCESS', 'Logged in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 750);
        }
    } catch (error) {
        showAlert('ERROR', error.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/v1/auth/logout'
        });
        if (res.data.status === 'SUCCESS') {
            showAlert('SUCCESS', 'Logged out successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 750);
        }
    } catch (error) {
        showAlert('ERROR', error.response.data.message);
    }
};
