let collectList = JSON.parse(localStorage.getItem('collectList')) || [];
let skipList = JSON.parse(localStorage.getItem('skipList')) || [];
let blockedSingers = JSON.parse(localStorage.getItem('blockedSingers')) || [];
let usedSongIndex = JSON.parse(localStorage.getItem('usedSongIndex')) || [];
let selectedTags = [];

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const tag = btn.dataset.tag;
        selectedTags.includes(tag) ? selectedTags = selectedTags.filter(t=>t!==tag) : selectedTags.push(tag);
    });
});

function toggleFilterPanel(){
    const panel = document.getElementById('filterPanel');
    const bar = document.getElementById('floatBar');
    panel.classList.toggle('open');
    bar.classList.toggle('show', panel.classList.contains('open'));
}

function toggleSection(id){
    document.getElementById(id).closest('.collapsible-section').classList.toggle('open');
}

function getSearchKey(){
    const n=document.getElementById("songName").innerText;
    const s=document.getElementById("songSinger").innerText;
    return encodeURIComponent(`${n} ${s}`);
}

function openDouyin(){location.href=`snssdk1128://search?keyword=${getSearchKey()}`;}
function openDouyinSpeed(){location.href=`snssdk2329://search?keyword=${getSearchKey()}`;}
function openQQMusic(){location.href=`qqmusic://search?key=${getSearchKey()}`;}
function openKuGou(){location.href=`kugou://search?keyword=${getSearchKey()}`;}
function openKuWo(){location.href=`kuwo://search?key=${getSearchKey()}`;}
function openQiShui(){location.href=`qishuimusic://search?keyword=${getSearchKey()}`;}

function applyFilter(){
    toggleFilterPanel();
    usedSongIndex=[];
    localStorage.setItem('usedSongIndex',JSON.stringify(usedSongIndex));
    goNextRandom();
}

function resetFilter(){
    selectedTags=[];
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    usedSongIndex=[];
    localStorage.setItem('usedSongIndex',JSON.stringify(usedSongIndex));
    goNextRandom();
}

function loadCurrentSong(song){
    document.getElementById("songName").innerText=song.name;
    document.getElementById("songSinger").innerText=song.singer;
    document.getElementById("songDesc").innerText=song.desc;
}

function getRandomSong(){
    let valid=songLibrary.filter((item,idx)=>{
        if(blockedSingers.includes(item.singer))return false;
        if(collectList.includes(`${item.name} - ${item.singer}`))return false;
        if(skipList.includes(`${item.name} - ${item.singer}`))return false;
        if(usedSongIndex.includes(idx))return false;
        if(selectedTags.length>0){
            let tags=item.desc.split(' ');
            for(let t of selectedTags)if(!tags.includes(t))return false;
        }
        return true;
    });
    if(!valid.length)return null;
    let rand=valid[Math.floor(Math.random()*valid.length)];
    let idx=songLibrary.findIndex(s=>s.name===rand.name&&s.singer===rand.singer);
    usedSongIndex.push(idx);
    localStorage.setItem('usedSongIndex',JSON.stringify(usedSongIndex));
    return rand;
}

function flashCard(type) {
    const card = document.getElementById('songCard');
    card.classList.remove('flash-red', 'flash-green');
    void card.offsetWidth;
    const cls = type === 'red' ? 'flash-red' : 'flash-green';
    card.classList.add(cls);
    setTimeout(() => {
        card.classList.remove('flash-red', 'flash-green');
    }, 400);
}

function collectSong(){
    let s=getCurrentShowSong();
    if(!s)return;
    collectList.push(`${s.name} - ${s.singer}`);
    localStorage.setItem('collectList',JSON.stringify(collectList));
    renderList();
    flashCard('green');
    setTimeout(goNextRandom, 400);
}

function listenOnly(){
    goNextRandom();
}

function skipSong(){
    let s=getCurrentShowSong();
    if(!s)return;
    skipList.push(`${s.name} - ${s.singer}`);
    localStorage.setItem('skipList',JSON.stringify(skipList));
    renderList();
    flashCard('red');
    setTimeout(goNextRandom, 400);
}

function blockSinger(){
    let s=getCurrentShowSong();
    if(!s)return;
    if(!blockedSingers.includes(s.singer)){
        blockedSingers.push(s.singer);
        localStorage.setItem('blockedSingers',JSON.stringify(blockedSingers));
    }
    renderBlackList();
    flashCard('red');
    setTimeout(goNextRandom, 400);
}

function goNextRandom(){
    let song=getRandomSong();
    if(!song){
        document.getElementById("songName").innerText="当前筛选无更多歌曲";
        document.getElementById("songSinger").innerText="";
        document.getElementById("songDesc").innerText="请重置标签或更换筛选条件";
        return;
    }
    loadCurrentSong(song);
}

function getCurrentShowSong(){
    let n=document.getElementById("songName").innerText;
    let s=document.getElementById("songSinger").innerText;
    return songLibrary.find(x=>x.name===n&&x.singer===s);
}

function renderList(){
    document.getElementById("collectList").innerText=collectList.join(" ｜ ");
    document.getElementById("skipList").innerText=skipList.join(" ｜ ");
}

function renderBlackList(){
    let box=document.getElementById('blacklistBox');
    box.innerHTML='';
    blockedSingers.forEach((item,idx)=>{
        let span=document.createElement('span');
        span.className='black-tag';
        span.innerText=item;
        span.onclick=()=>unBlockSinger(idx);
        box.appendChild(span);
    });
}

function unBlockSinger(idx){
    blockedSingers.splice(idx,1);
    localStorage.setItem('blockedSingers',JSON.stringify(blockedSingers));
    renderBlackList();
}

window.onload=function(){
    renderList();
    renderBlackList();
    goNextRandom();
}