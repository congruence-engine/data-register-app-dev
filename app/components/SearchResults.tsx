'use client';

import { FormEvent } from 'react';
import { CEEntity } from '@/app/components/Data';
import Accordion from './Accordion';

// const pluralize = (count:number, string:string, suffix:string = 's') => `${count} ${string}${count !== 1 ? suffix : ''}`;

const SearchResults = (props:{ keywords:string; data:CEEntity[]; searchMode:'keywordSearch'|'keywordVectorSearch'|'itemVectorSearch' }) => {

    const toggleLayout = (event:FormEvent) => {
    
        // Change layout style
        const mode = event.currentTarget.getAttribute('data-mode');
        const element = document.getElementById('search-results-content')?.getElementsByTagName('ol')[0];
        if (mode === 'list') element?.classList.replace('tile', 'list');
        else element?.classList.replace('list', 'tile');
        
        // Change button style
        const target = event.target as HTMLElement;
        const siblings: Element[] = Array.from(target.parentElement?.children ?? []);
        siblings.forEach((sibling: Element) => sibling.classList.remove('active'));
        target.classList.add('active');
        
    }
    
    return (
        <div id='search-results'>
            <Accordion typeOfSearch={props.searchMode} data={props.data} keywords={props.keywords}/>
            <div id='search-results-header'>
                {props.data.length ? 
                <div id='display-options' role='menu'>
                    <p>Layout: </p>
                    <button type='button' role='menuitem' id='display-tile' className='active' onClick={(e)=>{toggleLayout(e)}} data-mode='tile'>Grid</button>
                    <button type='button' role='menuitem' id='display-list' onClick={(e)=>{toggleLayout(e)}} data-mode='list'>List</button>
                </div>
                : null }
            </div>
            
            <div id='search-results-content'>
                { props.data.length ? 
                    <ol className={'tile ' + props.searchMode}>
                        { props.data.map((item) => (
                            <li key={item.id} id={item.id} className='item'>
                                <div className='entry'>
                                    <h2 className="label"> {item.label}</h2>
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
                                        <p className="value"><a href={'https://congruence-engine.wikibase.cloud/wiki/Item:' + item.id}>Congruence Engine Data Register ({item.id})</a></p>
                                    </li>
                                    
                                </ul>
                               { ( props.searchMode == 'itemVectorSearch' || props.searchMode == 'keywordVectorSearch') && <a href={`/data-register-app-dev?mode=vector&simDataset=${item.id}`} className='vectorSim'>Vector Similarity</a>}
                            </li>
                        ))}
                    </ol>
                : null }
            </div>
        </div>
    );

}

export default SearchResults;
