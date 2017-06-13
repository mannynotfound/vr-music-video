AFRAME.registerComponent('lyrics-manager', {
  schema: {
    title: {
      type: 'string',
    },
    lyrics: {
      type: 'string',
      parse: JSON.parse,
    },
    audio: {
      type: 'string',
    },
  },
  init() {
    const {title} = this.data;
    this.frame = this.createFrame();
    this.el.appendChild(this.frame);
    this.addNewText({text: title});
    this.playSong();
  },
  playSong() {
    // TODO: make this <a-sound> when song-loaded is released
    console.log('♪ PLAYING SONG ♪');
    const {audio} = this.data;
    const audioSrc = document.querySelector(audio).getAttribute('src');
    const soundFile = document.createElement('audio');
    soundFile.preload = 'auto';

    const src = document.createElement('source');
    src.src = audioSrc;
    soundFile.appendChild(src);

    soundFile.onplay = this.syncLyrics.bind(this);
    soundFile.load();
    soundFile.play();
  },
  clearEl(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  },
  syncLyrics() {
    const {lyrics} = this.data;
    lyrics.forEach(l => {
      setTimeout(() => {
        this.addNewText({
          dur: l.dur,
          text: l.lyrics,
        });
      }, l.start * 1000);
    });
  },
  createFrame() {
    const frame = document.createElement('a-box');
    frame.setAttribute('center-children', true);
    //frame.setAttribute('wireframe', true);
    frame.setAttribute('material', {opacity: 0});
    frame.setAttribute('position', '0 0 -5');
    frame.setAttribute('width', '8');
    frame.setAttribute('height', '5');
    frame.setAttribute('depth', '0.3');

    return frame;
  },
  addNewText({dur, text}) {
    this.clearEl(this.frame);
    this.currentText = this.createText(text);
    this.currentText.forEach(txt => {
      this.frame.appendChild(txt);
    });
    this.frame.emit('center-children');
    if (dur) {
      clearTimeout(this.textClear);
      this.textClear = setTimeout(() => {
        this.clearEl(this.frame);
      }, dur * 1000 + 500);
    }
  },
  createText(str) {
    return str.split('\n').map(line => {
      const text = document.createElement('a-entity');

      text.setAttribute('text-geometry', {
        value: line,
        bevelEnabled: true,
        bevelSize: 0.05,
        bevelThickness: 0.05,
        height: 0.25,
      });
      text.setAttribute('material', {
        color: 'pink',
        metalness: 0.9,
        roughness: 0.05,
        sphericalEnvMap: '#chrome',
        opacity: 0,
      });

      return text;
    });
  }
});
