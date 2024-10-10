'use client';

import Image from 'next/image'

const Header = () => {
    return (
        <header>
            <div className="container">
                <Image src='/images/CongruenceEngine-TitleTreatment-Left-White.png' width={300} height={81} alt='Picture of the author'/>
            </div>
        </header>
    );
}

export default Header;