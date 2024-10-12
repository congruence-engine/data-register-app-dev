'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { hasStoredData, setSessionData } from '@/app/components/Data';
import FullTextSearch from '@/app/components/FullTextSearch';
import VectorSearch from '@/app/components/VectorSearch';
import { DotLoader } from '@/app/components/Loader';
import ErrorMessage from '@/app/components/Error';

// Stuff that make stuff happen

const Search = () => {

    const searchParams = useSearchParams();
    const [isReady, setReady] = useState<boolean>(false);
    const [isError, setError] = useState<object>();

    const onErrorHandler = (error:object) => setError(error);

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

            if (!hasStoredData()) await setSessionData({onErrorHandler: onErrorHandler});
            setReady(true);
            
        }
        
        initialize();
        
    }, []);

    if (isError) return <ErrorMessage error={isError}/>;

    return (
        <section id='search' className='container'>
            <h1 className='home'>Congruence Engine Data Register</h1>
            <form>
                <div className='fieldgroup'>
                    <label htmlFor='mode'>Search Mode</label>
                    <select name='mode' id='mode' defaultValue={searchParams.get('mode')?.toString() ?? 'fulltext'}>
                        <option value='fulltext'>Full Text Search</option>
                        <option value='vector'>Vector Search</option>
                    </select>
                </div>
                <div className='fieldgroup'>
                    <label htmlFor='query'>Keywords</label>
                    <input type='search' name='query' id='query' placeholder='Search...' defaultValue={searchParams.get('query')?.toString()}/>
                </div>
                <button type='submit'><span className='btntext'>Search</span></button>
            </form>
            { !isReady ? <DotLoader style='dotdotdot'/> : 
                searchParams.get('mode')?.toString() === 'vector' ? <VectorSearch keywords={searchParams.get('query')?.toString() as string} onErrorHandler={onErrorHandler}/> : <FullTextSearch keywords={searchParams.get('query')?.toString() as string} onErrorHandler={onErrorHandler}/> 
            }
        </section>
    );

}

export default Search;
