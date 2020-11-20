import { useReducer } from 'react';
import * as users from '../data/users.json';
import { RIDE_STATUS } from '../utils/constants'

const reducer = (state, action) => {
    switch (action.type) {
        case "DISTANCE":
            return {
                ...state, distance: action.value
            }
        case "UPDATE_PASSENGERS":
            state.users.filter(user => user.origin === action.busStop)
                .forEach(user => user.status = RIDE_STATUS.CHECKED_IN); //Check-in Passengers
            state.users.filter(user => user.destination === action.busStop)
                .forEach(user => user.status = RIDE_STATUS.COMPLETED); //Check-out Passengers
            return {
                ...state
            }
        default: {
            return state;
        }
    }
};

const useGlobalState = () => {
    const [globalState, globalDispatch] = useReducer(reducer, {
        users: users.data,
        distance: 0
    })
    return { globalState, globalDispatch };
}

export default useGlobalState