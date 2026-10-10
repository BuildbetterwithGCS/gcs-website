const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '../js/nexus-demo-player.js'), 'utf8');

describe('guided demo narration', () => {
  let instances;
  let frames;
  beforeEach(() => {
    jest.useFakeTimers();
    instances = [];
    frames = [];
    document.body.innerHTML = '<h2 class="sandbox-dept-heading">Demo</h2><button class="sandbox-nav-btn" data-view="executive">Executive</button>';
    Object.defineProperty(document, 'readyState', { configurable: true, value: 'complete' });
    Element.prototype.scrollIntoView = jest.fn();
    global.requestAnimationFrame = jest.fn(fn => { frames.push(fn); return frames.length; });
    global.cancelAnimationFrame = jest.fn();
    global.Audio = jest.fn(function () {
      this.pause = jest.fn(() => { this.paused = true; });
      this.play = jest.fn(() => { this.paused = false; return Promise.resolve(); });
      this.currentTime = 0;
      this.duration = 12;
      instances.push(this);
    });
    new Function(source)();
    window.NexusDemoPlayer.enter();
  });
  afterEach(() => { window.NexusDemoPlayer.exit(); jest.useRealTimers(); });

  test('Play starts same-origin audio before asynchronous tab animation', () => {
    window.NexusDemoPlayer.play();
    expect(instances[0].play).toHaveBeenCalledTimes(1);
    expect(instances[0].src).toBe('/assets/audio/nexus-demo/01-welcome.mp3');
    expect(instances[0].crossOrigin).toBeUndefined();
    expect(frames).toHaveLength(0);
    jest.advanceTimersByTime(280);
    expect(frames).toHaveLength(1);
  });

  test('the unlocked element is reused and the previous scene cannot stop its successor', async () => {
    window.NexusDemoPlayer.play();
    const audio = instances[0];
    let rejectPrevious;
    audio.play.mockImplementationOnce(() => new Promise((resolve, reject) => { rejectPrevious = reject; }));
    window.NexusDemoPlayer.nextScene();
    window.NexusDemoPlayer.nextScene();
    const pauses = audio.pause.mock.calls.length;
    rejectPrevious(new Error('skipped playback'));
    await Promise.resolve();
    expect(instances).toHaveLength(1);
    expect(audio.pause).toHaveBeenCalledTimes(pauses);
    expect(audio.src).toContain('03-problem-detected.mp3');
  });

  test('zero volume stays silent and a failed track exposes captions-only playback', () => {
    window.NexusDemoPlayer.play();
    window.NexusDemoPlayer.setVolume(0);
    expect(instances[0].volume).toBe(0);
    instances[0].onerror();
    expect(document.getElementById('ndp-player').classList.contains('ndp-player--captions-only')).toBe(true);
    expect(document.getElementById('ndp-btn-mute').getAttribute('aria-hidden')).toBe('true');
  });

  test('loaded duration prevents a long narration from being cut at the original visual duration', () => {
    window.NexusDemoPlayer.play();
    const audio = instances[0];
    audio.onloadedmetadata();
    jest.advanceTimersByTime(280);
    audio.currentTime = 5;
    frames[0](5000);
    expect(audio.src).toContain('01-welcome.mp3');
    audio.onended();
    expect(audio.src).toContain('02-executive-dashboard.mp3');
  });
});

test('all ten narration files are shipped with the site', () => {
  const root = path.join(__dirname, '../assets/audio/nexus-demo');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  expect(manifest.tracks).toHaveLength(10);
  for (const track of manifest.tracks) {
    const bytes = fs.readFileSync(path.join(root, track.filename));
    expect(bytes.length).toBeGreaterThan(10000);
    expect(bytes.subarray(0, 15).toString()).not.toContain('<!DOCTYPE');
  }
});
