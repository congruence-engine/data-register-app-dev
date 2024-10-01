'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getItems, getHydratedItems } from "@/app/services/MediaWikiAPI";

// Types
import { propertyNames, WBEntity } from "@/app/services/MediaWikiAPI";
interface CEWBEntity extends WBEntity {
    embeddings?: number[];
}

// Variables
const CEPropertyNames:propertyNames = {
    P1: "instanceOf",
    P2: "describedURL",
    P3: "keywords",
    P4: "created",
    P5: "heldby",
    P6: "availableURL",
    P7: "copyrightStatus",
    P8: "copyrightLicense",
    P9: "datasheet",
    P10: "usedby"
};

// Stuff that make stuff happen
const getAllItems = async ():Promise<CEWBEntity[]> => {

    const params = {
        srsearch: 'haswbstatement:P1=Q1', 
        srnamespace: 120
    }

    return await getHydratedItems(params as {srsearch: string; srnamespace: number;}, CEPropertyNames);

}

const hydrateEntities = (entityIDs:string[]):CEWBEntity[] => {

    const storedData:CEWBEntity[] = JSON.parse(sessionStorage.getItem('cewbdata') as string);

    return entityIDs.map((id) => {
        return storedData.find(item => item.id === id);
    }) as CEWBEntity[];

}

const FullTextSearch = (props:{ keywords:string; }) => {

    const [data, setData] = useState<CEWBEntity[]>([]);
    const [isBusy, setBusy] = useState(true);

    useEffect(() => {
        
        setBusy(true);

        const search = async (keywords:string) => {

            const defaults = {
                srsearch: 'haswbstatement:P1=Q1', 
                srnamespace: 120
            }

            let params = {};

            // Process user input
            if (keywords.trim().length) {
                /* 
                 * [Keywords processing policy] Only interfere if either or both of the conditions are met:
                 * (a) Neither modifiers nor Cirrus Search keywords are used; or
                 * (b) Keywords do not include any of the required/default parameters.
                 */
                keywords = keywords.trim();
                const hasModifiers = new RegExp(/"|'|~|\*|\\\?|-|!|AND|OR|MUST|SHOULD/).test(keywords);
                const hasWikibaseCirrusSearchKeywords = new RegExp(/haswbstatement|inlabel|incaption|wbstatementquantity|hasdescription|haslabel|hascaption/).test(keywords);
                const hasConfig = keywords.split(' ').some(item => defaults.srsearch.split(' ').includes(item));
                if (!(hasModifiers || hasWikibaseCirrusSearchKeywords)) keywords = keywords.split(' ').join('* OR ') + '*';
                if (!(hasWikibaseCirrusSearchKeywords || hasConfig)) keywords = defaults.srsearch + ' ' + keywords;
            }
            Object.assign(params, {srsearch: keywords});
            params = {...defaults, ...params};

            setData(hydrateEntities(await getItems(params as {srsearch: string; srnamespace: number;})));
            setBusy(false);
        }

        if (props.keywords?.length) search(props.keywords);
        else {
            const storedData:CEWBEntity[] = JSON.parse(sessionStorage.getItem('cewbdata') as string);
            setData(storedData);
            setBusy(false);
        }

    }, [props]);

    return (
        <Results keywords={props.keywords} data={data} isbusy={isBusy}/>
    );

}

const VectorSearch = (props:{keywords:string}) => {

    const [data, setData] = useState<CEWBEntity[]>([]);
    const [isBusy, setBusy] = useState(false);

    useEffect(() => {

        setBusy(true);

        const storedData:CEWBEntity[] = JSON.parse(sessionStorage.getItem('cewbdata') as string);

        // Add embeddings if not present already
        const hasEmbeddings = storedData.filter((o) => {
            return o.hasOwnProperty('embeddings');
        }).length > 0;
        if (!hasEmbeddings) {
            // Append embeddings to stored data
            storedData.map((item) => {
                item.embeddings = [0.027038993313908577, 0.09814383834600449, 0.06750451773405075];
            });
            // Save to session storage
            sessionStorage.setItem('cewbdata', JSON.stringify(storedData));
        }

        const search = async (keywords:string) => {

            setData([]);
            setBusy(false);

        }

        if (props.keywords?.length) search(props.keywords);
        else {
            setData(storedData);
            setBusy(false);
        }

    }, [props]);

    return (
        <Results keywords={props.keywords} data={data} isbusy={isBusy}/>
    );

}

const pluralize = (count:number, string:string, suffix:string = 's') => `${count} ${string}${count !== 1 ? suffix : ''}`;

const Results = (props:{ keywords:string; data:CEWBEntity[]; isbusy:boolean; }) => {

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

const Search = () => {

    const searchParams = useSearchParams();
    const [isReady, setReady] = useState(false);

    useEffect(() => {

        const initialize = async () => {

            /*
             * Fetch all the (Q)items from CE Wikibase and save in session storage.
             * [WHY] Searches return an array of (Q)item ids, which is rehydrated using the 
             * details stored. Designed this way because the vector search require all the 
             * (Q)items preloaded in order to generate embeddings before a search can be
             * performed. The full text search query takes 2 API calls anyway (one to perform
             * search and another to fetch details of matched items), and having the (Q)item
             * details available locally eliminates the need for the 2nd API call.
             */
            if (sessionStorage.getItem("cewbdata") === null) await getAllItems().then((results) => {
                // Sort the results alphabetically
                results.sort((a, b) => {
                    const direction:string = "asc";
                    const regEx = new RegExp(/^The /, 'gm');
                    const aLabel = a.label !== null ? a.label.replace(regEx, '') : a.label;
                    const bLabel = b.label !== null ? b.label.replace(regEx, '') : b.label;
                    if (aLabel === null || bLabel === null) return 0;
                    if (direction === "desc") return -(aLabel > bLabel) || +(aLabel < bLabel);
                    return +(aLabel > bLabel) || -(aLabel < bLabel);
                });
                sessionStorage.setItem('cewbdata', JSON.stringify(results));
            });

            setReady(true);
        
        }
    
        initialize();

    }, []);

    return (
        <>
            <form id='search'>
                <div className='fieldgroup'>
                    <label htmlFor='searchmode'>Search Mode</label>
                    <select name='searchmode' id='searchmode' defaultValue={searchParams.get('searchmode')?.toString() ?? 'fulltext'}>
                        <option value='fulltext'>Full Text Search</option>
                        <option value='vector'>Vector Search</option>
                    </select>
                </div>
                <div className='fieldgroup'>
                    <label htmlFor='keywords'>Keywords</label>
                    <input type='search' name='keywords' id='keywords' placeholder='Search...' defaultValue={searchParams.get('keywords')?.toString()}/>
                </div>
                <button type='submit'><span className='label'> Search</span></button>
            </form>
            { isReady ? (searchParams.get('searchmode')?.toString() === 'vector' ? <VectorSearch keywords={searchParams.get('keywords')?.toString() as string}/> : <FullTextSearch keywords={searchParams.get('keywords')?.toString() as string}/>) : null }
        </>
    );

}

export default Search;
