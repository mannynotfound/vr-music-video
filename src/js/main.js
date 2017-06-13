/* eslint-disable */
import {parseString} from 'xml2js';
import {unescape} from 'lodash';

function parseLyrics({transcript}) {
  return transcript.text.map(text => {
    let chars = unescape(text._);
    const {dur, start} = text.$;

    chars = chars.replace(/♪/g, '').trim();
    if (!chars) return null;

    return {
      lyrics: chars,
      dur,
      start,
    };
  }).filter(x => x);
}

function parseCaptions(xml) {
  parseString(xml, (err, result) => {
    if (err) {
      console.log(err);
      throw new Error('parse failed');
    }

    const lyrics = parseLyrics(result);
    const lyricsManager = document.createElement('a-entity');
    lyricsManager.setAttribute('lyrics-manager', {
      title: 'SWANG',
      lyrics: JSON.stringify(lyrics),
      audio: '#song',
    });
    const container = document.getElementById('aframe-project');
    container.appendChild(lyricsManager);
  });
}

function fetchCaptions() {
  fetch('http://video.google.com/timedtext?lang=en&v=dmJefsOErr0')
    .then(response => response.text()).then(parseCaptions);
}

export function startApp(aScene) {
  const container = document.getElementById('container');
  container.innerHTML = aScene({});
  fetchCaptions();
}
