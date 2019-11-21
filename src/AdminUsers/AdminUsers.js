import React, { useEffect, useState, useContext } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel
} from "react-accessible-accordion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ContextInventory from "../ContextInventory";
import { findUser } from "../helper";
import "./AdminUsers.css";
//polyfills
import Promise from "promise-polyfill";
import "whatwg-fetch";

export default function AdminUser() {
  const { users, addUser, deleteUser } = useContext(ContextInventory);
  const [confirmation, updateConfirmation] = useState({});
  const [confirmationForm, updateConfirmationForm] = useState("");
  const [addIcon, updateAddIcon] = useState("plus");
  const [addId, updateAddId] = useState("");
  const [removeIcon, updateRemoveIcon] = useState("plus");
  const [removeId, updateRemoveId] = useState("");

  function handleClick(uuid) {
    if (uuid[0] === "add") {
      updateRemoveId("rotateDown");
      updateRemoveIcon("plus");
      updateAddId("rotateUp");
      return updateAddIcon("minus");
    }
    if (uuid[0] === "remove") {
      updateAddId("rotateDown");
      updateAddIcon("plus");
      updateRemoveIcon("minus");
      return updateRemoveId("rotateUp");
    } else {
      updateAddId("rotateDown");
      updateAddIcon("plus");
      updateRemoveId("rotateDown");
      updateRemoveIcon("plus");
    }
  }

  const userNames = users.map(user => {
    return (
      <option key={user.id} value={user.id}>
        {user.name}
      </option>
    );
  });

  const addUserSubmit = e => {
    e.preventDefault();
    updateConfirmationForm(null);
    const name = e.target.addUser.value;

    if (name.trim().length === 0) {
      return confirmationText("addUser", "Enter a name to add user");
    }

    const userData = {
      name: name
    };
    const url = "https://pure-peak-70321.herokuapp.com/api/users";
    e.target.reset();
    fetch(url, {
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify(userData),
      headers: { "content-type": "application/json" }
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(error => {
            throw error;
          });
        }
        return response.json();
      })
      .then(response => {
        const newUser = {
          id: response.id,
          name: response.name,
          checkedOut: {}
        };
        addUser(newUser);
        confirmationText("addUser", `${newUser.name} added`);
      })
      .catch(error => {
        confirmationText("addUser", error.message);
      });
  };

  const deleteUserSubmit = e => {
    e.preventDefault();
    updateConfirmationForm(null);
    const id = e.target.user.value;
    const user = findUser(users, id);
    let checkout = false;
    e.target.reset();

    if (Object.keys(user.checkedOut).length > 0) {
      checkout = true;
    }

    const url = `https://pure-peak-70321.herokuapp.com/api/users?id=${user.id}&clearCheckOut=${checkout}`;

    fetch(url, {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "content-type": "application/json" }
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(error => {
            throw error;
          });
        }
        deleteUser(id);
        confirmationText("removeUser", `${user.name} removed`);
      })
      .catch(error => {
        confirmationText("removeUser", error.message);
      });
  };

  let timer;

  function confirmationText(form, text) {
    clearTimeout(timer);
    updateConfirmation(() => {
      return (
        <p className="confirmation" role="alert">
          {text}
        </p>
      );
    });
    updateConfirmationForm(form);
    timer = setTimeout(() => {
      updateConfirmation("");
    }, 5000);
  }

  useEffect(() => {
    return clearTimeout(timer);
  }, [timer]);

  return (
    <Accordion
      allowZeroExpanded="true"
      className="userAccordion"
      onChange={uuid => handleClick(uuid)}
    >
      <AccordionItem uuid="add">
        <AccordionItemHeading className="accordion2">
          <AccordionItemButton>
            Add User
            <FontAwesomeIcon
              icon={addIcon}
              id={addId}
              className="angleIcon plus"
            />
          </AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <form onSubmit={addUserSubmit}>
            <input
              type="text"
              name="addUser"
              id="addUser"
              placeholder="Enter name..."
            />
            <button type="submit" className="user">
              Add User
            </button>
          </form>
          {confirmationForm === "addUser" && confirmation}
        </AccordionItemPanel>
      </AccordionItem>
      <AccordionItem uuid="remove">
        <AccordionItemHeading className="accordion2">
          <AccordionItemButton>
            Remove User
            <FontAwesomeIcon
              icon={removeIcon}
              id={removeId}
              className="angleIcon plus"
            />
          </AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <form onSubmit={deleteUserSubmit}>
            <select id="user" defaultValue="" required>
              <option value="" disabled>
                Select name...
              </option>
              {userNames}
            </select>
            <button type="submit" className="user">
              Delete User
            </button>
          </form>
          {confirmationForm === "removeUser" && confirmation}
        </AccordionItemPanel>
      </AccordionItem>
    </Accordion>
  );
}
