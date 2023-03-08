/**
 * eslint-disable
 *
 * @format
 */

import axios from 'axios';
import { showAlert } from './alert';

// type is either password or data
export const updateData = async (data, type) => {
    try {
        let url;
        if (type === 'password') {
            url = 'http://127.0.0.1:3000/v1/auth/profile/update-password';
        } else {
            url = 'http://127.0.0.1:3000/v1/auth/profile';
        }
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        if (res.data.status === 'SUCCESS') {
            showAlert('SUCCESS', 'Updated Successfully!!');
            window.setTimeout(() => {
                location.assign('/profile');
            }, 750);
        }
    } catch (error) {
        showAlert('ERROR', error.response.data.message);
    }
};
