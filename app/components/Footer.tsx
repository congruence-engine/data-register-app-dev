'use client';

const Footer = () => {
    return (
        <footer>
            <div className="footer-container">
                <div className='footer-information'>
                    <p><a href='https://congruence-engine.wikibase.cloud/wiki/Main_Page'>About Congruence Engine Wikibase</a></p>
                    <p>This work is licensed under a <a href='https://creativecommons.org/licenses/by/4.0/'>Creative Commons Attribution 4.0 License - CC BY 4.0</a>.</p>
                </div>
                <div className='footer-credits'>
                    <p>Project Lead: <a href='https://github.com/FelixNeSi'>Felix Needham-Simpson</a>.</p>
                    <p>Developers: <a href='https://github.com/kunika'>Kunika Kono</a>, <a href='https://github.com/FelixNeSi'>Felix Needham-Simpson</a>.</p>
                </div>
            </div>          
        </footer>
    );
}

export default Footer;