'use client';

import { useState, useEffect } from 'react';

import { getItems, isException } from "@/app/services/MediaWikiAPI";
import { CEEntity, getStoredData, hydrateEntities } from '@/app/components/Data';
import SearchResults from '@/app/components/SearchResults';
import { DotLoader } from '@/app/components/Loader';

// Stuff that make stuff happen

const FullTextSearch = (props:{keywords:string; onErrorHandler:(error:object)=>void;}) => {

    const [data, setData] = useState<CEEntity[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [loadingMessage, setLoadingMessage] = useState<string>('');

    useEffect(() => {
        
        setLoading(true);
        setLoadingMessage('Searching...');

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

            const results = await getItems(params as {srsearch: string; srnamespace: number;});

            if (isException(results)) props.onErrorHandler(results);
            else setData(hydrateEntities(results as string[]));
            
            setLoading(false);

        }
        
        if (props.keywords && props.keywords.length) search(props.keywords);
        else {
            const storedData = getStoredData();
            setData(storedData);
            setLoading(false);
        }

    }, [props]);

    if (isLoading) return <DotLoader style='dotdotdot' message={loadingMessage}/>;

    return (
        <SearchResults keywords={props.keywords} data={data} searchMode='keywordSearch'/>
    );

}

export default FullTextSearch;
