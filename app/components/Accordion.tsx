import React, { useState } from "react";

const Accordion = (props: { typeOfSearch: 'keywordSearch'|'keywordVectorSearch'|'itemVectorSearch'|null }) => {
  const [accordionOpen, setAccordionOpen] = useState(false);

  const fullTextSearchInfo = 
    <>
      <p>
        Full Text Search works as a traditional keyword search. The terms used in the search will be matched with the text content of the entries and their various properties. 
        <br/><br/>
        Boolean operators can be used to refine the search, these operators include: AND, OR, NOT. By default when no boolean operators are used the OR operator is used with each search term. Find out more here: ADD LINK
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
        By transforming the text into vectors you create a numerical representation of the text, which allows comparisons using mathematical processes. In this case the cosine distance between vectors is used, known as the cosine similarity.
        <br/><br/>
        All of the results will be returned sorted by the cosine similarity measure, showing the most similar results at the top. This method of search allows for a more explorative search, not requiring the exact keywords to be used but has the same black box qualities as a large language model. 
      </p>
    </>

  const additionalInfoDict = {
    'keywordSearch': {title: 'More information about Full Text Search', description: fullTextSearchInfo},
    'itemVectorSearch': {title: 'More information about Vector Search', description: 'item vector search'},
    'keywordVectorSearch': {title: 'More information about Keyword Vector Search', description: keywordVectorSearchInfo},
    null: {title: 'More information about Full Text Search', description: fullTextSearchInfo},
  }

  console.log(additionalInfoDict['keywordSearch'])
  console.log(additionalInfoDict['itemVectorSearch'])

  if (!props.typeOfSearch) return null

  return (
    <div id='display-search-information'>
      <button
        onClick={() => setAccordionOpen(!accordionOpen)}
      >
        {additionalInfoDict[props.typeOfSearch].title}
        {/* aaaaa */}
        {accordionOpen ? <span>-</span> : <span>+</span>}
        {/* <svg
          className="fill-indigo-500 shrink-0 ml-8"
          width="16"
          height="16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              accordionOpen && "!rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              accordionOpen && "!rotate-180"
            }`}
          />
        </svg> */}
      </button>
      <div
        id='accordion'
        // className={` ${
        //   accordionOpen
        //     ? "grid-rows-[1fr] opacity-100"
        //     : "grid-rows-[0fr] opacity-0"
        // }`}
        className={` ${accordionOpen ? "open" : "closed"}`}
      >
        <div id='accordion-content'>{additionalInfoDict[props.typeOfSearch].description}</div>
      </div>
    </div>
  );
};

export default Accordion;