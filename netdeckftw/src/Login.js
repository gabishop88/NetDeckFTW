import './Login.scss'
import React, { useState } from 'react';
import Axios from 'axios';

let url = 'http://localhost:3002';

function Login() {
    const [userMatch, setUserMatch] = useState(false);

    function changeUsername(e) {
        Axios.get(url + '/db/checkuser?username=' + e.target.value).then((response) => {
            setUserMatch(response.data.length);
            var button = document.getElementById('login_submit');
            console.log(button.innerHTML);
            if (response.data.length === 0) {
                button.innerHTML = "Sign Up";
            } else {
                button.innerHTML = "Log In";
            }
        });
    }

    function changePassword(e) {
        console.log(!userMatch && e.target.value.length > 0);
        var verify = document.getElementById('verify_password');
        if (!userMatch && e.target.value) {
            verify.classList.add("show");
        } else {
            verify.classList.remove("show");
        }
    }

    function checkPasswordMatch(e) {
        var check = e.target.value;
        var password = document.getElementById('password_input').value;
        if (check === password) {
            e.target.classList.add('verified');
        } else {
            e.target.classList.remove('verified');
        }
    }

// Fix how to show the password boxes. Need something easy, intuitive, uninvasive, and mobile friendly

    return (
        <div className='Login-Page'>
            <div className='login-box'>
                <p className='title'>Log In or Sign Up</p>
                <input type='text' placeholder='Username' onChange={changeUsername}></input>
                <input type='password' id='password_input' placeholder='Password' onChange={changePassword} onMouseOver={e => e.target.type = 'text'} onMouseLeave={e => e.target.type = 'password'}></input>
                <input type='password' id='verify_password' placeholder='Verify Password' onChange={checkPasswordMatch} onMouseOver={e => e.target.type = 'text'} onMouseLeave={e => e.target.type = 'password'}></input>
                <button id='login_submit' className='submit'>Log In</button>
            </div>
        </div>
    );
}

export default Login;
