import React, { useState } from "react";
import { CEEntity } from "./Data";

const Accordion = (props: { typeOfSearch: 'keywordSearch'|'keywordVectorSearch'|'itemVectorSearch'|null, data:CEEntity[], keywords: string }) => {
  const [accordionOpen, setAccordionOpen] = useState(false);

  const pluralize = (count:number, string:string, suffix:string = 's') => `${count} ${string}${count !== 1 ? suffix : ''}`;

  // console.log(props)

  let accordionTitle = <>Showing all {props.data.length} records.</>
  let accordionInfo = 
  <>
    <p>
      Keyword Vector Search utilises the <a href='https://huggingface.co/docs/transformers.js/en/index'>Transformer JS Library</a> to create Vectors/Embeddings from the search terms and the text content in the entries and their various properties.
      <br/><br/>
      By transforming the text into vectors you create a numerical representation of the text, which allows comparisons using mathematical processes. In this case the cosine distance between vectors is used, also known as the cosine similarity.
      <br/><br/>
      All of the results will be returned sorted by the cosine similarity measure, showing the most similar results at the top. This method of search allows for a more explorative search, not requiring the exact keywords to be used but has the same &apos;black box&apos; qualities as a large language model. 
    </p>
  </>

  if (props.typeOfSearch == 'keywordSearch' && props.keywords) {
    accordionTitle = <div>{pluralize(props.data.length, 'record')} found using Full Text Search with keywords: <em>{props.keywords}</em>.</div>
  } else if (props.typeOfSearch == 'itemVectorSearch'){
    accordionTitle = props.data[0] && <div>Showing all {props.data.length} items in order of similarity to the selected dataset: <em><span aria-details={props.data[0].id}> {props.data[0].label} </span></em></div>
    accordionInfo = 
    <>
      <p>
        Item Vector Search compares a single dataset to all other datasets in order to find the most similar ones.
        <br/><br/>
        This method uses vector embeddings, previously generated for the Keyword Vector Search, to represent each dataset numerically and measures similarity by calculating the cosine distance between vectors. It allows the exploration of relationships between datasets based on content similarity.
        <br/><br/>
        This type of search is particularly useful for discovering datasets with closely related content.
      </p>
    </>
  } else if (props.typeOfSearch == 'keywordVectorSearch'  && props.keywords) {
    accordionTitle = <div>Showing all {props.data.length} items in order of similarity to keywords: <em>{props.keywords}</em></div>
    accordionInfo = 
    <>
      <p>
        Keyword Vector Search utilises the <a href='https://huggingface.co/docs/transformers.js/en/index'>Transformer JS Library</a> to create Vectors/Embeddings from the search terms and the text content in the entries and their various properties.
        <br/><br/>
        By transforming the text into vectors you create a numerical representation of the text, which allows comparisons using mathematical processes. In this case the cosine distance between vectors is used, also known as the cosine similarity.
        <br/><br/>
        All of the results will be returned sorted by the cosine similarity measure, showing the most similar results at the top. This method of search allows for a more explorative search, not requiring the exact keywords to be used but has the same &apos;black box&apos; qualities as a large language model. 
      </p>
    </>
  }

  if (!props.typeOfSearch) return null

  return (
    <div id='search-results-information'>
      <button
        onClick={() => setAccordionOpen(!accordionOpen)}
      >
        {accordionTitle}
        {accordionOpen ? <span>-</span> : <span>+</span>}
      </button>
      <div id='accordion' className={` ${accordionOpen ? "open" : "closed"}`}>
        <div id='accordion-content'>{accordionInfo}</div>
      </div>
    </div>
  );
};

export default Accordion;