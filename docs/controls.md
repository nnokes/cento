# Controls

What every control does: the same text you see when you hover over it. In Max, rest the mouse on a control for a moment and its hint appears (or open Window > Clue Window). In Live, the text appears in the Info View (View > Info, or the ? button at the bottom left).

This page is written from the same table as the hover text (the patch generator), so they agree; `tests/patches.test.js` checks it.

## Max version: transport and output (left panel of `cento.maxpat`)

| Control | What it does |
| --- | --- |
| **Play / stop** | play (green): starts Max's transport and plays the current piece (or stream) through the output below, from the next barline; the button turns red and says stop. stop: stops the transport and silences held notes. When a piece (or a stream with a set number of phrases) ends, it stops by itself and says play again. |
| **Tempo** | Tempo in beats per minute (20 to 300) for Max's transport. Drag or type. Remembered for next time. |
| **Audio** | Audio on or off (Max's DSP). Needed only for plug-in instruments: the MIDI output plays without it. |
| **Output** | The MIDI port the four voices go to, one channel each: 1 soprano, 2 alto, 3 tenor, 4 bass. AU DLS Synth 1 is the Mac's own instruments. Remembered for next time. |
| **plug-in instruments** | On: the voices play through four plug-in instruments inside Max (choose them with set up) instead of the MIDI port. Turn audio on (the speaker) to hear them. Remembered for next time. |
| **set up** | Open the plug-in instruments window: choose the AU or VST3 instrument that plays each voice, and show its editor. |

## Live version: clips and voices (left panel of the cento.brain device)

| Control | What it does |
| --- | --- |
| **write clips** | Write the current piece as MIDI clips, one per voice, in the first empty clip slot of the Soprano, Alto, Tenor and Bass tracks. Edit them in Live like any clip. |
| **test clips** | Write a short test phrase as clips on the voice tracks: a quick check that the tracks are named and set up. |
| **clips on compose** | On: every piece composed is also written as clips (as write clips does), so nothing you like is lost. |
| **play through voices** | On: while Live plays, the piece plays through the cento.voice devices on the voice tracks. Turn it off to hear only clips you wrote (otherwise each note sounds twice). |
| **all voices on this track** | On: all four voices also come out of this track, to hear the whole piece on this track's instrument. |

## Composing (both versions)

| Control | What it does |
| --- | --- |
| **compose** | Compose a piece with the seed shown (with stream on: start a stream). While playing, the new music starts at the next bar. |
| **seed** | The random seed: the same seed, chorales, settings and taste always give the same piece. Changing it composes at once (once chorales are loaded). |
| **next** | Add 1 to the seed and compose: the quickest way to hear another piece. |
| **export midi** | Save the current piece as a MIDI file. For a composed piece or stream, a .json of where every beat came from is saved next to it. |
| **chorales** | Open the chorales window: the folders of chorales (MIDI files) to compose from, each switched on or off. Composing uses every folder that is on, as one corpus; they are loaded by themselves next time. |
| **beats** | The shortest piece to compose, in beats (4 to 256). With chorale form on, only chorales at least this long lend their form. |
| **chorale form** | On: each piece takes the form of a real chorale: its phrases and cadences fall in the same places. Off: beats are joined freely, with no phrase plan. |
| **stream** | On: compose starts a stream, composed a phrase at a time while it plays, for as many phrases as phrases says. Off: compose makes a whole piece. |
| **phrases** | How many phrases a stream plays before it ends (0: endless). |
| **transpose** | Transpose the music by semitones (-12 to 12): a piece at once, a stream from its next phrase. |
| **signatures** | On: Bach's signatures (cadence formulas found in several chorales) are kept whole at cadences, shown as gold bands in the piano roll. Off: cadences are recombined like any other beats. |
| **Status** | What the engine just did, or what went wrong. |
| **listening test** | Write a blind listening test: a web page of 10 pairs, each a Bach chorale and a piece composed in its form, in random order. Can listeners tell which is Bach? |
| **tools** | Less-used tools. Load a chorale: one chorale (a MIDI file) plays as written and is drawn in the piano roll, moved to C major or A minor, or in its own key. Play the test phrase: a built-in phrase (no chorales needed), to check that the voices sound. Stop and clear the queue: what is playing stops at once. |

## Emily (both versions)

| Control | What it does |
| --- | --- |
| **window** | Open the pop-up window: a large piano roll and Emily's taste in full, where you can edit her weights and see her memory. |
| **Like** | Tell Emily you like what you're hearing: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She learns which musical features it has, and prefers them when she composes. Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live). |
| **Dislike** | Tell Emily you don't like what you're hearing: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She learns to avoid its musical features. Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live). |
| **chance** | How much chance still plays when composing (Emily's temperature). 0: only Emily's favourite choices; 1: as before Emily (the default); up to 3: more adventurous. |
| **taste report** | Report Emily's taste: what she likes and dislikes most, in the Max window, and ten pieces composed with and without her taste, compared feature by feature. The pop-up window shows its progress (it composes a piece at a time, so you can go on playing) and the result. It changes nothing. |
| **keep** | Keep what you're hearing as a work of Emily's own: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She composes from it alongside Bach from then on (how much: mix, in the pop-up window's memory tab). Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live). |
| **Emily** | Emily in a line: how many ratings she has had, and what she likes and dislikes most. |

## Piano roll (both versions)

| Control | What it does |
| --- | --- |
| **Piano roll** | The current piece. Colours: the chorale each beat came from. Bright lines: seams between beats; gold bands: signatures; red marks: new parallel fifths or octaves; purple dots: notes Emily varied; yellow line: the playhead. Drag across beats to select them for like, dislike and accept (a click clears); hover over a beat to see where it came from, and over the SPEAC lane's letters (along the bottom) for what each means. For a large one: window, in the Emily panel. |

## The plug-in instruments window (Max version: set up, in the left panel)

| Control | What it does |
| --- | --- |
| **choose (soprano)** | Choose the AU or VST3 instrument that plays the soprano (voice 1) when plug-in instruments is on. |
| **choose (alto)** | Choose the AU or VST3 instrument that plays the alto (voice 2) when plug-in instruments is on. |
| **choose (tenor)** | Choose the AU or VST3 instrument that plays the tenor (voice 3) when plug-in instruments is on. |
| **choose (bass)** | Choose the AU or VST3 instrument that plays the bass (voice 4) when plug-in instruments is on. |
| **show editor (soprano)** | Show the editor window of the soprano's plug-in instrument. |
| **show editor (alto)** | Show the editor window of the alto's plug-in instrument. |
| **show editor (tenor)** | Show the editor window of the tenor's plug-in instrument. |
| **show editor (bass)** | Show the editor window of the bass's plug-in instrument. |

## The pop-up window (both versions: Emily panel, window)

| Control | What it does |
| --- | --- |
| **Piano roll** | The current piece, large. Colours: the chorale each beat came from. Bright lines: seams between beats; gold bands: signatures; red marks: new parallel fifths or octaves; purple dots: notes Emily varied; yellow line: the playhead. Drag across beats to select them for like, dislike and accept (a click clears); hover over a beat to see where it came from, and over the SPEAC lane's letters (along the bottom) for what each means. |
| **Emily's taste** | Emily's taste in three views, chosen by the tabs at its top right: overview (what she likes and dislikes most, her latest ratings, the last taste comparison), weights and memory. Hover over a tab, slider or button for what it does. |
| **like** | Tell Emily you like what you're hearing: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She learns which musical features it has, and prefers them when she composes. |
| **dislike** | Tell Emily you don't like what you're hearing: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She learns to avoid its musical features. |
| **keep** | Keep what you're hearing as a work of Emily's own: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She composes from it alongside Bach from then on (how much: mix, in the pop-up window's memory tab). |
| **taste report** | Report Emily's taste: what she likes and dislikes most, in the Max window, and ten pieces composed with and without her taste, compared feature by feature. The pop-up window shows its progress (it composes a piece at a time, so you can go on playing) and the result. It changes nothing. |
| **reload seed** | Compose the seed shown again, with Emily's taste, mix and novelty as they are now, to hear and see what your changes did. With stream on, the stream starts again. |
| **release all pins** | Release every pinned weight: each goes back to what Emily learned from your ratings. |
| **store taste** | Save Emily's whole taste (weights, pins, strength, ratings) to a file you choose. |
| **recall taste** | Load a taste saved with store taste and make it hers. The taste it replaces is kept as a backup and as a snapshot. |
| **forget** | Start a new taste from nothing. The old one is kept as a backup and as a snapshot, so you can roll back to it. |

## The chorales window (both versions: the panel's chorales button)

| Control | What it does |
| --- | --- |
| **Chorales** | Every folder of chorales on the list: switch one on or off with its box, use it alone (only), or take it off the list (remove). Composing uses every folder that is on, as one corpus, and the seed shown is composed again with it. A chorale in two folders counts once; the corpus has one meter (the first folder's). Hover over a name for its folder's full path. |
| **add folder** | Choose a folder of chorales (MIDI files, as tools/export-chorales.py writes them, e.g. Documents/Cento/corpus-both). It joins the list, switched on. |
| **rescan** | Read every folder again, after adding or removing chorales in one. (Folders are read once, when first switched on.) |

## The cento.voice device (Live)

| Control | What it does |
| --- | --- |
| **Voice** | The voice this device plays, from its track's name: Soprano, Alto, Tenor or Bass. Rename the track to change it. |

## In the pop-up window's taste pane

These are drawn by the window's taste pane (`code/emi.taste.v8ui.js`), so their help is drawn there too: rest the mouse on a slider or button and a box beside it says what it does. Each weight slider also says what its musical feature means (for example, *suspensions: an upper voice held over from the beat before, then stepping down*).

| Control | What it does |
| --- | --- |
| **overview** (tab) | What she likes and dislikes most, her latest ratings, and the last taste comparison. |
| **weights** (tab) | A slider per musical feature, to pin her weight for it, and strength. |
| **memory** (tab) | Her own works, snapshots of her taste to roll back to, and the mix and novelty sliders. |
| **a feature's slider** | Drag to pin Emily's weight for that feature (-3: she avoids it, +3: she seeks it); double-click to release it to what she learned (the thin line). |
| **strength** | How much her whole taste counts when composing. 0: not at all; 1: as she learned it; 2: twice as much. Double-click for 1. |
| **mix** | How much her own works (the ones you accepted) count against Bach's when composing. 0: Bach only; 0.75: mostly hers. Double-click for 0.5. |
| **novelty** | The chance that each phrase gets a variant of her own: a passing tone, a neighbour note, a suspension, a re-voiced chord... 0: never; 1: every phrase. Double-click for 0. |
| **put aside** | Stop composing from this work of hers. It stays in her memory file: roll back to a snapshot from when it was in use to bring it back. |
| **keep a snapshot** | Keep her whole taste as it is now, to roll back to later. |
| **roll back** | Make this snapshot's taste hers again, exactly: weights, pins, sliders, and which of her works are in use. The taste she has now is kept as a snapshot first. |

## In the chorales window's list

Drawn by `code/emi.corpora.v8ui.js`, with its help drawn the same way.

| Control | What it does |
| --- | --- |
| **a folder's box** | Switch this folder on or off. Composing uses every folder that is on, as one corpus; the seed shown is composed again with it. |
| **only** | Switch this folder on and every other one off. |
| **remove** | Take this folder off the list (the folder and its files stay where they are). Add it again with add folder. |
| **a folder's name** | Hover over it for the folder's full path. |
