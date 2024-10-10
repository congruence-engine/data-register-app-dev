'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { fetchStoredData } from '@/app/components/Data';
import FullTextSearch from '@/app/components/FullTextSearch';
import VectorSearch from '@/app/components/VectorSearch';
import { CSSLoader } from '@/app/components/Loader';
import ErrorMessage from '@/app/components/Error';


// Stuff that make stuff happen

const Search = () => {

    const searchParams = useSearchParams();
    const [isReady, setReady] = useState(true);
    const [isError, setError] = useState();

    const onErrorHandler = (error:any) => setError(error);

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
            await fetchStoredData({onErrorHandler: onErrorHandler});

            setReady(false);
        
        }
    
        initialize();

    }, []);

    if (isError) return <ErrorMessage error={isError}/>;

    return (
        <section id='search' className='container'>
            <h1 className='home'>Congruence Engine Data Register</h1>
            <form>
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
                <button type='submit'><span className='btntext'>Search</span></button>
            </form>
            { isReady ? <CSSLoader style='dotdotdot'/> : searchParams.get('searchmode')?.toString() === 'vector' ? <VectorSearch keywords={searchParams.get('keywords')?.toString() as string} onErrorHandler={onErrorHandler}/> : <FullTextSearch keywords={searchParams.get('keywords')?.toString() as string} onErrorHandler={onErrorHandler}/> }
        </section>
    );

}

export default Search;
