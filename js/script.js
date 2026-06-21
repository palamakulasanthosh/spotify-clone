let currentsong = new Audio()
let songs;
let songlist;
let curfolder;
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
async function getsongs(folder) {
    curfolder = folder;

    let response = await fetch(`./${folder}/info.json`);
    let data = await response.json();

    songs = data.songs;

    let songlist = document.querySelector(".songlist ul");
    songlist.innerHTML = "";

    for (const song of songs) {
        songlist.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song}</div>
                <div>santhu</div>
            </div>
            <div class="playnow">
                <span>play now</span>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`;
    }

    Array.from(songlist.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playmusic(
                e.querySelector(".info").firstElementChild.innerHTML.trim()
            );
        });
    });

    return songs;
}
const playmusic = (track, pause = false) => {
    currentsong.src = `./${curfolder}/${track}`;

    let playBtn = document.querySelector("#play");

    if (!pause) {
        currentsong.play();
        playBtn.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function displayalbums() {

    let cardcontainer = document.querySelector(".cardcontainer");
    cardcontainer.innerHTML = "";

    let folders = [
        "aashiq",
        "awara",
        "devara",
        "devotinal",
        "favourite",
        "padi padi leche manasu"
    ];

    for (const folder of folders) {
        try {
            console.log("Loading:", folder);

            let response = await fetch(`songs/${folder}/info.json`);

            if (!response.ok) {
                console.error(`Failed: ${folder}`, response.status);
                continue;
            }

            let data = await response.json();

            cardcontainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <img src="songs/${folder}/cover.jpg">
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            </div>`;
        }
        catch (err) {
            console.error(folder, err);
        }
    }

    console.log("Cards created:", document.querySelectorAll(".card").length);
    Array.from(document.getElementsByClassName("card")).forEach(card => {
    card.addEventListener("click", async () => {

        songs = await getsongs(`songs/${card.dataset.folder}`);
        console.log("Songs loaded:", songs);

        playmusic(songs[0]);
    });
});
}
async function main() {
    let songs = await getsongs("songs/favourite")
    playmusic(songs[0], true)
    await displayalbums();

    // play button working
    let play = document.querySelector("#play")
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })
    // current time for song
    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percentage = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percentage + "%"
        currentsong.currentTime = (currentsong.duration * percentage) / 100
    })
    document.querySelector("#next").addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").pop());

    if (index + 1 < songs.length) {
        playmusic(songs[index + 1]);
    }
});

document.querySelector("#previous").addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").pop());

    if (index - 1 >= 0) {
        playmusic(songs[index - 1]);
    }
});

currentsong.addEventListener("ended", () => {
    let index = songs.indexOf(currentsong.src.split("/").pop());

    if (index + 1 < songs.length) {
        playmusic(songs[index + 1]);
    }
});


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"

    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })


    // volume listner
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e.target.value)
        currentsong.volume = parseInt(e.target.value)  / 100
    })
    // mute the volume
    document.querySelector(".volume>img").addEventListener("click",(e)=>{
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg","mute.svg")
        document.querySelector(".range").getElementsByTagName("input")[0].value=0
        currentsong.volume=0
        }
    else{
        e.target.src = e.target.src.replace("mute.svg","volume.svg")
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        currentsong.volume=.10
        }   
    })

    
   


}
main()
