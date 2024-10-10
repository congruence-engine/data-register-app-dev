'use client';

import axios, { AxiosError } from 'axios';

// MediaWiki API endpoint
const endpoint = process.env.NEXT_PUBLIC_MEDIAWIKIAPI_ENDPOINT;

// Types
export type PropertyNames = {
    [key:string]: string;
};
export interface Entity {
    id: string;
    type: string;
    label: Translation;
    description: string|null;
    statements?: Statements;
};
export type Translation = string|null;
export interface Statements {
    [key: string]: Property[];
};
export interface Property {
    id: string;
    value: string|null;
    datatype:string;
    qualifiers?: Statements;
};
export type WBError = { error: WBWarning }|Error|AxiosError;
type WBWarning = {
    code: string;
    "*": string;
    "module": string;
}
type QueryProps = {
    action?: string;
    continue?: string;
} & (AllPagesProps|SearchProps);
type AllPagesProps = {
    list: 'allpages';
    aplimit?: number;
    apnamespace?: number;
    apcontinue?: string;
};
type SearchProps = {
    list: 'search';
    srsearch?: string;
    srnamespace?: number,
    srlimit?: number;
    sroffset?: number;
    srsort?: string;
};
type WBEntity = {
    id: string;
    type: string;
    labels: WBTranslation;
    descriptions: WBTranslation;
    claims?: WBClaim|any;
};
type WBTranslation = {
    [key: string]: {
        language: string;
        value: string;
    };
}
type WBClaim = {
    [key: string]: WBObject[];
};
type WBObject = {
    [key: string]: any;
    hasOwnProperty?: any;
};

// Stuff that make stuff happen

export const isWBError = (value: any): value is WBError => {
    return (value.name === 'AxiosError' || value.error);
}
export const WBErrorMessage = (value: any) => {
    if (value.name === 'AxiosError') return value.message;
    if (value.error) return value.error?.info;
}
export const WBErrorType = (value: any) => {
    if (value.name === 'AxiosError' || value.error) return 'api';
}

const useAPI = async (props:{}):Promise<{}> => {

    /*
     * MediaWiki APIs: https://www.mediawiki.org/wiki/API
     * MediaWiki Action API: https://www.mediawiki.org/wiki/API:Main_page
     * CirrusSearch: https://www.mediawiki.org/wiki/Extension:CirrusSearch
     * CirrusSearch Help/Full Text Search: https://www.mediawiki.org/wiki/Help:CirrusSearch
     * Wikibase CirrusSearch: https://www.mediawiki.org/wiki/Help:Extension:WikibaseCirrusSearch
    */

    const params = {
        ...props,
        format: 'json',
        origin: '*',
    }

    const querystring = new URLSearchParams(params).toString();
    const url = endpoint + '?' + querystring;

    return await axios.get(url, {
        headers: {
            'Accept': 'application/json'
        }
    })
    .then((response) => {
        return response.data;
    })
    .catch((error) => {
        return error;
    });

}

const Query = async (props:QueryProps):Promise<{}> => {

    const params = {
        ...props,
        action: 'query'
    }

    const response:any = await useAPI(params);

    if (isWBError(response)) return response;    

    let data = [];

    if (response.hasOwnProperty('query')) data = response.query[props.list];

    if (response.hasOwnProperty('continue')) {
        props.continue = response.continue.continue;
        if (props.list === 'allpages') props.apcontinue = response.continue.apcontinue;
        else if (props.list === 'search') props.sroffset = response.continue.sroffset;
        return data.concat(await Query(props));
    }

    return data;

}

const WBGetEntities = async (ids:string[]): Promise<{}> => {

    const params = {
        action: 'wbgetentities',
        props: 'labels|descriptions|claims',
        ids: ids.join("|")
    }
    
    let data = [];

    if (params.ids.length) {
        const response:any = await useAPI(params);
        if (response.hasOwnProperty('entities')) 
            data = Object.entries(response.entities as object).map(([key, value]) => value);
    }

    return data;

};

const parseEntities = (entities:WBEntity[], propertyNames:PropertyNames={}):Entity[] => {

    /* Parse entities into a simplified data strcuture:
    [
        {
            (Q)id: string,
            label: string,
            description: string,
            statements: {
                <pid|pname>: [
                    {
                        (P)id: string,
                        value: string,
                        datatype: string,
                        qualifiers: {
                            <pid|pname>: [
                                {
                                    (P)id: string,
                                    value: string,
                                    datatype: string
                                },
                                ...
                            ]
                        }
                    },
                    ...
                ]
            }
        },
        ...
    ]
    */
    
    const data = entities.map(entity => {

        let values:any = {
            id: entity.id,
            type: entity.type,
            label: Object.keys(entity.labels).length > 0 ? parseTranslation(entity.labels) : null,
            description: Object.keys(entity.descriptions).length > 0 ? parseTranslation(entity.descriptions) : null
        }
        if (entity.hasOwnProperty('claims') && Object.keys(entity.claims).length > 0) values.statements = parseStatements(entity.claims, propertyNames);

        return values;
    });

    return data;
};

const parseTranslation = (value:WBTranslation, preferredLanguage:string='en'):Translation => {

    // Get translation in the preferred language
    if (value.hasOwnProperty(preferredLanguage)) return value[preferredLanguage].value;
    
    // Get the default/first translation
    if (Object.keys(value).length > 0) return value[Object.keys(value)[0]].value;

    return null;

};

const parseStatements = (claims:WBClaim, propertyNames:PropertyNames={}):Statements => {

    let statements = {};

    Object.entries(claims).forEach(([pid, claim]) => {

        const pname:string|any = (propertyNames.hasOwnProperty(pid)) ? propertyNames[pid] : pid;

        let statement = [];

        for (const value of claim) {
            let property:Property = {
                id: pid,
                value: value.mainsnak?.datavalue?.value ?? value.datavalue?.value ?? null,
                datatype: value.mainsnak?.datatype ?? value.datatype
            };

            if (value.hasOwnProperty('qualifiers')) property.qualifiers = parseStatements(value.qualifiers, propertyNames);
            statement.push(property);
        }

        statements = {...statements, [pname]: statement};
        
    });

    return statements;

};

export const getProperties = async (props:{
    apnamespace?: number;
}, hydrate:boolean=false):Promise<Entity[]|string[]|WBError> => {

    const params:AllPagesProps = {
        ...props,
        list: 'allpages'
    };

    const result:any = await Query(params);

    if (isWBError(result)) return result;

    const ids = result.map((item: {ns: number; title: string;}) => {
        if (item.ns === 0) return item.title;
        return item.title.split(':')[1]
    });

    if (hydrate) return parseEntities(await WBGetEntities(ids) as WBEntity[]);

    return ids;   

};

export const getItems = async (props:{
    srsearch: string;
    srnamespace?: number
}, hydrate:boolean=false, propertyNames:PropertyNames={}):Promise<Entity[]|string[]|WBError> => {

    const params:SearchProps = {
        ...props,
        list: 'search'
    };
    
    const result:any = await Query(params);

    if (isWBError(result)) return result;

    const ids = result.map((item: {ns: number; title: string;}) => {
        if (item.ns === 0) return item.title;
        return item.title.split(':')[1]
    });

    if (hydrate) return parseEntities(await WBGetEntities(ids) as WBEntity[], propertyNames);

    return ids;

}