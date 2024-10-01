'use client';

import { useState, useEffect } from 'react';

// Types
import { WBEntity } from "@/app/services/MediaWikiAPI";
interface CEWBEntity extends WBEntity {
    embeddings?: number[];
}

const pluralize = (count:number, string:string, suffix:string = 's') => `${count} ${string}${count !== 1 ? suffix : ''}`;

const SearchResults = (props:{ keywords:string; data:CEWBEntity[]; isbusy:boolean; }) => {

    const [isBusy, setBusy] = useState(false);

    useEffect(() => {

        setBusy(props.isbusy);
        
    }, [props]);

    const Loader = () => (
        <div className='loader'>
            <div className='dots'/>
        </div>
    );

    const Records = () => (
        <>
            <p role="status">{ props.keywords?.length ? `${pluralize(props.data.length, 'record')} found.` : `Showing ${props.data.length} records.` }</p>
            { props.data.length ? 
                <ol className='tile'>
                    { props.data.map((item) => (
                        <li key={item.id} className='item'>
                            <div className='entry'>
                                <h2 className="label">{item.label}</h2>
                                <p className="description">{item.description}</p>
                            </div>
                            <ul className="statements">
                                <li className='property'>
                                    <p className="name">Keywords</p>
                                    <p className="value">{item.statements?.keywords ? item.statements.keywords.map(property => property.value).join(', ') : 'N/A'}</p>
                                </li>
                                <li className='property'>
                                    <p className="name">Held By</p>
                                    <p className="value">{item.statements?.heldby ? item.statements?.heldby.map((property, index) => {
                                        return <span key={index}>{index ? '; ' : ''}{property.qualifiers?.describedURL && property.qualifiers?.describedURL[0]?.value ? <a href={property.qualifiers.describedURL[0].value}>{property.value}</a> : property.value}</span>
                                    }) : 'N/A'}</p>
                                </li>
                                <li className='property'>
                                    <p className="name">Datasheet</p>
                                    <p className="value">{item.statements?.datasheet && item.statements.datasheet[0]?.value ? <a href={item.statements.datasheet[0].value}>Digital Cultural Heritage Datasheet</a> : 'N/A'}</p>
                                </li>
                                <li className='property'>
                                    <p className="name">Used By</p>
                                    <p className="value">{item.statements?.usedby ? item.statements?.usedby.map((property, index) => {
                                        return <span key={index}>{index ? '; ' : ''}{property.qualifiers?.describedURL && property.qualifiers?.describedURL[0]?.value ? <a href={property.qualifiers.describedURL[0].value}>{property.value}</a> : property.value}</span>
                                    }) : 'N/A'}</p>
                                </li>
                                <li className='property'>
                                    <p className="name">Data Register</p>
                                    <p className="value"><a href={'https://congruence-engine.wikibase.cloud/wiki/' + item.id}>Congruence Engine Data Register ({item.id})</a></p>
                                </li>
                            </ul>
                        </li>
                    ))}
                </ol>
            : null }
        </>
    );

    return (
        <div id='search-results'>
            { isBusy ?  <Loader/> : <Records/> }
        </div>
    );

}

export default SearchResults;