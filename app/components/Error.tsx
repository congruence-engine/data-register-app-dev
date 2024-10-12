'use client';

import { isException } from "@/app/services/MediaWikiAPI";

const ErrorMessage = (props:{error:unknown}) => {
    console.log('error', props.error);
    return (
        <div id='error'>
            <h1>Something went wrong</h1>
            { isException(props.error) ? <p>We&apos;re having problems connecting to Wikibase.</p> : null }
            <p>Please try again a little later.</p>
        </div>
    );
}

export default ErrorMessage;