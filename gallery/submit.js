let finalJson = null;

function generateJson(){
    const data = {
        displayName: document.getElementById('displayName').value.trim(),
        author: document.getElementById('author').value.trim(),
        filterKey: document.getElementById('filterKey').value,
        platform: document.getElementById('platform').value.trim(),
        frameRate: Number(document.getElementById('frameRate').value),
        actions:{
            idle:{
                loop:true,
                frames: document.getElementById('idleFrames').value.split(',').map(s=>s.trim()).filter(s=>s)
            },
            walk:{
                loop:true,
                frames: document.getElementById('walkFrames').value.split(',').map(s=>s.trim()).filter(s=>s)
            },
            click:{
                loop:false,
                frames: document.getElementById('clickFrames').value.split(',').map(s=>s.trim()).filter(s=>s)
            }
        }
    }
    finalJson = data;
    document.getElementById('outJson').innerText = JSON.stringify(data,null,2);
}
function downloadJson(){
    if(!finalJson) return alert("先生成JSON");
    const blob = new Blob([JSON.stringify(finalJson,null,2)],{type:"application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "pet.json";
    a.click();
}
