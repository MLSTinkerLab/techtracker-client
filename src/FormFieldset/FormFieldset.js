import React, { useContext } from "react";
import ContextForm from "../ContextForm";
import "./FormFieldset.css";

export default function FormFieldset(props) {
  const { category, inventory, flexOne } = props;
  const { inventoryNumber, inventoryKey, inventoryQuantity } = useContext(
    ContextForm
  );

  function options(quantity) {
    const optionList = quantity.map(num => {
      return (
        <option key={num + "qo"} value={num}>
          {num}
        </option>
      );
    });
    return optionList;
  }

  function items(tech) {
    const items = tech.map(item => {
      const itemNumber = inventoryNumber[item.id];
      const quantity = [];
      for (let i = 1; i <= itemNumber; i++) {
        quantity.push(i);
      }
      let disableClick = false;
      if (quantity.length === 0) disableClick = true;

      return (
        <li key={item.id}>
          <input
            type="checkbox"
            name={item.category}
            id={item.id}
            value={item.id}
            onChange={e => inventoryKey(e.target)}
            {...(disableClick && { disabled: true })}
          />
          <label className="checkbox" htmlFor={item.id}>
            {item.name}
            <img src={item.image} alt={"image of " + item.name} />
            {disableClick && <div className="disabled"></div>}
          </label>
          <div className="quantity">
            <label className="quantityLabel" htmlFor={"quantity " + item.id}>
              Quantity
            </label>
            <select
              id={"quantity " + item.id}
              name={item.category + "Quantity"}
              onChange={e => inventoryQuantity(e.target.value, item.id)}
              defaultValue="0"
            >
              <option value="0"> </option>
              {options(quantity)}
            </select>
          </div>
        </li>
      );
    });
    return items;
  }

  return (
    <fieldset className={category + " flexField " + flexOne}>
      <legend>{category}</legend>
      <ul className="flex">{items(inventory)}</ul>
    </fieldset>
  );
}
