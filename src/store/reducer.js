export const SET_DATA = 'SET_DATA';
export const RESET = 'RESET';

export const initialState = {
  address: ''
};

export function reducer(state, action) {
  switch (action.type) {
    case SET_DATA:
      return { ...state, ...action.payload };

    case RESET:
      return initialState;

    default:
      return state;
  }
}