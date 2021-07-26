import { Redirect } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import '../stylesheets/Home.scss';
import Axios from "axios";
const url = 'http://localhost:3002';

function Home(state) {
    const [cardResults, setCardResults] = useState([]);
    const [ownedGroups, setOwnedGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState({name: null, id: '', desc: '', cards: []});
    const [selectedGroupType, setSelectedGroupType] = useState('Decks');
    const [recommendations, setRecommendations] = useState([]);

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
                    setRecommendations(result.data[0]);
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
                    setSelectedGroup({name: result.data[0].name, id: result.data[0].id, desc: result.data[0].desc, cards: res2.data});
                });
            });
        } else {
            Axios.get(url + '/db/groupcards?type=' + selectedGroupType + '&id=' + group.id).then(result => {
                setSelectedGroup({name: group.name, id: group.id, desc: group.desc, cards: result.data});
            });
        }
    }

    function updateGroup(change) {
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
            if (result.data === "Done") setSelectedGroup({name: null, id: '', desc: '', cards: []});
        });
    }

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
                                    <li key={elem.DetailID}>{elem.CardName}</li>
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
                        <input type='text' value={selectedGroup.name != null ? selectedGroup.name : 'None Selected'} readOnly={selectedGroup.name == null} onChange={e => {updateGroup({name: e.target.value})}}></input>
                        <button onClick={e => deleteGroup(selectedGroup.id)}>DELETE</button>
                    </div>
                    <div className='owned'>
                        <div className='type-selection'>
                            <p>{state.userName}'s </p>
                            <p className='selected-group' onClick={e => setSelectedGroupType(selectedGroupType === 'Decks' ? 'Collections' : 'Decks')}>{selectedGroupType}</p>
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