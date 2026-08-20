const galleryEl = document.getElementById('gallery')
const emptyTip = document.getElementById('emptyTip')
const modal = document.getElementById('previewModal')
const modalImg = document.getElementById('animImg')
const modalName = document.getElementById('modalName')
const modalMeta = document.getElementById('modalMeta')
const modalDl = document.getElementById('modalDl')

let rawList = []
let currentFilter = "all"
let animTimer = null
let frameList = []
let frameIdx = 0
let currentPet = null

// ========== 4格轮播逻辑 ==========
const track = document.getElementById('recommendTrack');
let slidePos = 0;
function autoSlide(){
    slidePos += 1;
    if(slidePos > 1) slidePos = 0;
    track.style.transform = `translateX(-${slidePos * 100}%)`
}
let slideTimer = setInterval(autoSlide, 3500);
// 鼠标悬停暂停
track.onmouseenter = ()=> clearInterval(slideTimer);
track.onmouseleave = ()=> slideTimer = setInterval(autoSlide,3500);

// ========== 素材列表原有逻辑 ==========
fetch('./asset-index.json')
.then(res=>res.json())
.then(list=>{
    rawList = list.petList
    render()
    // ✅ 自动拿最新4个填充顶部推荐轮播
    fillRecommendTop4(list.petList.slice(0,4))
})
.catch(err=>{
    emptyTip.style.display = "block"
    emptyTip.innerText = "素材清单 asset-index.json 加载失败"
    console.error(err)
})

// 填充顶部4个推荐预览
function fillRecommendTop4(top4){
    const domList = track.querySelectorAll('.recommend-item');
    top4.forEach((item,idx)=>{
        if(!domList[idx]) return;
        domList[idx].innerHTML = `<img src="${item.path}/idle/q1.png" alt="${item.displayName}">`
    })
}

function render(){
    galleryEl.innerHTML = ""
    let filterList = rawList
    if(currentFilter !== "all"){
        filterList = rawList.filter(item => item.filterKey === currentFilter)
    }
    if(filterList.length === 0){
        emptyTip.style.display = "block"
        return
    }
    emptyTip.style.display = "none"
    filterList.forEach(item=>{
        const card = document.createElement('div')
        card.className = 'card'
        const thumbSrc = `${item.path}/idle/q1.png`
        card.innerHTML = `
            <img class="card-img" src="${thumbSrc}" onerror="this.style.display='none'">
            <div class="card-body">
                <span class="card-tag">${item.categoryName}</span>
                <div class="card-title">${item.displayName}</div>
                <div class="card-meta">作者：${item.author}<br>适配：${item.platform}</div>
                <a class="dl-btn" href="${item.path}.zip" download>📥 下载素材包</a>
            </div>
        `
        card.onclick = ()=> openPetPreview(item)
        galleryEl.appendChild(card)
    })
}

async function openPetPreview(petMeta){
    currentPet = petMeta
    const petCfg = await (await fetch(`${petMeta.path}/pet.json`)).json()
    currentPet.cfg = petCfg

    modalName.innerText = petCfg.displayName
    modalMeta.innerText = `帧率：${petCfg.frameRate} FPS | ID：${petCfg.id}`
    modalDl.href = `${petMeta.path}.zip`

    modal.classList.add('show')
    switchAction("idle")
}

function switchAction(actKey){
    clearInterval(animTimer)
    document.querySelectorAll(".action-group button").forEach(b=>{
        b.classList.toggle("active", b.dataset.act === actKey)
    })
    const actCfg = currentPet.cfg.actions[actKey]
    frameList = actCfg.frames.map(f=>`${currentPet.path}/${f}`)
    frameIdx = 0
    playAnim(actCfg.loop, currentPet.cfg.frameRate)
}

function playAnim(loop, fps){
    const gap = 1000 / fps
    animTimer = setInterval(()=>{
        modalImg.src = frameList[frameIdx]
        frameIdx ++
        if(frameIdx >= frameList.length){
            if(loop) frameIdx = 0
            else {
                clearInterval(animTimer)
                frameIdx = frameList.length -1
            }
        }
    }, gap)
}

function setFilter(filterKey){
    currentFilter = filterKey
    render()
    document.getElementById('materials').scrollIntoView({behavior:'smooth'})
}

document.querySelectorAll(".action-group button").forEach(btn=>{
    btn.onclick = ()=> switchAction(btn.dataset.act)
})

function closeModal(){
    clearInterval(animTimer)
    modal.classList.remove('show')
}

modal.onclick = e=>{if(e.target===modal) closeModal()}
