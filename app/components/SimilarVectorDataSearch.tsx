'use client';

import { useState, useEffect } from 'react';

import { CEEntity, getStoredData, setStoredData, hydrateEntities } from '@/app/components/Data';
import { cosinesim, generateTextStructureForEmbeddings, getEmbeddings } from '../services/VectorSearchHelper';
import SearchResults from './SearchResults';
import { DotLoader } from '@/app/components/Loader';

const SimilarVectorDataSearch = (props:{keywords:string; onErrorHandler:(error:object)=>void;}) => {

    const [data, setData] = useState<CEEntity[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [loadingMessage, setLoadingMessage] = useState<string>('');

    useEffect(() => {

        setLoading(true);
        setLoadingMessage('Generating vector embeddings (this may take a while...)');

        const storedData:CEEntity[] = getStoredData()

        const generateEmbeddings = async () => {
            const storedData:CEEntity[] = await getStoredData();

            // Add embeddings if not present already
            const hasEmbeddings = storedData.filter((o) => {
                return o.hasOwnProperty('embeddings');
            }).length > 0;

            if (!hasEmbeddings) {

                setLoadingMessage('Generating vector embeddings (this may take a while...)');

                const generatedEmbeddings = await getEmbeddings(generateTextStructureForEmbeddings(storedData))

                await storedData.map((item, index) => {
                    item.embeddings = generatedEmbeddings[index]
                })

                await setStoredData(storedData)
            }
        }

        const search = async (keywords:string) => {

            setLoadingMessage('Searching...');

            let storedData:CEEntity[] = await getStoredData()

            const hasEmbeddings = await storedData.filter((o) => {
                return o.hasOwnProperty('embeddings');
            }).length > 0;

            if (!hasEmbeddings) {
                await generateEmbeddings()
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const storedData:CEEntity[] = await getStoredData()
            }

            storedData = await getStoredData()

            const selectedTargetSimilarityDataItem = storedData.filter((storedItem) => {
              return storedItem.id == keywords
            })[0].embeddings
            // console.log(selectedTargetSimilarityDataItem)

            const cosineSims: { id: string; cosine: number }[] = []
            
            await storedData.forEach(async (dataItem)=>{
                cosineSims.push({id: dataItem.id, cosine: await cosinesim(dataItem.embeddings!, selectedTargetSimilarityDataItem!) })
            })
            
            cosineSims.sort((a, b) => (a.cosine < b.cosine ? 1 : -1))
            
            const onlyIds: string[] = []

            cosineSims.forEach((consineItem) => {
                onlyIds.push(consineItem.id)
            }) 

            setData(hydrateEntities(onlyIds));

            setLoading(false);

        }

        generateEmbeddings()

        if (props.keywords && props.keywords.length) search(props.keywords);
        else {
            setData(storedData);
            setLoading(false);
        }

    }, [props]);

    if (isLoading) return <DotLoader style='dotdotdot' message={loadingMessage}/>;

    return (
        <SearchResults keywords={props.keywords} data={data} searchMode='itemVectorSearch'/>
    );

}

export default SimilarVectorDataSearch;
