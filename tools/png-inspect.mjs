import assert from 'node:assert/strict';
import {inflateSync} from 'node:zlib';
/** Inspect our generated 8-bit, non-interlaced RGBA PNGs without image libraries. */
export function decodeRGBA(bytes) {
  assert.equal(bytes.subarray(1,4).toString(),'PNG');
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  assert.equal(bytes[24],8);assert.ok([2,6].includes(bytes[25]));assert.equal(bytes[28],0);
  assert.ok(width>0&&height>0&&width<=4096&&height<=4096);
  const chunks=[];
  for(let p=8;p<bytes.length;){const length=bytes.readUInt32BE(p),type=bytes.subarray(p+4,p+8).toString();if(type==='IDAT')chunks.push(bytes.subarray(p+8,p+8+length));p+=length+12;}
  const channels=bytes[25]===6?4:3,raw=inflateSync(Buffer.concat(chunks)),stride=width*channels;
  assert.equal(raw.length,(stride+1)*height);
  const decoded=new Uint8Array(stride*height),pixels=new Uint8Array(width*height*4);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<height;y++)for(let x=0;x<stride;x++){
    const filter=raw[y*(stride+1)],left=x>=channels?decoded[y*stride+x-channels]:0,up=y?decoded[(y-1)*stride+x]:0,corner=y&&x>=channels?decoded[(y-1)*stride+x-channels]:0;
    assert.ok(filter<=4);const prediction=[0,left,up,Math.floor((left+up)/2),paeth(left,up,corner)][filter];decoded[y*stride+x]=(raw[y*(stride+1)+1+x]+prediction)&255;
  }
  for(let i=0;i<width*height;i++){pixels[i*4]=decoded[i*channels];pixels[i*4+1]=decoded[i*channels+1];pixels[i*4+2]=decoded[i*channels+2];pixels[i*4+3]=channels===4?decoded[i*channels+3]:255;}
  return {width,height,pixels};
}
