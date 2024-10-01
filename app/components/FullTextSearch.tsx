'use client';

import { useState, useEffect } from 'react';

import { getItems } from "@/app/services/MediaWikiAPI";
import SearchResults from './SearchResults';

// Types
import { WBEntity } from "@/app/services/MediaWikiAPI";
interface CEWBEntity extends WBEntity {
    embeddings?: number[];
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
        <SearchResults keywords={props.keywords} data={data} isbusy={isBusy}/>
    );

}

export default FullTextSearch;