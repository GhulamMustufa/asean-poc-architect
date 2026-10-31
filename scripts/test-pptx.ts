import pptxgen from 'pptxgenjs';

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
const slide = pptx.addSlide();
slide.background = { color: '0A192F' };
slide.addText('Test Slide', { x: 1, y: 1, fontSize: 24, color: 'FFFFFF' });
slide.addNotes('Test speaker notes here.');

await pptx.writeFile({ fileName: 'presentation/test.pptx' });
console.log('Test PPTX generated successfully');
