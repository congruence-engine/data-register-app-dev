'use client';

import { getItems, Entity, PropertyNames, isException } from '@/app/services/MediaWikiAPI';

export interface CEEntity extends Entity {
    embeddings?: number[];
}

const CEPropertyNames:PropertyNames = {
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

const storedDataName = 'ce-wikibase';

export const setSessionData = async (props:{onErrorHandler:(error:object)=>void}) => {

        const params = {
            srsearch: 'haswbstatement:P1=Q1', 
            srnamespace: 120
        }
        
        const results = await getItems(params as {srsearch: string; srnamespace: number;}, true, CEPropertyNames) as CEEntity[];

        if (isException(results)) props.onErrorHandler(results);
        else if (results.length) {
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
            sessionStorage.setItem(storedDataName, JSON.stringify(results));
        }

}

export const hasStoredData = ():boolean => {
    return sessionStorage.getItem(storedDataName) !== null
}

export const setStoredData = (data:CEEntity[]):void => {
    sessionStorage.setItem(storedDataName, JSON.stringify(data));
}

export const getStoredData = ():CEEntity[] => {
    return JSON.parse(sessionStorage.getItem(storedDataName) as string);
}

export const hydrateEntities = (entityIDs:string[]):CEEntity[] => {

    const storedData:CEEntity[] = JSON.parse(sessionStorage.getItem(storedDataName) as string);

    return entityIDs.map((id) => {
        return storedData.find(item => item.id === id);
    }) as CEEntity[];

}