import { Redirect } from "react-router-dom";
import React, { useState } from 'react';
import './Home.scss';
import Axios from "axios";
const url = 'http://localhost:3002';

function Home(state) {
    const [cardResults, setCardResults] = useState([]);

    function updateCardList(e) {
        var cardName = e.target.value;

        Axios.post(url + '/db/cardsearch', {name: cardName.replaceAll(/'/ig, "''")}).then(result => {
            setCardResults(result.data);
            console.log(cardResults);
        });
    }

    return state.userName === '' ? 
    (
        <Redirect to='/login'></Redirect>
    ) : (
        <div className='Home'>
            <div className='layout'>
                <div className='cardSearch flex-col'>
                    <ul className='card-results'>
                        {
                            cardResults.map((elem) => {
                                console.log(elem);
                                return (<li>{elem.CardName}</li>);
                            })
                        }
                    </ul>
                    <input type='text' placeholder='Card Name' onChange={updateCardList}></input>
                </div>
                <div className='workspace flex-col'>

                </div>
                <div className='extrasPanel flex-col'>

                </div>
            </div>
        </div>
    );
}

export default Home;