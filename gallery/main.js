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
track.onmouseenter = ()=> clearInterval(slideTimer);
track.onmouseleave = ()=> slideTimer = setInterval(autoSlide,3500);

// ========== JSON读取（加版本号防缓存） ==========
fetch('../assets/gallery/asset-index.json?v=4')
.then(res=>{
    if(!res.ok) throw new Error('找不到文件')
    return res.json()
})
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

// 填充顶部4个推荐预览
function fillRecommendTop4(top4){
    if(!Array.isArray(top4)) return
    const domList = track.querySelectorAll('.recommend-item');
    top4.forEach((item,idx)=>{
        if(!domList[idx]) return;
        domList[idx].innerHTML = `<img src="../${item.cover}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;">`
    })
}

// ========== 素材列表渲染【已加上懒加载】 ==========
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
        const thumbSrc = `../${item.cover}`
        card.innerHTML = `
            <img class="card-img" loading="lazy" src="${thumbSrc}" onerror="this.style.display='none'">
            <div class="card-body">
                <span class="card-tag">${item.category}</span>
                <div class="card-title">${item.name}</div>
                <div class="card-meta">作者：${item.author}</div>
                <a class="dl-btn" href="../${item.cover}" download>📥 单张预览图</a>
            </div>
        `
        card.onclick = ()=> openPetPreview(item)
        galleryEl.appendChild(card)
    })
}

// 打开预览弹窗
function openPetPreview(petMeta){
    currentPet = petMeta
    modalName.innerText = petMeta.name
    modalMeta.innerText = `分类：${petMeta.category}`
    modal.classList.add('show')
    // 默认加载待机帧
    switchAnim('idle')
}

// 分类筛选切换
function setFilter(kat){
    currentFilter = kat
    render()
    document.getElementById('materials').scrollIntoView({behavior:'smooth'})
}

// 关闭弹窗
function closeModal(){
    clearInterval(animTimer)
    modal.classList.remove('show')
}
modal.onclick = e=>{if(e.target===modal) closeModal()}

// ✅ 修复：全局事件委托，按钮永久点击生效
document.addEventListener('click', function(e){
    const btn = e.target.closest('.action-group button')
    if(btn){
        const type = btn.dataset.act
        switchAnim(type)
    }
})

// ========== 动画帧切换核心函数 ==========
function switchAnim(type){
    if(!currentPet) return
    clearInterval(animTimer)
    // 取出对应帧数组
    switch(type){
        case 'idle': frameList = currentPet.idle || []; break
        case 'walk': frameList = currentPet.walk || []; break
        case 'click': frameList = currentPet.click || []; break
    }
    frameIdx = 0
    if(frameList.length === 0) return
    // 帧自动轮播
    animTimer = setInterval(()=>{
        modalImg.src = `../${frameList[frameIdx]}`
        frameIdx ++
        if(frameIdx >= frameList.length) frameIdx = 0
    }, 400)
}

// ========== 打包下载整套9帧素材ZIP ==========
modalDl.onclick = async (e)=>{
    e.preventDefault()
    if(!currentPet) return
    const zip = new JSZip()

    // 打包idle文件夹
    if(currentPet.idle?.length>0){
        const folder = zip.folder("idle")
        for(const path of currentPet.idle){
            const res = await fetch(`../${path}`)
            if(res.ok){
                const blob = await res.blob()
                const fileName = path.split('/').pop()
                folder.file(fileName, blob)
            }
        }
    }
    // 打包walk文件夹
    if(currentPet.walk?.length>0){
        const folder = zip.folder("walk")
        for(const path of currentPet.walk){
            const res = await fetch(`../${path}`)
            if(res.ok){
                const blob = await res.blob()
                const fileName = path.split('/').pop()
                folder.file(fileName, blob)
            }
        }
    }
    // 打包click文件夹
    if(currentPet.click?.length>0){
        const folder = zip.folder("click")
        for(const path of currentPet.click){
            const res = await fetch(`../${path}`)
            if(res.ok){
                const blob = await res.blob()
                const fileName = path.split('/').pop()
                folder.file(fileName, blob)
            }
        }
    }

    // 生成zip并触发下载
    const zipBlob = await zip.generateAsync({type:"blob"})
    const a = document.createElement('a')
    a.href = URL.createObjectURL(zipBlob)
    a.download = `${currentPet.name}_桌宠完整素材包.zip`
    a.click()
}
