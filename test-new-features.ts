import * as nfd from './src/index';

async function test() {
  console.log('--- NFD pickFolders Test ---');
  try {
    const folders = await nfd.pickFolders({
      title: 'Select multiple folders',
      defaultPath: process.cwd()
    });
    console.log('Selected folders:', folders);
  } catch (e) {
    console.error('Error during pickFolders:', e);
  }

  console.log('\n--- NFD parentWindow Test (Syntax Only) ---');
  try {
    // Testing if the API accepts parentWindow without crashing during call preparation
    // Using 0 as a dummy handle
    const folder = await nfd.pickFolder({
      title: 'Select folder with parentWindow handle',
      parentWindow: 0n
    });
    console.log('Selected folder:', folder);
  } catch (e) {
    console.error('Error during pickFolder with parentWindow:', e);
  }
}

test();
