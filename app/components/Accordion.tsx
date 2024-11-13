import React, { useState } from "react";

const Accordion = (props: { typeOfSearch: 'keywordSearch'|'keywordVectorSearch'|'itemVectorSearch'|null }) => {
  const [accordionOpen, setAccordionOpen] = useState(false);

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

  const additionalInfoDict = {
    'keywordSearch': {title: 'More information about Full Text Search', description: fullTextSearchInfo},
    'itemVectorSearch': {title: 'More information about Vector Similarity Search', description: itemVectorSearchInfo},
    'keywordVectorSearch': {title: 'More information about Keyword Vector Search', description: keywordVectorSearchInfo},
    null: {title: 'More information about Full Text Search', description: fullTextSearchInfo},
  }

  // console.log(additionalInfoDict['keywordSearch'])
  // console.log(additionalInfoDict['itemVectorSearch'])

  if (!props.typeOfSearch) return null

  return (
    <div id='display-search-information'>
      <button
        onClick={() => setAccordionOpen(!accordionOpen)}
      >
        {additionalInfoDict[props.typeOfSearch].title}
        {accordionOpen ? <span>-</span> : <span>+</span>}
      </button>
      <div id='accordion' className={` ${accordionOpen ? "open" : "closed"}`}>
        <div id='accordion-content'>{additionalInfoDict[props.typeOfSearch].description}</div>
      </div>
    </div>
  );
};

export default Accordion;