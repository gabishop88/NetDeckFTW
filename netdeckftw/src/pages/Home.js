import { Redirect } from "react-router-dom";
import React, { useState } from 'react';
import '../stylesheets/Home.scss';
import Axios from "axios";
const url = 'http://localhost:3002';

function Home(state) {
    const [cardResults, setCardResults] = useState([]);
    const [ownedDecks, setOwnedDecks] = useState([]);
    const [selected, setSelected] = useState('');

    function updateCardList(e) {
        var cardName = '';
        if (e) {
            cardName = e.target.value;
        }
        

        Axios.post(url + '/db/cardsearch', {name: cardName.replaceAll(/'/ig, "''")}).then(result => {
            setCardResults(result.data);
        });
    }
    if (cardResults.length === 0) updateCardList(null);

    return state.userName === '' ? 
    (
        <Redirect to='/login'></Redirect>
    ) : (
        <div className='Home'>
            <div className='layout'>
                <div className='card-search flex-col'>
                    <ul className='card-results'>
                        {
                            cardResults.map((elem) => {
                                return (
                                    <li>{elem.CardName}</li>
                                );
                            })
                        }

                    </ul>
                    <div className='search-options'>
                        <input id='search_cardname' type='text' placeholder='Card Name' onChange={updateCardList}></input>
                    </div>
                </div>
                <div className='workspace flex-col'>
                    <div className='display-cards'>
                        Something
                    </div>
                    <div className='owned-groups'>
                        <p>Something else</p>
                        <ul className='owned-decks'>
                            {
                                ownedDecks.map(deck => {
                                    return (
                                        <li id={'Deck#' + deck.deckID} onClick={e => setSelected(e.target.id)}>{deck.DeckName}</li>
                                    );
                                })
                            }
                        </ul>
                    </div>
                </div>
                <div className='extras-panel flex-col'>
                    <p>Usage TBD</p>
                </div>
            </div>
        </div>
    );
}

export default Home;