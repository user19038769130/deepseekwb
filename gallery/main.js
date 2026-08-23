onst galleryEl = document.getElementById('gallery')
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
const track = document.getElementById('recom
