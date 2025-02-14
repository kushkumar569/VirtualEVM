import './FrontPage.css'
import { useState, useEffect } from 'react';
import Glitch from './Glitch';
import HomePage from './HomePage';

function FrontPage() {

    const [showHomePage, setShowHomePage] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHomePage(true);
        }, 3150); // Adjust time to the length of the animation (3 seconds here)

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {
                !showHomePage ? (
                    <>
                        <Glitch />
                    </>
                )
                    : (
                        <>
                            {/* <Candidate /> */}
                            <HomePage/>
                        </>
                    )

            }
        </>
    )
}
export default FrontPage