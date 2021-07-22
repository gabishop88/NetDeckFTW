import './Login.scss'
import React, { useState } from 'react';
import Axios from 'axios';
import { Redirect } from "react-router-dom";

const bcrypt = require('bcryptjs');
const saltRounds = 11;
const url = 'http://localhost:3002';

function Login(state) {
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

    function submitLogin(e) {
        var elems = e.target.parentElement.children;
        var username = elems[0].value;
        var password = elems[1].value;
        if (username.length === 0 || password.length === 0) {
            // Error: You must have a username and password
        } else if (elems[2].value !== password) {
            // Error: Passwords must match
        } else {
            if (userMatch) {
                Axios.get(url + '/db/getpwdhash?username=' + username).then((response) => {
                    console.log(response);
                    // bcrypt.compare(password, reponse, (err, result) => {
                    //     if (result) {
                    //         // Verified, Log in
                    //     } else {
                    //         // Incorrect Password
                    //     }
                    // });
                });
            } else {
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    // Axios.post();
                });
            }
        }
    }

// Fix how to show the password boxes. Need something easy, intuitive, uninvasive, and mobile friendly
    console.log(state)
    return state.userName === "" ?
    (
        <div className='Login-Page'>
                <div className='login-box'>
                    <p className='title'>Log In or Sign Up</p>
                    <input type='text' placeholder='Username' onChange={changeUsername}></input>
                    <input type='password' id='password_input' placeholder='Password' onChange={changePassword} onMouseOver={e => e.target.type = 'text'} onMouseLeave={e => e.target.type = 'password'}></input>
                    <input type='password' id='verify_password' placeholder='Verify Password' onChange={checkPasswordMatch} onMouseOver={e => e.target.type = 'text'} onMouseLeave={e => e.target.type = 'password'}></input>
                    <button id='login_submit' className='submit' onClick={submitLogin}>Log In</button>
                </div>
            </div>
    ) : (
        <Redirect to='/home'></Redirect>
    );
}

export default Login;
