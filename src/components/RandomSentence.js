import React, { useState, useEffect } from 'react';

function RandomSentence(props) {
  const [sentences, setSentences] = useState([]);
  const [selectedSentence, setSelectedSentence] = useState('');

  useEffect(() => {
    const file = require(`../json/${props.jsonFileName}.json`);
    setSentences(file);
  }, [props.jsonFileName]);

useEffect(() => {
    if (sentences.length > 1) {
        let randomIndex = Math.floor(Math.random() * sentences.length);
        setSelectedSentence(sentences[randomIndex]);
        const intervalId = setInterval(() => {
          let newRandomIndex;
          do {
            newRandomIndex = Math.floor(Math.random() * sentences.length);
          } while (newRandomIndex == randomIndex);
          randomIndex = newRandomIndex;
          setSelectedSentence(sentences[randomIndex]);
        }, props.delay);
        return () => clearInterval(intervalId);
      }
  }, [sentences, props.delay]);

  return (
    <p className={props.className} dangerouslySetInnerHTML={{__html: selectedSentence}} />
  );
}

export default RandomSentence;
