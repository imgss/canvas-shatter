'use strict';
let flag = false;
let maxCol = 0;
let img = new Image();
img.src = './img.jpeg';
img.onload = function(){
  init(img)
}
function init(img){
  let canvas = document.querySelector('canvas')
  let ctx = canvas.getContext('2d');
  ctx.fillStyle="#000";
  ctx.fillRect(0,0,400,400);
  ctx.drawImage(img,80,20, 100,100);
  maxCol = 180;
  requestAnimationFrame(draw.bind(null, ctx));
}

function draw(c){
  let rawImgData = c.getImageData(0,0,maxCol,400).data;
  let imgData = zipImgData(rawImgData);
  let i, j;
  if(!flag){
    for(i = 0; i < 399; i+=2){// 行
      for(j = 80; j < maxCol; j+=2){// 列
        let indexs = [maxCol*i + j, maxCol*(i+1) + j, maxCol*i + j + 1, maxCol*(i+1) + j+1]
        let newData = freshStatus(indexs.map(p => imgData[p]))
        if(newData){
          let newRawData = restoreData(newData, rawImgData,indexs)
          let newImageData = new ImageData(new Uint8ClampedArray(newRawData),2,2)
          c.putImageData(newImageData, j, i)
        }
      }
    }
  } else {
    for(i = 1; i < 399; i+=2){
      for(j = 81; j < maxCol; j+=2){
        let indexs = [maxCol*i + j, maxCol*(i+1) + j, maxCol*i + j + 1, maxCol*(i+1) + j+1]
        let newData = freshStatus(indexs.map(p => imgData[p]))
        if(newData){
          let newRawData = restoreData(newData, rawImgData,indexs)
          let newImageData = new ImageData(new Uint8ClampedArray(newRawData),2,2)
          c.putImageData(newImageData, j, i)
        }
      }
    }
  }

  flag = !flag
  requestAnimationFrame(draw.bind(null, c));
}
function zipImgData(data){
  let zipData = []
  for(let i = 0, len = data.length; i<=len; i+=4){
    zipData.push(!(data[i]=== 0 && data[i+1]=== 0 && data[i+2]=== 0))
  }
  return zipData
}
function restoreData(data, rawImgData,indexs){
  return data.reduce((d,v) => {
    let rawDataPart;
    if(v === -1){
      rawDataPart = [0,0,0,255]
    } else {
      rawDataPart = rawImgData.subarray((indexs[v]*4),(indexs[v]+1)*4)
    }
    return [...d, ...rawDataPart]
  }, [])
}
function freshStatus(state) {
  /**
   * -1表示黑色
   * 其他数字表示改变后的颜色索引所在的位置
   */
  let status ;
  let [i1, i2, i3, i4] = state;
  if (!i1 && !i2 && !i3 && !i4) {
    return false// 不更新
  }
  else if (i3  && i4) {
    return false// 不更新
  }
  else if (i1 && i2 && !i3 && i4) {
    status = [-1,1,0,3]
  }
  else if (i1 && i2 && i3 && !i4) {
    status = [0,-1,2,1]
  }
  else if (i1 && !i2 && i3 && !i4) {
    status = [-1,-1,0,2]
  }
  else if (!i1 && i2 && !i3 && i4) {
    status = [-1,-1,3,1]
  }
  else if (i1 && i2 && !i3 && !i4) {
    var odd = Math.random();
    if (odd < 0.35) {
      status = [0,1,-1,-1]
    }
    else {
      status = [-1,-1,0,1]
    }
  }
  else if (i1) {
    status = [-1,-1,0,-1]
  }
  else if (i2) {
    status = [-1,-1,-1,1]
  }
  else {
    return false
  }
  return status
}
init();