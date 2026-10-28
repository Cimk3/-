import {existsSync,readFileSync,writeFileSync,renameSync,unlinkSync} from 'node:fs';
/** Deterministic outputs: skip identical files, replace changed files atomically.
 * Windows preview/indexing readers can transiently deny opening an existing file.
 * Retry only known file-sharing errors; all other errors propagate immediately.
 */
export function writeOutput(file,contents){
  const bytes=Buffer.isBuffer(contents)?contents:Buffer.from(contents);
  if(existsSync(file)&&readFileSync(file).equals(bytes))return;
  const temp=`${file}.mcpe-food-${process.pid}.tmp`;
  try{
    writeFileSync(temp,bytes);
    for(let attempt=0;;attempt++){
      try{renameSync(temp,file);return;}
      catch(error){if(attempt>=5||!['UNKNOWN','EBUSY','EPERM','EACCES'].includes(error.code))throw error;Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,40);}
    }
  }finally{if(existsSync(temp))unlinkSync(temp);}
}
