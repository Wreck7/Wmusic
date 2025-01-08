let currentSong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    // show all songs in the playlist
    let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
        <img src="/img/music.svg" alt="" class="invert" />
                      <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div></div>
                    </div>
                        <img src="/img/play.svg" alt="" class="invert" />
                        </li>`;
    }
    // attaching event listeners to each the song
    let lis = Array.from(document.querySelector(".songList").getElementsByTagName('li'));
    lis.forEach(e => {
        e.addEventListener('click', (element) => {
            playMusic(e.querySelector('.info').firstElementChild.innerHTML);
        })
    })
    return songs
}
// add playMusic function
playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "/img/pause.svg";
    }
    document.querySelector('.songInfo').innerHTML = decodeURI(track)
    document.querySelector('.songTime').innerHTML = "00:00 / 00:00";
}
// displaying all albums dynamically
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let cardContainer = document.querySelector(".cardContainer");
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a');
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("songs/")) {
            let folder = e.href.split("/").slice(0)[4]
            // get thee metadata of folder 
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
              <div class="cardPlay">
              <i class="fa-solid fa-play invert"></i>
              </div>
              <img
              src="/songs/${folder}/cover.jpeg"
              alt=""
              />
              <h4>${response.title}</h4>
              <p>${response.para}</p>
              </div>`
        }
    }
    // Load the playlist when clicked on card
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        })
    });
};
async function main() {
    // get the list of all songs
    await getSongs(`songs/ogs`);
    playMusic(songs[0], true);
    displayAlbums();
    // Attaching event listener to play button
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "/img/play.svg";
        }
    })
    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.songTime').innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })
    // add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    // add an event listener to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })
    // Attaching event listener to prev button
    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    // Attaching event listener to prev button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    // add an event listener to volume range
    range.addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if(currentSong.volume > 0){
            muteNUnmute.src = muteNUnmute.src.replace("mute.svg", "volume.svg")
        }
    })
    // add an event listener to mute
    let muteNUnmute = document.querySelector(".volume>img")
    muteNUnmute.addEventListener("click", (e)=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector("#range").value = 0;
        }else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .20;
            document.querySelector("#range").value = 20;
        }

    })
}
main()