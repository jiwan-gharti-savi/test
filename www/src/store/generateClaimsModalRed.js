const initialState = {
    isOpen: false 
  };
  
  const genrateClaimsModalRed = (state = initialState, action) => {
    switch (action.type) {
      case 'TOGGLECLAIMSMODAL':
        return {
          ...state,
          isOpen: !state.isOpen
        };
      default:
        return state;
    }
  };
  
  export default genrateClaimsModalRed;
  