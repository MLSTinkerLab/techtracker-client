import React, { useContext, useState, useEffect } from "react";
import ContextInventory from "../ContextInventory";
import ContextForm from "../ContextForm";
import Form from "../Form/Form";
import { findUser, findUserByName } from "../helper";
import "./CheckIn.css";
//polyfills
import Promise from "promise-polyfill";
import "whatwg-fetch";

export default function CheckIn(props) {
  const { users, inventory, checkForm } = useContext(ContextInventory);
  const [errorMessage, updateErrorMessage] = useState(null);

  /* setting values for the form render */
  const [userForm, updateUserForm] = useState("");
  const [userInventory, updateUserInventory] = useState([]);
  const [inventoryNumber, updateInventoryNumber] = useState("");

  const setUser = targetName => {
    const user = findUserByName(users, targetName);
    updateUserForm(user);
  };

  useEffect(() => {
    if (Number(userForm.id)) {
      const user = findUser(users, userForm.id);
      const { checkedOut } = user;
      const ids = Object.keys(checkedOut);
      const checkedOutItems = inventory.filter(item => {
        if (ids.includes(item.id)) {
          return item;
        }
        return false;
      });
      updateUserInventory([...checkedOutItems]);
      updateInventoryNumber(checkedOut);
    }
  }, [userForm, users, inventory]);

  /* storing inventory values from form */
  const [formData, setFormData] = useState({});

  const inventoryKey = target => {
    const id = target.value;

    if (target.checked) {
      if (!formData[id]) {
        setFormData({
          ...formData,
          [id]: 1
        });
      }
    } else {
      setFormData(formData => {
        delete formData[id];
        return formData;
      });
    }
  };

  const inventoryQuantity = (quantity, id) => {
    const num = Number(quantity);
    setFormData({
      ...formData,
      [id]: num
    });
  };

  /* submit form data */
  const checkIn = () => {
    const items = Object.keys(formData).map(Number);
    if (items.length === 0) {
      updateErrorMessage(() => {
        return (
          <p className="confirmation" role="alert">
            You must select an item to check in
          </p>
        );
      });
    } else {
      const url = "https://pure-peak-70321.herokuapp.com/api/users/checkin";
      items.forEach(item => {
        const currentNum = Number(userForm.checkedOut[item]);
        userForm.checkedOut[item] = currentNum - formData[item];
        if (userForm.checkedOut[item] === 0) {
          const checkinData = {
            user_id: Number(userForm.id),
            inventory_id: item
          };
          fetch(url, {
            method: "DELETE",
            credentials: "same-origin",
            body: JSON.stringify(checkinData),
            headers: { "content-type": "application/json" }
          })
            .then(response => {
              if (!response.ok) {
                return response.json().then(error => {
                  throw error;
                });
              }
              return Promise.resolve("ok");
            })
            .catch(error => {
              updateErrorMessage(() => <p>{error.message}</p>);
            });
        } else {
          const checkinData = {
            user_id: userForm.id,
            inventory_id: item,
            quantity: userForm.checkedOut[item]
          };
          fetch(url, {
            method: "PATCH",
            credentials: "same-origin",
            body: JSON.stringify(checkinData),
            headers: { "content-type": "application/json" }
          })
            .then(response => {
              if (!response.ok) {
                return response.json().then(error => {
                  throw error;
                });
              }
              return Promise.resolve("ok");
            })
            .catch(error => {
              updateErrorMessage(() => <p>{error.message}</p>);
            });
        }
      });
      checkForm(userForm.id, formData, "checked in");
      props.history.push("/");
    }
  };

  const handleClickCancel = () => {
    props.history.push("/");
  };

  const contextValue = {
    users,
    inventory: userInventory,
    inventoryNumber,
    inventoryKey,
    inventoryQuantity,
    setUser
  };

  return (
    <ContextForm.Provider value={contextValue}>
      <h2 className="formHeader">Check In</h2>
      <Form />
      <div>{errorMessage && errorMessage}</div>
      <button
        type="submit"
        form="checkForm"
        onClick={() => {
          checkIn();
        }}
      >
        Check In
      </button>
      <button onClick={handleClickCancel}>Cancel</button>
    </ContextForm.Provider>
  );
}
