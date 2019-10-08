import React, {useEffect, useState, useContext} from 'react'
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion'
import ContextInventory from '../ContextInventory'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {findInventory} from '../helper'
import './AdminInventory.css'

export default function AdminInventory() {
    const {inventory, addInventory, deleteInventory} = useContext(ContextInventory)
    const [confirmation, updateConfirmation] = useState({})
    const [confirmationForm, updateConfirmationForm] = useState('')
    const [addIcon, updateAddIcon] = useState('plus')
    const [addId, updateAddId] = useState('')
    const [removeIcon, updateRemoveIcon] = useState('plus')
    const [removeId, updateRemoveId] = useState('')

    function handleClick(uuid) {
        if (uuid[0] === "add") {
            updateRemoveId('rotateDown')
            updateRemoveIcon('plus')
            updateAddId('rotateUp')
            return updateAddIcon('minus')
        }
        if (uuid[0] === "remove") {
            updateAddId('rotateDown')
            updateAddIcon('plus')
            updateRemoveIcon('minus')
            return updateRemoveId('rotateUp')
        }
        else {
            updateAddId('rotateDown')
            updateAddIcon('plus')
            updateRemoveId('rotateDown')
            updateRemoveIcon('plus')
        }
    }

    const inventoryNames = inventory.map(item => {
        return <option key={item.id} value={item.id}>{item.name}</option>
    })

    const addInventorySubmit = (e) => {
        e.preventDefault()
        updateConfirmationForm(null)
        const {name, quantity, category, image} = e.target
        const item = {
            name: name.value,
            quantity: Number(quantity.value),
            category: category.value,
            image: image.value
        }

        for (const [key, value] of Object.entries(item)) {
            if (key === 'quantity') {
                if (value === 0) {
                    return confirmationText('addItem', `Quantity must be greater than zero`)
                }
            }
            if (key === 'name' || key === 'image') {
                if (value.trim().length === 0) {
                    return confirmationText('addItem', `Must include inventory ${key} to add item`)
                }
            }
        }  
        
        const url = 'https://pure-peak-70321.herokuapp.com/api/inventory'
        e.target.reset();
        
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(item),
            headers: {'content-type': 'application/json'}
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {throw error})
            }
            return response.json()
        })
        .then((response) => {
            const newItem = {
                id: response.id,
                name: response.name,
                quantity: Number(response.quantity),
                quantityAvailable: Number(response.quantityAvailable),
                category: response.category,
                image: response.image
            }
            addInventory(newItem)
            confirmationText('addItem', `${item.name} added`)
        })
        .catch(error => {
            confirmationText('addItem', error.message)
        })
    }

    const deleteInventorySubmit = e => {
        e.preventDefault()
        updateConfirmationForm(null)
        const id = e.target.item.value
        const item = findInventory(inventory, id)
        const url = `https://pure-peak-70321.herokuapp.com/api/inventory?id=${item.id}`
        e.target.reset();

        fetch(url, {
            method: 'DELETE',
            headers: {'content-type': 'application/json'}
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {throw error})
            }
            deleteInventory(item.id)
            confirmationText('removeItem', `${item.name} removed`)
        })
        .catch(error => {
            confirmationText('removeItem', error.message)
        })
    }

    let timer

    //handles confirmation and error alerts//
    function confirmationText(form, text) {
        clearTimeout(timer)
        updateConfirmation(() => {
            return (<p className="confirmation" role='alert'>
              {text}</p>
            )}
            )
        updateConfirmationForm(form)
        timer = setTimeout(() => {updateConfirmation('')}, 5000);
    }


    useEffect(() => {
        return clearTimeout(timer)
    }, [timer])

    return (
        <Accordion allowZeroExpanded="true" className="inventoryAccordion" onChange={(uuid) => handleClick(uuid)}>
            <AccordionItem uuid="add">
                <AccordionItemHeading className="accordion2">
                    <AccordionItemButton>
                        Add Items
                        <FontAwesomeIcon icon={addIcon} id={addId} className="angleIcon plus"/>
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <form onSubmit={addInventorySubmit} className="addFormContainer">
                        <table>
                            <tbody>
                            <tr>
                                <td>
                                    <label htmlFor="name">
                                        Name
                                    </label>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="quantity">
                                        Quantity
                                    </label>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="quantity"
                                        id="quantity"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="category">
                                        Category
                                    </label>
                                </td>
                                <td className="left">
                                    <select
                                        id="category"
                                        defaultValue=""
                                        required
                                        >
                                        <option value="" disabled>Select...</option>
                                        <option value="computer">Computer</option>
                                        <option value="tablet">Tablet</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="image">
                                        Image URL
                                    </label>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="image"
                                        id="image"
                                    />
                                </td>
                            </tr>
                        </tbody>
                        </table>
                        <button type="submit" className="item">
                            Add Item
                        </button>
                    </form>
                    {(confirmationForm === 'addItem') && confirmation}
                </AccordionItemPanel>
            </AccordionItem>
            <AccordionItem uuid="remove">
                <AccordionItemHeading className="accordion2">
                    <AccordionItemButton>
                        Remove Items
                        <FontAwesomeIcon icon={removeIcon} id={removeId} className="angleIcon plus"/>
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <form onSubmit={deleteInventorySubmit}>
                        <select
                            id="item"
                            defaultValue=""
                            required
                            >
                            <option value="" disabled>Select item</option>
                            {inventoryNames}
                        </select>
                        <button type="submit" className="item">
                            Delete Item
                        </button>
                    </form>
                    {(confirmationForm === 'removeItem') && confirmation}
                </AccordionItemPanel>
            </AccordionItem>
        </Accordion>
    )
}