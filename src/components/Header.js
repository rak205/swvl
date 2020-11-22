import React from 'react';
import '../styles/header.css'

function Header() {
    return (
        <div className='header' style={{ margin: '0px -15px' }}>
            <div className='header__left'>
                <img src='./swvl-logo.jpg' alt='' />
            </div>
        </div>
    )
}

export default Header;