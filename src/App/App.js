import React, { useState, useEffect } from 'react'
import {Route, Link, Switch} from 'react-router-dom'
import AdminDashboard from '../AdminDashboard/AdminDashboard'
import CheckIn from '../CheckIn/CheckIn'
import CheckOut from '../CheckOut/CheckOut'
import LandingPage from '../LandingPage/LandingPage'
import NavBar from '../NavBar/NavBar'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faMinus, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import ContextInventory from '../ContextInventory'
import ContextMenu from '../ContextMenu'
import { findUser, findInventory } from '../helper'
import './App.css'

function App() {
  const [users, updateUsers] = useState([])
  const [inventory, updateInventory] = useState([])
  const [confirmation, updateConfirmation] = useState('')
  const [menuOpen, updateMenuOpen] = useState(false)
  const [error, updateError] = useState(null)

  library.add(faAngleDown, faPlus, faMinus)

  /* handling menu state */
  function handleStateChange(newState) {
    updateMenuOpen(newState.isOpen)
  }

  function closeMenu() {
    updateMenuOpen(false)
  }

  /* initial data fetch */
  useEffect(() => {
    updateError(null)
    const userURL = 'https://pure-peak-70321.herokuapp.com/api/users'
    const inventoryURL = 'https://pure-peak-70321.herokuapp.com/api/inventory'
    const checkoutURL = 'https://pure-peak-70321.herokuapp.com/api/users/checkout'
    Promise.all([fetch(userURL), fetch(inventoryURL), fetch(checkoutURL)])
      .then(([userRes, inventoryRes, checkoutRes]) => {
        if (!userRes) {
          return userRes.json().then(error => {throw error})
        }
        if (!inventoryRes) {
          return inventoryRes.json().then(error => {throw error})
        }
        if (!checkoutRes) {
          return inventoryRes.json().then(error => {throw error})
        }
        return Promise.all([userRes.json(), inventoryRes.json(), checkoutRes.json()])
      })
      .then(([userRes, inventoryRes, checkoutRes]) => {
        updateInventory(inventoryRes)
        /* formatting checkout data to a more useable structure */
        const completeUsers = userRes.map(user => {
          const checkoutData = checkoutRes.filter(item => item.user_id === user.id)
          let formattedData = {}
          checkoutData.forEach(data => {
            formattedData = {
            ...formattedData,
            [data.inventory_id]: data.quantity
            }
          })
          const updatedUser = {
            ...user,
            checkedOut: {
              ...formattedData
            }
          }
          return updatedUser
        })
        const sortedUsers = completeUsers.sort((a,b) => {
          const nameA = a.name.toUpperCase()
          const nameB = b.name.toUpperCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        })
        updateUsers(sortedUsers)
      })
      .catch(error => {
        updateError(error.message)
      })
  }, [])

  /* handle check in and out form submission */
  const checkForm = (user, data, checkMethod) => {
    if(checkMethod === 'checked out') {
      checkOutUser(user, data)
      checkOutInventory(data)
      confirmationText(user, data, checkMethod)
    }
    if(checkMethod === 'checked in') {
      checkInUser(user, data)
      checkInInventory(data)
      confirmationText(user, data, checkMethod)
    }
  }

  function checkOutUser(user, data) {
    const userToUpdate = findUser(users, user)
    Object.keys(data).forEach(dataKey => {
      if (Object.keys(userToUpdate.checkedOut).includes(dataKey)) {
        data[dataKey] = (Number(data[dataKey]) + Number(userToUpdate.checkedOut[dataKey]))
      }
    })
    updateUsers(() => {
      userToUpdate.checkedOut = {
        ...userToUpdate.checkedOut,
        ...data
      }
      return users
    })
  }

  function checkOutInventory(data) {
    const items = Object.keys(data).map(Number)
    items.forEach(item => {
      const itemToUpdate = findInventory(inventory, item)
      const currentNum = itemToUpdate.quantityAvailable
      updateInventory(() => {
        itemToUpdate.quantityAvailable = (currentNum - data[item])
        return inventory
      })
    })
  }

  function checkInUser(user, data) {
    const userToUpdate = findUser(users, user)
    const items = Object.keys(data).map(Number)
    items.forEach(item => {
      updateUsers(() => {
        if (userToUpdate.checkedOut[item] === 0) {
          delete userToUpdate.checkedOut[item]
        }
        return users
      })
    })
  }

  function checkInInventory(data) {
    const items = Object.keys(data).map(Number)
    items.forEach(item => {
      const itemToUpdate = findInventory(inventory, item)
      const currentNum = itemToUpdate.quantityAvailable
      updateInventory(() => {
        itemToUpdate.quantityAvailable = (currentNum + data[item])
        return inventory
      })
    })
  }

  let timer

  function confirmationText(user, data, checkMethod) {
    const itemList = Object.keys(data).map(Number)
    const items = itemList.map(listItem => {
      const itemData = findInventory(inventory, listItem)
      return `${data[listItem]} ${itemData.name}`
      }).join(', ')
    const name = findUser(users, user).name
    updateConfirmation(() => {
    return (<p className="confirmation" role='alert'>
      {name} has {checkMethod} {items}</p>
    )}
    )
    timer = setTimeout(() => {updateConfirmation('')}, 5000);
  }

  useEffect(() => {
    return clearTimeout(timer)
  }, [timer])

  /* handle Admin actions */
  function addUser(newUser) {
    updateUsers(() => {
      const newUsers = [...users, newUser]
      return newUsers
    })
  }

  function deleteUser(id) {
    updateUsers(() => {
      const newUsers = users.filter(person => person.id !== id)
      return newUsers
    })
  }

  function addInventory(newItem) {
    updateInventory(() => {
      const newItems = [...inventory, newItem]
      return newItems
    })
  }

  function deleteInventory(id) {
    const updatedUsers = users.map(user => {
      if (user.checkedOut.hasOwnProperty(`${id}`)) {
        delete user.checkedOut[id]
        return user
      }
      return user
    })
    updateUsers(updatedUsers)
    updateInventory(() => {
      const newItems = inventory.filter(item => item.id !== id)
      return newItems
    })
  }

  const contextValueInventory = {
    users,
    inventory,
    checkForm,
    confirmation,
    addUser,
    deleteUser,
    addInventory,
    deleteInventory
  }

  const contextValueMenu = {
    isMenuOpen: menuOpen,
    handleStateChange,
    closeMenu
  }

  function renderRoutes() {
    return (
      <Switch>
        <Route
          exact path="/"
          component={LandingPage}
        />
        <Route
          path="/admin"
          component={AdminDashboard}
        />
        <Route
          path="/checkin"
          component={CheckIn}
        />
        <Route
          path="/checkout"
          component={CheckOut}
        />
        <Route render={() => <h1>Page not found</h1>} />
      </Switch>
    )
  }

  return (
    <ContextInventory.Provider value={contextValueInventory}>
      <header className="App_header" role="banner">
        <ContextMenu.Provider value={contextValueMenu}>
          <NavBar handleStateChange={handleStateChange} />
        </ContextMenu.Provider>
        <h1 className="title_header">
          <Link to="/" className="title">TechTracker</Link>
        </h1>
      </header>
      <main className="App_main" role="main">
        {renderRoutes()}
        <div className='error' role='alert'>
          {error && <p>{error}</p>}
        </div>
      </main>
    </ContextInventory.Provider>
  );
}

export default App;
