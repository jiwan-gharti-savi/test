const initialState = {
    login : false,
    token : null
  };



  const authReducer = (state = initialState, action) =>
  {
    if(action.type == 'LOGIN')
    {
        return{
            ...state,
            login : true
        }
    }
    else if(action.type == 'UPDATE_TOKEN')
    {
        return{
            ...state,
            token : action.payload
        }
    }
    else if(action.type == 'LOGOUT')
    {
        return{
            ...state,
            login : false
        }
    }
    else {
        return state;
    }
  }

  export default authReducer;