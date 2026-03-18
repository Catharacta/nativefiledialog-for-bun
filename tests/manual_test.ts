import { 
  openFile, 
  openFiles, 
  pickFolder, 
  saveFile 
} from '../src/index';

async function test() {
  console.log('--- Native File Dialog Test ---');
  
  try {
    console.log('1. Opening single file dialog...');
    const file = await openFile({ title: 'Select a file' });
    console.log('Result:', file);

    console.log('\n2. Opening multi-file dialog...');
    const files = await openFiles({ title: 'Select multiple files' });
    console.log('Result:', files);

    console.log('\n3. Opening folder picker...');
    const folder = await pickFolder({ title: 'Select a folder' });
    console.log('Result:', folder);

    console.log('\n4. Opening save file dialog...');
    const savePath = await saveFile({ title: 'Save your file' });
    console.log('Result:', savePath);

  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
