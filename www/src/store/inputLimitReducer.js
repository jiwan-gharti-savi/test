const initialState = {limitExceed : false};


const inputLimitReducer = (state = initialState, action) =>
{
    if(action.type == 'EXCEED')
    {
        return{
            limitExceed :true
        }
    }
    else if(action.type == 'INLIMIT')
    {
        return{
            limitExceed :false
        }
    }
    else{
        return state;
    }
}

export default inputLimitReducer;