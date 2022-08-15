import fs from "fs";
import readline from "readline";
import crypto from 'crypto';

interface Record {
  value: string;
  weight: number;
}

interface Node {
  hash: string;
  value: string;
}

// 昇順にソート
const compareF = (a: Node, b: Node) => {
  if (a.hash > b.hash) {
    return 1;
  } else if (a.hash < b.hash) {
    return -1;
  }

  return 0;
}

//　入力値の validation をどこかで行っておきたい。
const readRecords = async (fileName: string): Promise<Record[]> => {
  const readStream = fs.createReadStream(fileName);
  const reader= readline.createInterface({
    input: readStream,
  });

  const res: Record[] = [];

  for await (const line of reader) {
    const elements = line.split(" ");
    const record: Record = {
      value: elements[0],
      weight: Number(elements[1])
    }

    res.push(record);
  }
  return res;
}

const searchHash = (nodes: Node[], key: string): string => {
  const hashKeyValue = crypto.createHash('md5').update(String(key)).digest("hex");

  let start =0;
  let end = nodes.length;

  if(end == 0) return '';

  // binary search
  while(start <= end) {
    let mid =  Math.floor((start + end) / 2);
    if(nodes[mid].hash == hashKeyValue) return nodes[mid].value;
    else if (hashKeyValue < nodes[mid].hash) end = mid - 1;
    else start = mid + 1;
  }

  return nodes[start].hash;
}

const createKetamaObj = async (fileName: string, multipleNum: number = 1) => {
  const records = await readRecords(fileName);
  const nodes: Node[] =[];

  for(let i = 0; i < records.length; i++) {
    const record = records[i];
    const recordWeight = record.weight;
    const recordNodeWeight = recordWeight * multipleNum;
    for(let j = 0; j < recordNodeWeight; j++) {
      const hashValue = crypto.createHash('md5').update(record.value).update(String(j)).digest("hex");
      nodes.push({value: record.value, hash: hashValue})
    }
  }

  nodes.sort(compareF);

  return nodes;
}

const test = async () => {
  const ketama = await createKetamaObj("./test/serverFile.txt", 3);
  console.log(searchHash(ketama, "1"))
}

test();