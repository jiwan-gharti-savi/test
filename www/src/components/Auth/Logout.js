import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

function Logout() {

    const dispatch = useDispatch();
    const history = useHistory();

        useEffect(()=>
        {
            localStorage.setItem("isLoggedIn", "false");
            localStorage.clear();
            dispatch({type : 'LOGOUT'})
            history.replace('/auth');
        })
  return (
   null
  )
}

export default Logout;