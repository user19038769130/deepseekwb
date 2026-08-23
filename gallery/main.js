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
// ========== 素材列表【✅直接写完整网址，不猜相对路径】 ==========
fetch('https://user19038769130.github.io/deepseekwb/assets/gallery/asset-index.json')
.then(res=>res.json())
.then(list=>{
    rawList = Array.isArray(list) ? list : []
    render()
    if(rawList.length>0){
        fillRecommendTop4(rawList.slice(0,4))
    }
})
.catch(err=>{
    emptyTip.style.display = "block"
    emptyTip.innerText = "素材清单 asset-index.json 加载失败"
    console.error(err)
})
// 填充顶部4个推荐预览【适配cover】
function fillRecommendTop4(top4){
    if(!Array.isArray(top4)) return
    const domList = track.querySelectorAll('.recommend-item');
    top4.forEach((item,idx)=>{
        if(!domList[idx]) return;
        domList[idx].innerHTML = `<img src="${item.cover}" alt="${item.name}">`
    })
}
// ========== render渲染【终极兜底】==========
function render(){
    galleryEl.innerHTML = ""
    const safeList = Array.isArray(rawList) ? rawList : []
    let filterList = safeList
    if(currentFilter !== "all"){
        filterList = filterList.filter(item => item.category === currentFilter)
    }
    if(filterList.length === 0){
        emptyTip.style.display = "block"
        return
    }
    emptyTip.style.display = "none"
    filterList.forEach(item=>{
        const card = document.createElement('div')
        card.className = 'card'
        const thumbSrc = item.cover
        card.innerHTML = `
            <img class="card-img" src="${thumbSrc}" onerror="this.style.display='none'">
            <div class="card-body">
                <span class="card-tag">${item.category}</span>
                <div class="card-title">${item.name}</div>
                <div class="card-meta">作者：${item.studio}</div>
                <a class="dl-btn" href="${item.cover}" download>📥 下载预览图</a>
            </div>
        `
        card.onclick = ()=> openPetPreview(item)
        galleryEl.appendChild(card)
    })
}
// 预览弹窗
async function openPetPreview(petMeta){
    currentPet = petMeta
    modalName.innerText = petMeta.name
    modalMeta.innerText = `分类：${petMeta.category}`
    modalDl.href = petMeta.cover
    modal.classList.add('show')
}
function setFilter(kat){
    currentFilter = kat
    render()
    document.getElementById('materials').scrollIntoView({behavior:'smooth'})
}
function closeModal(){
    clearInterval(animTimer)
    modal.classList.remove('show')
}
modal.onclick = e=>{if(e.target===modal) closeModal()}
