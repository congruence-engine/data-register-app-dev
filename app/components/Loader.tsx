'use client';

export const DotLoader = (props:{style:string; message?:string;}) => {
    return (
        <div className="loader">
            <div className={props.style}></div>
            { props.message ? <p>{props.message}</p> : null }
        </div>
    );
}