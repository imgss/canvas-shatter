function init(){
  let canvas = document.querySelector('canvas')
  let ctx = canvas.getContext('2d');
  ctx.fillStyle="#000";
  ctx.fillRect(0,0,400,400);
  ctx.font="100px Georgia";
  ctx.fillStyle="#fff";
  ctx.fillText('节操', 80,100);
  requestAnimationFrame(draw.bind(null, ctx));
  // console.log(ctx.getImageData(0,0, 2,2))
}
let flag = false;
function draw(c){
  let imgData = c.getImageData(0,0,400,400);
  imgData = zipImgData(imgData);
  if(!flag){
    for(let i = 0; i < 399; i+=2){
      for(let j = 80; j < 349; j+=2){
        let p1 = imgData[400*i + j]
        let p2 = imgData[400*i + j + 1]
        let p3 = imgData[400*(i+1) + j]
        let p4 = imgData[400*(i+1) + j + 1]
        let newData = cvtStatus([p1, p2, p3, p4])
        newData = newData.reduce((d,i) => [...d,i*255,i*255,i*255,255], [])
        let newImageData = new ImageData(new Uint8ClampedArray(newData),2,2)
        c.putImageData(newImageData, j, i)
      }
    }
  } else {
    for(let i = 1; i < 399; i+=2){
      for(let j = 81; j < 349; j+=2){
        let p1 = imgData[400*i + j]
        let p2 = imgData[400*i + j + 1]
        let p3 = imgData[400*(i+1) + j]
        let p4 = imgData[400*(i+1) + j + 1]
        let newData = cvtStatus([p1, p2, p3, p4])
        newData = newData.reduce((d,i) => [...d,i*255,i*255,i*255,255], [])
        let newImageData = new ImageData(new Uint8ClampedArray(newData),2,2)
        c.putImageData(newImageData, j, i)
      }
    }
  }

  flag = !flag
  requestAnimationFrame(draw.bind(null, c));
}
function zipImgData(data){
  data = Array.from(data.data)
  let zip = []
  for(let i = 0, len = data.length; i < len; i += 4){
    zip.push(data[i])
  }
  return zip
}
function cvtStatus(state) {
  let status ;
  let [i1, i2, i3, i4] = state;
  if (!i1 && !i2 && !i3 && !i4) {
    status = [0,0,0,0]
  }
  else if (i3  && i4) {
    status = state
  }
  else if (i1 && i2 && !i3 && i4) {
    status = [0,1,1,1]
  }
  else if (i1 && i2 && i3 && !i4) {
    status = [1,0,1,1]
  }
  else if (i1 && !i2 && i3 && !i4) {
    status = [0,0,1,1]
  }
  else if (!i1 && i2 && !i3 && i4) {
    status = [0,0,1,1]
  }
  else if (i1 && i2 && !i3 && !i4) {
    var odd = Math.random();
    if (odd < 0.35) {
      status = [1,1,0,0]
    }
    else {
      status = [0,0,1,1]
    }
  }
  else if (i1) {
    status = [0,0,1,0]
  }
  else if (i2) {
    status = [0,0,0,1]
  }
  else {
    status = state
  }
  return status
}
init();