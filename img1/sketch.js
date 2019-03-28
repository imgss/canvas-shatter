"use strict";
let flag = false;
let maxCol = 0;
let img = new Image();
img.src = "./img.jpeg";
img.onload = function() {
  init(img);
};
const EMPTY =  [9,9,9,255]
const IMG_X = 80
const IMG_Y = 20
const IMG_WIDTH = 100

let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

function init(img) {

  ctx.fillStyle = `rgba(${EMPTY.toString()})`;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, IMG_X, IMG_Y, IMG_WIDTH, IMG_WIDTH);
  maxCol = IMG_X + IMG_WIDTH;
  requestAnimationFrame(draw);
}

function draw() {
  let rawImgData = ctx.getImageData(0, 0, maxCol, height + 1).data;
  // statusData 一个由布尔值构成的数组，用于记录当前cell是否为空态
  let statusData = zipImgData(rawImgData);
  let i, j;
  // flag控制遍历的方格排列
  if (!flag) {
    for (i = IMG_Y; i < height; i += 2) {
      // 行号为y值
      for (j = IMG_X - 10; j < maxCol; j += 2) {
        // 列号为x值, 从图片前10像素就开始遍历，确保图片上所有像素点都能遍历到
        
        /**   cell位置
         *    (j, i)     (j+1, i)
         *    (j, i+1)  (j+1, i+1)
         */
        freshState(i, j, rawImgData, statusData)
      }
    }
  } else {
    for (i = IMG_Y + 1; i < height; i += 2) {
      for (j = IMG_X - 9; j < maxCol + 1; j += 2) {
        freshState(i, j, rawImgData, statusData)
      }
    }
  }

  flag = !flag;
  requestAnimationFrame(draw);
}

function freshState(i, j, rawImgData, statusData) {
  let indexs = [
    maxCol * i + j,
    maxCol * i + j + 1,
    maxCol * (i + 1) + j,
    maxCol * (i + 1) + j + 1
  ];
  // 根据原先的状态数据，计算出新的状态数据
  let prevData = indexs.map(p => statusData[p]);
  let newData = freshStatus(prevData);
  if (newData) {
    let newRawData = restoreData(newData, rawImgData, indexs);
    let newImageData = new ImageData(
      new Uint8ClampedArray(newRawData),
      2,
      2
    );
    ctx.putImageData(newImageData, j, i);
  }
}
//记录图片在某个位置是黑色还是不是黑色，黑色记为false，其他记为true
function zipImgData(data) {
  let zipData = [];
  for (let i = 0, len = data.length; i <= len; i += 4) {
    zipData.push(!(data[i] === EMPTY[0] && data[i + 1] === EMPTY[1] && data[i + 2] === EMPTY[2]));
  }
  return zipData;
}

//根据更新后的状态生成新的图片数据
function restoreData(data, rawImgData, indexs) {
  return data.reduce((d, v) => {
    let rawDataPart;
    // -1 为空态
    if (v === -1) {
      rawDataPart = EMPTY;
    } else {
      rawDataPart = rawImgData.subarray(indexs[v] * 4, (indexs[v] + 1) * 4);
    }
    return [...d, ...rawDataPart];
  }, []);
}

// 根据原先的状态更新cell状态
function freshStatus(state) {
  /**
   * -1表示黑色
   * 其他数字表示改变后的颜色索引所在的位置
   */
  let status;
  let [i1, i2, i3, i4] = state;
  // 总共有16种情况
  if (!i1 && !i2 && !i3 && !i4) {
    // 都是空 1种情况
    return false; // 不更新
  } else if (i3 && i4) {
    // 3，4不为空 包括4种情况
    return false; // 不更新
  } else if (i1 && i2 && !i3 && i4) {
    // 0->3 第一个为空
    status = [-1, 1, 0, 3];
  } else if (i1 && i2 && i3 && !i4) {
    status = [0, -1, 2, 1];
  } else if (i1 && !i2 && i3 && !i4) {
    status = [-1, -1, 0, 2];
  } else if (!i1 && i2 && !i3 && i4) {
    status = [-1, -1, 3, 1];
  } else if (i1 && i2 && !i3 && !i4) {
    var odd = Math.random();
    // 导致整副图像没有整体塌陷的秘诀在这里
    if (odd < 0.35) {
      status = [0, 1, -1, -1];
    } else {
      status = [-1, -1, 0, 1];
    }
  } else if (i1) {
    status = [-1, -1, 0, -1];
  } else if (i2) {
    status = [-1, -1, -1, 1];
  } else {
    return false;
  }
  return status;
}
