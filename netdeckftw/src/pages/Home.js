import { Redirect } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import '../stylesheets/Home.scss';
import Axios from "axios";
const url = 'http://localhost:3002';

function Home(state) {

    const [cardResults, setCardResults] = useState([]);
    const [cardResultsLimit, setCardResultsLimit] = useState(15);
    const [ownedGroups, setOwnedGroups] = useState([]);
    const [selectedGroupType, setSelectedGroupType] = useState('Decks');
    const [recommendations, setRecommendations] = useState([]);
    const [dragging, setDragging] = useState('');
    const [hoveredImage, setHoveredImage] = useState('');

    function sortCardsByLocation(cards) {
        if (selectedGroupType === 'Collections') return cards;
        let output = {};
        for (var i in cards) {
            if (!output.hasOwnProperty(cards[i].Location)) output[cards[i].Location] = [];
            output[cards[i].Location].push(cards[i]);
        }
        if (!output.hasOwnProperty('sideboard')) output['sideboard'] = [];
        return [output];
    }

    const defaultSelection = {name: null, id: 'none', desc: '', cards: sortCardsByLocation([])};
    const [selectedGroup, setSelectedGroup] = useState(defaultSelection);

    function updateCardList(e) {
        var cardName = '';
        if (e) cardName = e.target.value;
        Axios.post(url + '/db/cardsearch', {name: cardName.replaceAll(/'/ig, "''")}).then(result => {
            setCardResults(result.data);
            if (result.data.length === 1) { // OR name matches a result
                let format = 'none';
                if (selectedGroup.name)  {
                    // Get request for format OR store format in selectedGroup
                }
                Axios.get(url + `/db/getrecommendations/${result.data[0].DetailID}?format=${format}`).then(result => {
                    console.log(result.data[0]);
                    setRecommendations(result.data[0].slice(0, 20));
                });
            }
        });
    }
    if (cardResults.length === 0) updateCardList(null); 

    useEffect(() => {
        async function getOwned() {
            Axios.get(url + '/db/getgroups?type=' + selectedGroupType + '&owner=' + state.userName).then(result => {
                result.data.push({name: '+', id: 'creator'});
                setOwnedGroups(result.data);
            });
        }
        getOwned();
    }, [selectedGroupType, state.userName, selectedGroup]);

    function selectGroup(group) {
        if (group.id === 'creator') {
            Axios.post(url + '/db/addgroup', {type: selectedGroupType, owner: state.userName}).then(result => {
                if (result.data === 'Creation Failed') {
                    return; // Error messages?
                }
                Axios.get(url + '/db/groupcards?type=' + selectedGroupType + '&id=' + result.data[0].id).then(res2 => {
                    setSelectedGroup({name: result.data[0].name, id: result.data[0].id, desc: result.data[0].desc, cards: sortCardsByLocation(res2.data)});
                });
            });
        } else {
            Axios.get(url + '/db/groupcards?type=' + selectedGroupType + '&id=' + group.id).then(result => {
                console.log(`'${group.name}'`, result.data);
                setSelectedGroup({name: group.name, id: group.id, desc: group.desc, cards: sortCardsByLocation(result.data)});
            });
        }
    }

    function switchSelected() {
        setSelectedGroupType(selectedGroupType === 'Decks' ? 'Collections' : 'Decks');
        setSelectedGroup(defaultSelection);
    }

    function updateGroup(change) {
        console.log(change);
        Axios.post(url + '/db/updategroup?type=' + selectedGroupType + '&id=' + selectedGroup.id, change).then(result => {
            setSelectedGroup({
                name: (change.hasOwnProperty('name') ? change.name : selectedGroup.name),
                id: selectedGroup.id,
                desc: (change.hasOwnProperty('desc') ? change.desc : selectedGroup.desc),
                cards: selectedGroup.cards
            });
        });
    }

    function deleteGroup(id) {
        // Eventually maybe have a confirmation?
        Axios.delete(url + `/db/deletegroup/${id}?type=${selectedGroupType}`).then(result => {
            if (result.data === "Done") setSelectedGroup(defaultSelection);
        });
    }

    function dragCard(e) {
        e.preventDefault();
        var card = e.target.dataset.cardid;
        if (dragging !== card) setDragging(card);
        // console.log(e); // Maybe show a better drag card thing
    }

    function addCard(loc = null) {
        // console.log(dragging, e.target);
        var options = {};
        if (loc) options['location'] = loc;
        if (dragging !== '') {
            Axios.post(`${url}/db/addcard/${selectedGroup.id}/${dragging}?type=${selectedGroupType}`, options).then(result => {
                selectGroup(selectedGroup);
            });
        }
    }

    function removeCard() {
        if (dragging !== '') {
            Axios.delete(`${url}/db/removecard/${selectedGroup.id}/${dragging}?type=${selectedGroupType}`).then(result => {
                selectGroup(selectedGroup);
            });
        }
    }

    function moveCard(loc = null) {
        
    }

    return state.userName === '' ? 
    (
        <Redirect to='/login'></Redirect>
    ) : (
        <div className='Home'>
            <div className='layout'>
                <div className='card-search flex-col'>
                    <div></div>
                    <ul className='card-results' onDrop={e => removeCard()} onDragOver={e => e.preventDefault()}>
                        {
                            cardResults.slice(0, cardResultsLimit).map(elem => {
                                return (
                                    <li key={elem.DetailID} draggable='true' onDrag={e => dragCard(e)} onMouseOver={e => setHoveredImage(e.target.dataset.mid)} data-mid={elem.MultiverseID} data-cardid={elem.DetailID}>{elem.CardName}</li>
                                );
                            })
                        }
                    </ul>
                    <div className='search-options'>
                        <input id='search_cardname' type='text' placeholder='Card Name' onChange={updateCardList}></input>
                        <div className='result-limit'>
                            <input type='number' value={cardResultsLimit} onChange={e => setCardResultsLimit(Math.max(0, e.target.value))}></input>
                            <p>{' Results'}</p>
                        </div>
                    </div>
                </div>
                <div className='workspace flex-col'>
                    <div className='deck-info'>
                        <input type='text' value={selectedGroup.id !== 'none' ? selectedGroup.name : 'None Selected'} readOnly={selectedGroup.id === 'none'} onChange={e => {updateGroup({name: e.target.value})}}></input>
                        {
                            selectedGroup.id !== 'none' ? <button onClick={e => deleteGroup(selectedGroup.id)}>DELETE</button> : ''
                        }
                        
                    </div>
                    {
                        (selectedGroup.id !== 'none') ? (
                            selectedGroupType === 'Decks' ? (
                                <div className='display-cards'>
                                    <div className='main-board' onDrop={e => addCard()} onDragOver={e => e.preventDefault()}>
                                        {
                                            Object.keys(selectedGroup.cards[0]).map(loc => {
                                                if (loc !== 'sideboard' && loc !== '') return (
                                                    <div className='location' key={loc}>
                                                        <h4 className='location-title'>{loc}</h4>
                                                        {
                                                            selectedGroup.cards[0][loc].map(card => {
                                                                return (
                                                                    <div className='display-card' key={card.DetailID}>
                                                                        <p onMouseOver={e => setHoveredImage(e.target.dataset.mid)} data-mid={card.MultiverseID} data-cardid={card.DetailID} draggable='true' onDrag={e => dragCard(e)}>{card.Quantity}x {card.CardName}</p>
                                                                    </div>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                    );
                                                else return '';
                                            })
                                        }
                                    </div>
                                    <div className='sideboard' onDrop={e => moveCard('sideboard')} onDragOver={e => e.preventDefault()}>
                                        <h4>Sideboard</h4>
                                        {
                                            selectedGroup.cards[0].sideboard.map(card => {
                                                return (
                                                    <div className='display-card' key={card.DetailID}>
                                                        <p onMouseOver={e => setHoveredImage(e.target.dataset.mid)} data-mid={card.MultiverseID} data-cardid={card.DetailID} draggable='true' onDrag={e => dragCard(e)}>{card.Quantity}x {card.CardName}</p>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            ) : (
                                <div className='display-cards'>
                                    <div className='collection-cards' onDrop={e => addCard()} onDragOver={e => e.preventDefault()}>
                                        {
                                            selectedGroup.cards.map(card => {
                                                return (
                                                    <div className='display-card' key={card.CardID}>
                                                        <p onMouseOver={e => setHoveredImage(e.target.dataset.mid)} data-mid={card.MultiverseID} data-cardid={card.CardID} draggable='true' onDrag={e => dragCard(e)}>{card.Quantity}x {card.CardName}</p>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            )
                        ) : <p>Please select a Deck or Collection</p>
                    }
                    <div className='owned'>
                        <div className='type-selection'>
                            <p>{state.userName}'s </p>
                            <p className='selected-group' onClick={e => switchSelected()}>{selectedGroupType}</p>
                        </div>
                        <div className='owned-groups'>
                            {
                                ownedGroups.map(group => {
                                    return (
                                        <div key={group.id}>
                                            <p className='group-entry' onClick={e => selectGroup(group)}>{group.name}</p>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className='extras-panel flex-col'>
                    <img src={`https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${hoveredImage}&type=card`} alt=''></img>
                    <p>Recommendations</p>
                    {
                        recommendations.map(card => {
                            return (
                                <li key={card.DetailID}>{card.CardName}</li>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
}

export default Home;