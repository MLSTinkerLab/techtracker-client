import React, {useContext} from 'react';
import { Link } from 'react-router-dom';
import ContextInventory from '../ContextInventory';
import './LandingPage.css';

export default function LandingPage() {
    const {confirmation} = useContext(ContextInventory)
    return (
        <>
        <div className="pageLinks">
            <Link to="/checkout" className="checkLink"><button className="buttonLink">Check Out</button></Link>
            <Link to="/checkin" className="checkLink"><button className="buttonLink">Check In</button></Link>
        </div>
        <div className="info">
            <h3>How to</h3>
            <ul className="bulletpoint">
                <li>Click the link above</li>
                <li>Select your name</li>
                <li>Click item group(s)</li>
                <li>Select the quantity</li>
                <li>Hit Check In/Out!</li>
            </ul>
            <p>You can check in or out as many different items as you need</p>
            
        </div>
        <div>
            {confirmation}
        </div>
        </>
    )
}