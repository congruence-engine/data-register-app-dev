'use client';

import { useState, useEffect } from 'react';

import SearchResults from './SearchResults';

// Types
import { WBEntity } from "@/app/services/MediaWikiAPI";
import { cosinesim, generateTextStructureForEmbeddings, getEmbeddings } from '../services/VectorSearchHelper';
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

        const generateEmbeddings = async () => {
            const embeddings = await getEmbeddings(generateTextStructureForEmbeddings(storedData))
            return embeddings
        }

        

        const storedData:CEWBEntity[] = JSON.parse(sessionStorage.getItem('cewbdata') as string);
        // const tempText = generateTextStructureForEmbeddings(storedData)
        // Add embeddings if not present already
        const hasEmbeddings = storedData.filter((o) => {
            return o.hasOwnProperty('embeddings');
        }).length > 0;
        if (!hasEmbeddings) {
            generateEmbeddings().then(embeddings => {
                storedData.map((item, index) => {
                    item.embeddings = embeddings[index]
                })
                sessionStorage.setItem('cewbdata', JSON.stringify(storedData));
            })
        }

        const search = async (keywords:string) => {

            getEmbeddings([keywords]).then(searchEmbedding => {
                console.log(searchEmbedding[0])

                const storedData:CEWBEntity[] = JSON.parse(sessionStorage.getItem('cewbdata') as string);
                
                const cosineSims: { id: string; cosine: number }[] = []
                storedData.forEach((dataItem)=>{
                    cosineSims.push({id: dataItem.id, cosine: cosinesim(dataItem.embeddings!, searchEmbedding[0]) })
                })
                
                cosineSims.sort((a, b) => (a.cosine < b.cosine ? 1 : -1))
                
                const onlyIds: string[] = []
                cosineSims.forEach((consineItem) => {
                    onlyIds.push(consineItem.id)
                })

                console.log(cosineSims)
                console.log(onlyIds)
                setData(hydrateEntities(onlyIds));
            })
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
