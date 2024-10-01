'use client';

import { useState, useEffect } from 'react';

import SearchResults from './SearchResults';

// Types
import { propertyNames, WBEntity } from "@/app/services/MediaWikiAPI";
interface CEWBEntity extends WBEntity {
    embeddings?: number[];
}

const hydrateEntities = (entityIDs:string[]):CEWBEntity[] => {

    const storedData:CEWBEntity[] = JSON.parse(sessionStorage.getItem('cewbdata') as string);

    return entityIDs.map((id) => {
        return storedData.find(item => item.id === id);
    }) as CEWBEntity[];

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
        <SearchResults keywords={props.keywords} data={data} isbusy={isBusy}/>
    );

}

export default VectorSearch;
