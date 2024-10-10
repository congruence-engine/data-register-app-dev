'use client';

import { useState, useEffect } from 'react';

import { CEEntity, getStoredData, setStoredData, hydrateEntities } from '@/app/components/Data';
import { cosinesim, generateTextStructureForEmbeddings, getEmbeddings } from '../services/VectorSearchHelper';
import SearchResults from './SearchResults';
import { CSSLoader } from '@/app/components/Loader';

const VectorSearch = (props:{keywords:string; onErrorHandler:any;}) => {

    const [data, setData] = useState<CEEntity[]>([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {

        setLoading(true);

        const generateEmbeddings = async () => {
            const embeddings = await getEmbeddings(generateTextStructureForEmbeddings(storedData))
            return embeddings
        }

        const storedData:CEEntity[] = getStoredData();
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
                setStoredData(storedData);
            })
        }

        const search = async (keywords:string) => {

            getEmbeddings([keywords]).then(searchEmbedding => {
                console.log(searchEmbedding[0])

                const storedData:CEEntity[] = getStoredData();
                
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
                setLoading(false);
            })

        }

        if (props.keywords?.length) search(props.keywords);
        else {
            setData(storedData);
            setLoading(false);
        }

    }, [props]);

    if (isLoading) return <CSSLoader style='dotdotdot' message='Generating vector embeddings, may take a while...'/>;

    return (
        <SearchResults keywords={props.keywords} data={data}/>
    );

}

export default VectorSearch;
