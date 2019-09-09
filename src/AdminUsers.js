import React, {useContext} from 'react'
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion'
import ContextInventory from './ContextInventory'
import './AdminUsers.css'

export default function AdminUser() {
    const {users, addUser, deleteUser} = useContext(ContextInventory)

    const userNames = users.map(user => {
        return <option key={user.id} value={user.name}>{user.name}</option>
    })

    const addUserSubmit = (e) => {
        e.preventDefault()
        const name = e.target.addUser.value
        addUser(name)
        
    }

    const deleteUserSubmit = (e) => {
        e.preventDefault()
        const name = e.target.user.value
        deleteUser(name)
    }

    return (
        <Accordion allowZeroExpanded="true">
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        Add User
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <form onSubmit={addUserSubmit}>
                        <input
                            type="text"
                            name="addUser"
                            id="addUser"
                        />
                        <button type="submit" className="user">
                            Add User
                        </button>
                    </form>
                </AccordionItemPanel>
            </AccordionItem>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        Remove User
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <form onSubmit={deleteUserSubmit}>
                        <select id="user">
                            {userNames}
                        </select>
                        <button type="submit" className="user">
                            Delete User
                        </button>
                    </form>
                </AccordionItemPanel>
            </AccordionItem>
        </Accordion>
    )
}