class Song {

    constructor(info) {
        Object.assign(this, info);
    }

    render(idx) {
        if (this.entry === undefined) {
            this.entry = $('<div class="entry"/>');

            this.entry.append(
                $(`<h2 class="numHeader">#${idx}</h2>`)
            );

            const controls = $('<div class="controls"/>');
            const audio = $('<audio controls/>').append(
                $('<source src="sound/' + this.fileNum + '.mp3"' +
                    'type="audio/mp3" />')
            );
            audio.on("play", function () {
                $("audio").not(this).each(
                    (_, other) => other.pause()
                );
            });

            controls.append(
                audio,
                $('<div/>').append(
                    $('<ul>').append(
                        $('<li>').append(
                            $(`<input type="radio" name="guess${idx}" ` +
                                `id="guess${idx}0" value="0"/>`),
                            $(`<label for="guess${idx}0">` +
                                'Final Fantasy Crystal Chronicles</label>'),
                        ),
                        $('<li>').append(
                            $(`<input type="radio" name="guess${idx}" ` +
                                `id="guess${idx}1" value="1"/>`),
                            $(`<label for="guess${idx}1">` +
                                "Mom's Christmas Music</label>"),
                        )
                    )
                )
            );

            this.entry.append(
                controls,
                $('<div class="songInfo">' +
                    '<div class="songVid" />' +
                    '</div>')
            );
        }
        return this.entry;
    }

    checkGuess() {
        const songInfo = this.entry.find('.songInfo');
        songInfo.append(
            $(`<p><strong>Title:</strong> ${this.title}</p>`),
            $(`<p><strong>Artist:</strong> ${this.artist}</p>`),
            $(`<p><strong>Album:</strong> ${this.album}</p>`)
        );

        const songVid = songInfo.find('.songVid');
        if (this.videoId !== "") {
            const player = new YT.Player(songVid[0], {
                width: '100%',
                videoId: this.videoId
                /* TODO: it would be nice to implement the onStateChange event
                   to pause all other currently playing videos, but let's not
                   bother with that right now... */
            });
        }
        else {
            songVid.append(
                $('<strong>[No video available]</strong>')
            );
        }

        let isCorrect = false;
        const header = this.entry.find('.numHeader');
        header.css('float', 'initial');

        if (this.entry.find('input:checked').val() === this.src.toString()) {
            header.addClass('correct');
            header.text(`${header.text()} - Correct!`);
            isCorrect = true;
        }
        else {
            header.addClass('incorrect');
            header.text(`${header.text()} - Incorrect!`);
        }

        return isCorrect;
    }
}

function checkGuesses(songs) {
    let emptyGuess = null;
    for (const song of songs) {
        const entry = song.render();
        if (entry.find('.controls input:checked').length === 0) {
            emptyGuess = entry;
            break;
        }
        entry.css('border', ''); // reset border from any previous errors
    }
    if (emptyGuess !== null) {
        emptyGuess.css('border', '2px solid red');
	emptyGuess[0].scrollIntoView();
	emptyGuess.find('audio')[0].focus();
        return;
    }

    let numCorrect = 0;
    songs.forEach(song => numCorrect += song.checkGuess() ? 1 : 0);

    const bottom = $('#bottom');
    bottom.empty();
    bottom.append(
        $(`<div class="totalCorrect">Total: ${numCorrect} / ${songs.length}</div>`)
    );
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 * @returns {Array} Shuffled array
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

async function init() {
    const request = await fetch('data/songs.json');
    const songInfo = await request.json();
    const songs = shuffle(songInfo.map(info => new Song(info)));

    /**
    * Ready event handler.
    * Initializes the audio elements and controls.
    */
    $(function () {
        for (let i = 0; i < songs.length; i++) {
            $('#entries').append(songs[i].render(i + 1));
        }
        $('#btnOK').click(() => checkGuesses(songs));
    });
}

init();