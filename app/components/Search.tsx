'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getHydratedItems } from "@/app/services/MediaWikiAPI";

import FullTextSearch from './FullTextSearch';
import VectorSearch from './VectorSearch';

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
