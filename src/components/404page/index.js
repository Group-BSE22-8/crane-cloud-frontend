import React from 'react';
import { Link} from 'react-router-dom';
import Header from "../Header";
import PrimaryButton from '../PrimaryButton';
import './404page.css';

const WrongUrl = () => {
    return (
        <div>
            <Header />
            <div>
                <div className="ErrorPageContainer">
                    <div className="ErrorPageFirstDiv">
                        <div className="ErrorPageDigit">404</div>
                    </div>
                    <div className="ErrorPageText">
                        <div className="ErrorPageTextFirst">PAGE NOT FOUND</div>
                        <div className="ErrorPageTextSecond">Sorry, the page you are looking for does not exist.</div>
                    </div>
                    <div className="ErrorPageButton">
                        <Link to="/"><PrimaryButton label="Home" /></Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WrongUrl