// import v5 from 'uuid/v5';
import { SET_ALERT, REMOVE_ALERT } from './types';

export const setAlert = (msg, alertType, timeout = 5000) => dispatch => {
    var d = new Date();
    const id = d.getTime();

    dispatch({
        type: SET_ALERT,
        payload: { msg, alertType, id }
    });

    setTimeout(() => dispatch({
        type: REMOVE_ALERT,
        payload: id
    }), timeout)
};
