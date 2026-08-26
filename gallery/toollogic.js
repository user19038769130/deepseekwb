const sizeSelect = document.getElementById('sizeSelect');
const customSizeBox = document.getElementById('customSizeBox');
sizeSelect.onchange = () => {
 customSizeBox.style.display = sizeSelect.value === 'custom' ? 'block' : 'none';
};

document.getElementById('btnResize').onclick = async ()=>{
  const file = document.getElementById('inpResize').files[0];
  if(!file) return alert("请先选择图片（JPG/PNG均可）");

  let targetW, targetH;
  if(sizeSelect.value === 'custom'){
 targetW = Number(document.getElementById('inpW').value);
 targetH = Number(document.getElementById('inpH').value);
    if(!targetW || !targetH) return alert("请填写宽高数字");
  }else{
 targetW = Number(sizeSelect.value);
 targetH = Number(sizeSelect.value);
  }
  const bgColor = document.getElementById('bgSelect').value;

  const img = new Image();
 img.src = URL.createObjectURL(file);
  await new Promise(r=>img.onload=r);

  const canvas = document.createElement('canvas');
 canvas.width = targetW;
 canvas.height = targetH;
  const ctx = canvas.getContext('2d');

  if(bgColor === 'transparent'){
 ctx.clearRect(0,0,targetW,targetH);
  }else{
 ctx.fillStyle = bgColor;
 ctx.fillRect(0,0,targetW,targetH);
  }

  const scale = Math.min(targetW / img.width, targetH / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const ox = (targetW - dw) / 2;
  const oy = (targetH - dh) / 2;
 ctx.drawImage(img, ox, oy, dw, dh);

  const url = canvas.toDataURL("image/png");
  const a = document.createElement('a');
 a.href = url;
 a.download = file.name.replace(/\.(jpg|jpeg|png)$/i,"_out.png");
 a.click();
 document.getElementById('tipResize').innerText = "✅ 处理完成，已下载PNG";
};

document.getElementById('btnSeq2Gif').onclick = async ()=>{
  const files = Array.from(document.getElementById('inpSeq2Gif').files);
  const delay = Number(document.getElementById('gifDelay').value) || 200;
  if(files.length<2) return alert("至少上传2张PNG合成动画");

  const gif = new GIF({workers:2, quality:10,workerScript: "./lib/gif.worker.js"});
  for(const f of files){
    const img = new Image();
 img.src = URL.createObjectURL(f);
    await new Promise(res=>img.onload = res);
 gif.addFrame(img, {delay});
  }
 gif.on('finished', blob=>{
    const a = document.createElement('a');
 a.href = URL.createObjectURL(blob);
 a.download = "preview.gif";
 a.click();
 document.getElementById('tipSeq2Gif').innerText = "✅ GIF合成完成";
  });
 gif.render();
};

const store = {
  preview: {card: null, thumb: null, gif: null},
  frames: {idle: [], walk: [], click: []}
};

bindSingleFile("fileCard", "card", "tipCard", "png");
bindSingleFile("fileThumb", "thumb", "tipThumb", "png");
bindSingleFile("filePreviewGif", "gif", "tipGif", "gif");
bindMultiFile('fileIdle', 'idle', 'listIdle');
bindMultiFile('fileWalk', 'walk', 'listWalk');
bindMultiFile('fileClick', 'click', 'listClick');

function bindSingleFile(inputId, key, tipId, ext) {
  const inp = document.getElementById(inputId);
  const tipDom = document.getElementById(tipId);
 inp.onchange = (e) => {
    const f = e.target.files[0];
    if(!f) return;
    if(!f.name.toLowerCase().endsWith(`.${ext}`)){
      alert(`只允许上传 .${ext}`);
 inp.value = "";
      return;
    }
 store.preview[key] = f;
 tipDom.innerText = `✅ 已选择：${f.name}`;
  }
}

function bindMultiFile(inputId, type, showId) {
  const inp = document.getElementById(inputId);
  const showDom = document.getElementById(showId);
 inp.onchange = async (e) => {
    const files = Array.from(e.target.files);
    const bad = files.some(f => !f.name.toLowerCase().endsWith('.png'));
    if(bad){
      alert("动作帧只支持PNG，请先用上方预处理工具转换");
 inp.value = "";
      return;
    }
 store.frames[type] = files;
 showDom.innerText = `✅ 已选择 ${files.length} 张PNG序列帧`;
  }
}

document.getElementById('btnBuild').onclick = async () => {
  const petName = document.getElementById('petName').value.trim();
  if(!petName){
    alert("请填写素材名称");
    return;
  }
  const zip = new JSZip();
  if(store.preview.card) zip.folder("preview").file("card.png", await store.preview.card.arrayBuffer());
  if(store.preview.thumb) zip.folder("preview").file("thumb.png", await store.preview.thumb.arrayBuffer());
  if(store.preview.gif) zip.folder("preview").file("preview.gif", await store.preview.gif.arrayBuffer());

  const frameRoot = zip.folder("frames");
  for(const [folderName, fileList] of Object.entries(store.frames)){
    if(fileList.length === 0) continue;
    const dir = frameRoot.folder(folderName);
    for(const f of fileList){
 dir.file(f.name, await f.arrayBuffer());
    }
  }

  const meta = {
    name: petName,
    type: "pet",
    preview:{
      card:"preview/card.png",
      thumb:"preview/thumb.png",
      gif:"preview/preview.gif"
    },
    frames:{
      idle: store.frames.idle.map(f=>f.name),
      walk: store.frames.walk.map(f=>f.name),
      click: store.frames.click.map(f=>f.name)
    }
  };
 zip.file("meta.json", JSON.stringify(meta,null,2));

  const blob = await zip.generateAsync({type:"blob"});
  const a = document.createElement('a');
 a.href = URL.createObjectURL(blob);
 a.download = `${petName}_完整桌宠素材包.zip`;
 document.body.appendChild(a);
 a.click();
 a.remove();
 document.getElementById('tipBox').innerText = `✅ ${petName}_完整桌宠素材包.zip 打包完成！`;
};
