import React, {useContext} from 'react';
import { Link } from 'react-router-dom';
import ContextInventory from './ContextInventory';
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
            <p>Thanks for using TechTracker! Check out the admin dashboard to see how the app data is maintained.
            </p>
        </div>
        <div>
            {confirmation}
        </div>
        </>
    )
}