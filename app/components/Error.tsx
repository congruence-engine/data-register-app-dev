'use client';

import { WBError, WBErrorType } from "@/app/services/MediaWikiAPI";

const ErrorMessage = (props:{error:WBError}) => {
    return (
        <div id='error'>
            <h1>Something went wrong</h1>
            { WBErrorType(props.error) === 'api' ? <p>We're having problems connecting with Wikibase.</p> : null }
            <p>Please try again a little later.</p>
        </div>
    );
}

export default ErrorMessage;