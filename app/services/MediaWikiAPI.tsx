/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import axios from 'axios';

// MediaWiki API endpoint
const endpoint = process.env.NEXT_PUBLIC_MEDIAWIKIAPI_ENDPOINT;

// Types
export interface WBEntity {
    id: string;
    type: string;
    label: string|null;
    description: string|null;
    statements?: WBStatement;
};
export interface WBStatement {
    [key: string]: WBProperty[];
};
export interface WBProperty {
    id: string;
    value: string|null;
    datatype:string;
    qualifiers?: WBStatement;
};
export type propertyNames = {
    [key:string]: string;
};
type GenericObject = {
    [key: string]: {value: any}|any; 
    hasOwnProperty?: any;
};
type RequestProps = QueryProps|(Omit<WBGetEntitiesProps, 'ids'> & {ids: string});
type QueryProps = {
    action?: string;
    continue?: string;
} & (AllPagesProps|SRSearchProps);
type AllPagesProps = {
    list: 'allpages';
    apnamespace?: number;
    apcontinue?: string;
};
type SRSearchProps = {
    list: 'search';
    srsearch?: string;
    srnamespace?: number,
    sroffset?: number;
    srsort?: string;
};
type WBGetEntitiesProps = {
    action?: string;
    props?: string;
    ids: string[];
};

// Stuff that make stuff happen
const Request = async (props:RequestProps) => {

    /*
     * MediaWiki APIs: https://www.mediawiki.org/wiki/API
     * MediaWiki Action API: https://www.mediawiki.org/wiki/API:Main_page
     * CirrusSearch: https://www.mediawiki.org/wiki/Extension:CirrusSearch
     * CirrusSearch Help/Full Text Search: https://www.mediawiki.org/wiki/Help:CirrusSearch
     * Wikibase CirrusSearch: https://www.mediawiki.org/wiki/Help:Extension:WikibaseCirrusSearch
    */

    const params:GenericObject = {
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
    .catch ((err) => {
        return err;
    });
    
};

const Query = async (props:QueryProps): Promise<string[]> => {

    const params = {
        ...props,
        action: 'query'
    }
    
    const response = await Request(params);
    
    let data:string[] = [];
    
    if (response.hasOwnProperty('query')) 
        data = response.query[props.list].map((item: {ns: number; title: string;}) => {
            if (item.ns === 0) return item.title;
            return item.title.split(':')[1]
        });
    
    if (response.hasOwnProperty('continue')) {
        props.continue = response.continue.continue;
        if (props.list === 'allpages') props.apcontinue = response.continue.apcontinue;
        else if (props.list === 'search') props.sroffset = response.continue.sroffset;
        return data.concat(await Query(props));
    }
    
    return data;

};

const WBGetEntities = async (props:WBGetEntitiesProps): Promise<GenericObject[]> => {

    const ids = props.ids.join("|");

    let params = {
        ...props,
        ids: ids,
        action: 'wbgetentities',
        props: 'labels|descriptions|claims'
    }    
    
    let data:GenericObject[] = [];

    if (params.ids.length) {
        const response = await Request(params);        
        if (response.hasOwnProperty('entities')) 
            data = Object.entries(response.entities as object).map(([key, value]) => value);
    }
    
    return data;

};

const parseEntities = (entities:GenericObject[], propertyNames:propertyNames={}):WBEntity[] => {

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
    
    const data = entities.map(item => {

        let values:WBEntity = {
            id: item.id,
            type: item.type,
            label: Object.keys(item.labels).length > 0 ? parseTranslation(item.labels) : null,
            description: Object.keys(item.descriptions).length > 0 ? parseTranslation(item.descriptions) : null
        }
        if (Object.keys(item.claims).length > 0) values.statements = parseStatements(item.claims, propertyNames);

        return values;
    });

    return data;
};

const parseTranslation = (value:{
    [key: string]: {
        language: string;
        value: string;
    }; 
}, preferredLanguage='en'):string|null => {

    // Get translation in the preferred language
    if (value.hasOwnProperty(preferredLanguage)) return value[preferredLanguage].value;
    
    // Get the default/first translation
    if (Object.keys(value).length > 0) return value[Object.keys(value)[0]].value;

    return null;

};

const parseStatements = (claims:object, propertyNames:propertyNames={}):WBStatement => {

    let statements = {};

    Object.entries(claims).forEach(([pid, claim]) => {

        const pname:string|any = (propertyNames.hasOwnProperty(pid)) ? propertyNames[pid] : pid;

        let statement = [];

        for (const value of claim) {

            let property:WBProperty = {
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
}, parse:boolean=false):Promise<WBEntity[]|string[]> => {

    const args:AllPagesProps = {
        ...props,
        list: 'allpages'
    };
    const ids = await Query(args);

    if (!parse) return ids;
 
    return parseEntities(await WBGetEntities({ids: ids}));

};

export const getItems = async (props:{
    srsearch: string;
    srnamespace?: number
}):Promise<string[]> => {

    const args:SRSearchProps = {
        ...props,
        list: 'search'
    };
    
    return await Query(args);

};

export const getHydratedItems = async (props:{
    srsearch: string;
    srnamespace?: number
}, propertyNames:propertyNames={}):Promise<WBEntity[]> => {

    const ids = await getItems(props);

    return parseEntities(await WBGetEntities({ids: ids}), propertyNames);

};
