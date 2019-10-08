import React, { useState, useContext } from 'react';
import ContextInventory from '../ContextInventory';
import ContextForm from '../ContextForm';
import Form from '../Form/Form';
import {findUserByName} from '../helper'
import './CheckOut.css';

export default function CheckOut(props) {
    const {users, inventory, checkForm} = useContext(ContextInventory)
    const [errorMessage, updateErrorMessage] = useState(null)
    
    /* creating items for form render */
    const inventoryNumber = {}

    inventory.forEach(item => {
        const id = item.id
        const num = item.quantityAvailable
        inventoryNumber[id] = num;
    })

    /* storing values from form submit */
    const [userForm, updateUserForm] = useState(users[0])
    const [formData, setFormData] = useState({})

    /* setting values from form */
    const inventoryKey = target => {
        const id = target.value

        if(target.checked) {
            if(!formData[id]) {
                setFormData({
                    ...formData,
                    [id]: 0
                })
            }
        }
        else{
           setFormData(formData => {
               delete formData[id]
               return formData
           })
        }
    }

    const inventoryQuantity = (quantity, id) => {
        const num = Number(quantity)
        setFormData({
            ...formData,
            [id]: num
        })
    }

    const setUser = targetName => {
        const user = findUserByName(users, targetName)
        updateUserForm(user)
    }

    /* submit form info */
    const checkOut = () => {
        updateErrorMessage(null)
        const checkoutData = {
            'user_id': Number(userForm.id),
            'data': formData
        }
        
        if (Object.keys(formData).length === 0) {
            updateErrorMessage(() => {
                return (<p className="confirmation" role="alert">
                    You must select an item to check out
                    </p>)
            })
        }
        else {
            const url = 'https://pure-peak-70321.herokuapp.com/api/users/checkout'
            fetch(url, {
                method: 'POST',
                body: JSON.stringify(checkoutData),
                headers: {'content-type': 'application/json'}
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {throw error})
                }
                return Promise.resolve('ok')
            })
            .then(() => {
                checkForm(userForm.id, formData, 'checked out')
                props.history.push('/')
            })
            .catch(error => {
                updateErrorMessage(() => <p>{error.message}</p>)
            })
        }
    }

    const handleClickCancel = () => {
        props.history.push('/')
    };

    const contextValue = {
        users,
        inventory,
        inventoryNumber,
        inventoryKey,
        inventoryQuantity,
        setUser,
    }
    
    return (
        <ContextForm.Provider value={contextValue}>
            <h2 className="formHeader">Check Out</h2>
            <Form />
            <div>
                {(errorMessage) && errorMessage}
            </div>
            <button
                type="submit"
                form="checkForm"
                onClick={() => {checkOut()}}>
                Check Out
            </button>
            <button
                onClick={handleClickCancel}>
                Cancel
            </button>
        </ContextForm.Provider>
    )
}