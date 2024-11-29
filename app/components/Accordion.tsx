import React, { useState } from "react";
import { CEEntity } from "./Data";

const Accordion = (props: { typeOfSearch: 'keywordSearch'|'keywordVectorSearch'|'itemVectorSearch'|null, data:CEEntity[], keywords: string }) => {
  const [accordionOpen, setAccordionOpen] = useState(false);

  const pluralize = (count:number, string:string, suffix:string = 's') => `${count} ${string}${count !== 1 ? suffix : ''}`;

  const fullTextSearchInfo = 
    <>
      <p>
        Full Text Search works as a traditional keyword search. The terms used in the search will be matched with the text content of the entries and their various properties. 
        <br/><br/>
        Boolean operators can be used to refine the search, these operators include: AND, OR, NOT. By default when no boolean operators are used the OR operator is used with each search term. 
        <br/>
        <a href='https://www.mediawiki.org/wiki/Help:Extension:WikibaseCirrusSearch'> Find out more about additional operators.</a>
        <br/>
        Examples:
        <ul>
          <li> <em>Bradford Textiles</em> : Returns entries containing the word Bradford OR Textiles. </li>
          <li> <em>Bradford AND Textiles</em> : Returns entries containing the word Bradford AND Textiles. </li>
          <li> <em>Bradford AND !Textiles</em> : Returns entries that contain the word Bradford but NOT Textiles. </li>
        </ul>
      </p>
    </>

  const fullTextSearchTitle = <>{pluralize(props.data.length, 'record')} found using Full Text Search.</>

  const keywordVectorSearchInfo = 
    <>
      <p>
        Keyword Vector Search utilises the <a href='https://huggingface.co/docs/transformers.js/en/index'>Transformer JS Library</a> to create Vectors/Embeddings from the search terms and the text content in the entries and their various properties.
        <br/><br/>
        By transforming the text into vectors you create a numerical representation of the text, which allows comparisons using mathematical processes. In this case the cosine distance between vectors is used, also known as the cosine similarity.
        <br/><br/>
        All of the results will be returned sorted by the cosine similarity measure, showing the most similar results at the top. This method of search allows for a more explorative search, not requiring the exact keywords to be used but has the same &apos;black box&apos; qualities as a large language model. 
      </p>
    </>

  const keywordVectorSearchTitle = <div>Showing all {props.data.length} items in order of cosine similarity to keywords: <em>{props.keywords}</em></div>

  const itemVectorSearchInfo = 
  <>
    <p>
      Item Vector Search compares a single dataset to all other datasets in order to find the most similar ones.
      <br/><br/>
      This method uses vector embeddings, previously generated for the Keyword Vector Search, to represent each dataset numerically and measures similarity by calculating the cosine distance between vectors. It allows the exploration of relationships between datasets based on content similarity.
      <br/><br/>
      This type of search is particularly useful for discovering datasets with closely related content.
    </p>
  </>

  const itemVectorSearchTitle = <div>Showing all {props.data.length} items in order of cosine similarity to dataset: <em><span aria-details={props.data[0].id}> {props.data[0].label} </span></em></div>

  const defaultFullTextSearchTitle = <>Showing all {props.data.length} records.</>


  const additionalInfoDict = {
    'keywordSearch': {title: fullTextSearchTitle, description: fullTextSearchInfo},
    'itemVectorSearch': {title: itemVectorSearchTitle, description: itemVectorSearchInfo},
    'keywordVectorSearch': {title: keywordVectorSearchTitle, description: keywordVectorSearchInfo},
    'none': {title: defaultFullTextSearchTitle, description: fullTextSearchInfo},
  }

  if (!props.typeOfSearch) return null

  return (
    <div id='display-search-information'>
      <button
        onClick={() => setAccordionOpen(!accordionOpen)}
      >
        {props.keywords ? additionalInfoDict[props.typeOfSearch].title : additionalInfoDict['none'].title}
        {accordionOpen ? <span>-</span> : <span>+</span>}
      </button>
      <div id='accordion' className={` ${accordionOpen ? "open" : "closed"}`}>
        <div id='accordion-content'>{additionalInfoDict[props.typeOfSearch].description}</div>
      </div>
    </div>
  );
};

export default Accordion;