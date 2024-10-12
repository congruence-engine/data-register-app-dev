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

type RecordValue = string | number;
type NestedRecord = {
    [key: string]: RecordValue | NestedRecord;
};

export type Exception = APIWarning|Error|AxiosError;
type  APIWarning = {
    code: string;
    "*": string;
    "module": string;
}
export const isException = (value:unknown):boolean => {
    return typeof value === 'object' && value !== null && (value['name' as keyof object] === 'AxiosError' || value['error' as keyof object]);
}
export const ExceptionType = (value:unknown):string|void => {
    if (isException(value)) return 'api';
}


// Stuff that make stuff happen

const useAPI = async (props:object):Promise<NestedRecord|Exception> => {

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
        return response.data as NestedRecord;
    })
    .catch((error) => {
        return error;
    });

}

const Query = async (props:QueryProps):Promise<NestedRecord[]|Exception> => {

    const params = {
        ...props,
        action: 'query'
    }

    const response = await useAPI(params) as NestedRecord;

    if (isException(response)) return response as Exception;    

    let data:object[] = [];

    if (response.hasOwnProperty('query') && typeof response.query === 'object') data = response.query[props.list] as unknown as object[];

    if (response.hasOwnProperty('continue') && typeof response.continue === 'object') {
        props.continue = response.continue.continue as string;
        if (props.list === 'allpages') props.apcontinue = response.continue.apcontinue as string;
        else if (props.list === 'search') props.sroffset = response.continue.sroffset as number;
        return data.concat(await Query(props)) as NestedRecord[];
    }

    return data as NestedRecord[];

}

const WBGetEntities = async (ids:string[]): Promise<NestedRecord[]|Exception> => {

    const params = {
        action: 'wbgetentities',
        props: 'labels|descriptions|claims',
        ids: ids.join("|")
    }

    const response = await useAPI(params) as NestedRecord;

    if (isException(response)) return response as Exception;

    let data:object = [];
    if (response.hasOwnProperty('entities')) 
        data = (Object.entries(response.entities).map((value) => value[1]));

    return data as NestedRecord[];

};

const parseEntities = (entities:NestedRecord[], propertyNames:PropertyNames={}):Entity[] => {

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

    const data:Entity[] = entities.map((entity) => {
        const values:Entity = {
            id: entity.id as string,
            type: entity.type as string,
            label: Object.keys(entity.labels).length ? parseTranslation(entity.labels as object) : null,
            description: Object.keys(entity.descriptions).length > 0 ? parseTranslation(entity.descriptions as object) : null
        }
        if (entity.hasOwnProperty('claims') && Object.keys(entity.claims as object).length > 0) values.statements = parseStatements(entity.claims as object, propertyNames);

        return values;
    });

    return data;
};

const parseTranslation = (value:object, preferredLanguage:string='en'):Translation => {

    // Get translation in the preferred language
    if (value.hasOwnProperty(preferredLanguage)) return value[preferredLanguage as keyof object]['value'];
    
    // Get the default/first translation
    if (Object.keys(value).length > 0) return value[Object.keys(value)[0] as keyof object]['value'];

    return null;

};

const parseStatements = (claims:object, propertyNames:PropertyNames={}):Statements => {

    let statements = {};

    Object.entries(claims).forEach(([pid, claim]) => {

        const pname:string = (propertyNames.hasOwnProperty(pid)) ? propertyNames[pid] : pid;

        const statement = [];

        for (const value of claim) {
            const property:Property = {
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
}, hydrate:boolean=false):Promise<string[]|Entity[]|Exception> => {

    const params:AllPagesProps = {
        ...props,
        list: 'allpages'
    };

    const result = await Query(params);

    if (isException(result)) return result as Exception;

    const ids = (result as {ns: number; title: string;}[]).map((item) => {
        if (item.ns === 0) return item.title;
        return item.title.split(':')[1];
    });

    if (hydrate) return parseEntities(await WBGetEntities(ids) as NestedRecord[]);

    return ids;   

};

export const getItems = async (props:{
    srsearch: string;
    srnamespace?: number
}, hydrate:boolean=false, propertyNames:PropertyNames={}):Promise<string[]|Entity[]|Exception> => {

    const params:SearchProps = {
        ...props,
        list: 'search'
    };
    
    const result = await Query(params);

    if (isException(result)) return result as Exception;

    const ids = (result as {ns: number; title: string;}[]).map((item) => {
        if (item.ns === 0) return item.title;
        return (item.title as string).split(':')[1];
    });

    if (hydrate) return parseEntities(await WBGetEntities(ids) as NestedRecord[], propertyNames);

    return ids;

}
